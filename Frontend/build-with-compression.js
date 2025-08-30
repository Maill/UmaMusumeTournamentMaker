const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Build the Angular app first
console.log('Building Angular app...');
execSync('ng build', { stdio: 'inherit' });

// Compress files after build
console.log('Compressing files...');
const distPath = path.join(__dirname, 'dist', 'tournament-frontend');

function compressFile(filePath) {
  const content = fs.readFileSync(filePath);
  
  // Generate gzip
  const gzipped = zlib.gzipSync(content, { level: 9 });
  fs.writeFileSync(filePath + '.gz', gzipped);
  
  // Generate brotli
  const brotli = zlib.brotliCompressSync(content, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    },
  });
  fs.writeFileSync(filePath + '.br', brotli);
  
  console.log(`Compressed: ${path.basename(filePath)}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (/\.(js|css|html|svg)$/.test(file) && stat.size > 8192) {
      compressFile(filePath);
    }
  });
}

if (fs.existsSync(distPath)) {
  processDirectory(distPath);
  console.log('Compression complete!');
} else {
  console.error('Dist directory not found');
}