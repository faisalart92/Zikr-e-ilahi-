const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const res = path.join(root, "android", "app", "src", "main", "res");
const source = path.join(root, "assets", "zikr-ilahi-launcher.webp.b64");

if (!fs.existsSync(source)) {
  throw new Error("User-provided Zikr-e-Ilahi launcher artwork is missing.");
}

const encoded = fs.readFileSync(source, "utf8").replace(/\s+/g, "");
const image = Buffer.from(encoded, "base64");
if (image.length < 1000 || image.toString("ascii", 0, 4) !== "RIFF" ||
    image.toString("ascii", 8, 12) !== "WEBP") {
  throw new Error("Launcher artwork payload is not a valid WebP image.");
}

const drawableNodpi = path.join(res, "drawable-nodpi");
const mipmapNodpi = path.join(res, "mipmap-nodpi");
const adaptiveDir = path.join(res, "mipmap-anydpi-v26");
const legacyAdaptiveDir = path.join(res, "mipmap-anydpi");
fs.mkdirSync(drawableNodpi, { recursive: true });
fs.mkdirSync(mipmapNodpi, { recursive: true });
fs.mkdirSync(adaptiveDir, { recursive: true });
fs.mkdirSync(legacyAdaptiveDir, { recursive: true });

// Use the exact user-supplied crescent-and-mosque artwork for both
// legacy launchers and the adaptive icon foreground.
fs.writeFileSync(path.join(drawableNodpi, "zikr_launcher_art.webp"), image);
fs.writeFileSync(path.join(mipmapNodpi, "ic_launcher.webp"), image);

const background = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#06251C" android:pathData="M0,0h108v108h-108z"/>
</vector>`;

const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/zikr_icon_background"/>
    <foreground android:drawable="@drawable/zikr_launcher_art"/>
</adaptive-icon>`;

fs.writeFileSync(path.join(res, "drawable", "zikr_icon_background.xml"), background);
fs.writeFileSync(path.join(adaptiveDir, "ic_launcher.xml"), adaptive);
fs.writeFileSync(path.join(adaptiveDir, "ic_launcher_round.xml"), adaptive);

// The earlier native-prayer setup creates generic fallback XML icons in
// mipmap-anydpi. Replace those too, otherwise Android 5–7 can show the
// temporary generated icon instead of the artwork selected by the user.
const legacyIcon = `<?xml version="1.0" encoding="utf-8"?>\n<bitmap xmlns:android="http://schemas.android.com/apk/res/android" android:src="@drawable/zikr_launcher_art" />`;
fs.writeFileSync(path.join(legacyAdaptiveDir, "ic_launcher.xml"), legacyIcon);
fs.writeFileSync(path.join(legacyAdaptiveDir, "ic_launcher_round.xml"), legacyIcon);

const manifest = path.join(root, "android", "app", "src", "main", "AndroidManifest.xml");
if (!fs.existsSync(manifest)) {
  throw new Error("AndroidManifest.xml was not generated.");
}
let xml = fs.readFileSync(manifest, "utf8");
xml = xml.replace(/android:icon="[^"]*"/, 'android:icon="@mipmap/ic_launcher"');
if (/android:roundIcon="[^"]*"/.test(xml)) {
  xml = xml.replace(/android:roundIcon="[^"]*"/, 'android:roundIcon="@mipmap/ic_launcher_round"');
} else {
  xml = xml.replace(/<application\b/, '<application android:roundIcon="@mipmap/ic_launcher_round"');
}
fs.writeFileSync(manifest, xml);

console.log("Exact user-provided Zikr-e-Ilahi icon installed for legacy and adaptive Android launchers.");
