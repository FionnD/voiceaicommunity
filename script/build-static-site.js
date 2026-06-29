const fs = require("fs");
const path = require("path");

require("./validate-static-site");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const files = ["index.html", "styles.css", "CNAME"];
const directories = ["data", "images", "ja", "script", "translations"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(dist, directory), {
    recursive: true,
    filter(source) {
      const name = path.basename(source);
      return !name.endsWith(".backup") && !name.endsWith(".log");
    }
  });
}

console.log(`Built static site in ${path.relative(root, dist)}/`);
