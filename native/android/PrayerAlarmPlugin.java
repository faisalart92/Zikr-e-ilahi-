package com.faisalart92.zikreilahi;

import android.Manifest;
import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "PrayerAlarm",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS }),
        @Permission(alias = "location", strings = {
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_FINE_LOCATION
        })
    }
)
public class PrayerAlarmPlugin extends Plugin {
    @PluginMethod
    public void requestLocationPermission(PluginCall call) {
        if (getPermissionState("location") == PermissionState.GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("location", call, "locationPermissionCallback");
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", getPermissionState("location") == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 ||
            getPermissionState("notifications") == PermissionState.GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", getPermissionState("notifications") == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void checkExactAlarmAccess(PluginCall call) {
        boolean allowed = true;
        if (Build.VERSION.SDK_INT >= 31) {
            AlarmManager manager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            allowed = manager != null && manager.canScheduleExactAlarms();
        }
        JSObject result = new JSObject();
        result.put("allowed", allowed);
        call.resolve(result);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 31) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void schedulePrayerAlarms(PluginCall call) {
        JSObject times = call.getObject("times");
        if (times == null) {
            call.reject("Prayer times are missing");
            return;
        }
        PrayerAlarmScheduler.saveTimes(getContext(), times);
        PrayerAlarmScheduler.scheduleAll(getContext());
        JSObject result = new JSObject();
        boolean exact = Build.VERSION.SDK_INT < 31 ||
            ((AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms();
        result.put("exactAlarmAllowed", exact);
        call.resolve(result);
    }
}
