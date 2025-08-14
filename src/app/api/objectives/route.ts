import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface MboObjective {
  id: string
  title: string
  description: string
  category: string
  target: number
  current: number
  weight: number
  status: string
  dueDate: Date
  quarter: string
  year: number
  createdAt: Date
  updatedAt: Date
  userId: string
  reviews?: any[]
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Cache for storing recent results
const cache = new Map()
const CACHE_TTL = 30000 // 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `objectives_${userId}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const objectives = await prisma.mboObjective.findMany({
      where: { userId },
      include: {
        reviews: {
          select: {
            id: true,
            score: true,
            comments: true,
            reviewDate: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit results to improve performance
    })

    // Calculate progress for each objective
    const objectivesWithProgress = objectives.map((objective: MboObjective) => ({
      ...objective,
      progress: Math.round((objective.current / objective.target) * 100)
    }))

    const result = { 
      objectives: objectivesWithProgress,
      total: objectives.length 
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching objectives:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, target, dueDate, userId } = body

    // Validation
    if (!title || !target || !dueDate || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, target, dueDate, userId' 
      }, { status: 400 })
    }

    // Calculate quarter and year from due date
    const dueDateObj = new Date(dueDate)
    const quarter = `Q${Math.ceil((dueDateObj.getMonth() + 1) / 3)}`
    const year = dueDateObj.getFullYear()

    const objective = await prisma.mboObjective.create({
      data: {
        title,
        description: description || '',
        category: category || 'General',
        target: parseFloat(target),
        current: 0,
        dueDate: dueDateObj,
        quarter,
        year,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ 
      objective,
      message: 'Objective created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating objective:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, current, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Objective ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (current !== undefined) updateData.current = parseFloat(current)
    if (status) updateData.status = status
    updateData.updatedAt = new Date()

    const objective = await prisma.mboObjective.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ 
      objective,
      message: 'Objective updated successfully' 
    })
  } catch (error) {
    console.error('Error updating objective:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
