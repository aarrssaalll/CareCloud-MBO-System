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
  const ddlReport = [];
  try {
    const pool = await new sql.ConnectionPool(config).connect();

    // Identify FKs referencing mbo_users
    const fkRs = await pool.request().query(`SELECT fk.name as fk_name, t.name as referencing_table
      FROM sys.foreign_keys fk
      INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN sys.tables t ON fkc.parent_object_id = t.object_id
      INNER JOIN sys.tables rt ON fkc.referenced_object_id = rt.object_id
      WHERE rt.name = 'mbo_users'`);

    for (const row of fkRs.recordset) {
      try {
        await pool.request().query(`ALTER TABLE ${row.referencing_table} DROP CONSTRAINT ${row.fk_name}`);
        ddlReport.push({ droppedFK: row.fk_name, table: row.referencing_table });
      } catch (e) {
        ddlReport.push({ dropFkFailed: row.fk_name, error: e.message });
      }
    }

    // Drop table
    try {
      await pool.request().query(`IF OBJECT_ID('dbo.mbo_users','U') IS NOT NULL DROP TABLE dbo.mbo_users`);
      ddlReport.push({ dropped: 'mbo_users' });
    } catch (e) {
      ddlReport.push({ dropFailed: e.message });
    }

    // Recreate table with comprehensive schema
    const createSql = `CREATE TABLE dbo.mbo_users (
      id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
      employeeId NVARCHAR(50) NULL,
      email NVARCHAR(255) NOT NULL UNIQUE,
      firstName NVARCHAR(100) NULL,
      lastName NVARCHAR(100) NULL,
      name AS (CONCAT(ISNULL(firstName,''), CASE WHEN firstName IS NOT NULL AND lastName IS NOT NULL THEN ' ' ELSE '' END, ISNULL(lastName,''))) PERSISTED,
      role NVARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE',
      title NVARCHAR(150) NULL,
      phone NVARCHAR(40) NULL,
      hireDate DATE NULL,
      salary DECIMAL(18,2) NULL,
      status NVARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      departmentId UNIQUEIDENTIFIER NULL,
      teamId UNIQUEIDENTIFIER NULL,
      managerId UNIQUEIDENTIFIER NULL,
      createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );`;
    try { await pool.request().query(createSql); ddlReport.push({ created: 'mbo_users' }); } catch (e) { ddlReport.push({ createFailed: e.message }); }

    // Add FKs back where tables exist
    const fkAdds = [
      { name: 'FK_mbo_users_department', sql: `ALTER TABLE dbo.mbo_users ADD CONSTRAINT FK_mbo_users_department FOREIGN KEY (departmentId) REFERENCES dbo.mbo_departments(id)` },
      { name: 'FK_mbo_users_team', sql: `ALTER TABLE dbo.mbo_users ADD CONSTRAINT FK_mbo_users_team FOREIGN KEY (teamId) REFERENCES dbo.mbo_teams(id)` },
      { name: 'FK_mbo_users_manager', sql: `ALTER TABLE dbo.mbo_users ADD CONSTRAINT FK_mbo_users_manager FOREIGN KEY (managerId) REFERENCES dbo.mbo_users(id)` }
    ];

    for (const fk of fkAdds) {
      try { await pool.request().query(fk.sql); ddlReport.push({ addedFK: fk.name }); } catch (e) { ddlReport.push({ addFkFailed: fk.name, error: e.message }); }
    }

    // Trigger to auto-update updatedAt
    try {
      await pool.request().query(`CREATE TRIGGER trg_mbo_users_updatedAt ON dbo.mbo_users AFTER UPDATE AS BEGIN SET NOCOUNT ON; UPDATE dbo.mbo_users SET updatedAt = GETDATE() FROM inserted i WHERE dbo.mbo_users.id = i.id; END`);
      ddlReport.push({ trigger: 'created' });
    } catch (e) {
      ddlReport.push({ triggerFailed: e.message });
    }

    // Write report file
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname,'_recreate_users_report.json'), JSON.stringify(ddlReport, null, 2));

    await pool.close();
  } catch (e) {
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname,'_recreate_users_report.json'), JSON.stringify([{ fatal: e.message }], null, 2));
  }
})();
