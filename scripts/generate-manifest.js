#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const OUTPUT_FILE = path.join(__dirname, "../notes-manifest.json");

// Folders/files to exclude from crawl
const EXCLUDE = [
  ".git",
  "viewer",
  "scripts",
  ".obsidian",
  "viewer-old-backup",
  "node_modules",
];
const SKIP_FILES = ["README.md"];

function extractTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(/^#\s+(.+?)$/m);
    if (match) return match[1].trim();
  } catch (e) {
    // Ignore read errors
  }
  return path.basename(filePath, ".md");
}

function sortItems(items) {
  return items.sort((a, b) => {
    // Folders first, then files, both alphabetically
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function crawlDirectory(dir, relativePath = "") {
  const items = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      // Skip excluded items
      if (EXCLUDE.includes(file)) continue;

      const fullPath = path.join(dir, file);
      const relPath = path.join(relativePath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Recursively crawl subdirectories
        const children = crawlDirectory(fullPath, relPath);
        if (children.length > 0) {
          items.push({
            type: "folder",
            name: file,
            path: relPath.replace(/\\/g, "/"),
            children: children,
          });
        }
      } else if (file.endsWith(".md") && !SKIP_FILES.includes(file)) {
        // Add markdown files
        items.push({
          type: "file",
          name: file,
          title: extractTitle(fullPath),
          path: relPath.replace(/\\/g, "/"),
        });
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }

  return sortItems(items);
}

// Generate and write manifest
try {
  const manifest = crawlDirectory(ROOT_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`✓ Manifest generated successfully at: ${OUTPUT_FILE}`);
  console.log(`  Total items indexed: ${getItemCount(manifest)}`);
} catch (err) {
  console.error("✗ Failed to generate manifest:", err.message);
  process.exit(1);
}

function getItemCount(items) {
  let count = 0;
  items.forEach((item) => {
    if (item.type === "file") count++;
    else if (item.type === "folder" && item.children) {
      count += getItemCount(item.children);
    }
  });
  return count;
}
