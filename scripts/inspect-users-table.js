require('dotenv').config();
const sql = require('mssql');

(async () => {
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  };
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    const rs = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_users' ORDER BY ORDINAL_POSITION`);
    console.log('mbo_users columns:');
    rs.recordset.forEach(c => console.log(` - ${c.COLUMN_NAME} (${c.DATA_TYPE}) ${c.IS_NULLABLE}`));
    await pool.close();
  } catch (e) {
    console.error('Error inspecting users table:', e.message);
  }
})();
