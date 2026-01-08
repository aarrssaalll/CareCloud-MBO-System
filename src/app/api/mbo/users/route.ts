import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch users with optional filters for HR module
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const departmentId = searchParams.get('departmentId');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    console.log('🔍 HR Module - Fetching users with filters:', { userId, departmentId, role, search });

    if (userId) {
      // Get specific user for HR
      const user = await prisma.mboUser.findUnique({
        where: { id: userId },
        include: {
          department: {
            select: { id: true, name: true }
          },
          team: {
            select: { id: true, name: true }
          },
          manager: {
            select: { id: true, name: true, email: true }
          },
          managedUsers: {
            select: { id: true, name: true, email: true, role: true }
          },
          objectives: {
            select: { id: true, title: true, status: true }
          }
        }
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: user
      });
    }

    // Build filters for HR user management
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (role) where.role = role.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.mboUser.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true }
        },
        team: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            managedUsers: true,
            objectives: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ HR Module - Found ${users.length} users`);

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('❌ HR Module - Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

// POST - Create new user (HR functionality)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      firstName,
      lastName,
      email,
      employeeId,
      role,
      title,
      departmentId,
      teamId,
      managerId,
      phone,
      hireDate,
      salary,
      allocatedBonusAmount,
      password
    } = body;

    console.log('👤 HR Module - Creating new user:', { name, email, role });

    // Validate required fields for HR
    if (!name || !email || !role) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and role are required'
      }, { status: 400 });
    }

    // Check for existing user with same email
    const existingUser = await prisma.mboUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Check for existing employeeId if provided
    if (employeeId) {
      const existingEmployeeId = await prisma.mboUser.findUnique({
        where: { employeeId }
      });

      if (existingEmployeeId) {
        return NextResponse.json({
          success: false,
          error: 'Employee ID already exists'
        }, { status: 409 });
      }
    }

    // Create user with default password for HR
    const defaultPassword = password || 'CareCloud2025!';

    console.log('💾 Creating user data:', { 
      name, 
      email, 
      role: role.toUpperCase(),
      salary: salary ? parseFloat(salary) : null,
      allocatedBonusAmount: allocatedBonusAmount ? parseFloat(allocatedBonusAmount) : null
    });

    const user = await prisma.mboUser.create({
      data: {
        name,
        firstName: firstName || name.split(' ')[0],
        lastName: lastName || name.split(' ').slice(1).join(' '),
        email,
        employeeId: employeeId || null,
        role: role.toUpperCase(),
        title: title || null,
        departmentId: departmentId || null,
        teamId: teamId || null,
        managerId: managerId || null,
        phone: phone || null,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        salary: salary !== undefined && salary !== null && salary !== "" ? parseFloat(salary) : null,
        allocatedBonusAmount: allocatedBonusAmount !== undefined && allocatedBonusAmount !== null && allocatedBonusAmount !== "" ? parseFloat(allocatedBonusAmount) : null,
        password: defaultPassword
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        team: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('✅ HR Module - User created successfully:', user.id);
    console.log('✅ Created with salary:', user.salary, '| Bonus amount:', user.allocatedBonusAmount);

    return NextResponse.json({
      success: true,
      message: 'Employee added successfully to CareCloud MBO System',
      data: user
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ HR Module - Error creating user:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'A user with this email or employee ID already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to add employee to system'
    }, { status: 500 });
  }
}

// PUT - Update user (HR functionality)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id: bodyId, ...updateData } = body;
    
    // Try to get ID from URL path as well
    const urlId = request.url.split('/').pop();
    const id = bodyId || urlId;

    console.log('📝 HR Module - Updating user:', id, '| From body:', bodyId, '| From URL:', urlId);
    console.log('📝 Update data:', { allocatedBonusAmount: updateData.allocatedBonusAmount, salary: updateData.salary });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.mboUser.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }

    // Check for email conflicts if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailConflict = await prisma.mboUser.findUnique({
        where: { email: updateData.email }
      });

      if (emailConflict) {
        return NextResponse.json({
          success: false,
          error: 'Email already exists'
        }, { status: 409 });
      }
    }

    // Check for employeeId conflicts if being updated
    if (updateData.employeeId && updateData.employeeId !== existingUser.employeeId) {
      const employeeIdConflict = await prisma.mboUser.findUnique({
        where: { employeeId: updateData.employeeId }
      });

      if (employeeIdConflict) {
        return NextResponse.json({
          success: false,
          error: 'Employee ID already exists'
        }, { status: 409 });
      }
    }

    // Update user
    const updatedUser = await prisma.mboUser.update({
      where: { id },
      data: {
        ...updateData,
        role: updateData.role ? updateData.role.toUpperCase() : undefined,
        hireDate: updateData.hireDate ? new Date(updateData.hireDate) : undefined,
        salary: updateData.salary !== undefined && updateData.salary !== null && updateData.salary !== "" ? parseFloat(updateData.salary) : undefined,
        allocatedBonusAmount: updateData.allocatedBonusAmount !== undefined && updateData.allocatedBonusAmount !== null && updateData.allocatedBonusAmount !== "" ? parseFloat(updateData.allocatedBonusAmount) : undefined
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        team: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('✅ HR Module - User updated successfully:', updatedUser.id);
    console.log('✅ Updated bonus amount:', updatedUser.allocatedBonusAmount, '| Salary:', updatedUser.salary);

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedUser
    });

  } catch (error: any) {
    console.error('❌ HR Module - Error updating user:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Email or employee ID already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update employee'
    }, { status: 500 });
  }
}

// DELETE - Remove user (HR functionality)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ HR Module - Removing user:', id);

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.mboUser.findUnique({
      where: { id },
      include: {
        managedUsers: true,
        objectives: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }

    // Check if user has dependent records
    if (existingUser.managedUsers.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot remove employee: They manage ${existingUser.managedUsers.length} other employees. Please reassign their reports first.`
      }, { status: 409 });
    }

    // Delete the user
    const deletedUser = await prisma.mboUser.delete({
      where: { id }
    });

    console.log('✅ HR Module - User removed successfully:', deletedUser.id);

    return NextResponse.json({
      success: true,
      message: 'Employee removed from CareCloud MBO System',
      data: { 
        id: deletedUser.id, 
        name: deletedUser.name,
        email: deletedUser.email
      }
    });

  } catch (error: any) {
    console.error('❌ HR Module - Error removing user:', error);

    // Handle foreign key constraints
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Cannot remove employee: They have associated records (objectives, reviews, etc.). Please reassign or complete their records first.'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to remove employee from system'
    }, { status: 500 });
  }
}

