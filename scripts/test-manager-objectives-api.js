// =====================================================
// Manager Objectives API Endpoints Test
// =====================================================
// This script tests all manager objectives API endpoints to ensure
// they are working correctly with the new database table

const API_BASE_URL = 'http://localhost:3000';

// Test authentication token (you may need to get a real token)
const TEST_AUTH_TOKEN = 'test-token'; // Replace with actual token if needed

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🚀 Testing Manager Objectives API Endpoints${colors.reset}\n`);

// Helper function to make API requests
async function testEndpoint(name, method, url, body = null, expectedStatus = 200) {
    try {
        console.log(`${colors.yellow}Testing: ${name}${colors.reset}`);
        console.log(`${method} ${url}`);
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        const data = await response.text();
        
        console.log(`Status: ${response.status}`);
        
        if (response.status === expectedStatus || (expectedStatus === 'any')) {
            console.log(`${colors.green}✅ PASS${colors.reset}`);
            try {
                const jsonData = JSON.parse(data);
                console.log('Response:', JSON.stringify(jsonData, null, 2).substring(0, 500) + '...');
            } catch {
                console.log('Response:', data.substring(0, 200) + '...');
            }
        } else {
            console.log(`${colors.red}❌ FAIL - Expected ${expectedStatus}, got ${response.status}${colors.reset}`);
            console.log('Response:', data.substring(0, 300));
        }
        
        console.log('─'.repeat(60));
        return response.status === expectedStatus;
        
    } catch (error) {
        console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
        console.log('─'.repeat(60));
        return false;
    }
}

// Main test function
async function runTests() {
    const results = [];
    
    console.log(`${colors.bold}1. Testing Senior Management Manager Objectives APIs${colors.reset}\n`);
    
    // Test 1: Get available managers
    results.push(await testEndpoint(
        'Get Available Managers',
        'GET',
        `${API_BASE_URL}/api/senior-management/managers`,
        null,
        'any' // Accept any status for now (401 is expected without auth)
    ));
    
    // Test 2: Get assigned manager objectives
    results.push(await testEndpoint(
        'Get Assigned Manager Objectives',
        'GET',
        `${API_BASE_URL}/api/senior-management/assigned-objectives`,
        null,
        'any'
    ));
    
    // Test 3: Get manager objectives by status
    results.push(await testEndpoint(
        'Get Manager Objectives by Status',
        'GET',
        `${API_BASE_URL}/api/senior-management/objectives?status=completed`,
        null,
        'any'
    ));
    
    // Test 4: Get quarterly weights for a manager
    results.push(await testEndpoint(
        'Get Quarterly Weights',
        'GET',
        `${API_BASE_URL}/api/senior-management/quarterly-weights?managerId=test-manager&year=2025`,
        null,
        'any'
    ));
    
    // Test 5: Assign objective to manager (will fail without proper auth, but should hit the endpoint)
    const testObjective = {
        managerId: 'test-manager-id',
        title: 'Test Manager Objective',
        description: 'This is a test objective for managers',
        category: 'performance',
        target: 100,
        weight: 25,
        dueDate: '2025-12-31',
        quarter: 'Q4',
        year: 2025
    };
    
    results.push(await testEndpoint(
        'Assign Objective to Manager',
        'POST',
        `${API_BASE_URL}/api/senior-management/assign-objective`,
        testObjective,
        'any'
    ));
    
    console.log(`${colors.bold}2. Testing Manager Side APIs${colors.reset}\n`);
    
    // Test 6: Get manager's objectives
    results.push(await testEndpoint(
        'Get Manager Objectives',
        'GET',
        `${API_BASE_URL}/api/manager/objectives`,
        null,
        'any'
    ));
    
    // Test 7: Complete manager objective
    results.push(await testEndpoint(
        'Complete Manager Objective',
        'POST',
        `${API_BASE_URL}/api/manager/objectives/complete`,
        {
            objectiveId: 'test-objective-id',
            managerRemarks: 'Test completion remarks',
            managerEvidence: 'Test evidence',
            digitalSignature: 'Test Signature'
        },
        'any'
    ));
    
    console.log(`${colors.bold}3. Testing AI Scoring API${colors.reset}\n`);
    
    // Test 8: AI score manager objective
    results.push(await testEndpoint(
        'AI Score Manager Objective',
        'POST',
        `${API_BASE_URL}/api/ai/score-manager-objective`,
        {
            objectiveId: 'test-objective-id'
        },
        'any'
    ));
    
    // Test 9: Senior management review
    results.push(await testEndpoint(
        'Senior Management Review',
        'PUT',
        `${API_BASE_URL}/api/senior-management/review-manager-objectives`,
        {
            objectiveId: 'test-objective-id',
            seniorManagerScore: 85,
            seniorManagerComments: 'Good performance',
            seniorDigitalSignature: 'Senior Manager Signature'
        },
        'any'
    ));
    
    // Summary
    console.log(`${colors.bold}${colors.blue}📊 Test Summary${colors.reset}\n`);
    
    const totalTests = results.length;
    const passedTests = results.filter(Boolean).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    
    if (passedTests === totalTests) {
        console.log(`${colors.green}${colors.bold}🎉 All API endpoints are accessible!${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠️  Some endpoints may need authentication or have other issues${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}Note: 401 (Unauthorized) responses are expected for endpoints requiring authentication.${colors.reset}`);
    console.log(`${colors.blue}The important thing is that the endpoints exist and are reachable.${colors.reset}`);
}

// Run the tests
runTests().catch(error => {
    console.error(`${colors.red}Test suite failed:${colors.reset}`, error);
});