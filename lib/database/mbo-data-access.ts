import { getDbConnection } from './mbo-connection';
import sql from 'mssql';

export interface MboUser {
  id: string;
  employeeId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'SENIOR_MANAGEMENT';
  title: string;
  phone?: string;
  hireDate?: Date;
  salary?: number;
  status: string;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  departmentName?: string;
  teamName?: string;
  managerName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MboDepartment {
  id: string;
  name: string;
  description?: string;
  presidentId?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MboTeam {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  managerId?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MboObjective {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  dueDate: Date;
  quarter: string;
  year: number;
  userId: string;
  assignedById?: string;
  assignedByName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MboReview {
  id: string;
  quarter: string;
  year: number;
  overallScore: number;
  comments?: string;
  status: string;
  submittedAt?: Date;
  approvedAt?: Date;
  employeeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MboApproval {
  id: string;
  objectiveId: string;
  type: string;
  status: string;
  requestedById: string;
  approvedById?: string;
  remarks?: string;
  requestedAt?: Date;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MboDataAccess {
  private pool: sql.ConnectionPool | null = null;
  private objectivesHasAssigner: boolean | null = null;

  async initialize() {
    this.pool = await getDbConnection();
  }

  private async ensurePool() {
    if (!this.pool) {
      await this.initialize();
      return;
    }
    // If pool is closed or not connected, reinitialize
    // mssql doesn't expose direct 'closed' flag, catch request errors instead
    try {
      await this.pool.request().query('SELECT 1');
    } catch (e) {
      this.pool = null;
      await this.initialize();
    }
  }

  private async detectObjectivesAssignedBy() {
    if (this.objectivesHasAssigner !== null) return;
    try {
      await this.ensurePool();
      const rs = await this.pool!.request().query("SELECT TOP 1 assignedById FROM dbo.mbo_objectives");
      if (rs) this.objectivesHasAssigner = true;
    } catch {
      this.objectivesHasAssigner = false;
    }
  }

  // User operations
  async getUserById(id: string): Promise<MboUser | null> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT u.*, d.name as departmentName, t.name as teamName, m.name as managerName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        LEFT JOIN mbo_teams t ON u.teamId = t.id
        LEFT JOIN mbo_users m ON u.managerId = m.id
        WHERE u.id = @id
      `);

    return result.recordset[0] || null;
  }

  async getUserByEmail(email: string): Promise<MboUser | null> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.*, d.name as departmentName, t.name as teamName, m.name as managerName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        LEFT JOIN mbo_teams t ON u.teamId = t.id
        LEFT JOIN mbo_users m ON u.managerId = m.id
        WHERE u.email = @email
      `);

    return result.recordset[0] || null;
  }

  async getAllUsers(): Promise<MboUser[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .query(`
        SELECT u.*, d.name as departmentName, t.name as teamName, m.name as managerName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        LEFT JOIN mbo_teams t ON u.teamId = t.id
        LEFT JOIN mbo_users m ON u.managerId = m.id
        ORDER BY u.name
      `);

    return result.recordset;
  }

  async getUsersByRole(role: string): Promise<MboUser[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('role', sql.NVarChar, role)
      .query(`
        SELECT u.*, d.name as departmentName, t.name as teamName, m.name as managerName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        LEFT JOIN mbo_teams t ON u.teamId = t.id
        LEFT JOIN mbo_users m ON u.managerId = m.id
        WHERE u.role = @role
        ORDER BY u.name
      `);

    return result.recordset;
  }

  async getDirectReports(managerId: string): Promise<MboUser[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('managerId', sql.NVarChar, managerId)
      .query(`
        SELECT u.*, d.name as departmentName, t.name as teamName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        LEFT JOIN mbo_teams t ON u.teamId = t.id
        WHERE u.managerId = @managerId
        ORDER BY u.name
      `);

    return result.recordset;
  }

  // Department operations
  async getAllDepartments(): Promise<MboDepartment[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .query(`
        SELECT d.*, m.name as managerName
        FROM mbo_departments d
        LEFT JOIN mbo_users m ON d.managerId = m.id
        ORDER BY d.name
      `);

    return result.recordset;
  }

  async getDepartmentById(id: string): Promise<MboDepartment | null> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT d.*, m.name as managerName
        FROM mbo_departments d
        LEFT JOIN mbo_users m ON d.managerId = m.id
        WHERE d.id = @id
      `);

    return result.recordset[0] || null;
  }

  // Team operations
  async getAllTeams(): Promise<MboTeam[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .query(`
        SELECT t.*, d.name as departmentName, l.name as leaderName
        FROM mbo_teams t
        LEFT JOIN mbo_departments d ON t.departmentId = d.id
        LEFT JOIN mbo_users l ON t.leaderId = l.id
        ORDER BY d.name, t.name
      `);

    return result.recordset;
  }

  async getTeamsByDepartment(departmentId: string): Promise<MboTeam[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('departmentId', sql.NVarChar, departmentId)
      .query(`
        SELECT t.*, l.name as leaderName
        FROM mbo_teams t
        LEFT JOIN mbo_users l ON t.leaderId = l.id
        WHERE t.departmentId = @departmentId
        ORDER BY t.name
      `);

    return result.recordset;
  }

  // Objective operations
  async getObjectivesByUser(userId: string): Promise<MboObjective[]> {
  await this.ensurePool();
  await this.detectObjectivesAssignedBy();

  const selectAssigned = this.objectivesHasAssigner ? 'LEFT JOIN mbo_users a ON o.assignedById = a.id' : '';
  const result = await this.pool!.request()
      .input('userId', sql.NVarChar, userId)
      .query(`
        SELECT o.*, a.name as assignedByName
        FROM mbo_objectives o
    ${selectAssigned}
        WHERE o.userId = @userId
        ORDER BY o.dueDate
      `);

    return result.recordset;
  }

  async getObjectivesByAssigner(assignerId: string): Promise<MboObjective[]> {
  await this.ensurePool();
  await this.detectObjectivesAssignedBy();
  if (!this.objectivesHasAssigner) return [];
  const result = await this.pool!.request()
      .input('assignerId', sql.NVarChar, assignerId)
      .query(`
        SELECT o.*, u.name as userName, u.title as userTitle
        FROM mbo_objectives o
        INNER JOIN mbo_users u ON o.userId = u.id
        WHERE o.assignedById = @assignerId
        ORDER BY o.dueDate
      `);

    return result.recordset;
  }

  async createObjective(objective: Omit<MboObjective, 'id'>): Promise<string> {
  await this.ensurePool();
  await this.detectObjectivesAssignedBy();

    const id = this.generateId();

    const request = this.pool!.request()
      .input('id', sql.NVarChar, id)
      .input('title', sql.NVarChar, objective.title)
      .input('description', sql.NVarChar, objective.description)
      .input('category', sql.NVarChar, objective.category)
      .input('target', sql.Float, objective.target)
      .input('current', sql.Float, objective.current)
      .input('weight', sql.Float, objective.weight)
      .input('status', sql.NVarChar, objective.status)
      .input('dueDate', sql.DateTime2, objective.dueDate)
      .input('quarter', sql.NVarChar, objective.quarter)
      .input('year', sql.Int, objective.year)
      .input('userId', sql.NVarChar, objective.userId);

    let columns = 'id, title, description, category, target, current, weight, status, dueDate, quarter, year, userId, createdAt, updatedAt';
    let values = '@id, @title, @description, @category, @target, @current, @weight, @status, @dueDate, @quarter, @year, @userId, GETDATE(), GETDATE()';
    if (this.objectivesHasAssigner) {
      request.input('assignedById', sql.NVarChar, objective.assignedById);
      columns = columns.replace('createdAt', 'assignedById, createdAt');
      values = values.replace('GETDATE(), GETDATE()', '@assignedById, GETDATE(), GETDATE()');
    }

    await request.query(`INSERT INTO mbo_objectives (${columns}) VALUES (${values})`);

    return id;
  }

  async updateObjectiveProgress(objectiveId: string, current: number): Promise<void> {
    if (!this.pool) await this.initialize();

    await this.pool!.request()
      .input('objectiveId', sql.NVarChar, objectiveId)
      .input('current', sql.Float, current)
      .query(`
        UPDATE mbo_objectives 
        SET current = @current, updatedAt = GETDATE()
        WHERE id = @objectiveId
      `);
  }

  // Review operations
  async getReviewsByEmployee(employeeId: string): Promise<MboReview[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('employeeId', sql.NVarChar, employeeId)
      .query(`
        SELECT * FROM mbo_reviews
        WHERE employeeId = @employeeId
        ORDER BY year DESC, quarter DESC
      `);

    return result.recordset;
  }

  async createReview(review: Omit<MboReview, 'id'>): Promise<string> {
    if (!this.pool) await this.initialize();

    const id = this.generateId();

    await this.pool!.request()
      .input('id', sql.NVarChar, id)
      .input('quarter', sql.NVarChar, review.quarter)
      .input('year', sql.Int, review.year)
      .input('overallScore', sql.Float, review.overallScore)
      .input('comments', sql.NVarChar, review.comments)
      .input('status', sql.NVarChar, review.status)
      .input('employeeId', sql.NVarChar, review.employeeId)
      .query(`
        INSERT INTO mbo_reviews (
          id, quarter, year, overallScore, comments, status, employeeId, createdAt, updatedAt
        )
        VALUES (
          @id, @quarter, @year, @overallScore, @comments, @status, @employeeId, GETDATE(), GETDATE()
        )
      `);

    return id;
  }

  // Approval operations
  async getPendingApprovals(approverId: string): Promise<MboApproval[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .input('approverId', sql.NVarChar, approverId)
      .query(`
        SELECT * FROM mbo_approvals
        WHERE approverId = @approverId AND status = 'PENDING'
        ORDER BY createdAt DESC
      `);

    return result.recordset;
  }

  async createApproval(approval: Omit<MboApproval, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.pool) await this.initialize();

    const id = this.generateId();

    await this.pool!.request()
      .input('id', sql.NVarChar, id)
      .input('type', sql.NVarChar, approval.type)
      .input('entityId', sql.NVarChar, approval.entityId)
      .input('status', sql.NVarChar, approval.status)
      .input('comments', sql.NVarChar, approval.comments)
      .input('approverId', sql.NVarChar, approval.approverId)
      .query(`
        INSERT INTO mbo_approvals (
          id, type, entityId, status, comments, approverId, createdAt, updatedAt
        )
        VALUES (
          @id, @type, @entityId, @status, @comments, @approverId, GETDATE(), GETDATE()
        )
      `);

    return id;
  }

  async updateApprovalStatus(approvalId: string, status: string, comments?: string): Promise<void> {
    if (!this.pool) await this.initialize();

    const now = new Date();
    const statusField = status === 'APPROVED' ? 'approvedAt' : status === 'REJECTED' ? 'rejectedAt' : null;

    let query = `
      UPDATE mbo_approvals 
      SET status = @status, comments = @comments, updatedAt = @now
    `;

    if (statusField) {
      query += `, ${statusField} = @now`;
    }

    query += ` WHERE id = @approvalId`;

    await this.pool!.request()
      .input('approvalId', sql.NVarChar, approvalId)
      .input('status', sql.NVarChar, status)
      .input('comments', sql.NVarChar, comments)
      .input('now', sql.DateTime2, now)
      .query(query);
  }

  // Analytics operations
  async getDepartmentPerformanceMetrics(): Promise<any[]> {
    if (!this.pool) await this.initialize();

    const result = await this.pool!.request()
      .query(`
        SELECT 
          d.name as departmentName,
          COUNT(DISTINCT u.id) as totalEmployees,
          COUNT(DISTINCT o.id) as totalObjectives,
          AVG(CASE WHEN o.target > 0 THEN (o.current / o.target) * 100 ELSE 0 END) as avgProgress,
          COUNT(DISTINCT CASE WHEN o.status = 'COMPLETED' THEN o.id END) as completedObjectives
        FROM mbo_departments d
        LEFT JOIN mbo_users u ON d.id = u.departmentId
        LEFT JOIN mbo_objectives o ON u.id = o.userId
        GROUP BY d.id, d.name
        ORDER BY d.name
      `);

    return result.recordset;
  }

  async getTeamPerformanceMetrics(departmentId?: string): Promise<any[]> {
    if (!this.pool) await this.initialize();

    let query = `
      SELECT 
        t.name as teamName,
        d.name as departmentName,
        COUNT(DISTINCT u.id) as totalEmployees,
        COUNT(DISTINCT o.id) as totalObjectives,
        AVG(CASE WHEN o.target > 0 THEN (o.current / o.target) * 100 ELSE 0 END) as avgProgress,
        COUNT(DISTINCT CASE WHEN o.status = 'COMPLETED' THEN o.id END) as completedObjectives
      FROM mbo_teams t
      LEFT JOIN mbo_departments d ON t.departmentId = d.id
      LEFT JOIN mbo_users u ON t.id = u.teamId
      LEFT JOIN mbo_objectives o ON u.id = o.userId
    `;

    if (departmentId) {
      query += ` WHERE t.departmentId = @departmentId`;
    }

    query += `
      GROUP BY t.id, t.name, d.name
      ORDER BY d.name, t.name
    `;

    const request = this.pool!.request();
    if (departmentId) {
      request.input('departmentId', sql.NVarChar, departmentId);
    }

    const result = await request.query(query);
    return result.recordset;
  }

  private generateId(): string {
    return 'mbo_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
