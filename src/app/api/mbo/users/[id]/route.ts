import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Update user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
      password
    } = body;

    console.log('👤 HR Module - Updating user:', { id, name, email, role });

    // Check if user exists
    const existingUser = await prisma.mboUser.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name: name || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      employeeId: employeeId || undefined,
      role: role || undefined,
      title: title || undefined,
      departmentId: departmentId || null,
      teamId: teamId || null,
      managerId: managerId || null,
      phone: phone || undefined,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      salary: salary ? parseFloat(salary) : undefined,
    };

    // Only hash and update password if provided
    if (password && password.trim() !== '') {
      // Simple password assignment without hashing for now
      updateData.password = password;
    }

    // Remove undefined values to avoid overwriting existing data
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('📝 Update data prepared:', { 
      ...updateData, 
      password: updateData.password ? '[HIDDEN]' : 'Not updated' 
    });

    const updatedUser = await prisma.mboUser.update({
      where: { id },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ User updated successfully:', updatedUser.name);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${updatedUser.name} updated successfully`
    });

  } catch (error: any) {
    console.error('❌ HR Module - Error updating user:', error);

    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Email or Employee ID already exists'
      }, { status: 400 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Invalid department, team, or manager reference'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// DELETE - Delete user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('👤 HR Module - Deleting user:', id);

    // Check if user exists
    const existingUser = await prisma.mboUser.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    await prisma.mboUser.delete({
      where: { id }
    });

    console.log('✅ User deleted successfully:', existingUser.name);

    return NextResponse.json({
      success: true,
      message: `User ${existingUser.name} deleted successfully`
    });

  } catch (error: any) {
    console.error('❌ HR Module - Error deleting user:', error);

    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete user: they have associated records (objectives, reviews, etc.)'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}
