package com.faisalart92.zikreilahi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PrayerBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PrayerAlarmScheduler.scheduleAll(context);
    }
}
