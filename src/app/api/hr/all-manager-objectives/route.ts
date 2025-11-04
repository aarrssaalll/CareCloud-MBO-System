import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Define the transformed objective interface
interface TransformedManagerObjective {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  dueDate: string;
  quarter: string;
  year: number;
  managerId: string;
  managerName: string;
  managerTitle: string;
  managerEmail?: string;
  managerDepartment?: string;
  progress: number;
  completedAt?: string;
  managerRemarks?: string;
  managerEvidence?: string;
  aiScore?: number;
  aiComments?: string;
  seniorManagerScore?: number;
  seniorManagerComments?: string;
  finalScore?: number;
  createdAt: string;
  updatedAt: string;
  assignedByName?: string;
  assignedByTitle?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching all manager objectives for HR dashboard');

    // Query to fetch all manager objectives with related information
    const managerObjectives = await prisma.mboManagerObjective.findMany({
      include: {
        manager: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            title: true,
            department: true
          }
        },
        assignedBySeniorManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            title: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform the data to match the expected interface
    const objectives: TransformedManagerObjective[] = managerObjectives.map((obj: any): TransformedManagerObjective => ({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      category: obj.category,
      target: obj.target,
      current: obj.current,
      weight: obj.weight,
      status: obj.status,
      dueDate: obj.dueDate.toISOString(),
      quarter: obj.quarter,
      year: obj.year,
      managerId: obj.managerId,
      managerName: obj.manager?.name || `${obj.manager?.firstName} ${obj.manager?.lastName}`.trim(),
      managerTitle: obj.manager?.title || 'Manager',
      managerEmail: obj.manager?.email,
      managerDepartment: obj.manager?.department,
      progress: obj.progress,
      completedAt: obj.completedAt?.toISOString(),
      managerRemarks: obj.managerRemarks,
      managerEvidence: obj.managerEvidence,
      aiScore: obj.aiScore,
      aiComments: obj.aiComments,
      seniorManagerScore: obj.seniorManagerScore,
      seniorManagerComments: obj.seniorManagerComments,
      finalScore: obj.finalScore,
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      assignedByName: obj.assignedBySeniorManager?.name || `${obj.assignedBySeniorManager?.firstName} ${obj.assignedBySeniorManager?.lastName}`.trim(),
      assignedByTitle: obj.assignedBySeniorManager?.title
    }));

    // Calculate statistics
    const stats = {
      total: objectives.length,
      completed: objectives.filter((obj: TransformedManagerObjective) => obj.status === 'COMPLETED' || obj.status === 'MANAGER_SUBMITTED').length,
      inProgress: objectives.filter((obj: TransformedManagerObjective) => obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS').length,
      aiScored: objectives.filter((obj: TransformedManagerObjective) => obj.status === 'AI_SCORED').length,
      submitted: objectives.filter((obj: TransformedManagerObjective) => obj.status === 'SUBMITTED_TO_HR').length,
      bonusApproved: objectives.filter((obj: TransformedManagerObjective) => obj.status === 'BONUS_APPROVED').length,
      overdue: objectives.filter((obj: TransformedManagerObjective) => {
        const dueDate = new Date(obj.dueDate);
        const today = new Date();
        return obj.status !== 'COMPLETED' && obj.status !== 'MANAGER_SUBMITTED' && obj.status !== 'BONUS_APPROVED' && dueDate < today;
      }).length,
      avgProgress: objectives.length > 0 
        ? Math.round(objectives.reduce((sum: number, obj: TransformedManagerObjective) => sum + (obj.progress || 0), 0) / objectives.length)
        : 0,
      avgAiScore: objectives.filter((obj: TransformedManagerObjective) => obj.aiScore).length > 0
        ? Math.round(
            objectives
              .filter((obj: TransformedManagerObjective) => obj.aiScore)
              .reduce((sum: number, obj: TransformedManagerObjective) => sum + obj.aiScore!, 0) / 
            objectives.filter((obj: TransformedManagerObjective) => obj.aiScore).length * 10
          ) / 10
        : 0,
      avgFinalScore: objectives.filter((obj: TransformedManagerObjective) => obj.finalScore).length > 0
        ? Math.round(
            objectives
              .filter((obj: TransformedManagerObjective) => obj.finalScore)
              .reduce((sum: number, obj: TransformedManagerObjective) => sum + obj.finalScore!, 0) / 
            objectives.filter((obj: TransformedManagerObjective) => obj.finalScore).length * 10
          ) / 10
        : 0
    };

    // Group by quarters and years for additional insights
    interface QuarterlyData {
      year: number;
      quarter: string;
      total: number;
      completed: number;
      avgProgress: number;
      objectives: TransformedManagerObjective[];
    }

    const quarterlyData = objectives.reduce((acc: Record<string, QuarterlyData>, obj: TransformedManagerObjective) => {
      const key = `${obj.year}-${obj.quarter}`;
      if (!acc[key]) {
        acc[key] = {
          year: obj.year,
          quarter: obj.quarter,
          total: 0,
          completed: 0,
          avgProgress: 0,
          objectives: []
        };
      }
      acc[key].total++;
      if (obj.status === 'COMPLETED' || obj.status === 'MANAGER_SUBMITTED' || obj.status === 'BONUS_APPROVED') {
        acc[key].completed++;
      }
      acc[key].objectives.push(obj);
      acc[key].avgProgress = Math.round(
        acc[key].objectives.reduce((sum: number, o: TransformedManagerObjective) => sum + (o.progress || 0), 0) / acc[key].objectives.length
      );
      return acc;
    }, {} as Record<string, QuarterlyData>);

    console.log(`Successfully fetched ${objectives.length} manager objectives`);

    return NextResponse.json({
      success: true,
      objectives,
      stats,
      quarterlyData: Object.values(quarterlyData),
      message: `Retrieved ${objectives.length} manager objectives successfully`
    });

  } catch (error) {
    console.error('Error fetching all manager objectives:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch manager objectives',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}