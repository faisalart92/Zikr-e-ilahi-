const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = path.join(root, "Zikr-e-Ilahi-Home-and-Prayer-Location-Search.html");
const assets = path.join(root, "assets");
const outputDir = path.join(root, "www");
const output = path.join(outputDir, "index.html");

if (!fs.existsSync(source)) {
  console.error("Main Zikr-e-Ilahi HTML file is missing.");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(source, output);

// Copy image and other static assets too; the splash logo is loaded from assets/.
if (fs.existsSync(assets)) {
  fs.cpSync(assets, path.join(outputDir, "assets"), { recursive: true });
}
console.log("Web app and static assets prepared at www/");
