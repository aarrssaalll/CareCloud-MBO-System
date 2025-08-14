require('dotenv').config();
const fetch = require('node-fetch');
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/mbo/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@company.com' }) });
    const text = await res.text();
    require('fs').writeFileSync(require('path').join(__dirname, '_auth_response.txt'), text);
  } catch (e) {
    require('fs').writeFileSync(require('path').join(__dirname, '_auth_response.txt'), 'ERROR: '+ e.message);
  }
})();
