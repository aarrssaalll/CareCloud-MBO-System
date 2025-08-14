// Test login route path specifically
const path = require('path');
const fs = require('fs');

const libPath = path.resolve(__dirname, 'lib', 'database', 'mbo-data-access.ts');
const apiLoginPath = path.resolve(__dirname, 'src', 'app', 'api', 'mbo', 'auth', 'login');

console.log('Library file path:', libPath);
console.log('API login path:', apiLoginPath);

const relativeToLib = path.relative(apiLoginPath, libPath);
console.log('Relative path from login API to lib:', relativeToLib);

const unixPath = relativeToLib.replace(/\\/g, '/');
console.log('Unix-style path for login import:', unixPath);
