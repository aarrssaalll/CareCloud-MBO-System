import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('🔍 Auth POST request received');
  
  try {
    const { email, password, role } = await request.json();
    console.log('📧 Login attempt for:', email, 'with role:', role);

    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json({
        success: false,
        message: 'Email is required',
      }, { status: 400 });
    }

    // Look up user by email using Prisma
    console.log('🔍 Looking up user in database...');
    const user = await prisma.mboUser.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found for email:', email);
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    console.log('✅ User found:', user.name, user.role);

    // Check if role matches
    if (role && user.role !== role) {
      console.log('❌ Role mismatch. User role:', user.role, 'Selected role:', role);
      return NextResponse.json({
        success: false,
        message: `Access denied. Your account role is ${user.role}, but you selected ${role}`,
      }, { status: 403 });
    }

    // Check password for all user roles (SENIOR_MANAGEMENT, HR, MANAGER, EMPLOYEE)
    if (user.role === 'SENIOR_MANAGEMENT' || user.role === 'HR' || user.role === 'MANAGER' || user.role === 'EMPLOYEE') {
      if (!password) {
        console.log('❌ Password required for', user.role);
        return NextResponse.json({
          success: false,
          message: `Password is required for ${user.role} users`,
        }, { status: 400 });
      }

      const userWithPassword = user as any;
      if (userWithPassword.password !== password) {
        console.log('❌ Invalid password for', user.role, 'user');
        return NextResponse.json({
          success: false,
          message: 'Invalid password',
        }, { status: 401 });
      }
    }

    console.log('✅ Authentication successful for:', user.name);
    
    const userResponse: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isDemoUser: false,
    };

    // Add optional fields safely
    const userAny = user as any;
    if (userAny.employeeId) userResponse.employeeId = userAny.employeeId;
    if (userAny.firstName) userResponse.firstName = userAny.firstName;
    if (userAny.lastName) userResponse.lastName = userAny.lastName;
    if (userAny.title) userResponse.title = userAny.title;
    if (userAny.phone) userResponse.phone = userAny.phone;
    if (userAny.hireDate) userResponse.hireDate = userAny.hireDate;
    if (userAny.salary) userResponse.salary = userAny.salary;
    if (userAny.departmentId) userResponse.departmentId = userAny.departmentId;
    if (userAny.teamId) userResponse.teamId = userAny.teamId;
    if (userAny.managerId) userResponse.managerId = userAny.managerId;
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
    });
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'MBO Authentication API is running',
    timestamp: new Date().toISOString(),
  });
}
