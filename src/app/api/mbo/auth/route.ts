import { NextRequest, NextResponse } from 'next/server';
import { MboDataAccess } from '@/lib/database/mbo-data-access';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required',
      }, { status: 400 });
    }

    const dataAccess = new MboDataAccess();
    
    // Try to get user by email
    const user = await dataAccess.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    // For demo purposes, accept any password or no password for existing users
    // In production, implement proper password hashing and verification

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        role: user.role,
        title: user.title,
        phone: user.phone,
        hireDate: user.hireDate,
        salary: user.salary,
        status: user.status,
        departmentId: user.departmentId,
        teamId: user.teamId,
        managerId: user.managerId,
        departmentName: user.departmentName,
        teamName: user.teamName,
        managerName: user.managerName,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'MBO Authentication API is running',
    timestamp: new Date().toISOString(),
  });
}
