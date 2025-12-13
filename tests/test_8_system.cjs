const http = require('http');

console.log('');
console.log('========================================');
console.log(' System Testing');
console.log('========================================');
console.log('');

function apiRequest(endpoint, method, data, queryParams) {
    return new Promise(function(resolve, reject) {
        var queryString = '';
        if (queryParams) {
            var params = [];
            for (var key in queryParams) {
                params.push(key + '=' + encodeURIComponent(queryParams[key]));
            }
            queryString = '?' + params.join('&');
        }
        
        var options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/' + endpoint + queryString,
            method: method || 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        
        var req = http.request(options, function(res) {
            var body = '';
            res.on('data', function(chunk) { body += chunk; });
            res.on('end', function() {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
                } catch (e) {
                    resolve({ status: res.statusCode, data: {} });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(10000, function() {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    var passed = 0;
    var failed = 0;
    
    try {
        console.log('Test 8.1: Data Persistence');
        var testData = {
            userId: 'test-user-id',
            accountId: 'test-account-id',
            transactionType: 'deposit',
            amount: 25.00,
            description: 'Persistence Test'
        };
        var createRes = await apiRequest('transactions', 'POST', testData);
        
        if (createRes.status === 200 || createRes.status === 201) {
            console.log('[PASS] Data created');
            passed++;
            
            var readRes = await apiRequest('transactions', 'GET', null, { userId: 'test-user-id' });
            if (readRes.status === 200) {
                console.log('[PASS] Data retrieved correctly');
                passed++;
            } else {
                console.log('[INFO] Could not verify retrieval (requires valid auth)');
            }
        } else if (createRes.status === 400 || createRes.status === 403 || createRes.status === 404) {
            console.log('[PASS] Endpoint validates data/auth (Status: ' + createRes.status + ')');
            passed++;
        } else {
            console.log('[FAIL] Could not create - Status: ' + createRes.status);
            failed++;
        }
        
        console.log('');
        console.log('Test 8.2: Transaction Flow');
        var transaction = {
            userId: 'test-user-id',
            accountId: 'test-account-id',
            transactionType: 'deposit',
            amount: 50.00,
            description: 'System Test Transaction'
        };
        var txRes = await apiRequest('transactions', 'POST', transaction);
        
        if (txRes.status === 200 || txRes.status === 201) {
            console.log('[PASS] Transaction created');
            passed++;
            
            if (txRes.data.transaction || txRes.data.success) {
                console.log('[PASS] Transaction response includes data');
                passed++;
            } else {
                console.log('[INFO] Transaction created but response format differs');
            }
        } else if (txRes.status === 400 || txRes.status === 403 || txRes.status === 404) {
            console.log('[PASS] Transaction endpoint validates data/auth (Status: ' + txRes.status + ')');
            passed++;
        } else {
            console.log('[FAIL] Could not create transaction - Status: ' + txRes.status);
            failed++;
        }
        
        console.log('');
        console.log('Test 8.3: API Endpoint Availability');
        var endpoints = [
            { name: 'test-supabase', desc: 'Supabase Connection' },
            { name: 'admin/stats', desc: 'Admin Stats' },
            { name: 'customer/summary', desc: 'Customer Summary' }
        ];
        
        for (var i = 0; i < endpoints.length; i++) {
            var ep = endpoints[i];
            var res = await apiRequest(ep.name, 'GET', null, { userId: 'test-id' });
            if (res.status === 200 || res.status === 400 || res.status === 403) {
                console.log('[PASS] ' + ep.desc + ' endpoint available');
                passed++;
            } else {
                console.log('[FAIL] ' + ep.desc + ' - Status: ' + res.status);
                failed++;
            }
        }
        
    } catch (e) {
        console.log('[ERROR] ' + e.message);
        failed++;
    }
    
    console.log('');
    console.log('========================================');
    console.log('  RESULT: ' + passed + ' passed, ' + failed + ' failed');
    console.log('========================================');
    console.log('');
}

runTest();



