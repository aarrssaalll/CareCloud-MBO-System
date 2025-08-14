import sql from 'mssql';

const config = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || '',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDbConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
  }
  return pool;
}

export async function closeDbConnection() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

// Initialize MBO tables only if they don't exist
export async function initializeMboTables() {
  const pool = await getDbConnection();
  
  try {
    // Check if MBO tables exist, if not create them
    const checkTablesQuery = `
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('mbo_users', 'mbo_departments', 'mbo_teams', 'mbo_objectives', 'mbo_reviews', 'mbo_bonuses', 'mbo_approvals')
    `;
    
    const result = await pool.request().query(checkTablesQuery);
    const existingTables = result.recordset[0].count;
    
    if (existingTables === 0) {
      // Create MBO tables
      await createMboTables(pool);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing MBO tables:', error);
    throw error;
  }
}

async function createMboTables(pool: sql.ConnectionPool) {
  const createTablesSQL = `
    -- Create MBO Departments table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_departments')
    CREATE TABLE mbo_departments (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      name NVARCHAR(255) UNIQUE NOT NULL,
      description NVARCHAR(MAX),
      budget FLOAT,
      managerId NVARCHAR(30),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE()
    );

    -- Create MBO Teams table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_teams')
    CREATE TABLE mbo_teams (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      name NVARCHAR(255) NOT NULL,
      description NVARCHAR(MAX),
      leaderId NVARCHAR(30),
      departmentId NVARCHAR(30) NOT NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (departmentId) REFERENCES mbo_departments(id)
    );

    -- Create MBO Users table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_users')
    CREATE TABLE mbo_users (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      employeeId NVARCHAR(255) UNIQUE NOT NULL,
      email NVARCHAR(255) UNIQUE NOT NULL,
      firstName NVARCHAR(255) NOT NULL,
      lastName NVARCHAR(255) NOT NULL,
      name NVARCHAR(255) NOT NULL,
      role NVARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
      title NVARCHAR(255) NOT NULL,
      phone NVARCHAR(50),
      hireDate DATETIME2,
      salary FLOAT,
      status NVARCHAR(50) DEFAULT 'ACTIVE',
      permissions NVARCHAR(MAX),
      profileImage NVARCHAR(500),
      departmentId NVARCHAR(30),
      teamId NVARCHAR(30),
      managerId NVARCHAR(30),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (departmentId) REFERENCES mbo_departments(id),
      FOREIGN KEY (teamId) REFERENCES mbo_teams(id),
      FOREIGN KEY (managerId) REFERENCES mbo_users(id)
    );

    -- Create MBO Objectives table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_objectives')
    CREATE TABLE mbo_objectives (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      title NVARCHAR(255) NOT NULL,
      description NVARCHAR(MAX) NOT NULL,
      category NVARCHAR(100) NOT NULL,
      target FLOAT NOT NULL,
      current FLOAT NOT NULL,
      weight FLOAT DEFAULT 1.0,
      status NVARCHAR(50) DEFAULT 'ACTIVE',
      dueDate DATETIME2 NOT NULL,
      quarter NVARCHAR(10) NOT NULL,
      year INT NOT NULL,
      userId NVARCHAR(30) NOT NULL,
      assignedById NVARCHAR(30),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (userId) REFERENCES mbo_users(id),
      FOREIGN KEY (assignedById) REFERENCES mbo_users(id)
    );

    -- Create MBO Reviews table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_reviews')
    CREATE TABLE mbo_reviews (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      quarter NVARCHAR(10) NOT NULL,
      year INT NOT NULL,
      overallScore FLOAT NOT NULL,
      comments NVARCHAR(MAX),
      status NVARCHAR(50) DEFAULT 'DRAFT',
      submittedAt DATETIME2,
      approvedAt DATETIME2,
      employeeId NVARCHAR(30) NOT NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (employeeId) REFERENCES mbo_users(id)
    );

    -- Create MBO Bonuses table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_bonuses')
    CREATE TABLE mbo_bonuses (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      quarter NVARCHAR(10) NOT NULL,
      year INT NOT NULL,
      baseAmount FLOAT NOT NULL,
      performanceMultiplier FLOAT NOT NULL,
      finalAmount FLOAT NOT NULL,
      status NVARCHAR(50) DEFAULT 'CALCULATED',
      calculatedAt DATETIME2 DEFAULT GETDATE(),
      paidAt DATETIME2,
      employeeId NVARCHAR(30) NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES mbo_users(id)
    );

    -- Create MBO Approvals table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_approvals')
    CREATE TABLE mbo_approvals (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      type NVARCHAR(50) NOT NULL,
      entityId NVARCHAR(30) NOT NULL,
      status NVARCHAR(50) DEFAULT 'PENDING',
      comments NVARCHAR(MAX),
      approvedAt DATETIME2,
      rejectedAt DATETIME2,
      approverId NVARCHAR(30) NOT NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (approverId) REFERENCES mbo_users(id)
    );

    -- Create MBO Objective Reviews table
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mbo_objective_reviews')
    CREATE TABLE mbo_objective_reviews (
      id NVARCHAR(30) PRIMARY KEY DEFAULT NEWID(),
      score FLOAT NOT NULL,
      comments NVARCHAR(MAX),
      reviewDate DATETIME2 DEFAULT GETDATE(),
      objectiveId NVARCHAR(30) NOT NULL,
      reviewerId NVARCHAR(30) NOT NULL,
      FOREIGN KEY (objectiveId) REFERENCES mbo_objectives(id),
      FOREIGN KEY (reviewerId) REFERENCES mbo_users(id)
    );
  `;

  await pool.request().query(createTablesSQL);
}
