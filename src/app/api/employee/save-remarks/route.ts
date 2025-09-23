import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { objectiveId, employeeRemarks } = await request.json()

    console.log('💾 Saving employee remarks for objective:', objectiveId)

    if (!objectiveId) {
      return NextResponse.json({ error: 'Objective ID is required' }, { status: 400 })
    }

    if (!employeeRemarks || typeof employeeRemarks !== 'string') {
      return NextResponse.json({ error: 'Employee remarks are required' }, { status: 400 })
    }

    // Update the objective with employee remarks
    const updatedObjective = await prisma.mboObjective.update({
      where: {
        id: objectiveId
      },
      data: {
        employeeRemarks: employeeRemarks.trim(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        employeeRemarks: true,
        updatedAt: true
      }
    })

    console.log('✅ Employee remarks saved successfully for objective:', updatedObjective.title)

    return NextResponse.json({
      success: true,
      message: 'Employee remarks saved successfully',
      objective: updatedObjective
    })
  } catch (error) {
    console.error('Error saving employee remarks:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
