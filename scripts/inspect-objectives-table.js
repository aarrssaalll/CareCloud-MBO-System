require('dotenv').config();
const sql = require('mssql');
(async () => {
  const cfg={user:process.env.DB_USER,password:process.env.DB_PASSWORD,server:process.env.DB_SERVER,database:process.env.DB_NAME,options:{encrypt:false,trustServerCertificate:true,enableArithAbort:true}};
  try {const pool=await new sql.ConnectionPool(cfg).connect();
    const cols=await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_objectives' ORDER BY ORDINAL_POSITION");
    console.log('mbo_objectives columns:');
    cols.recordset.forEach(c=>console.log(' -',c.COLUMN_NAME,c.DATA_TYPE));
    await pool.close();
  } catch(e){console.error('Error:',e.message);} })();
