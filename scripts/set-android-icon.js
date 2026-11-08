const fs = require("node:fs");
const path = require("node:path");

const res = path.join(__dirname, "..", "android", "app", "src", "main", "res");
const adaptiveDir = path.join(res, "mipmap-anydpi-v26");
const drawableDir = path.join(res, "drawable");
fs.mkdirSync(adaptiveDir, { recursive: true });
fs.mkdirSync(drawableDir, { recursive: true });

const background = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#064B2D" android:pathData="M0,0h108v108h-108z"/>
    <path android:fillColor="#0A6B3D" android:pathData="M0,78L54,30 108,78v30h-108z"/>
    <path android:fillColor="#D9AE45" android:pathData="M0,8h108v3h-108zM0,97h108v3h-108z"/>
</vector>`;

const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#DDB64F" android:pathData="M50,12 C25,15 11,37 13,58 C15,82 37,96 60,91 C77,87 89,73 92,55 C84,75 67,84 49,79 C28,73 20,54 27,35 C31,24 40,16 50,12 Z"/>
    <path android:fillColor="#E8C45F" android:pathData="M54,34 C43,34 34,43 34,53 L74,53 C74,43 65,34 54,34 Z"/>
    <path android:fillColor="#E8C45F" android:pathData="M50,33 L50,25 L58,25 L58,33 Z M54,18 C50,18 48,21 48,24 C48,27 50,29 54,29 C58,29 60,27 60,24 C60,21 58,18 54,18 Z"/>
    <path android:fillColor="#E8C45F" android:pathData="M31,55 H77 V60 H31 Z M35,60 H73 V84 H35 Z"/>
    <path android:fillColor="#064B2D" android:pathData="M46,84 V70 C46,63 62,63 62,70 V84 Z"/>
    <path android:fillColor="#E8C45F" android:pathData="M28,84 H80 V88 H28 Z"/>
</vector>`;

const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/zikr_icon_background"/>
    <foreground android:drawable="@drawable/zikr_icon_foreground"/>
</adaptive-icon>`;

fs.writeFileSync(path.join(drawableDir, "zikr_icon_background.xml"), background);
fs.writeFileSync(path.join(drawableDir, "zikr_icon_foreground.xml"), foreground);
fs.writeFileSync(path.join(adaptiveDir, "ic_launcher.xml"), adaptive);
fs.writeFileSync(path.join(adaptiveDir, "ic_launcher_round.xml"), adaptive);
console.log("Zikr-e-Ilahi green-and-gold launcher icon installed.");
