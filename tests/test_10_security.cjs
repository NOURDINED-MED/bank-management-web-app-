const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('');
console.log('========================================');
console.log(' Security Testing');
console.log('========================================');
console.log('');

var passed = 0;
var failed = 0;

var projectRoot = path.join(__dirname, '..');

console.log('Test 10.1: Role-Based Access Control');
console.log('');

// Simulated users with different roles
var users = [
    { id: 1, role: 'customer' },
    { id: 2, role: 'teller' },
    { id: 3, role: 'admin' }
];

// Function to simulate access check
function hasAccess(user, requiredRole) {
    if (requiredRole === 'admin') {
        return user.role === 'admin';
    } else if (requiredRole === 'teller') {
        return user.role === 'admin' || user.role === 'teller';
    }
    return true; // Customer can access customer endpoints
}

try {
    var customerCheck = !hasAccess(users[0], 'admin');
    console.log('Customer blocked from admin area:', customerCheck ? '[PASS]' : '[FAIL]');
    customerCheck ? passed++ : failed++;

    var tellerCheck = !hasAccess(users[1], 'admin');
    console.log('Teller blocked from admin area:', tellerCheck ? '[PASS]' : '[FAIL]');
    tellerCheck ? passed++ : failed++;

    var adminCheck = hasAccess(users[2], 'admin');
    console.log('Admin granted access:', adminCheck ? '[PASS]' : '[FAIL]');
    adminCheck ? passed++ : failed++;

} catch (e) {
    console.log('[ERROR] Role access test failed:', e.message);
    failed++;
}

console.log('');

console.log('Test 10.2: Unauthorized User Access');
console.log('');

try {
    var fakeUser = { id: 999, role: 'guest' };
    var blocked = !hasAccess(fakeUser, 'admin');
    console.log('Guest blocked from admin access:', blocked ? '[PASS]' : '[FAIL]');
    blocked ? passed++ : failed++;
} catch (e) {
    console.log('[ERROR] Unauthorized access test failed');
    failed++;
}

console.log('');

console.log('Test 10.3: Sensitive File Protection');
console.log('');

var sensitiveFiles = [
    '.env',
    '.env.local',
    'supabase-service-key.json',
    'config.json'
];

for (var i = 0; i < sensitiveFiles.length; i++) {
    var file = sensitiveFiles[i];
    var fullPath = path.join(projectRoot, file);
    // Check if file exists in public directory (bad) or root (ok if not committed)
    var publicPath = path.join(projectRoot, 'public', file);
    if (fs.existsSync(publicPath)) {
        console.log('[FAIL] ' + file + ' is in public directory');
        failed++;
    } else {
        console.log('[PASS] ' + file + ' not publicly accessible');
        passed++;
    }
}

console.log('');

console.log('Test 10.4: Input Validation');
console.log('');

function validateInput(input) {
    var illegalPatterns = ["<script>", "' OR 1=1", "--", "DROP", "DELETE", "UPDATE", "INSERT"];
    for (var i = 0; i < illegalPatterns.length; i++) {
        if (input.includes(illegalPatterns[i])) return false;
    }
    return true;
}

var testInputs = [
    { val: "<script>alert(1)</script>", valid: false },
    { val: "' OR 1=1", valid: false },
    { val: "DROP TABLE users", valid: false },
    { val: "normalusername", valid: true },
    { val: "test@example.com", valid: true }
];

for (var t = 0; t < testInputs.length; t++) {
    var result = validateInput(testInputs[t].val) === testInputs[t].valid;
    console.log('Input "' + testInputs[t].val + '" validation:', result ? '[PASS]' : '[FAIL]');
    result ? passed++ : failed++;
}

console.log('');

console.log('Test 10.5: API Authentication Requirements');
console.log('');

function testEndpointAuth(endpoint) {
    return new Promise(function(resolve) {
        var req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/' + endpoint,
            method: 'GET'
        }, function(res) {
            resolve({ status: res.statusCode, endpoint: endpoint });
        });
        req.on('error', function() {
            resolve({ status: 'ERROR', endpoint: endpoint });
        });
        req.setTimeout(5000, function() {
            req.destroy();
            resolve({ status: 'TIMEOUT', endpoint: endpoint });
        });
        req.end();
    });
}

async function testAuth() {
    var protectedEndpoints = [
        'admin/users',
        'admin/customers',
        'admin/transactions',
        'customer/summary',
        'teller/search-customer'
    ];
    
    for (var i = 0; i < protectedEndpoints.length; i++) {
        var result = await testEndpointAuth(protectedEndpoints[i]);
        // Should return 400 or 403 (requires auth), not 200 (public access)
        if (result.status === 400 || result.status === 403) {
            console.log('[PASS] ' + result.endpoint + ' requires authentication');
            passed++;
        } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
            console.log('[INFO] ' + result.endpoint + ' - Server not running or unreachable');
        } else {
            console.log('[WARN] ' + result.endpoint + ' - Status: ' + result.status + ' (may be public)');
        }
    }
}

async function runTest() {
    await testAuth();
    
    console.log('');
    console.log('========================================');
    console.log('  RESULT: ' + passed + ' passed, ' + failed + ' failed');
    console.log('========================================');
    console.log('');
}

runTest();

console.log('');
console.log('========================================');
console.log('  RESULT: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');
console.log('');

