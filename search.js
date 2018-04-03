'use strict'
const fs = require('fs');
const { promisify } = require('util');
const path = require('path')
 
if (process.argv.length === 2) {
    console.log("USAGE: node search [EXT] [TEXT]");
    process.exit(-1);
}

if (process.argv.length === 3) {
    console.log("missing argument");
    console.log("USAGE: node search [EXT] [TEXT]");
    process.exit(-1);
}

const EXT = process.argv[2];
const TEXT = process.argv[3];
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

async function scanDirectory(directory, extension, text) {
    const result = [];
    const items = await readdir(directory);
    await Promise.all(items.map(async (item) => {
        const fullPath = directory + '\\'+item; 
        const stats = await stat(fullPath)
        if (stats.isDirectory()) {
            const localResult = await scanDirectory(fullPath, extension, text);
            result.push(...localResult);
        }
        if (stats.isFile()) {
            const itemExtension = path.extname(item).slice(1);
            if (itemExtension === extension) {
                const contents = await readFile(fullPath, 'utf8');
                if (contents.includes(text)) {
                    result.push(fullPath);
                }
            }    
        }
    }))
    return result;
}

function getRelevantFiles(extension, text) {
    const rootPath = process.cwd();
    return new Promise((resolve, reject) => {
        resolve(scanDirectory(rootPath, extension, text))
    })
} 

getRelevantFiles(EXT, TEXT).then((relevantFiles) => {
    if (relevantFiles.length === 0) {
        console.log("No file was found");
    } else {
        relevantFiles.map((file) => console.log(file));
    }
})