import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/manager/pending-reviews
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const managerId = url.searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ error: 'Manager ID is required' }, { status: 400 });
    }

    console.log(`📋 Fetching pending reviews for manager: ${managerId}`);

    // Get objectives pending review for this manager's team
    const pendingObjectives = await prisma.$queryRaw`
      SELECT o.*, u.name as employeeName, u.email as employeeEmail,
             u.employeeId, u.role as employeeRole
      FROM mbo_objectives o
      INNER JOIN mbo_users u ON o.userId = u.id
      WHERE u.managerId = ${managerId} 
      AND o.workflowStatus = 'PENDING_MANAGER_REVIEW'
      ORDER BY o.submittedToManagerAt ASC
    ` as any[];

    console.log(`📊 Found ${pendingObjectives.length} objectives pending review`);

    return NextResponse.json({
      success: true,
      pendingObjectives,
      count: pendingObjectives.length
    });

  } catch (error) {
    console.error('❌ Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
