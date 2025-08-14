require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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
  const out = { steps: [] };
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    out.steps.push({ msg: 'Connected' });
    const existing = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_users'`);
    out.before = existing.recordset;
    const existingSet = new Set(existing.recordset.map(r => r.COLUMN_NAME.toLowerCase()));

    for (const col of needed) {
      if (!existingSet.has(col.name.toLowerCase())) {
        const ddl = `ALTER TABLE dbo.mbo_users ADD ${col.name} ${col.type} ${col.null} ${col.default || ''}`.trim();
        try {
          await pool.request().query(ddl);
          out.steps.push({ added: col.name, ddl });
        } catch (e) {
          out.steps.push({ failedAdd: col.name, error: e.message, ddl });
        }
      } else {
        out.steps.push({ exists: col.name });
      }
    }

    const after = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_users'`);
    out.after = after.recordset;

    const trigCheck = await pool.request().query("SELECT name FROM sys.triggers WHERE name='trg_mbo_users_updatedAt'");
    if (trigCheck.recordset.length === 0) {
      try {
        await pool.request().query(`CREATE TRIGGER trg_mbo_users_updatedAt ON dbo.mbo_users AFTER UPDATE AS BEGIN SET NOCOUNT ON; UPDATE dbo.mbo_users SET updatedAt = GETDATE() FROM inserted i WHERE dbo.mbo_users.id = i.id; END`);
        out.steps.push({ trigger: 'created' });
      } catch (e) {
        out.steps.push({ triggerCreateFailed: e.message });
      }
    } else {
      out.steps.push({ trigger: 'exists' });
    }

    await pool.close();
    out.status = 'ok';
  } catch (e) {
    out.status = 'failed';
    out.error = e.message;
  }
  fs.writeFileSync(path.join(__dirname, '_enhanced_migrate_result.json'), JSON.stringify(out, null, 2));
})();
