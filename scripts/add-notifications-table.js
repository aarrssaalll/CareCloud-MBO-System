const sql = require('mssql');

const config = {
  server: '2F-WKS-020\\MSSQLSERVER02',
  database: 'CareCloudMBO',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: true
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: '',
      password: ''
    }
  }
};

async function addNotificationsTable() {
  try {
    console.log('🔌 Connecting to database...');
    await sql.connect(config);
    
    console.log('🔍 Checking if notifications table exists...');
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'mbo_notifications'
    `;
    
    const tableExists = await sql.query(checkTableQuery);
    
    if (tableExists.recordset[0].count > 0) {
      console.log('✅ Notifications table already exists');
      return;
    }
    
    console.log('📝 Creating notifications table...');
    const createTableQuery = `
      CREATE TABLE mbo_notifications (
        id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
        type NVARCHAR(50) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        [read] BIT NOT NULL DEFAULT 0,
        actionRequired BIT NOT NULL DEFAULT 0,
        entityId NVARCHAR(36) NULL,
        entityType NVARCHAR(50) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        userId NVARCHAR(36) NOT NULL,
        FOREIGN KEY (userId) REFERENCES mbo_users(id) ON DELETE CASCADE
      );
    `;
    
    await sql.query(createTableQuery);
    
    console.log('📇 Creating indexes...');
    await sql.query('CREATE INDEX IDX_notifications_userId ON mbo_notifications(userId);');
    await sql.query('CREATE INDEX IDX_notifications_read ON mbo_notifications([read]);');
    
    console.log('📊 Creating sample notifications...');
    
    // Get some user IDs for sample notifications
    const usersResult = await sql.query('SELECT TOP 3 id, name FROM mbo_users ORDER BY createdAt DESC');
    
    for (const user of usersResult.recordset) {
      const sampleNotifications = [
        {
          type: 'info',
          title: 'Welcome to CareCloud MBO',
          message: `Hello ${user.name}! Welcome to the MBO performance tracking system.`,
          actionRequired: false
        },
        {
          type: 'warning', 
          title: 'Objective Review Pending',
          message: 'You have objectives that need review or completion.',
          actionRequired: true
        }
      ];
      
      for (const notification of sampleNotifications) {
        await sql.query(`
          INSERT INTO mbo_notifications (type, title, message, actionRequired, userId)
          VALUES ('${notification.type}', '${notification.title}', '${notification.message}', ${notification.actionRequired ? 1 : 0}, '${user.id}')
        `);
      }
    }
    
    console.log('✅ Notifications table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
  } finally {
    await sql.close();
  }
}

addNotificationsTable();
