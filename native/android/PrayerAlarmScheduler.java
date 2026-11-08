package com.faisalart92.zikreilahi;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import org.json.JSONObject;
import java.util.Calendar;

public final class PrayerAlarmScheduler {
    private static final String PREFS="zikr_prayer_alarm_settings";
    private static final String[] KEYS={"Fajr","Dhuhr","Asr","Maghrib","Isha"};
    private static final String[] LABELS={"فجر","ظہر","عصر","مغرب","عشاء"};
    private static final int REQUEST_BASE=7400;
    private PrayerAlarmScheduler(){}
    public static void saveTimes(Context c, JSONObject times){
        android.content.SharedPreferences.Editor e=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit();
        for(String key:KEYS){String v=times.optString(key,"");if(v.matches("\\d{1,2}:\\d{2}"))e.putString(key,v);}
        e.apply();
    }
    public static void scheduleAll(Context c){for(int i=0;i<KEYS.length;i++)scheduleNext(c,i);}
    public static void scheduleNext(Context c,int i){
        if(i<0||i>=KEYS.length)return;
        String t=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE).getString(KEYS[i],"");
        if(!t.matches("\\d{1,2}:\\d{2}"))return;
        String[] p=t.split(":"); Calendar when=Calendar.getInstance();
        when.set(Calendar.HOUR_OF_DAY,Integer.parseInt(p[0]));when.set(Calendar.MINUTE,Integer.parseInt(p[1]));
        when.set(Calendar.SECOND,0);when.set(Calendar.MILLISECOND,0);
        if(when.getTimeInMillis()<=System.currentTimeMillis())when.add(Calendar.DAY_OF_YEAR,1);
        Intent in=new Intent(c,PrayerAlarmReceiver.class).putExtra("prayer_key",KEYS[i]).putExtra("prayer_label",LABELS[i]);
        PendingIntent pi=PendingIntent.getBroadcast(c,REQUEST_BASE+i,in,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        AlarmManager am=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);if(am==null)return;
        try{if(Build.VERSION.SDK_INT>=31&&am.canScheduleExactAlarms())am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when.getTimeInMillis(),pi);else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when.getTimeInMillis(),pi);}
        catch(SecurityException ex){am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when.getTimeInMillis(),pi);}
    }
    public static void startAzan(Context c,String key,String label){
        Intent service=new Intent(c,PrayerAzanService.class).putExtra("prayer_key",key).putExtra("prayer_label",label);
        try{if(Build.VERSION.SDK_INT>=26)c.startForegroundService(service);else c.startService(service);}catch(Exception e){android.util.Log.e("ZikrAzan","Could not start Adhan service",e);}
    }
}
