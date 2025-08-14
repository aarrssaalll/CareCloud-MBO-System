import { NextRequest, NextResponse } from 'next/server';
import { MboDataAccess } from '@/lib/database/mbo-data-access';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required',
      }, { status: 400 });
    }

    const dataAccess = new MboDataAccess();
    const user = await dataAccess.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    // For demo purposes, accept any password for existing users
    // In production, implement proper password hashing and verification

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
        departmentId: user.departmentId,
        teamId: user.teamId,
        managerId: user.managerId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
