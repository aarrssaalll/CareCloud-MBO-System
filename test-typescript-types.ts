import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test TypeScript compilation with bonusAmount
async function testBonusAmountTypes() {
  // This should compile without errors if types are correct
  const testUser = await prisma.mboUser.create({
    data: {
      employeeId: 'TYPE_TEST',
      email: 'type.test@example.com',
      name: 'Type Test User',
      role: 'EMPLOYEE',
      bonusAmount: 5000.00, // This line should NOT show TypeScript errors
    }
  });

  console.log('✅ TypeScript compilation successful!');
  console.log('User created with bonusAmount:', testUser.bonusAmount);
  
  // Clean up
  await prisma.mboUser.delete({
    where: { id: testUser.id }
  });
  
  await prisma.$disconnect();
}

// Export for type checking
export { testBonusAmountTypes };