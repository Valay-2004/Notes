const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, '../viewer/notes-manifest.json');

// Folders to exclude from crawl
const EXCLUDE = ['.git', 'viewer', 'scripts', '.obsidian'];

function getTitle(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^#\s+(.+)$/m);
        if (match) return match[1].trim();
    } catch (e) {}
    return path.basename(filePath, '.md');
}

function crawl(dir, relativePath = '') {
    const items = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (EXCLUDE.includes(file)) continue;
        
        const fullPath = path.join(dir, file);
        const relPath = path.join(relativePath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            const children = crawl(fullPath, relPath);
            if (children.length > 0) {
                items.push({
                    type: 'folder',
                    name: file,
                    path: relPath.replace(/\\/g, '/'),
                    children: children.sort((a, b) => a.name.localeCompare(b.name))
                });
            }
        } else if (file.endsWith('.md') && file !== 'Implementation Plan.md' && file !== 'README.md' && file !== 'Diff.md') {
            items.push({
                type: 'file',
                name: file,
                title: getTitle(fullPath),
                path: relPath.replace(/\\/g, '/')
            });
        }
    }
    return items.sort((a, b) => {
        // Folders first, then files
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

const manifest = crawl(ROOT_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log('Global manifest generated at:', OUTPUT_FILE);
