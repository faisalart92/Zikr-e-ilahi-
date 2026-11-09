package com.faisalart92.zikreilahi;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public final class PrayerAlarmScheduler {
    private static final String TAG="ZikrPrayerAlarm";
    private static final String PREFS="zikr_prayer_alarm_settings";
    private static final String[] KEYS={"Fajr","Dhuhr","Asr","Maghrib","Isha"};
    private static final String[] LABELS={"فجر","ظہر","عصر","مغرب","عشاء"};
    private static final int REQUEST_BASE=7400;
    private static final int DAILY_REFRESH_REQUEST=7410;
    private PrayerAlarmScheduler(){}

    public static void enable(Context c){
        c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit().putBoolean("enabled",true).apply();
    }

    public static void saveTimes(Context c, JSONObject times){
        android.content.SharedPreferences.Editor e=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit();
        for(String key:KEYS){
            String v=times.optString(key,"").split(" ")[0];
            if(v.matches("\\d{1,2}:\\d{2}"))e.putString(key,v);
        }
        if(times.has("latitude")&&times.has("longitude")){
            e.putString("latitude",String.valueOf(times.optDouble("latitude")));
            e.putString("longitude",String.valueOf(times.optDouble("longitude")));
        }
        e.apply();
    }

    public static void scheduleAll(Context c){
        if(!isEnabled(c))return;
        for(int i=0;i<KEYS.length;i++)scheduleNext(c,i);
        scheduleDailyRefresh(c);
    }

    private static boolean isEnabled(Context c){
        return c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).getBoolean("enabled",false);
    }

    public static void scheduleNext(Context c,int i){
        if(i<0||i>=KEYS.length||!isEnabled(c))return;
        String t=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).getString(KEYS[i],"");
        if(!t.matches("\\d{1,2}:\\d{2}"))return;
        String[] p=t.split(":");
        Calendar when=Calendar.getInstance();
        when.set(Calendar.HOUR_OF_DAY,Integer.parseInt(p[0]));
        when.set(Calendar.MINUTE,Integer.parseInt(p[1]));
        when.set(Calendar.SECOND,0);
        when.set(Calendar.MILLISECOND,0);
        if(when.getTimeInMillis()<=System.currentTimeMillis())when.add(Calendar.DAY_OF_YEAR,1);
        Intent in=new Intent(c,PrayerAlarmReceiver.class).putExtra("prayer_key",KEYS[i]).putExtra("prayer_label",LABELS[i]);
        PendingIntent pi=PendingIntent.getBroadcast(c,REQUEST_BASE+i,in,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        AlarmManager am=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        if(am==null)return;
        try{
            if(Build.VERSION.SDK_INT>=31&&am.canScheduleExactAlarms())
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when.getTimeInMillis(),pi);
            else
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when.getTimeInMillis(),pi);
        }catch(SecurityException ex){
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when.getTimeInMillis(),pi);
        }
    }

    // Refresh tomorrow's prayer times shortly after midnight so alarms do not
    // repeat yesterday's timings throughout the year.
    public static void scheduleDailyRefresh(Context c){
        if(!isEnabled(c))return;
        Calendar when=Calendar.getInstance();
        when.add(Calendar.DAY_OF_YEAR,1);
        when.set(Calendar.HOUR_OF_DAY,0);
        when.set(Calendar.MINUTE,5);
        when.set(Calendar.SECOND,0);
        when.set(Calendar.MILLISECOND,0);
        scheduleRefreshAt(c,when.getTimeInMillis());
    }

    private static void scheduleRefreshAt(Context c,long at){
        if(!isEnabled(c))return;
        Intent in=new Intent(c,PrayerAlarmReceiver.class).putExtra("prayer_key","DAILY_REFRESH");
        PendingIntent pi=PendingIntent.getBroadcast(c,DAILY_REFRESH_REQUEST,in,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        AlarmManager am=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        if(am!=null)am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pi);
    }

    public static void refreshFromApi(Context c){
        if(!isEnabled(c))return;
        HttpURLConnection connection=null;
        try{
            android.content.SharedPreferences prefs=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE);
            String lat=prefs.getString("latitude","");
            String lon=prefs.getString("longitude","");
            if(lat.isEmpty()||lon.isEmpty()){
                scheduleDailyRefresh(c);
                return;
            }
            String date=new SimpleDateFormat("dd-MM-yyyy",Locale.US).format(Calendar.getInstance().getTime());
            String endpoint="https://api.aladhan.com/v1/timings/"+date+
                "?latitude="+lat+"&longitude="+lon+"&method=1&school=1";
            connection=(HttpURLConnection)new URL(endpoint).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setUseCaches(false);
            int status=connection.getResponseCode();
            if(status!=200)throw new IllegalStateException("Prayer API HTTP "+status);
            StringBuilder body=new StringBuilder();
            try(BufferedReader reader=new BufferedReader(new InputStreamReader(connection.getInputStream(),StandardCharsets.UTF_8))){
                String line;
                while((line=reader.readLine())!=null)body.append(line);
            }
            JSONObject response=new JSONObject(body.toString());
            if(response.optInt("code")!=200)throw new IllegalStateException("Prayer API returned an error");
            JSONObject timings=response.getJSONObject("data").getJSONObject("timings");
            timings.put("latitude",Double.parseDouble(lat));
            timings.put("longitude",Double.parseDouble(lon));
            saveTimes(c,timings);
            scheduleAll(c);
            Log.i(TAG,"Daily prayer times refreshed successfully");
        }catch(Exception ex){
            Log.e(TAG,"Could not refresh daily prayer times; retrying in 15 minutes",ex);
            scheduleRefreshAt(c,System.currentTimeMillis()+15L*60L*1000L);
        }finally{
            if(connection!=null)connection.disconnect();
        }
    }

    public static void cancelAll(Context c){
        c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit().putBoolean("enabled",false).apply();
        AlarmManager am=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        if(am==null)return;
        for(int i=0;i<KEYS.length;i++){
            Intent in=new Intent(c,PrayerAlarmReceiver.class).putExtra("prayer_key",KEYS[i]).putExtra("prayer_label",LABELS[i]);
            PendingIntent pi=PendingIntent.getBroadcast(c,REQUEST_BASE+i,in,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            am.cancel(pi);
            pi.cancel();
        }
        Intent refresh=new Intent(c,PrayerAlarmReceiver.class).putExtra("prayer_key","DAILY_REFRESH");
        PendingIntent refreshPi=PendingIntent.getBroadcast(c,DAILY_REFRESH_REQUEST,refresh,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        am.cancel(refreshPi);
        refreshPi.cancel();
    }

    public static void startAzan(Context c,String key,String label){
        Intent service=new Intent(c,PrayerAzanService.class).putExtra("prayer_key",key).putExtra("prayer_label",label);
        try{
            if(Build.VERSION.SDK_INT>=26)c.startForegroundService(service);
            else c.startService(service);
        }catch(Exception e){
            Log.e("ZikrAzan","Could not start Adhan service",e);
        }
    }
}
