// Sample Data Initialization for CareCloud MBO System
// This script populates the system with realistic test data for demonstration

import { mboSystem } from './mbo-integration';

interface SampleUser {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr' | 'senior_management';
  level: 'employee' | 'manager' | 'senior_manager' | 'executive';
  department: string;
  managerId?: string;
  directReports: string[];
  permissions: string[];
}

interface SampleObjective {
  title: string;
  description: string;
  weight: number;
  type: 'quantitative' | 'qualitative';
  target: string;
  progress: number;
  status: 'draft' | 'assigned' | 'in_progress' | 'completed' | 'overdue';
  remarks: string;
}

export class SampleDataInitializer {
  static async initializeAllData(): Promise<boolean> {
    try {
      console.log('🚀 Initializing CareCloud MBO System with sample data...');
      
      await this.initializeUsers();
      await this.initializeObjectives();
      await this.initializeWorkflows();
      await this.initializeNotifications();
      
      console.log('✅ Sample data initialization completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
      return false;
    }
  }

  private static async initializeUsers(): Promise<void> {
    const sampleUsers: SampleUser[] = [
      // Executive Level
      {
        id: "emp001",
        name: "David Wilson",
        email: "david.wilson@carecloud.com",
        role: "senior_management",
        level: "executive",
        department: "executive",
        directReports: ["emp002", "emp008", "emp009"],
        permissions: ["manage_organization", "assign_objectives", "approve_objectives", "view_all_reports", "strategic_planning"]
      },
      
      // Senior Management
      {
        id: "emp002",
        name: "Sarah Johnson",
        email: "sarah.johnson@carecloud.com",
        role: "manager",
        level: "senior_manager",
        department: "customer_success",
        managerId: "emp001",
        directReports: ["emp003", "emp004", "emp005"],
        permissions: ["assign_objectives", "approve_team_objectives", "view_team_reports", "manage_department"]
      },
      {
        id: "emp008",
        name: "Dr. Amanda Foster",
        email: "amanda.foster@carecloud.com",
        role: "hr",
        level: "senior_manager",
        department: "human_resources",
        managerId: "emp001",
        directReports: ["emp010"],
        permissions: ["manage_employees", "define_bonus_structures", "view_all_reports", "process_approvals"]
      },
      {
        id: "emp009",
        name: "Michael Rodriguez",
        email: "michael.rodriguez@carecloud.com",
        role: "senior_management",
        level: "senior_manager",
        department: "technology",
        managerId: "emp001",
        directReports: ["emp011", "emp012"],
        permissions: ["assign_objectives", "approve_team_objectives", "view_team_reports", "manage_department"]
      },
      
      // Managers
      {
        id: "emp003",
        name: "John Smith",
        email: "john.smith@carecloud.com",
        role: "manager",
        level: "manager",
        department: "customer_success",
        managerId: "emp002",
        directReports: ["emp006"],
        permissions: ["assign_team_objectives", "view_team_performance", "approve_team_actions"]
      },
      {
        id: "emp004",
        name: "Emily Davis",
        email: "emily.davis@carecloud.com",
        role: "manager",
        level: "manager",
        department: "customer_success",
        managerId: "emp002",
        directReports: ["emp007"],
        permissions: ["assign_team_objectives", "view_team_performance", "approve_team_actions"]
      },
      {
        id: "emp005",
        name: "Michael Chen",
        email: "michael.chen@carecloud.com",
        role: "manager",
        level: "manager",
        department: "customer_success",
        managerId: "emp002",
        directReports: [],
        permissions: ["assign_team_objectives", "view_team_performance"]
      },
      
      // HR Team
      {
        id: "emp010",
        name: "Robert Kim",
        email: "robert.kim@carecloud.com",
        role: "hr",
        level: "manager",
        department: "human_resources",
        managerId: "emp008",
        directReports: [],
        permissions: ["manage_employee_records", "process_approvals", "view_hr_reports"]
      },
      
      // Technology Team
      {
        id: "emp011",
        name: "Alex Thompson",
        email: "alex.thompson@carecloud.com",
        role: "manager",
        level: "manager",
        department: "technology",
        managerId: "emp009",
        directReports: ["emp013"],
        permissions: ["assign_team_objectives", "view_team_performance"]
      },
      {
        id: "emp012",
        name: "Lisa Rodriguez",
        email: "lisa.rodriguez@carecloud.com",
        role: "manager",
        level: "manager",
        department: "technology",
        managerId: "emp009",
        directReports: ["emp014"],
        permissions: ["assign_team_objectives", "view_team_performance"]
      },
      
      // Employees
      {
        id: "emp006",
        name: "Jessica Brown",
        email: "jessica.brown@carecloud.com",
        role: "employee",
        level: "employee",
        department: "customer_success",
        managerId: "emp003",
        directReports: [],
        permissions: ["view_own_performance", "submit_objectives", "request_approvals"]
      },
      {
        id: "emp007",
        name: "Ryan Wilson",
        email: "ryan.wilson@carecloud.com",
        role: "employee",
        level: "employee",
        department: "customer_success",
        managerId: "emp004",
        directReports: [],
        permissions: ["view_own_performance", "submit_objectives", "request_approvals"]
      },
      {
        id: "emp013",
        name: "Maria Garcia",
        email: "maria.garcia@carecloud.com",
        role: "employee",
        level: "employee",
        department: "technology",
        managerId: "emp011",
        directReports: [],
        permissions: ["view_own_performance", "submit_objectives", "request_approvals"]
      },
      {
        id: "emp014",
        name: "James Lee",
        email: "james.lee@carecloud.com",
        role: "employee",
        level: "employee",
        department: "technology",
        managerId: "emp012",
        directReports: [],
        permissions: ["view_own_performance", "submit_objectives", "request_approvals"]
      }
    ];

    // Save users to localStorage
    localStorage.setItem('all_users', JSON.stringify(sampleUsers));
    
    // Save individual user records
    for (const user of sampleUsers) {
      const userKey = `user_${user.email}`;
      localStorage.setItem(userKey, JSON.stringify(user));
    }

    console.log(`✅ Initialized ${sampleUsers.length} users`);
  }

  private static async initializeObjectives(): Promise<void> {
    const objectiveTemplates: { [key: string]: SampleObjective[] } = {
      // Customer Success Objectives
      customer_success: [
        {
          title: "Customer Satisfaction Excellence",
          description: "Achieve and maintain exceptional customer satisfaction scores through proactive engagement and issue resolution.",
          weight: 25,
          type: "quantitative",
          target: "95% Customer Satisfaction Score",
          progress: 88,
          status: "in_progress",
          remarks: "Currently at 88% satisfaction. Implemented new feedback system and reduced response time by 40%. Planning quarterly customer survey campaign."
        },
        {
          title: "Revenue Growth Contribution",
          description: "Drive revenue growth through upselling, cross-selling, and customer retention initiatives.",
          weight: 30,
          type: "quantitative",
          target: "$150K Additional Revenue",
          progress: 75,
          status: "in_progress",
          remarks: "Generated $112K in additional revenue through upselling initiatives. Working on 3 major accounts for Q4 closure."
        },
        {
          title: "Process Innovation Initiative",
          description: "Lead process improvement projects that enhance customer experience and team efficiency.",
          weight: 20,
          type: "qualitative",
          target: "1 Major Process Improvement",
          progress: 60,
          status: "in_progress",
          remarks: "Designed new customer onboarding process. Pilot testing with 5 customers showing 30% improvement in time-to-value."
        },
        {
          title: "Professional Development",
          description: "Complete advanced certifications and training programs to enhance expertise.",
          weight: 15,
          type: "qualitative",
          target: "2 Professional Certifications",
          progress: 100,
          status: "completed",
          remarks: "Completed Customer Success Management certification and Advanced Analytics certification. Applied learnings to improve customer engagement strategies."
        },
        {
          title: "Team Collaboration",
          description: "Enhance cross-functional collaboration and knowledge sharing.",
          weight: 10,
          type: "qualitative",
          target: "Lead 2 Cross-Team Projects",
          progress: 50,
          status: "in_progress",
          remarks: "Leading customer feedback integration project with Product team. Planning knowledge sharing sessions for Q4."
        }
      ],
      
      // Technology Objectives
      technology: [
        {
          title: "System Performance Optimization",
          description: "Improve system performance and reduce downtime through infrastructure enhancements.",
          weight: 30,
          type: "quantitative",
          target: "99.9% System Uptime",
          progress: 95,
          status: "in_progress",
          remarks: "Achieved 99.8% uptime this quarter. Implemented automated monitoring and deployed performance optimizations."
        },
        {
          title: "Security Enhancement Project",
          description: "Strengthen cybersecurity measures and ensure compliance with healthcare regulations.",
          weight: 25,
          type: "qualitative",
          target: "Complete Security Audit & Implementation",
          progress: 80,
          status: "in_progress",
          remarks: "Completed comprehensive security audit. Implementing multi-factor authentication and encrypted data storage solutions."
        },
        {
          title: "Innovation & Technology Research",
          description: "Research and prototype new technologies to enhance CareCloud's competitive advantage.",
          weight: 20,
          type: "qualitative",
          target: "2 Technology Prototypes",
          progress: 65,
          status: "in_progress",
          remarks: "Developed AI-powered patient data analysis prototype. Working on telehealth integration solution."
        },
        {
          title: "Team Technical Skills Development",
          description: "Enhance team technical capabilities through training and knowledge sharing.",
          weight: 15,
          type: "qualitative",
          target: "Complete Advanced Technical Training",
          progress: 100,
          status: "completed",
          remarks: "Completed cloud architecture certification. Conducted 4 technical workshops for the team."
        },
        {
          title: "Code Quality & Documentation",
          description: "Improve code quality standards and technical documentation.",
          weight: 10,
          type: "qualitative",
          target: "Establish Quality Standards",
          progress: 90,
          status: "in_progress",
          remarks: "Implemented automated code review process. Updated 80% of technical documentation."
        }
      ],
      
      // HR Objectives
      human_resources: [
        {
          title: "Employee Engagement Enhancement",
          description: "Improve employee engagement and satisfaction through strategic HR initiatives.",
          weight: 30,
          type: "quantitative",
          target: "90% Employee Engagement Score",
          progress: 85,
          status: "in_progress",
          remarks: "Current engagement score at 85%. Launched wellness program and flexible work arrangements. Planning Q4 engagement survey."
        },
        {
          title: "Talent Acquisition Excellence",
          description: "Streamline hiring processes and attract top talent to support company growth.",
          weight: 25,
          type: "quantitative",
          target: "Hire 15 Quality Candidates",
          progress: 80,
          status: "in_progress",
          remarks: "Hired 12 exceptional candidates. Reduced time-to-hire by 25% through process optimization."
        },
        {
          title: "Performance Management System",
          description: "Enhance the MBO system and performance review processes.",
          weight: 20,
          type: "qualitative",
          target: "Launch Enhanced MBO System",
          progress: 95,
          status: "completed",
          remarks: "Successfully launched the new MBO system with AI-powered analytics and automated workflows."
        },
        {
          title: "Compliance & Policy Updates",
          description: "Ensure all HR policies comply with latest regulations and best practices.",
          weight: 15,
          type: "qualitative",
          target: "Update All HR Policies",
          progress: 70,
          status: "in_progress",
          remarks: "Updated 70% of HR policies. Working with legal team on final reviews and approvals."
        },
        {
          title: "Learning & Development Programs",
          description: "Develop comprehensive learning programs to support employee growth.",
          weight: 10,
          type: "qualitative",
          target: "Launch 3 Development Programs",
          progress: 100,
          status: "completed",
          remarks: "Launched leadership development, technical skills, and wellness programs. High participation rates across all programs."
        }
      ]
    };

    const users = JSON.parse(localStorage.getItem('all_users') || '[]');
    
    for (const user of users) {
      if (user.role === 'employee' || user.role === 'manager') {
        const departmentObjectives = objectiveTemplates[user.department] || objectiveTemplates.customer_success;
        
        const userObjectives = departmentObjectives.map((template, index) => ({
          id: `obj_${user.id}_${index + 1}`,
          employeeId: user.id,
          title: template.title,
          description: template.description,
          weight: template.weight,
          type: template.type,
          target: template.target,
          progress: template.progress + (Math.random() * 20 - 10), // Add some variance
          status: template.status,
          dueDate: "2025-09-30", // Q3 2025 end
          assignedBy: user.managerId || "emp001",
          assignedDate: "2025-07-01",
          lastUpdated: new Date().toISOString(),
          remarks: template.remarks,
          aiScore: template.status === 'completed' ? Math.round(template.weight * 0.9) : undefined
        }));

        const objectivesKey = `objectives_${user.email}`;
        localStorage.setItem(objectivesKey, JSON.stringify(userObjectives));
      }
    }

    console.log(`✅ Initialized objectives for all employees`);
  }

  private static async initializeWorkflows(): Promise<void> {
    const users = JSON.parse(localStorage.getItem('all_users') || '[]');
    
    for (const user of users) {
      if (user.role === 'employee' || user.role === 'manager') {
        const currentStage = this.getRandomWorkflowStage();
        
        const workflowStatus = {
          employeeId: user.email,
          quarterYear: "Q3-2025",
          currentStage,
          stages: {
            draft: { 
              completed: true, 
              date: new Date('2025-07-01') 
            },
            employee_signature: { 
              completed: currentStage !== 'draft', 
              date: currentStage !== 'draft' ? new Date('2025-07-15') : undefined,
              signedBy: currentStage !== 'draft' ? user.email : undefined
            },
            ai_analysis: { 
              completed: ['ai_analysis', 'manager_review', 'hr_approval', 'completed'].includes(currentStage),
              date: ['ai_analysis', 'manager_review', 'hr_approval', 'completed'].includes(currentStage) ? new Date('2025-07-16') : undefined,
              totalScore: ['ai_analysis', 'manager_review', 'hr_approval', 'completed'].includes(currentStage) ? Math.round(Math.random() * 30 + 70) : undefined
            },
            manager_review: { 
              completed: ['manager_review', 'hr_approval', 'completed'].includes(currentStage),
              date: ['manager_review', 'hr_approval', 'completed'].includes(currentStage) ? new Date('2025-07-20') : undefined,
              reviewedBy: ['manager_review', 'hr_approval', 'completed'].includes(currentStage) ? user.managerId : undefined,
              approved: ['hr_approval', 'completed'].includes(currentStage)
            },
            hr_approval: { 
              completed: ['hr_approval', 'completed'].includes(currentStage),
              date: ['hr_approval', 'completed'].includes(currentStage) ? new Date('2025-07-25') : undefined,
              approvedBy: ['hr_approval', 'completed'].includes(currentStage) ? 'emp008' : undefined,
              bonusCalculated: ['hr_approval', 'completed'].includes(currentStage)
            },
            completed: { 
              completed: currentStage === 'completed',
              date: currentStage === 'completed' ? new Date('2025-07-30') : undefined,
              finalScore: currentStage === 'completed' ? Math.round(Math.random() * 30 + 70) : undefined
            }
          }
        };

        const workflowKey = `workflow_status_${user.email}`;
        localStorage.setItem(workflowKey, JSON.stringify(workflowStatus));
      }
    }

    console.log(`✅ Initialized workflow statuses for all employees`);
  }

  private static getRandomWorkflowStage(): string {
    const stages = ['employee_signature', 'ai_analysis', 'manager_review', 'hr_approval', 'completed'];
    const weights = [0.1, 0.2, 0.3, 0.2, 0.2]; // Probability distribution
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < stages.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return stages[i];
      }
    }
    
    return 'employee_signature';
  }

  private static async initializeNotifications(): Promise<void> {
    const users = JSON.parse(localStorage.getItem('all_users') || '[]');
    
    const sampleNotifications = [
      {
        type: 'objective_assigned',
        title: 'New Objectives Assigned',
        message: 'You have been assigned 5 new objectives for Q3 2025.',
        priority: 'medium'
      },
      {
        type: 'review_pending',
        title: 'Manager Review Pending',
        message: 'Your objectives are pending manager review.',
        priority: 'high'
      },
      {
        type: 'ai_analysis_complete',
        title: 'AI Analysis Complete',
        message: 'AI analysis of your objectives has been completed.',
        priority: 'low'
      },
      {
        type: 'bonus_calculated',
        title: 'Bonus Calculation Complete',
        message: 'Your Q3 bonus has been calculated and approved.',
        priority: 'high'
      }
    ];

    for (const user of users) {
      const notifications = sampleNotifications.map((template, index) => ({
        id: `notif_${user.id}_${index}`,
        recipientId: user.id,
        type: template.type,
        title: template.title,
        message: template.message,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
        read: Math.random() > 0.7, // 30% chance of being unread
        priority: template.priority
      }));

      const notifKey = `notifications_${user.id}`;
      localStorage.setItem(notifKey, JSON.stringify(notifications));
    }

    console.log(`✅ Initialized notifications for all users`);
  }

  static async clearAllData(): Promise<void> {
    const keys = Object.keys(localStorage);
    const mboKeys = keys.filter(key => 
      key.startsWith('user_') ||
      key.startsWith('objectives_') ||
      key.startsWith('workflow_status_') ||
      key.startsWith('notifications_') ||
      key.startsWith('assignments_') ||
      key === 'all_users'
    );

    mboKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${mboKeys.length} data entries`);
  }

  static async getSystemSummary(): Promise<any> {
    const users = JSON.parse(localStorage.getItem('all_users') || '[]');
    const summary = {
      totalUsers: users.length,
      usersByRole: users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      usersByDepartment: users.reduce((acc: any, user: any) => {
        acc[user.department] = (acc[user.department] || 0) + 1;
        return acc;
      }, {}),
      dataInitialized: true,
      lastInitialized: new Date().toISOString()
    };

    return summary;
  }
}

// Auto-initialize if no data exists
export const initializeSampleDataIfNeeded = async (): Promise<boolean> => {
  const existingUsers = localStorage.getItem('all_users');
  
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    console.log('🔄 No existing data found. Initializing sample data...');
    return await SampleDataInitializer.initializeAllData();
  }
  
  console.log('✅ Sample data already exists');
  return true;
};

export default SampleDataInitializer;
