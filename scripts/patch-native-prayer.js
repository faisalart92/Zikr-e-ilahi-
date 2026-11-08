const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const androidRoot = path.join(root, "android", "app", "src", "main");
const javaRoot = path.join(androidRoot, "java");
function findFile(dir, name) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { const found = findFile(full, name); if (found) return found; }
    else if (entry.name === name) return full;
  }
  return null;
}
const mainActivity = findFile(javaRoot, "MainActivity.java");
if (!mainActivity) throw new Error("Generated MainActivity.java not found.");
const match = fs.readFileSync(mainActivity, "utf8").match(/^package\s+([\w.]+);/m);
if (!match) throw new Error("Could not detect Android application package.");
const packageName = match[1], packageDir = path.dirname(mainActivity);
const sourceDir = path.join(root, "native", "android");
for (const name of ["PrayerAlarmPlugin.java","PrayerAlarmScheduler.java","PrayerAlarmReceiver.java","PrayerBootReceiver.java","PrayerAzanService.java"]) {
  const source = path.join(sourceDir, name);
  if (!fs.existsSync(source)) throw new Error("Missing native source: " + source);
  fs.writeFileSync(path.join(packageDir, name), fs.readFileSync(source, "utf8").replace("package com.faisalart92.zikreilahi;", "package " + packageName + ";"));
}
fs.writeFileSync(mainActivity,
  "package " + packageName + ";\n\nimport android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;\n\n" +
  "public class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n" +
  "        registerPlugin(PrayerAlarmPlugin.class);\n        super.onCreate(savedInstanceState);\n    }\n}\n");

const res = path.join(androidRoot, "res");
function put(rel, value) { const p=path.join(res,rel); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,value); }
put("values/ic_launcher_background.xml", `<resources><color name="ic_launcher_background">#063D27</color></resources>`);
put("drawable/ic_launcher_foreground.xml", `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="#063D27" android:pathData="M0,0h108v108h-108z"/>
  <path android:fillColor="#F8D66D" android:pathData="M54,8a17,17 0,1 0,17 26a14,14 0,1 1,-17 -26z"/>
  <path android:fillColor="#D7A93D" android:pathData="M14,77h80v5h-80z M22,77V53h8v24z M78,77V53h8v24z M18,53l8,-11 8,11z M74,53l8,-11 8,11z M38,77V59a16,16 0,0 1,32 0v18z M34,59a20,20 0,0 1,40 0h-5a15,15 0,0 0,-30 0z M48,77V64a6,6 0,0 1,12 0v13z"/>
  <path android:fillColor="#FFF1B5" android:pathData="M49,26h10v3h-10z M52,20h4v8h-4z"/>
  <path android:fillColor="#F8D66D" android:pathData="M12,86h84v3h-84z M20,91h68v2h-68z"/>
</vector>`);
put("mipmap-anydpi-v26/ic_launcher.xml", `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>`);
put("mipmap-anydpi-v26/ic_launcher_round.xml", `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>`);
put("mipmap-anydpi/ic_launcher.xml", `<bitmap xmlns:android="http://schemas.android.com/apk/res/android" android:src="@drawable/ic_launcher_foreground" />`);
put("mipmap-anydpi/ic_launcher_round.xml", `<bitmap xmlns:android="http://schemas.android.com/apk/res/android" android:src="@drawable/ic_launcher_foreground" />`);

const manifestPath = path.join(androidRoot,"AndroidManifest.xml");
let manifest=fs.readFileSync(manifestPath,"utf8");
for(const p of [
  "android.permission.POST_NOTIFICATIONS","android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.SCHEDULE_EXACT_ALARM","android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK","android.permission.WAKE_LOCK"
]) if(!manifest.includes(p)) manifest=manifest.replace("<application",'    <uses-permission android:name="'+p+'" />\n    <application');
manifest=manifest.replace(/<application([^>]*)>/, (whole,attrs)=>{
  let a=attrs.replace(/\sandroid:icon="[^"]*"/,"").replace(/\sandroid:roundIcon="[^"]*"/,"");
  return '<application'+a+' android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round">';
});
if(!manifest.includes("PrayerAzanService")) manifest=manifest.replace("</application>",'        <service android:name=".PrayerAzanService" android:enabled="true" android:exported="false" android:foregroundServiceType="mediaPlayback" />\n        <receiver android:name=".PrayerAlarmReceiver" android:enabled="true" android:exported="false" />\n        <receiver android:name=".PrayerBootReceiver" android:enabled="true" android:exported="true"><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /><action android:name="android.intent.action.TIME_SET" /><action android:name="android.intent.action.TIMEZONE_CHANGED" /></intent-filter></receiver>\n    </application>');
fs.writeFileSync(manifestPath,manifest);
console.log("Adhan playback service, permissions, receivers, and new green-gold launcher icon configured.");
