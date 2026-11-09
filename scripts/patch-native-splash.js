const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const mainRes = path.join(root, "android", "app", "src", "main", "res");

function writeResource(relativePath, content) {
  const file = path.join(mainRes, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

writeResource("drawable/zikr_splash_logo.xml", `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#064B2D" android:pathData="M0,0h108v108h-108z"/>
    <path android:fillColor="#0A6B3D" android:pathData="M0,80L54,42 108,80v28h-108z"/>
    <path android:fillColor="#DDB64F" android:pathData="M57,10 C35,11 20,29 20,51 C20,74 38,91 60,91 C76,91 89,82 95,68 C84,79 69,83 55,77 C36,69 29,49 36,31 C40,21 48,14 57,10 Z"/>
    <path android:fillColor="#F0D27B" android:pathData="M29,80h50v5h-50z M35,57h38v24h-38z M31,53h46v5h-46z M43,53 C43,42 50,35 54,35 C59,35 66,42 66,53z M50,35v-8h8v8z"/>
    <path android:fillColor="#064B2D" android:pathData="M48,81v-13c0,-9 12,-9 12,0v13z"/>
    <path android:fillColor="#F0D27B" android:pathData="M22,81h64v4h-64z M27,86h54v3h-54z"/>
</vector>`);

writeResource("drawable/zikr_splash_background.xml", `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item><shape android:shape="rectangle"><solid android:color="#071B14" /></shape></item>
    <item android:drawable="@drawable/zikr_splash_logo" android:gravity="center" />
</layer-list>`);

const stylesPath = path.join(mainRes, "values", "styles.xml");
if (!fs.existsSync(stylesPath)) throw new Error("Generated Android styles.xml is missing.");
let styles = fs.readFileSync(stylesPath, "utf8");

function updateStyle(xml, styleName, items) {
  const escaped = styleName.replace(/\./g, "\\.");
  const pattern = new RegExp("(<style\\s+name=\"" + escaped + "\"[^>]*>)([\\s\\S]*?)(</style>)");
  const match = xml.match(pattern);
  if (!match) return xml;
  let body = match[2];
  for (const [name, value] of Object.entries(items)) {
    const itemPattern = new RegExp("<item\\s+name=\"" + name + "\"[^>]*>[\\s\\S]*?</item>");
    const item = "<item name=\"" + name + "\">" + value + "</item>";
    if (itemPattern.test(body)) body = body.replace(itemPattern, item);
    else body += "\\n        " + item;
  }
  return xml.replace(match[0], match[1] + body + match[3]);
}

styles = updateStyle(styles, "AppTheme.NoActionBarLaunch", {
  "android:background": "@drawable/zikr_splash_background",
  "android:windowBackground": "@drawable/zikr_splash_background",
  "android:statusBarColor": "#071B14",
  "android:navigationBarColor": "#071B14",
  "android:windowLightStatusBar": "false",
  "android:windowLightNavigationBar": "false"
});
styles = updateStyle(styles, "AppTheme.NoActionBar", {
  "android:windowBackground": "#071B14",
  "android:statusBarColor": "#071B14",
  "android:navigationBarColor": "#071B14",
  "android:windowLightStatusBar": "false",
  "android:windowLightNavigationBar": "false"
});
fs.writeFileSync(stylesPath, styles);

const v31Path = path.join(mainRes, "values-v31", "styles.xml");
fs.mkdirSync(path.dirname(v31Path), { recursive: true });
let v31 = fs.existsSync(v31Path) ? fs.readFileSync(v31Path, "utf8") : "<resources>\n</resources>\n";
if (!/<style\s+name="AppTheme.NoActionBarLaunch"/.test(v31)) {
  v31 = v31.replace("</resources>", '    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n    </style>\n</resources>');
}
v31 = updateStyle(v31, "AppTheme.NoActionBarLaunch", {
  "android:windowSplashScreenBackground": "#071B14",
  "android:windowSplashScreenAnimatedIcon": "@drawable/zikr_splash_logo",
  "android:windowSplashScreenIconBackgroundColor": "#071B14",
  "android:windowSplashScreenAnimationDuration": "250",
  "postSplashScreenTheme": "@style/AppTheme.NoActionBar"
});
fs.writeFileSync(v31Path, v31);
console.log("Native Android splash configured with the matching emerald-and-gold vector emblem.");
