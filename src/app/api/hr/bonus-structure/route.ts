import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default bonus structure for new years
const DEFAULT_STRUCTURE = {
  calculationMethod: 'weighted_performance',
  baseAmount: 5000,
  performanceThresholds: [
    { minPercentage: 0, maxPercentage: 50, multiplier: 0.5 },
    { minPercentage: 50, maxPercentage: 70, multiplier: 0.75 },
    { minPercentage: 70, maxPercentage: 85, multiplier: 0.9 },
    { minPercentage: 85, maxPercentage: 100, multiplier: 1.0 }
  ],
  enableManualOverride: true,
  quarterlyBudget: 20000,
  departmentOverrides: {},
  roleMultipliers: {}
};

/**
 * GET /api/hr/bonus-structure
 * Fetch bonus structure for a specific year
 * Query params: year (optional, defaults to current year)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    console.log(`📊 Fetching bonus structure for year: ${year}`);

    // Try to fetch existing bonus structure
    let bonusStructure = await prisma.bonusStructure.findFirst({
      where: { year, isActive: true },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // If no structure exists for this year, create default
    if (!bonusStructure) {
      console.log(`ℹ️ No bonus structure found for year ${year}, using defaults`);
      
      // Return default without saving (unless explicitly requested)
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          year,
          ...DEFAULT_STRUCTURE,
          performanceThresholds: JSON.stringify(DEFAULT_STRUCTURE.performanceThresholds),
          departmentOverrides: JSON.stringify(DEFAULT_STRUCTURE.departmentOverrides),
          roleMultipliers: JSON.stringify(DEFAULT_STRUCTURE.roleMultipliers),
          createdAt: new Date(),
          updatedAt: new Date(),
          creator: null,
          updater: null,
          isDefault: true
        }
      }, { status: 200 });
    }

    // Parse JSON fields
    const parsedStructure = {
      ...bonusStructure,
      performanceThresholds: JSON.parse(bonusStructure.performanceThresholds),
      departmentOverrides: bonusStructure.departmentOverrides ? JSON.parse(bonusStructure.departmentOverrides) : {},
      roleMultipliers: bonusStructure.roleMultipliers ? JSON.parse(bonusStructure.roleMultipliers) : {}
    };

    console.log(`✅ Bonus structure retrieved for year ${year}`);

    return NextResponse.json({
      success: true,
      data: parsedStructure
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching bonus structure:', error);
    
    // Return default structure as fallback
    const year = new Date().getFullYear();
    return NextResponse.json({
      success: true,
      data: {
        id: null,
        year,
        ...DEFAULT_STRUCTURE,
        performanceThresholds: JSON.stringify(DEFAULT_STRUCTURE.performanceThresholds),
        departmentOverrides: JSON.stringify(DEFAULT_STRUCTURE.departmentOverrides),
        roleMultipliers: JSON.stringify(DEFAULT_STRUCTURE.roleMultipliers),
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: null,
        updater: null,
        isDefault: true,
        error: 'Using default structure due to database error'
      }
    }, { status: 200 });
  }
}

/**
 * POST /api/hr/bonus-structure
 * Create a new bonus structure for a year
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      year,
      calculationMethod,
      baseAmount,
      performanceThresholds,
      enableManualOverride,
      quarterlyBudget,
      departmentOverrides,
      roleMultipliers,
      description,
      userId // HR user creating the structure
    } = body;

    // Validate required fields
    if (!year || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: year, userId'
      }, { status: 400 });
    }

    // Check if structure already exists for this year
    const existingStructure = await prisma.bonusStructure.findFirst({
      where: { year }
    });

    if (existingStructure) {
      return NextResponse.json({
        success: false,
        error: `Bonus structure already exists for year ${year}. Use PUT to update.`
      }, { status: 409 });
    }

    // Validate thresholds
    if (performanceThresholds && Array.isArray(performanceThresholds)) {
      const isValid = performanceThresholds.every(t => 
        typeof t.minPercentage === 'number' &&
        typeof t.maxPercentage === 'number' &&
        typeof t.multiplier === 'number' &&
        t.minPercentage >= 0 &&
        t.maxPercentage <= 100 &&
        t.minPercentage < t.maxPercentage &&
        t.multiplier > 0 &&
        t.multiplier <= 1.0
      );
      if (!isValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid performance thresholds. Max percentage must not exceed 100% and multiplier must be between 0 and 1.0'
        }, { status: 400 });
      }
    }

    console.log(`📝 Creating new bonus structure for year ${year}`);

    const newStructure = await prisma.bonusStructure.create({
      data: {
        year,
        calculationMethod: calculationMethod || 'weighted_performance',
        baseAmount: baseAmount || 5000,
        performanceThresholds: JSON.stringify(performanceThresholds || DEFAULT_STRUCTURE.performanceThresholds),
        enableManualOverride: enableManualOverride !== false,
        quarterlyBudget: quarterlyBudget || 20000,
        departmentOverrides: departmentOverrides ? JSON.stringify(departmentOverrides) : null,
        roleMultipliers: roleMultipliers ? JSON.stringify(roleMultipliers) : null,
        description: description || null,
        isActive: true,
        createdBy: userId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`✅ Bonus structure created for year ${year}`);

    return NextResponse.json({
      success: true,
      data: {
        ...newStructure,
        performanceThresholds: JSON.parse(newStructure.performanceThresholds),
        departmentOverrides: newStructure.departmentOverrides ? JSON.parse(newStructure.departmentOverrides) : {},
        roleMultipliers: newStructure.roleMultipliers ? JSON.parse(newStructure.roleMultipliers) : {}
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating bonus structure:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create bonus structure'
    }, { status: 500 });
  }
}

/**
 * PUT /api/hr/bonus-structure
 * Update an existing bonus structure
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      year,
      calculationMethod,
      baseAmount,
      performanceThresholds,
      enableManualOverride,
      quarterlyBudget,
      departmentOverrides,
      roleMultipliers,
      description,
      userId // HR user updating the structure
    } = body;

    if (!id || !year || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, year, userId'
      }, { status: 400 });
    }

    // Validate thresholds
    if (performanceThresholds && Array.isArray(performanceThresholds)) {
      const isValid = performanceThresholds.every(t => 
        typeof t.minPercentage === 'number' &&
        typeof t.maxPercentage === 'number' &&
        typeof t.multiplier === 'number' &&
        t.minPercentage >= 0 &&
        t.maxPercentage <= 100 &&
        t.minPercentage < t.maxPercentage &&
        t.multiplier > 0 &&
        t.multiplier <= 1.0
      );
      if (!isValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid performance thresholds. Max percentage must not exceed 100% and multiplier must be between 0 and 1.0'
        }, { status: 400 });
      }
    }

    console.log(`📝 Updating bonus structure for year ${year}`);

    const updatedStructure = await prisma.bonusStructure.update({
      where: { id },
      data: {
        calculationMethod: calculationMethod || 'weighted_performance',
        baseAmount: baseAmount || 5000,
        performanceThresholds: JSON.stringify(performanceThresholds || DEFAULT_STRUCTURE.performanceThresholds),
        enableManualOverride: enableManualOverride !== false,
        quarterlyBudget: quarterlyBudget || 20000,
        departmentOverrides: departmentOverrides ? JSON.stringify(departmentOverrides) : null,
        roleMultipliers: roleMultipliers ? JSON.stringify(roleMultipliers) : null,
        description: description || null,
        updatedBy: userId,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`✅ Bonus structure updated for year ${year}`);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedStructure,
        performanceThresholds: JSON.parse(updatedStructure.performanceThresholds),
        departmentOverrides: updatedStructure.departmentOverrides ? JSON.parse(updatedStructure.departmentOverrides) : {},
        roleMultipliers: updatedStructure.roleMultipliers ? JSON.parse(updatedStructure.roleMultipliers) : {}
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error updating bonus structure:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Bonus structure not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update bonus structure'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/hr/bonus-structure
 * Deactivate a bonus structure (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, userId'
      }, { status: 400 });
    }

    console.log(`🗑️ Deactivating bonus structure ${id}`);

    const deactivatedStructure = await prisma.bonusStructure.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Bonus structure deactivated`);

    return NextResponse.json({
      success: true,
      data: deactivatedStructure
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error deactivating bonus structure:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Bonus structure not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate bonus structure'
    }, { status: 500 });
  }
}

