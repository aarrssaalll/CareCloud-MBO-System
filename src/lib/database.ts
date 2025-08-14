import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'data', 'mbo_system.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await createTables();
  
  return db;
}

async function createTables() {
  if (!db) throw new Error('Database not initialized');

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK(role IN ('employee', 'manager', 'hr', 'senior-management')),
      title VARCHAR(150),
      department_id INTEGER,
      team_id INTEGER,
      manager_id INTEGER,
      phone VARCHAR(20),
      hire_date DATE,
      salary DECIMAL(12,2),
      status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'terminated')),
      permissions TEXT, -- JSON array of permissions
      profile_image VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )
  `);

  // Departments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      manager_id INTEGER,
      budget DECIMAL(15,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )
  `);

  // Teams table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      department_id INTEGER NOT NULL,
      team_lead_id INTEGER,
      budget DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (team_lead_id) REFERENCES users(id)
    )
  `);

  // Objectives table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS objectives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      target_value DECIMAL(10,2),
      current_value DECIMAL(10,2) DEFAULT 0,
      unit VARCHAR(50),
      weight_percentage DECIMAL(5,2) NOT NULL,
      category VARCHAR(100),
      quarter INTEGER NOT NULL CHECK(quarter IN (1,2,3,4)),
      year INTEGER NOT NULL,
      self_score DECIMAL(5,2),
      manager_score DECIMAL(5,2),
      ai_score DECIMAL(5,2),
      final_score DECIMAL(5,2),
      status VARCHAR(50) DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'completed', 'cancelled')),
      created_by INTEGER,
      assigned_date DATE,
      due_date DATE,
      completion_date DATE,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Approvals table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_type VARCHAR(50) NOT NULL CHECK(request_type IN ('objective_override', 'bonus_approval', 'score_review', 'workflow_approval')),
      request_id INTEGER NOT NULL, -- References the objective, bonus, etc.
      requester_id INTEGER NOT NULL,
      approver_id INTEGER,
      status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      priority VARCHAR(20) DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      request_data TEXT, -- JSON data for the request
      approval_notes TEXT,
      approved_at DATETIME,
      rejected_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requester_id) REFERENCES users(id),
      FOREIGN KEY (approver_id) REFERENCES users(id)
    )
  `);

  // Workflow stages table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      objective_id INTEGER NOT NULL,
      stage_name VARCHAR(50) NOT NULL,
      stage_order INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'skipped')),
      completed_by INTEGER,
      completed_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (objective_id) REFERENCES objectives(id),
      FOREIGN KEY (completed_by) REFERENCES users(id)
    )
  `);

  // Performance metrics table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      year INTEGER NOT NULL,
      total_objectives INTEGER DEFAULT 0,
      completed_objectives INTEGER DEFAULT 0,
      average_score DECIMAL(5,2),
      weighted_score DECIMAL(5,2),
      bonus_percentage DECIMAL(5,2),
      bonus_amount DECIMAL(10,2),
      rating VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, quarter, year)
    )
  `);

  // Notifications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info' CHECK(type IN ('info', 'warning', 'error', 'success')),
      read_status BOOLEAN DEFAULT FALSE,
      action_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Audit log table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(50) NOT NULL,
      resource_id INTEGER,
      old_values TEXT, -- JSON
      new_values TEXT, -- JSON
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database tables created successfully');
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
