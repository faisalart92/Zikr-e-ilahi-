const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const mainRes = path.join(root, "android", "app", "src", "main", "res");
const logoSource = path.join(root, "assets", "zikr-e-ilahi-logo.jpg");
if (!fs.existsSync(logoSource)) throw new Error("Zikr-e-Ilahi logo asset is missing: " + logoSource);

const drawableDir = path.join(mainRes, "drawable-nodpi");
fs.mkdirSync(drawableDir, { recursive: true });
fs.copyFileSync(logoSource, path.join(drawableDir, "zikr_splash_logo_image.jpg"));

function writeResource(relativePath, content) {
  const file = path.join(mainRes, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

writeResource("drawable/zikr_splash_logo.xml", `<?xml version="1.0" encoding="utf-8"?>
<bitmap xmlns:android="http://schemas.android.com/apk/res/android"
    android:src="@drawable/zikr_splash_logo_image"
    android:gravity="center"
    android:filter="true" />`);

writeResource("drawable/zikr_splash_background.xml", `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item><shape android:shape="rectangle"><solid android:color="#071B14" /></shape></item>
    <item>
        <bitmap android:src="@drawable/zikr_splash_logo_image"
            android:gravity="center" android:filter="true" />
    </item>
</layer-list>`);

const valuesDir = path.join(mainRes, "values");
const stylesPath = path.join(valuesDir, "styles.xml");
if (!fs.existsSync(stylesPath)) throw new Error("Generated Android styles.xml is missing.");
let styles = fs.readFileSync(stylesPath, "utf8");

function updateStyle(xml, styleName, items) {
  const escaped = styleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp("(<style\\s+name=[\\\"']" + escaped + "[\\\"'][^>]*>)([\\s\\S]*?)(</style>)");
  const match = xml.match(pattern);
  if (!match) return xml;
  let body = match[2];
  for (const [name, value] of Object.entries(items)) {
    const itemPattern = new RegExp("<item\\s+name=[\\\"']" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\\"'][^>]*>[\\s\\S]*?</item>");
    const item = "<item name=\"" + name + "\">" + value + "</item>";
    if (itemPattern.test(body)) body = body.replace(itemPattern, item);
    else body += "\n        " + item;
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
const v31Items = {
  "android:windowSplashScreenBackground": "#071B14",
  "android:windowSplashScreenAnimatedIcon": "@drawable/zikr_splash_logo",
  "android:windowSplashScreenIconBackgroundColor": "#071B14",
  "android:windowSplashScreenAnimationDuration": "250",
  "postSplashScreenTheme": "@style/AppTheme.NoActionBar"
};
if (!/<style\\s+name=["']AppTheme.NoActionBarLaunch["']/.test(v31)) {
  v31 = v31.replace("</resources>", '    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n    </style>\n</resources>');
}
v31 = updateStyle(v31, "AppTheme.NoActionBarLaunch", v31Items);
fs.writeFileSync(v31Path, v31);

console.log("Native Android splash configured with the Zikr-e-Ilahi logo and deep-green background.");
