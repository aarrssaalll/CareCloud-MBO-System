import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  managerId: string | null;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking senior management data');
    
    // Get all users
    const allUsers = await prisma.mboUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true
      }
    });
    
    // Get all manager objectives
    const allManagerObjectives = await prisma.mboManagerObjective.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        managerId: true,
        assignedBySeniorManagerId: true
      }
    });
    
    // Get senior managers
    const seniorManagers = allUsers.filter((user: User) => 
      user.role === 'SENIOR_MANAGEMENT' || user.role === 'senior-management'
    );
    
    // Get managers
    const managers = allUsers.filter((user: User) => 
      user.role === 'MANAGER' || user.role === 'manager'
    );
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: allUsers.length,
        seniorManagers: seniorManagers.length,
        managers: managers.length,
        managerObjectives: allManagerObjectives.length,
        users: allUsers,
        objectives: allManagerObjectives,
        seniorManagersList: seniorManagers,
        managersList: managers
      }
    });
    
  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}