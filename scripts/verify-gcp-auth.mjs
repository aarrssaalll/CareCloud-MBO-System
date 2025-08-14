import 'dotenv/config';
import fs from 'fs';

const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

console.log(`[INFO] Script running in: ${process.cwd()}`);
console.log(`[INFO] Attempting to read GOOGLE_APPLICATION_CREDENTIALS from .env.local`);
console.log(`[INFO] Path found: "${credsPath}"`);

if (!credsPath) {
  console.error('\n[ERROR] The GOOGLE_APPLICATION_CREDENTIALS variable is not set in your .env.local file.');
  process.exit(1);
}

try {
  const stats = fs.statSync(credsPath);
  if (stats.isFile()) {
    console.log('\n[SUCCESS] The file was found at the specified path.');
    const content = fs.readFileSync(credsPath, 'utf-8');
    const json = JSON.parse(content);
    console.log(`[SUCCESS] File is valid JSON. Project ID from file: "${json.project_id}"`);
    console.log('\nThis confirms the path is correct and the file is readable. If the API still fails, the problem is likely with Google Cloud permissions or APIs not being enabled.');
  } else {
    console.error(`\n[ERROR] The path "${credsPath}" points to a directory, not a file.`);
    process.exit(1);
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`\n[ERROR] File not found. The path "${credsPath}" does not exist.`);
  } else if (error instanceof SyntaxError) {
    console.error(`\n[ERROR] The file at "${credsPath}" is not valid JSON.`);
  } else {
    console.error(`\n[ERROR] An unknown error occurred while trying to read the file:`, error.message);
  }
  process.exit(1);
}
