package com.faisalart92.zikreilahi;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

public final class PrayerAlarmScheduler {
    private static final String PREFS = "zikr_prayer_alarm_settings";
    private static final String CHANNEL_ID = "zikr_prayer_times";
    private static final String[] KEYS = { "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha" };
    private static final String[] LABELS = { "فجر", "ظہر", "عصر", "مغرب", "عشاء" };
    private static final int REQUEST_BASE = 7400;

    private PrayerAlarmScheduler() {}

    public static void saveTimes(Context context, JSONObject times) {
        android.content.SharedPreferences.Editor editor =
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        for (String key : KEYS) {
            String value = times.optString(key, "");
            if (value.matches("\\d{1,2}:\\d{2}")) editor.putString(key, value);
        }
        editor.apply();
    }

    public static void scheduleAll(Context context) {
        for (int i = 0; i < KEYS.length; i++) {
            scheduleNext(context, i);
        }
    }

    public static void scheduleNext(Context context, int index) {
        if (index < 0 || index >= KEYS.length) return;
        String time = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEYS[index], "");
        if (!time.matches("\\d{1,2}:\\d{2}")) return;

        String[] parts = time.split(":");
        int hour = Integer.parseInt(parts[0]);
        int minute = Integer.parseInt(parts[1]);
        Calendar trigger = Calendar.getInstance();
        trigger.set(Calendar.HOUR_OF_DAY, hour);
        trigger.set(Calendar.MINUTE, minute);
        trigger.set(Calendar.SECOND, 0);
        trigger.set(Calendar.MILLISECOND, 0);
        if (trigger.getTimeInMillis() <= System.currentTimeMillis()) {
            trigger.add(Calendar.DAY_OF_YEAR, 1);
        }

        Intent intent = new Intent(context, PrayerAlarmReceiver.class);
        intent.putExtra("prayer_key", KEYS[index]);
        intent.putExtra("prayer_label", LABELS[index]);
        PendingIntent pending = PendingIntent.getBroadcast(
            context, REQUEST_BASE + index, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;
        try {
            if (Build.VERSION.SDK_INT >= 31 && manager.canScheduleExactAlarms()) {
                manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger.getTimeInMillis(), pending);
            } else {
                manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger.getTimeInMillis(), pending);
            }
        } catch (SecurityException exception) {
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger.getTimeInMillis(), pending);
        }
    }

    public static void showPrayerNotification(Context context, String label) {
        if (Build.VERSION.SDK_INT >= 33 &&
            context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                != android.content.pm.PackageManager.PERMISSION_GRANTED) return;

        NotificationManager manager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        if (Build.VERSION.SDK_INT >= 26 && manager.getNotificationChannel(CHANNEL_ID) == null) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "نماز کے اوقات", NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("نماز کے وقت کی یاد دہانی");
            channel.enableVibration(true);
            channel.setSound(
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build()
            );
            manager.createNotificationChannel(channel);
        }

        Notification.Builder builder = Build.VERSION.SDK_INT >= 26
            ? new Notification.Builder(context, CHANNEL_ID)
            : new Notification.Builder(context);
        Notification notification = builder
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("نماز کا وقت ہوگیا")
            .setContentText(label + " کی نماز ادا کریں۔")
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_REMINDER)
            .setDefaults(Notification.DEFAULT_SOUND | Notification.DEFAULT_VIBRATE)
            .build();
        try {
            manager.notify(8100 + label.hashCode() % 500, notification);
        } catch (SecurityException ignored) {
        }
    }
}
