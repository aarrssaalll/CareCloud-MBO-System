const { SimpleMboSeeder } = require('../lib/database/simple-mbo-seeder');

async function runSeeder() {
  console.log('🌱 Starting MBO database seeding...');
  
  try {
    const seeder = new SimpleMboSeeder();
    await seeder.initialize();
    
    const result = await seeder.seed();
    
    console.log('✅ Seeding completed successfully!');
    console.log('Created:');
    console.log(`- ${result.departments.length} departments`);
    console.log(`- ${result.teams.length} teams`);
    console.log(`- ${result.users.length} users`);
    console.log(`- ${result.objectives.length} objectives`);
    
    // Test user login
    console.log('\n📝 Test users created:');
    result.users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.title}`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runSeeder();
