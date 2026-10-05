import fs from "node:fs";
import path from "node:path";
import { achievements } from "../content/proof/achievements";
import { profile } from "../content/profile";
import { technologies } from "../content/tech";

const missing: string[] = [];
if (!fs.existsSync(path.join(process.cwd(), "public", profile.portraitPath))) {
  missing.push(profile.portraitPath);
}
if (!fs.existsSync(path.join(process.cwd(), "public", profile.resumePath))) {
  missing.push(profile.resumePath);
}

for (const a of achievements) {
  if (a.imagePath && !fs.existsSync(path.join(process.cwd(), "public", a.imagePath))) {
    missing.push(a.imagePath);
  }
  if (a.imagePath2 && !fs.existsSync(path.join(process.cwd(), "public", a.imagePath2))) {
    missing.push(a.imagePath2);
  }
}

for (const t of technologies) {
  if (t.logo && !fs.existsSync(path.join(process.cwd(), "public", "tech", `${t.logo}.svg`))) {
    missing.push(`tech/${t.logo}.svg`);
  }
}

console.log("Missing assets count:", missing.length);
if (missing.length > 0) {
  console.log("Missing:", missing);
  process.exit(1);
} else {
  console.log("ALL ASSETS EXIST VERIFIED!");
}
