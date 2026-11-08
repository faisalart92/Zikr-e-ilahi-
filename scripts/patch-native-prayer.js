const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const androidRoot = path.join(root, "android", "app", "src", "main");
const javaRoot = path.join(androidRoot, "java");

function findFile(dir, name) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(full, name);
      if (found) return found;
    } else if (entry.name === name) return full;
  }
  return null;
}

const mainActivity = findFile(javaRoot, "MainActivity.java");
if (!mainActivity) throw new Error("Generated MainActivity.java not found.");
const packageLine = fs.readFileSync(mainActivity, "utf8").match(/^package\s+([\w.]+);/m);
if (!packageLine) throw new Error("Could not detect Android application package.");
const packageName = packageLine[1];
const packageDir = path.dirname(mainActivity);
const sourceDir = path.join(root, "native", "android");

for (const name of [
  "PrayerAlarmPlugin.java",
  "PrayerAlarmScheduler.java",
  "PrayerAlarmReceiver.java",
  "PrayerBootReceiver.java"
]) {
  const source = path.join(sourceDir, name);
  if (!fs.existsSync(source)) throw new Error("Missing native source: " + source);
  const content = fs.readFileSync(source, "utf8").replace(
    "package com.faisalart92.zikreilahi;",
    "package " + packageName + ";"
  );
  fs.writeFileSync(path.join(packageDir, name), content);
}

fs.writeFileSync(mainActivity,
  "package " + packageName + ";\n\n" +
  "import android.os.Bundle;\n" +
  "import com.getcapacitor.BridgeActivity;\n\n" +
  "public class MainActivity extends BridgeActivity {\n" +
  "    @Override\n" +
  "    public void onCreate(Bundle savedInstanceState) {\n" +
  "        registerPlugin(PrayerAlarmPlugin.class);\n" +
  "        super.onCreate(savedInstanceState);\n" +
  "    }\n" +
  "}\n"
);

const manifestPath = path.join(androidRoot, "AndroidManifest.xml");
let manifest = fs.readFileSync(manifestPath, "utf8");
const permissions = [
  "    <uses-permission android:name=\"android.permission.POST_NOTIFICATIONS\" />",
  "    <uses-permission android:name=\"android.permission.RECEIVE_BOOT_COMPLETED\" />",
  "    <uses-permission android:name=\"android.permission.SCHEDULE_EXACT_ALARM\" />"
];
for (const permission of permissions) {
  const name = permission.match(/android:name="([^"]+)"/)[1];
  if (!manifest.includes(name)) manifest = manifest.replace("<application", permission + "\n    <application");
}
const receivers = [
  '        <receiver android:name=".PrayerAlarmReceiver" android:enabled="true" android:exported="false" />',
  '        <receiver android:name=".PrayerBootReceiver" android:enabled="true" android:exported="true">',
  '            <intent-filter>',
  '                <action android:name="android.intent.action.BOOT_COMPLETED" />',
  '                <action android:name="android.intent.action.TIME_SET" />',
  '                <action android:name="android.intent.action.TIMEZONE_CHANGED" />',
  '            </intent-filter>',
  '        </receiver>'
].join("\n");
if (!manifest.includes("PrayerBootReceiver")) {
  manifest = manifest.replace("</application>", receivers + "\n    </application>");
}
fs.writeFileSync(manifestPath, manifest);
console.log("Native prayer alarms and Android permissions configured.");
