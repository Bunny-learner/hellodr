import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// absolute path of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// templates folder is ALWAYS next to utils folder
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

export function loadTemplate(templateName, replacements = {}) {
  const filePath = path.join(TEMPLATES_DIR, templateName);
console.log("filePath:",filePath)
  if (!fs.existsSync(filePath)) {
    console.error("Template missing at:", filePath); // LOG IT
    throw new Error("Email template not found: " + filePath);
  }

  let template = fs.readFileSync(filePath, "utf-8");

  for (const key in replacements) {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, replacements[key]);
  }

  return template;
}
