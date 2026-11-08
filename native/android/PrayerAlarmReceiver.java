package com.faisalart92.zikreilahi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PrayerAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String key = intent.getStringExtra("prayer_key");
        String label = intent.getStringExtra("prayer_label");
        PrayerAlarmScheduler.showPrayerNotification(context, label == null ? "نماز" : label);
        String[] keys = { "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha" };
        for (int i = 0; i < keys.length; i++) {
            if (keys[i].equals(key)) {
                PrayerAlarmScheduler.scheduleNext(context, i);
                break;
            }
        }
    }
}
