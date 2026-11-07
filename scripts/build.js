const fs = require("node:fs");
const path = require("node:path");

const source = path.join(__dirname, "..", "Zikr-e-Ilahi-Home-and-Prayer-Location-Search.html");
const outputDir = path.join(__dirname, "..", "www");
const output = path.join(outputDir, "index.html");

if (!fs.existsSync(source)) {
  console.error("Main Zikr-e-Ilahi HTML file is missing.");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(source, output);
console.log("Web app prepared at www/index.html");
