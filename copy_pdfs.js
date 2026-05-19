#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const sources = [
    'C:\\Users\\Jorge\\Downloads\\POPs_Microscopia',
    'C:\\Users\\Jorge\\Downloads\\POPs_Lavagem',
    'C:\\Users\\Jorge\\Downloads\\POPs_Analises_Clinicas',
    'C:\\Users\\Jorge\\Downloads\\multididatico_POP'
];

const destination = 'C:\\Users\\Jorge\\Downloads\\iftracker\\pdfs';

// Create destination directory
if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
}

let totalCopied = 0;

// Copy all PDFs
sources.forEach(source => {
    try {
        if (fs.existsSync(source)) {
            const files = fs.readdirSync(source).filter(f => f.endsWith('.pdf'));
            files.forEach(file => {
                const srcPath = path.join(source, file);
                const destPath = path.join(destination, file);
                fs.copyFileSync(srcPath, destPath);
                totalCopied++;
                console.log(`✓ Copied: ${file}`);
            });
        } else {
            console.log(`✗ Source not found: ${source}`);
        }
    } catch (err) {
        console.error(`✗ Error copying from ${source}:`, err.message);
    }
});

// Verify all files are present
const copiedFiles = fs.readdirSync(destination).filter(f => f.endsWith('.pdf'));
console.log(`\n✓ Total PDFs copied: ${totalCopied}`);
console.log(`✓ Files in destination: ${copiedFiles.length}\n`);

copiedFiles.sort().forEach(f => {
    console.log(`  - ${f}`);
});
