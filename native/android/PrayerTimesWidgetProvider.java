package com.faisalart92.zikreilahi;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.content.SharedPreferences;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PrayerTimesWidgetProvider extends AppWidgetProvider {
    private static final String PREFS="zikr_prayer_alarm_settings";
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for(int id:ids) update(context,manager,id);
    }
    public static void refresh(Context context){
        AppWidgetManager manager=AppWidgetManager.getInstance(context);
        int[] ids=manager.getAppWidgetIds(new ComponentName(context,PrayerTimesWidgetProvider.class));
        for(int id:ids)update(context,manager,id);
    }
    private static void update(Context c,AppWidgetManager m,int id){
        RemoteViews v=new RemoteViews(c.getPackageName(),R.layout.prayer_times_widget);
        SharedPreferences p=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE);
        String[] keys={"Fajr","Dhuhr","Asr","Maghrib","Isha"};
        String[] idsView={"widget_fajr","widget_dhuhr","widget_asr","widget_maghrib","widget_isha"};
        int[] viewIds={R.id.widget_fajr,R.id.widget_dhuhr,R.id.widget_asr,R.id.widget_maghrib,R.id.widget_isha};
        boolean available=false;
        for(int i=0;i<keys.length;i++){
            String t=p.getString(keys[i],"--:--");
            v.setTextViewText(viewIds[i],keys[i]+"  "+t);
            if(!t.equals("--:--"))available=true;
        }
        String lat=p.getString("latitude",""),lon=p.getString("longitude","");
        v.setTextViewText(R.id.widget_location,(lat.isEmpty()||lon.isEmpty())?"Enable prayer alerts in app to sync":"Prayer times synced");
        v.setTextViewText(R.id.widget_date,new SimpleDateFormat("EEE, dd MMM",Locale.getDefault()).format(new Date()));
        v.setTextViewText(R.id.widget_hint,available?"Tap to open Noor-e-Hidayat":"Open app and enable prayer alerts to sync timings");
        Intent open=c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if(open!=null){open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);v.setOnClickPendingIntent(R.id.widget_root,android.app.PendingIntent.getActivity(c,id,open,android.app.PendingIntent.FLAG_UPDATE_CURRENT|android.app.PendingIntent.FLAG_IMMUTABLE));}
        m.updateAppWidget(id,v);
    }
    @Override public void onReceive(Context c,Intent i){super.onReceive(c,i);refresh(c);}
}
