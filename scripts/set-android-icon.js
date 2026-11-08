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
    <path android:fillColor="#F6D878" android:pathData="M54,13a15,15 0,1 0,0 30a12,12 0,1 1,0 -30"/>
    <path android:fillColor="#F6D878" android:pathData="M20,82V59l9,-12 9,12v23zM70,82V59l9,-12 9,12v23z"/>
    <path android:fillColor="#F6D878" android:pathData="M35,82V61q19,-25 38,0v21z"/>
    <path android:fillColor="#064B2D" android:pathData="M45,82V68q9,-13 18,0v14z"/>
    <path android:fillColor="#F6D878" android:pathData="M49,59V48h10v11zM47,48l7,-9 7,9z"/>
    <path android:fillColor="#F6D878" android:pathData="M14,82h80v5h-80z"/>
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
