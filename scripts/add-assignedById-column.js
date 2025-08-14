require('dotenv').config();
const sql = require('mssql');
(async () => {
  const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_SERVER, database: process.env.DB_NAME, options:{encrypt:false,trustServerCertificate:true,enableArithAbort:true}};
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    const rs = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_objectives' AND COLUMN_NAME='assignedById'");
    if (rs.recordset.length === 0) {
      await pool.request().query("ALTER TABLE dbo.mbo_objectives ADD assignedById UNIQUEIDENTIFIER NULL");
      console.log('Added assignedById column');
    } else {
      console.log('assignedById already exists');
    }
    await pool.close();
  } catch(e) { console.error('Migration error:', e.message); }
})();
