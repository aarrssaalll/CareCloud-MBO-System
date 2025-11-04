import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  id: string;
  role: string;
  departmentId?: string | null;
}

interface Department {
  id: string;
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching employees with role and deptID...');
    
    // Fetch all users with their role and departmentId
    const users = await prisma.mboUser.findMany({
      select: {
        id: true,
        role: true,
        departmentId: true
      }
    });

    // Get all departments
    const departments = await prisma.mboDepartment.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log(`📊 Found ${users.length} users and ${departments.length} departments`);

    // Create department stats
    const departmentStats = departments.map((dept: Department) => {
      const deptUsers = users.filter((user: User) => user.departmentId === dept.id);
      const employees = deptUsers.filter((user: User) => user.role === 'EMPLOYEE').length;
      const managers = deptUsers.filter((user: User) => user.role === 'MANAGER').length;
      
      return {
        id: dept.id,
        name: dept.name,
        employees,
        managers,
        totalUsers: employees + managers,
        completion: 0,
        score: 0,
        trend: 'stable' as const
      };
    });
    
    console.log('✅ Department stats calculated');
    
    return NextResponse.json({
      success: true,
      data: departmentStats
    });
    
  } catch (error) {
    console.error('❌ Error fetching department stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch department statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}