const fs = require("node:fs");
const path = require("node:path");

const manifest = path.join(__dirname, "..", "android", "app", "src", "main", "AndroidManifest.xml");
if (!fs.existsSync(manifest)) {
  console.error("AndroidManifest.xml was not generated.");
  process.exit(1);
}

let xml = fs.readFileSync(manifest, "utf8");
const permissions = [
  '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />'
].join("\n");

if (!xml.includes("android.permission.ACCESS_COARSE_LOCATION")) {
  if (!xml.includes("<application")) {
    console.error("Could not find the application element in AndroidManifest.xml.");
    process.exit(1);
  }
  xml = xml.replace("<application", permissions + "\n    <application");
  fs.writeFileSync(manifest, xml);
}
console.log("Android location permissions configured.");
