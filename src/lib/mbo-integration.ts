// CareCloud MBO System Integration API
// This file provides comprehensive integration between all MBO system components

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'hr' | 'senior_management';
  level: 'employee' | 'manager' | 'senior_manager' | 'executive';
  department: string;
  managerId?: string;
  directReports: string[];
  permissions: string[];
}

interface Objective {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  weight: number;
  type: 'quantitative' | 'qualitative';
  target: string;
  progress: number;
  status: 'draft' | 'assigned' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  assignedBy?: string;
  assignedDate?: string;
  lastUpdated: string;
  remarks: string;
  aiScore?: number;
  managerReview?: {
    score: number;
    comments: string;
    approved: boolean;
    reviewDate: string;
    reviewedBy: string;
  };
}

interface WorkflowStatus {
  employeeId: string;
  quarterYear: string;
  currentStage: 'draft' | 'employee_signature' | 'ai_analysis' | 'manager_review' | 'hr_approval' | 'completed';
  stages: {
    draft: { completed: boolean; date?: Date };
    employee_signature: { completed: boolean; date?: Date; signedBy?: string };
    ai_analysis: { completed: boolean; date?: Date; totalScore?: number };
    manager_review: { completed: boolean; date?: Date; reviewedBy?: string; approved?: boolean };
    hr_approval: { completed: boolean; date?: Date; approvedBy?: string; bonusCalculated?: boolean };
    completed: { completed: boolean; date?: Date; finalScore?: number };
  };
}

interface Assignment {
  id: string;
  employeeId: string;
  objectives: Objective[];
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  quarter: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  notifications: {
    employee: boolean;
    manager: boolean;
    hr: boolean;
  };
}

class MBOSystemIntegration {
  private static instance: MBOSystemIntegration;
  
  public static getInstance(): MBOSystemIntegration {
    if (!MBOSystemIntegration.instance) {
      MBOSystemIntegration.instance = new MBOSystemIntegration();
    }
    return MBOSystemIntegration.instance;
  }

  // User Management
  async getUser(email: string): Promise<SystemUser | null> {
    try {
      const userKey = `user_${email}`;
      const stored = localStorage.getItem(userKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUsersByRole(role: SystemUser['role']): Promise<SystemUser[]> {
    try {
      const allUsers = this.getAllUsers();
      return allUsers.filter(user => user.role === role);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  getAllUsers(): SystemUser[] {
    try {
      const usersKey = 'all_users';
      const stored = localStorage.getItem(usersKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUser(user: SystemUser): Promise<boolean> {
    try {
      const userKey = `user_${user.email}`;
      localStorage.setItem(userKey, JSON.stringify(user));
      
      // Update in all users list
      const allUsers = this.getAllUsers();
      const updatedUsers = allUsers.map(u => u.id === user.id ? user : u);
      localStorage.setItem('all_users', JSON.stringify(updatedUsers));
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Objective Management
  async getObjectives(employeeId: string): Promise<Objective[]> {
    try {
      const employee = this.getAllUsers().find(u => u.id === employeeId);
      if (!employee) return [];
      
      const objectivesKey = `objectives_${employee.email}`;
      const stored = localStorage.getItem(objectivesKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting objectives:', error);
      return [];
    }
  }

  async saveObjectives(employeeId: string, objectives: Objective[]): Promise<boolean> {
    try {
      const employee = this.getAllUsers().find(u => u.id === employeeId);
      if (!employee) return false;
      
      const objectivesKey = `objectives_${employee.email}`;
      localStorage.setItem(objectivesKey, JSON.stringify(objectives));
      return true;
    } catch (error) {
      console.error('Error saving objectives:', error);
      return false;
    }
  }

  async assignObjectives(assignment: Assignment): Promise<boolean> {
    try {
      // Save objectives to employee
      const success = await this.saveObjectives(assignment.employeeId, assignment.objectives);
      if (!success) return false;

      // Save assignment record
      const assignmentKey = `assignment_${assignment.id}`;
      localStorage.setItem(assignmentKey, JSON.stringify(assignment));

      // Update assignment history for manager
      const historyKey = `assignments_${assignment.assignedBy}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([...existingHistory, assignment]));

      // Send notifications
      await this.sendNotifications(assignment);

      return true;
    } catch (error) {
      console.error('Error assigning objectives:', error);
      return false;
    }
  }

  // Workflow Management
  async getWorkflowStatus(employeeId: string): Promise<WorkflowStatus | null> {
    try {
      const employee = this.getAllUsers().find(u => u.id === employeeId);
      if (!employee) return null;
      
      const workflowKey = `workflow_status_${employee.email}`;
      const stored = localStorage.getItem(workflowKey);
      
      if (stored) {
        const status = JSON.parse(stored);
        // Convert date strings back to Date objects
        Object.keys(status.stages).forEach(stageKey => {
          const stage = status.stages[stageKey];
          if (stage.date) {
            stage.date = new Date(stage.date);
          }
        });
        return status;
      }
      return null;
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return null;
    }
  }

  async updateWorkflowStatus(employeeId: string, status: WorkflowStatus): Promise<boolean> {
    try {
      const employee = this.getAllUsers().find(u => u.id === employeeId);
      if (!employee) return false;
      
      const workflowKey = `workflow_status_${employee.email}`;
      localStorage.setItem(workflowKey, JSON.stringify(status));
      return true;
    } catch (error) {
      console.error('Error updating workflow status:', error);
      return false;
    }
  }

  async advanceWorkflow(employeeId: string, stage: WorkflowStatus['currentStage'], data?: any): Promise<boolean> {
    try {
      const currentStatus = await this.getWorkflowStatus(employeeId);
      if (!currentStatus) return false;

      // Update current stage
      currentStatus.currentStage = stage;
      currentStatus.stages[stage] = {
        completed: true,
        date: new Date(),
        ...data
      };

      return await this.updateWorkflowStatus(employeeId, currentStatus);
    } catch (error) {
      console.error('Error advancing workflow:', error);
      return false;
    }
  }

  // Team Management
  async getTeamMembers(managerId: string): Promise<SystemUser[]> {
    try {
      const allUsers = this.getAllUsers();
      return allUsers.filter(user => user.managerId === managerId);
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  async getTeamObjectives(managerId: string): Promise<{ employee: SystemUser; objectives: Objective[] }[]> {
    try {
      const teamMembers = await this.getTeamMembers(managerId);
      const results = [];

      for (const member of teamMembers) {
        const objectives = await this.getObjectives(member.id);
        results.push({ employee: member, objectives });
      }

      return results;
    } catch (error) {
      console.error('Error getting team objectives:', error);
      return [];
    }
  }

  // Performance Analytics
  async getPerformanceMetrics(employeeId: string): Promise<{
    currentScore: number;
    completionRate: number;
    objectivesCount: number;
    quarterlyTrend: number[];
  }> {
    try {
      const objectives = await this.getObjectives(employeeId);
      const workflow = await this.getWorkflowStatus(employeeId);
      
      const objectivesCount = objectives.length;
      const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;
      const completionRate = objectivesCount > 0 ? (completedObjectives / objectivesCount) * 100 : 0;
      
      const currentScore = workflow?.stages.ai_analysis.completed 
        ? workflow.stages.ai_analysis.totalScore || 0
        : 0;

      // Mock quarterly trend - in real implementation, fetch from database
      const quarterlyTrend = [75, 82, 88, currentScore || 85];

      return {
        currentScore,
        completionRate,
        objectivesCount,
        quarterlyTrend
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return { currentScore: 0, completionRate: 0, objectivesCount: 0, quarterlyTrend: [] };
    }
  }

  async getDepartmentMetrics(department: string): Promise<{
    totalEmployees: number;
    averageScore: number;
    completionRate: number;
    pendingReviews: number;
  }> {
    try {
      const allUsers = this.getAllUsers();
      const departmentEmployees = allUsers.filter(user => user.department === department);
      
      let totalScore = 0;
      let totalCompletion = 0;
      let pendingReviews = 0;

      for (const employee of departmentEmployees) {
        const metrics = await this.getPerformanceMetrics(employee.id);
        totalScore += metrics.currentScore;
        totalCompletion += metrics.completionRate;
        
        const workflow = await this.getWorkflowStatus(employee.id);
        if (workflow?.currentStage === 'manager_review') {
          pendingReviews++;
        }
      }

      return {
        totalEmployees: departmentEmployees.length,
        averageScore: departmentEmployees.length > 0 ? totalScore / departmentEmployees.length : 0,
        completionRate: departmentEmployees.length > 0 ? totalCompletion / departmentEmployees.length : 0,
        pendingReviews
      };
    } catch (error) {
      console.error('Error getting department metrics:', error);
      return { totalEmployees: 0, averageScore: 0, completionRate: 0, pendingReviews: 0 };
    }
  }

  // AI Integration
  async analyzeObjectives(objectives: Objective[]): Promise<{ scores: number[]; totalScore: number; analysis: string }> {
    try {
      // Simulate AI analysis - in real implementation, call AI service
      const scores = objectives.map(obj => {
        // Mock scoring based on objective type and progress
        const baseScore = obj.progress / 100 * obj.weight;
        const qualityBonus = obj.type === 'qualitative' ? Math.random() * 5 : 0;
        return Math.min(obj.weight, baseScore + qualityBonus);
      });

      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      
      const analysis = `Comprehensive AI analysis completed. Employee demonstrates ${
        totalScore >= 85 ? 'exceptional' : totalScore >= 75 ? 'strong' : 'developing'
      } performance across all objective areas. Key strengths identified in ${
        objectives.find(obj => obj.type === 'quantitative') ? 'quantitative achievement' : 'qualitative excellence'
      }.`;

      return { scores, totalScore, analysis };
    } catch (error) {
      console.error('Error analyzing objectives:', error);
      return { scores: [], totalScore: 0, analysis: 'Analysis failed' };
    }
  }

  // Notification System
  async sendNotifications(assignment: Assignment): Promise<boolean> {
    try {
      const notifications = [];
      
      if (assignment.notifications.employee) {
        notifications.push({
          id: `notif_${Date.now()}_employee`,
          type: 'objective_assigned',
          recipientId: assignment.employeeId,
          title: 'New Objectives Assigned',
          message: `You have been assigned ${assignment.objectives.length} new objectives for ${assignment.quarter}.`,
          date: new Date().toISOString(),
          read: false
        });
      }

      if (assignment.notifications.manager) {
        notifications.push({
          id: `notif_${Date.now()}_manager`,
          type: 'assignment_confirmation',
          recipientId: assignment.assignedBy,
          title: 'Objectives Successfully Assigned',
          message: `Objectives have been assigned to employee ${assignment.employeeId}.`,
          date: new Date().toISOString(),
          read: false
        });
      }

      // Save notifications
      for (const notification of notifications) {
        const notifKey = `notifications_${notification.recipientId}`;
        const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
        localStorage.setItem(notifKey, JSON.stringify([...existing, notification]));
      }

      return true;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return false;
    }
  }

  // Reporting
  async generateReport(type: 'individual' | 'team' | 'department' | 'organization', targetId: string): Promise<any> {
    try {
      switch (type) {
        case 'individual':
          return await this.generateIndividualReport(targetId);
        case 'team':
          return await this.generateTeamReport(targetId);
        case 'department':
          return await this.generateDepartmentReport(targetId);
        case 'organization':
          return await this.generateOrganizationReport();
        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }

  private async generateIndividualReport(employeeId: string): Promise<any> {
    const employee = this.getAllUsers().find(u => u.id === employeeId);
    if (!employee) throw new Error('Employee not found');

    const objectives = await this.getObjectives(employeeId);
    const workflow = await this.getWorkflowStatus(employeeId);
    const metrics = await this.getPerformanceMetrics(employeeId);

    return {
      employee,
      objectives,
      workflow,
      metrics,
      generatedAt: new Date().toISOString(),
      reportType: 'individual'
    };
  }

  private async generateTeamReport(managerId: string): Promise<any> {
    const manager = this.getAllUsers().find(u => u.id === managerId);
    if (!manager) throw new Error('Manager not found');

    const teamMembers = await this.getTeamMembers(managerId);
    const teamObjectives = await this.getTeamObjectives(managerId);
    
    const teamMetrics = {
      totalMembers: teamMembers.length,
      averageCompletion: 0,
      totalObjectives: 0,
      pendingReviews: 0
    };

    for (const member of teamMembers) {
      const metrics = await this.getPerformanceMetrics(member.id);
      teamMetrics.averageCompletion += metrics.completionRate;
      teamMetrics.totalObjectives += metrics.objectivesCount;
      
      const workflow = await this.getWorkflowStatus(member.id);
      if (workflow?.currentStage === 'manager_review') {
        teamMetrics.pendingReviews++;
      }
    }

    teamMetrics.averageCompletion = teamMembers.length > 0 
      ? teamMetrics.averageCompletion / teamMembers.length 
      : 0;

    return {
      manager,
      teamMembers,
      teamObjectives,
      teamMetrics,
      generatedAt: new Date().toISOString(),
      reportType: 'team'
    };
  }

  private async generateDepartmentReport(department: string): Promise<any> {
    const departmentMetrics = await this.getDepartmentMetrics(department);
    const allUsers = this.getAllUsers();
    const departmentEmployees = allUsers.filter(user => user.department === department);
    
    const departmentHead = departmentEmployees.find(emp => 
      emp.level === 'senior_manager' || emp.level === 'executive'
    );

    return {
      department,
      departmentHead,
      employees: departmentEmployees,
      metrics: departmentMetrics,
      generatedAt: new Date().toISOString(),
      reportType: 'department'
    };
  }

  private async generateOrganizationReport(): Promise<any> {
    const allUsers = this.getAllUsers();
    const departments = [...new Set(allUsers.map(user => user.department))];
    
    const organizationMetrics = {
      totalEmployees: allUsers.length,
      totalDepartments: departments.length,
      averageScore: 0,
      completionRate: 0,
      pendingReviews: 0
    };

    let totalScore = 0;
    let totalCompletion = 0;

    for (const user of allUsers) {
      const metrics = await this.getPerformanceMetrics(user.id);
      totalScore += metrics.currentScore;
      totalCompletion += metrics.completionRate;
      
      const workflow = await this.getWorkflowStatus(user.id);
      if (workflow?.currentStage === 'manager_review' || workflow?.currentStage === 'hr_approval') {
        organizationMetrics.pendingReviews++;
      }
    }

    organizationMetrics.averageScore = allUsers.length > 0 ? totalScore / allUsers.length : 0;
    organizationMetrics.completionRate = allUsers.length > 0 ? totalCompletion / allUsers.length : 0;

    const departmentReports = [];
    for (const dept of departments) {
      const deptReport = await this.generateDepartmentReport(dept);
      departmentReports.push(deptReport);
    }

    return {
      organizationMetrics,
      departmentReports,
      totalEmployees: allUsers.length,
      generatedAt: new Date().toISOString(),
      reportType: 'organization'
    };
  }

  // Data Synchronization
  async syncData(): Promise<boolean> {
    try {
      // In real implementation, sync with backend
      console.log('Data synchronization completed');
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      return false;
    }
  }

  // System Health Check
  async systemHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    lastSync: string;
  }> {
    try {
      const issues = [];
      
      // Check for users without objectives
      const allUsers = this.getAllUsers();
      for (const user of allUsers) {
        if (user.role === 'employee' || user.role === 'manager') {
          const objectives = await this.getObjectives(user.id);
          if (objectives.length === 0) {
            issues.push(`${user.name} has no assigned objectives`);
          }
        }
      }

      // Check for overdue workflows
      for (const user of allUsers) {
        const workflow = await this.getWorkflowStatus(user.id);
        if (workflow && workflow.currentStage !== 'completed') {
          // Check if workflow is overdue (simplified check)
          const lastActivity = workflow.stages[workflow.currentStage].date;
          if (lastActivity && Date.now() - new Date(lastActivity).getTime() > 7 * 24 * 60 * 60 * 1000) {
            issues.push(`${user.name} has an overdue workflow in ${workflow.currentStage} stage`);
          }
        }
      }

      const status = issues.length === 0 ? 'healthy' : issues.length < 5 ? 'warning' : 'error';

      return {
        status,
        issues,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        status: 'error',
        issues: ['System health check failed'],
        lastSync: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const mboSystem = MBOSystemIntegration.getInstance();
export default MBOSystemIntegration;
export type { SystemUser, Objective, WorkflowStatus, Assignment };
