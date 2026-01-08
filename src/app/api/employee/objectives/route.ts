import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('🔍 Employee objectives API called for userId:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get all objectives assigned to the employee
    // Employee can see all their objectives but can only edit ASSIGNED ones
    const objectives = await prisma.mboObjective.findMany({
      where: {
        userId: userId,
        // Show all objectives assigned to this employee
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        },
        reviews: {
          select: {
            id: true,
            score: true,
            comments: true,
            reviewDate: true
          }
        },
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📋 Found ${objectives.length} objectives for employee before processing`)
    console.log('📋 First few objectives status:', objectives.slice(0, 3).map(obj => ({ 
      title: obj.title, 
      status: obj.status,
      userId: obj.userId
    })))

    // Calculate progress and add workflow flags for each objective
    const objectivesWithProgress = objectives.map((objective) => ({
      ...objective,
      progress: objective.target > 0 && objective.current != null 
        ? Math.round((objective.current / objective.target) * 100) 
        : 0,
      // Workflow status flags for UI based on status field
      isEditable: objective.status === 'ASSIGNED' || objective.status === 'ACTIVE' || objective.status === 'IN_PROGRESS',
      isCompleted: objective.status === 'COMPLETED',
      isAiScored: objective.status === 'AI_SCORED',
      isUnderManagerReview: ['AI_SCORED', 'REVIEWED'].includes(objective.status || ''),
      isReadOnly: !['ASSIGNED', 'ACTIVE', 'IN_PROGRESS'].includes(objective.status || ''),
      workflowStage: objective.status || 'ASSIGNED'
    }))

    console.log(`📊 Returning ${objectivesWithProgress.length} objectives to employee`)
    console.log('📋 Objectives breakdown:')
    const breakdown = objectivesWithProgress.reduce((acc, obj) => {
      const stage = obj.workflowStage
      acc[stage] = (acc[stage] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log(breakdown)

    return NextResponse.json({
      objectives: objectivesWithProgress,
      message: `Found ${objectivesWithProgress.length} objectives for employee`,
      metadata: {
        total: objectivesWithProgress.length,
        completed: objectivesWithProgress.filter(obj => obj.status === 'COMPLETED').length,
        inProgress: objectivesWithProgress.filter(obj => obj.status === 'IN_PROGRESS').length,
        aiScored: objectivesWithProgress.filter(obj => obj.status === 'AI_SCORED').length
      }
    })
  } catch (error) {
    console.error('Error fetching employee objectives:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
