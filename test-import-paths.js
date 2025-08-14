// Test import paths
const path = require('path');

console.log('Current directory:', __dirname);

// Test if the file exists at the correct location
const fs = require('fs');
const libPath = path.resolve(__dirname, 'lib', 'database', 'mbo-data-access.ts');
console.log('Looking for file at:', libPath);
console.log('File exists:', fs.existsSync(libPath));

// Test from API perspective  
const apiAuthPath = path.resolve(__dirname, 'src', 'app', 'api', 'mbo', 'auth');
console.log('API auth path:', apiAuthPath);
const relativeToLib = path.relative(apiAuthPath, libPath);
console.log('Relative path from API auth to lib:', relativeToLib);

// Convert Windows path to Unix style for import
const unixPath = relativeToLib.replace(/\\/g, '/');
console.log('Unix-style path for import:', unixPath);
