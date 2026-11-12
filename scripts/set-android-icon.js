const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const res = path.join(root, "android", "app", "src", "main", "res");
const drawable = path.join(res, "drawable");
fs.mkdirSync(drawable, { recursive: true });

// Noor-e-Hidayat: emerald field, gold crescent and mosque silhouette.
const icon = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#073B2B" android:pathData="M0,0h108v108h-108z"/>
    <path android:fillColor="#DDBB62" android:pathData="M66,13 C43,14 27,31 27,53 C27,75 44,92 66,92 C78,92 89,86 96,77 C87,82 76,84 65,79 C48,72 40,54 46,37 C49,26 57,18 66,13z"/>
    <path android:fillColor="#F4E7C2" android:pathData="M18,77h72v5h-72z M25,82h58v5h-58z M31,54h46v23h-46z M27,50h54v5h-54z M37,50 C37,37 46,29 54,29 C62,29 71,37 71,50z M50,29v-9h8v9z M53,17h2v-5h-2z M48,77v-14c0,-8 12,-8 12,0v14z"/>
    <path android:fillColor="#DDBB62" android:pathData="M18,49h7v28h-7z M83,49h7v28h-7z M16,46h11v4h-11z M81,46h11v4h-11z"/>
</vector>`;
fs.writeFileSync(path.join(drawable, "noor_launcher.xml"), icon);

const manifest = path.join(root, "android", "app", "src", "main", "AndroidManifest.xml");
if (!fs.existsSync(manifest)) throw new Error("AndroidManifest.xml was not generated.");
let xml = fs.readFileSync(manifest, "utf8");
xml = xml.replace(/android:icon="[^"]*"/, 'android:icon="@drawable/noor_launcher"');
if (/android:roundIcon="[^"]*"/.test(xml)) {
  xml = xml.replace(/android:roundIcon="[^"]*"/, 'android:roundIcon="@drawable/noor_launcher"');
} else {
  xml = xml.replace(/<application\\b/, '<application android:roundIcon="@drawable/noor_launcher"');
}
fs.writeFileSync(manifest, xml);
console.log("Noor-e-Hidayat emerald-and-gold launcher icon installed.");
