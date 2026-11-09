package com.faisalart92.zikreilahi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class PrayerBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)) {
            // Recreate alarms after Android restarts using the last saved
            // prayer times. The daily refresh alarm will update them again.
            PrayerAlarmScheduler.scheduleAll(context);
            return;
        }

        if (Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {
            // A timezone or clock change can make cached prayer times stale.
            // Refresh in the background and keep the broadcast process alive.
            final PendingResult pending = goAsync();
            final Context appContext = context.getApplicationContext();
            new Thread(() -> {
                try {
                    PrayerAlarmScheduler.refreshFromApi(appContext);
                } catch (Exception error) {
                    Log.e("ZikrPrayerAlarm", "Prayer refresh after time change failed", error);
                    PrayerAlarmScheduler.scheduleAll(appContext);
                } finally {
                    pending.finish();
                }
            }, "ZikrPrayerTimeChange").start();
        }
    }
}
