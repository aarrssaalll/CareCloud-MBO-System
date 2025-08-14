require('dotenv').config();
const sql = require('mssql');

const needed = [
  { name: 'role', type: 'NVARCHAR(30)', null: 'NOT NULL', default: "DEFAULT 'EMPLOYEE'" },
  { name: 'title', type: 'NVARCHAR(120)', null: 'NULL' },
  { name: 'departmentId', type: 'UNIQUEIDENTIFIER', null: 'NULL' },
  { name: 'teamId', type: 'UNIQUEIDENTIFIER', null: 'NULL' },
  { name: 'managerId', type: 'UNIQUEIDENTIFIER', null: 'NULL' },
  { name: 'createdAt', type: 'DATETIME2', null: 'NOT NULL', default: 'DEFAULT GETDATE()' },
  { name: 'updatedAt', type: 'DATETIME2', null: 'NOT NULL', default: 'DEFAULT GETDATE()' }
];

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
    const existing = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_users'`);
    const existingSet = new Set(existing.recordset.map(r => r.COLUMN_NAME.toLowerCase()));

    for (const col of needed) {
      if (!existingSet.has(col.name.toLowerCase())) {
        const ddl = `ALTER TABLE dbo.mbo_users ADD ${col.name} ${col.type} ${col.null} ${col.default || ''}`.trim();
        try {
          await pool.request().query(ddl);
          console.log('Added column:', col.name);
        } catch (e) {
          console.log('Failed adding', col.name, e.message);
        }
      } else {
        console.log('Column exists:', col.name);
      }
    }

    // Simple trigger to keep updatedAt current if not exists
    const trigCheck = await pool.request().query("SELECT name FROM sys.triggers WHERE name='trg_mbo_users_updatedAt'");
    if (trigCheck.recordset.length === 0 && existingSet.has('updatedat')) {
      try {
        await pool.request().query(`CREATE TRIGGER trg_mbo_users_updatedAt ON dbo.mbo_users AFTER UPDATE AS BEGIN SET NOCOUNT ON; UPDATE dbo.mbo_users SET updatedAt = GETDATE() FROM inserted i WHERE dbo.mbo_users.id = i.id; END`);
        console.log('Created trigger trg_mbo_users_updatedAt');
      } catch (e) { console.log('Trigger create failed:', e.message); }
    }

    await pool.close();
  } catch (e) {
    console.error('Migration failed:', e.message);
  }
})();
