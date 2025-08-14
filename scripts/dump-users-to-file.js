require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

(async () => {
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  };
  const outPath = path.join(__dirname, '_users_dump.json');
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    const colsRs = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_users' ORDER BY ORDINAL_POSITION`);
    const usersRs = await pool.request().query(`SELECT TOP 10 * FROM mbo_users ORDER BY createdAt DESC`);
    const payload = {
      generatedAt: new Date().toISOString(),
      columnCount: colsRs.recordset.length,
      columns: colsRs.recordset,
      userCountSample: usersRs.recordset.length,
      usersSample: usersRs.recordset
    };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    await pool.close();
  } catch (e) {
    fs.writeFileSync(outPath, JSON.stringify({ error: e.message }, null, 2));
  }
})();
