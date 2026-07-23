const fs = require('fs');
const path = require('path');

function checkImports(filePath, visited) {
  if (visited.has(filePath)) return;
  visited.add(filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log('MISSING FILE:', filePath);
    return;
  }
  
  // also check if case matches exactly on disk (useful for catching Windows case-insensitivity masking issues)
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const filesInDir = fs.readdirSync(dir);
  if (!filesInDir.includes(base)) {
    console.log('CASE MISMATCH:', filePath, 'Actual files:', filesInDir.find(f => f.toLowerCase() === base.toLowerCase()));
  }

  const code = fs.readFileSync(filePath, 'utf8');
  // Match imports
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];
    // Resolve relative paths
    if (importPath.startsWith('.')) {
      const targetPath = path.resolve(dir, importPath);
      checkImports(targetPath, visited);
    }
  }
}

checkImports(path.resolve('js/main.js'), new Set());
console.log('Static import check complete.');
