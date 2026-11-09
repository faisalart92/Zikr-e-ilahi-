package com.faisalart92.zikreilahi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class PrayerAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String key = intent == null ? null : intent.getStringExtra("prayer_key");
        if ("DAILY_REFRESH".equals(key)) {
            final PendingResult pending = goAsync();
            final Context appContext = context.getApplicationContext();
            new Thread(() -> {
                try {
                    PrayerAlarmScheduler.refreshFromApi(appContext);
                } catch (Exception error) {
                    Log.e("ZikrPrayerAlarm", "Daily prayer refresh failed", error);
                } finally {
                    pending.finish();
                }
            }, "ZikrPrayerRefresh").start();
            return;
        }

        String label = intent == null ? null : intent.getStringExtra("prayer_label");
        PrayerAlarmScheduler.startAzan(
            context,
            key == null ? "Dhuhr" : key,
            label == null ? "نماز" : label
        );
        String[] keys = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};
        for (int i = 0; i < keys.length; i++) {
            if (keys[i].equals(key)) {
                PrayerAlarmScheduler.scheduleNext(context, i);
                break;
            }
        }
    }
}
