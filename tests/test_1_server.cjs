const http = require('http');

console.log('');
console.log('========================================');
console.log('  Server Connection');
console.log('========================================');
console.log('');

function testEndpoint(endpoint) {
    return new Promise(function(resolve) {
        var req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/' + endpoint,
            method: 'GET'
        }, function(res) {
            resolve({ endpoint: endpoint, status: res.statusCode, ok: res.statusCode === 200 || res.statusCode === 404 });
        });
        req.on('error', function() {
            resolve({ endpoint: endpoint, status: 'ERROR', ok: false });
        });
        req.setTimeout(5000, function() {
            req.destroy();
            resolve({ endpoint: endpoint, status: 'TIMEOUT', ok: false });
        });
        req.end();
    });
}

async function runTest() {
    console.log('Testing Next.js Server connection...');
    console.log('');
    
    // Test main endpoints
    var endpoints = [
        { path: '', name: 'Root' },
        { path: 'api/test-supabase', name: 'Test Supabase API' },
        { path: 'api/admin/stats', name: 'Admin Stats API' }
    ];
    var passed = 0;
    
    for (var i = 0; i < endpoints.length; i++) {
        var result = await testEndpoint(endpoints[i].path);
        if (result.ok) {
            console.log('[PASS] /' + result.endpoint + ' (' + endpoints[i].name + ') - Status: ' + result.status);
            passed++;
        } else {
            console.log('[FAIL] /' + result.endpoint + ' (' + endpoints[i].name + ') - Status: ' + result.status);
        }
    }
    
    // Test server is responding
    console.log('');
    var rootTest = await testEndpoint('');
    if (rootTest.ok) {
        console.log('[PASS] Next.js Server is running on port 3000');
        passed++;
    } else {
        console.log('[FAIL] Next.js Server is not responding on port 3000');
        console.log('       Make sure to run: npm run dev');
    }
    
    console.log('');
    console.log('========================================');
    console.log('  RESULT: ' + passed + '/' + (endpoints.length + 1) + ' endpoints OK');
    console.log('========================================');
    console.log('');
}

runTest();



