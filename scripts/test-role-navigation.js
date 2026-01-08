// Test script to verify navigation and role access
const testRoleNavigation = () => {
  console.log('=== Testing Role Navigation ===');
  
  // Test role normalization
  const testRoles = [
    'SENIOR_MANAGEMENT',
    'senior-management', 
    'MANAGER',
    'manager',
    'HR',
    'hr',
    'EMPLOYEE',
    'employee'
  ];
  
  const normalizeRole = (role) => role.toLowerCase().replace('_', '-');
  
  testRoles.forEach(role => {
    const normalized = normalizeRole(role);
    console.log(`${role} -> ${normalized}`);
  });
  
  console.log('\n=== Navigation Items by Role ===');
  
  // Mock navigation items
  const NAV_ITEMS = [
    { name: 'Dashboard', roles: ['employee', 'manager', 'hr', 'senior-management'] },
    { name: 'My Objectives', roles: ['manager'] },
    { name: 'Pending Objectives', roles: ['employee', 'manager'] },
    { name: 'Review Objectives', roles: ['senior-management'] },
    { name: 'HR Reports', roles: ['hr'] },
    { name: 'Strategic Overview', roles: ['senior-management'] }
  ];
  
  const filterNavByRole = (role) => {
    if (!role) return [];
    const normalized = normalizeRole(role);
    return NAV_ITEMS.filter(item => item.roles.includes(normalized));
  };
  
  ['MANAGER', 'SENIOR_MANAGEMENT', 'HR', 'EMPLOYEE'].forEach(role => {
    const items = filterNavByRole(role);
    console.log(`\n${role}:`);
    items.forEach(item => console.log(`  - ${item.name}`));
  });
};

console.log('Role Navigation Test');
testRoleNavigation();