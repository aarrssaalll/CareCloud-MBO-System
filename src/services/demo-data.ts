// Demo data service for CareCloud MBO System
export interface DemoUser {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
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
  isDemoUser: boolean;
}

export interface DemoObjective {
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
}

export interface DemoDepartment {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  status?: string;
}

export interface DemoTeam {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  leaderId?: string;
  status?: string;
}

// Demo users with credentials
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo_emp_001',
    employeeId: 'EMP001',
    email: 'employee@carecloud.com',
    firstName: 'Demo',
    lastName: 'Employee',
    name: 'Demo Employee',
    role: 'EMPLOYEE',
    title: 'Software Developer',
    phone: '+1-555-0101',
    hireDate: new Date('2023-01-15'),
    salary: 85000,
    status: 'ACTIVE',
    departmentId: 'demo_dept_001',
    teamId: 'demo_team_001',
    managerId: 'demo_mgr_001',
    departmentName: 'Engineering',
    teamName: 'Frontend Development',
    managerName: 'Demo Manager',
    isDemoUser: true,
  },
  {
    id: 'demo_mgr_001',
    employeeId: 'MGR001',
    email: 'manager@carecloud.com',
    firstName: 'Demo',
    lastName: 'Manager',
    name: 'Demo Manager',
    role: 'MANAGER',
    title: 'Engineering Manager',
    phone: '+1-555-0102',
    hireDate: new Date('2022-03-01'),
    salary: 120000,
    status: 'ACTIVE',
    departmentId: 'demo_dept_001',
    teamId: 'demo_team_001',
    departmentName: 'Engineering',
    teamName: 'Frontend Development',
    isDemoUser: true,
  },
  {
    id: 'demo_hr_001',
    employeeId: 'HR001',
    email: 'hr@carecloud.com',
    firstName: 'Demo',
    lastName: 'HR',
    name: 'Demo HR Specialist',
    role: 'HR',
    title: 'HR Business Partner',
    phone: '+1-555-0103',
    hireDate: new Date('2021-06-15'),
    salary: 95000,
    status: 'ACTIVE',
    departmentId: 'demo_dept_002',
    teamId: 'demo_team_002',
    departmentName: 'Human Resources',
    teamName: 'People Operations',
    isDemoUser: true,
  },
  {
    id: 'demo_senior_001',
    employeeId: 'EXEC001',
    email: 'executive@carecloud.com',
    firstName: 'Demo',
    lastName: 'Executive',
    name: 'Demo Executive',
    role: 'SENIOR_MANAGEMENT',
    title: 'VP of Engineering',
    phone: '+1-555-0104',
    hireDate: new Date('2020-01-01'),
    salary: 180000,
    status: 'ACTIVE',
    departmentId: 'demo_dept_001',
    departmentName: 'Engineering',
    isDemoUser: true,
  },
];

// Demo departments
export const DEMO_DEPARTMENTS: DemoDepartment[] = [
  {
    id: 'demo_dept_001',
    name: 'Engineering',
    description: 'Software development and technology innovation',
    managerId: 'demo_senior_001',
    status: 'ACTIVE',
  },
  {
    id: 'demo_dept_002',
    name: 'Human Resources',
    description: 'People operations and organizational development',
    managerId: 'demo_hr_001',
    status: 'ACTIVE',
  },
];

// Demo teams
export const DEMO_TEAMS: DemoTeam[] = [
  {
    id: 'demo_team_001',
    name: 'Frontend Development',
    description: 'User interface and experience development',
    departmentId: 'demo_dept_001',
    leaderId: 'demo_mgr_001',
    status: 'ACTIVE',
  },
  {
    id: 'demo_team_002',
    name: 'People Operations',
    description: 'Employee lifecycle and engagement',
    departmentId: 'demo_dept_002',
    leaderId: 'demo_hr_001',
    status: 'ACTIVE',
  }
];

// Demo objectives
export const DEMO_OBJECTIVES: DemoObjective[] = [
  {
    id: 'demo_obj_001',
    title: 'Complete React Component Library',
    description: 'Build and document a comprehensive React component library for the CareCloud design system',
    category: 'DEVELOPMENT',
    target: 100,
    current: 75,
    weight: 3,
    status: 'ACTIVE',
    dueDate: new Date('2025-12-31'),
    quarter: 'Q4',
    year: 2025,
    userId: 'demo_emp_001',
    assignedById: 'demo_mgr_001',
    assignedByName: 'Demo Manager',
  },
  {
    id: 'demo_obj_002',
    title: 'Improve Code Quality Metrics',
    description: 'Increase test coverage to 90% and reduce technical debt by 50%',
    category: 'QUALITY',
    target: 90,
    current: 68,
    weight: 2,
    status: 'ACTIVE',
    dueDate: new Date('2025-11-30'),
    quarter: 'Q4',
    year: 2025,
    userId: 'demo_emp_001',
    assignedById: 'demo_mgr_001',
    assignedByName: 'Demo Manager',
  },
  {
    id: 'demo_obj_003',
    title: 'Team Performance Enhancement',
    description: 'Mentor 3 junior developers and improve team velocity by 25%',
    category: 'LEADERSHIP',
    target: 100,
    current: 60,
    weight: 4,
    status: 'ACTIVE',
    dueDate: new Date('2025-12-31'),
    quarter: 'Q4',
    year: 2025,
    userId: 'demo_mgr_001',
    assignedById: 'demo_senior_001',
    assignedByName: 'Demo Executive',
  },
  {
    id: 'demo_obj_004',
    title: 'Employee Satisfaction Survey',
    description: 'Achieve 85%+ satisfaction rate in quarterly employee survey',
    category: 'ENGAGEMENT',
    target: 85,
    current: 78,
    weight: 3,
    status: 'ACTIVE',
    dueDate: new Date('2025-11-15'),
    quarter: 'Q4',
    year: 2025,
    userId: 'demo_hr_001',
    assignedById: 'demo_senior_001',
    assignedByName: 'Demo Executive',
  },
  {
    id: 'demo_obj_005',
    title: 'Strategic Platform Initiative',
    description: 'Launch new microservices architecture and migrate 80% of legacy systems',
    category: 'STRATEGIC',
    target: 80,
    current: 45,
    weight: 5,
    status: 'ACTIVE',
    dueDate: new Date('2025-12-31'),
    quarter: 'Q4',
    year: 2025,
    userId: 'demo_senior_001',
  },
];

// Demo credentials mapping
export const DEMO_CREDENTIALS = {
  'employee@carecloud.com': 'demo123',
  'manager@carecloud.com': 'demo123',
  'hr@carecloud.com': 'demo123',
  'executive@carecloud.com': 'demo123',
};

export class DemoDataService {
  static authenticateUser(email: string, password: string): DemoUser | null {
    // Check if this is a demo user
    if (!DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS]) {
      return null;
    }

    // Validate password
    if (DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] !== password) {
      return null;
    }

    // Return the demo user
    return DEMO_USERS.find(user => user.email === email) || null;
  }

  static isDemoUser(email: string): boolean {
    return email in DEMO_CREDENTIALS;
  }

  static getAllUsers(): DemoUser[] {
    return DEMO_USERS;
  }

  static getUserById(id: string): DemoUser | null {
    return DEMO_USERS.find(user => user.id === id) || null;
  }

  static getUserByEmail(email: string): DemoUser | null {
    return DEMO_USERS.find(user => user.email === email) || null;
  }

  static getObjectivesByUser(userId: string): DemoObjective[] {
    return DEMO_OBJECTIVES.filter(obj => obj.userId === userId);
  }

  static getObjectivesByAssigner(assignerId: string): DemoObjective[] {
    return DEMO_OBJECTIVES.filter(obj => obj.assignedById === assignerId);
  }

  static getAllDepartments(): DemoDepartment[] {
    return DEMO_DEPARTMENTS;
  }

  static getAllTeams(): DemoTeam[] {
    return DEMO_TEAMS;
  }

  static updateObjectiveProgress(objectiveId: string, current: number): boolean {
    const objective = DEMO_OBJECTIVES.find(obj => obj.id === objectiveId);
    if (objective) {
      objective.current = current;
      return true;
    }
    return false;
  }
}
