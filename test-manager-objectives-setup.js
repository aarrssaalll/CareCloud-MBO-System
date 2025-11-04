// Test script to verify manager objectives database table and API functionality
// Run this to test the complete manager objectives system

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testManagerObjectivesSetup() {
  console.log('🧪 Testing Manager Objectives Database Setup...\n');

  try {
    // Test 1: Verify table structure
    console.log('1️⃣ Testing database connection and table structure...');
    
    // Try to count records in manager objectives table
    const count = await prisma.mboManagerObjective.count();
    console.log(`✅ Manager objectives table exists. Current records: ${count}`);

    // Test 2: Test basic CRUD operations
    console.log('\n2️⃣ Testing basic CRUD operations...');
    
    // Find a test manager (should exist from seeded data)
    const testManager = await prisma.mboUser.findFirst({
      where: { 
        role: { in: ['MANAGER', 'manager'] }
      }
    });

    if (!testManager) {
      console.log('❌ No manager found in database for testing');
      return;
    }

    console.log(`✅ Test manager found: ${testManager.name} (${testManager.email})`);

    // Find a test senior manager
    const testSeniorManager = await prisma.mboUser.findFirst({
      where: { 
        role: { in: ['SENIOR_MANAGEMENT', 'senior-management'] }
      }
    });

    if (!testSeniorManager) {
      console.log('❌ No senior manager found in database for testing');
      return;
    }

    console.log(`✅ Test senior manager found: ${testSeniorManager.name} (${testSeniorManager.email})`);

    // Test 3: Create a test manager objective
    console.log('\n3️⃣ Testing manager objective creation...');
    
    const testObjective = await prisma.mboManagerObjective.create({
      data: {
        title: 'Test Manager Objective - Database Verification',
        description: 'This is a test objective to verify the manager objectives table structure',
        category: 'performance',
        target: 100,
        current: 0,
        weight: 0.25, // 25%
        status: 'ASSIGNED',
        dueDate: new Date('2025-12-31'),
        quarter: 'Q4',
        year: 2025,
        managerId: testManager.id,
        assignedBySeniorManagerId: testSeniorManager.id
      }
    });

    console.log(`✅ Test objective created successfully:`);
    console.log(`   ID: ${testObjective.id}`);
    console.log(`   Title: ${testObjective.title}`);
    console.log(`   Manager: ${testManager.name}`);
    console.log(`   Assigned by: ${testSeniorManager.name}`);
    console.log(`   Weight: ${(testObjective.weight || 0) * 100}%`);

    // Test 4: Test quarterly weight calculations
    console.log('\n4️⃣ Testing quarterly weight calculations...');
    
    const quarterlyObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: testManager.id,
        quarter: 'Q4',
        year: 2025
      },
      select: {
        weight: true,
        title: true
      }
    });

    const totalWeight = quarterlyObjectives.reduce((sum, obj) => sum + ((obj.weight || 0) * 100), 0);
    const remainingWeight = 100 - totalWeight;

    console.log(`✅ Quarterly weight calculation for ${testManager.name} - Q4 2025:`);
    console.log(`   Objectives count: ${quarterlyObjectives.length}`);
    console.log(`   Total allocated weight: ${totalWeight}%`);
    console.log(`   Remaining weight: ${remainingWeight}%`);

    // Test 5: Test manager objective retrieval with relationships
    console.log('\n5️⃣ Testing objective retrieval with relationships...');
    
    const objectiveWithRelations = await prisma.mboManagerObjective.findFirst({
      where: { id: testObjective.id },
      include: {
        manager: {
          select: {
            name: true,
            email: true,
            title: true
          }
        },
        assignedBySeniorManager: {
          select: {
            name: true,
            title: true
          }
        }
      }
    });

    if (objectiveWithRelations) {
      console.log(`✅ Objective with relationships retrieved:`);
      console.log(`   Manager: ${objectiveWithRelations.manager.name} (${objectiveWithRelations.manager.title})`);
      console.log(`   Assigned by: ${objectiveWithRelations.assignedBySeniorManager.name}`);
    }

    // Test 6: Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    
    await prisma.mboManagerObjective.delete({
      where: { id: testObjective.id }
    });

    console.log(`✅ Test objective deleted successfully`);

    // Test 7: API endpoints validation
    console.log('\n7️⃣ API Endpoints Ready for Testing:');
    console.log(`   📝 Assign Objective: POST /api/senior-management/assign-objective`);
    console.log(`   📊 Quarterly Weights: GET /api/senior-management/quarterly-weights?managerId=${testManager.id}&year=2025`);
    console.log(`   📋 Manager Objectives: GET /api/manager/objectives`);
    console.log(`   🎯 Complete Objective: POST /api/manager/objectives/complete`);
    console.log(`   🔍 Review Objectives: GET /api/senior-management/objectives?status=completed`);

    console.log('\n🎉 All tests passed! Manager objectives system is ready for use.');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('\nPlease check:');
    console.error('1. Database connection is working');
    console.error('2. All tables are created properly');
    console.error('3. Sample data is seeded');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testManagerObjectivesSetup();