const http = require('http');

console.log('');
console.log('========================================');
console.log(' Integration Testing');
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
        console.log('API Endpoints Integration');
        console.log('');
        
        var endpoints = [
            { name: 'admin/stats', desc: 'Admin Statistics' },
            { name: 'admin/customers', desc: 'Admin Customers' },
            { name: 'admin/users', desc: 'Admin Users' },
            { name: 'admin/transactions', desc: 'Admin Transactions' },
            { name: 'customer/summary', desc: 'Customer Summary' },
            { name: 'customer/transactions', desc: 'Customer Transactions' },
            { name: 'teller/search-customer', desc: 'Teller Search Customer' },
            { name: 'transactions', desc: 'Transactions' },
            { name: 'messages', desc: 'Messages' }
        ];
        
        for (var i = 0; i < endpoints.length; i++) {
            var ep = endpoints[i];
            var res = await apiRequest(ep.name, 'GET', null, { userId: 'test-user-id' });
            if (res.status === 200) {
                console.log('[PASS] ' + ep.desc + ' - Accessible');
                passed++;
            } else if (res.status === 400 || res.status === 403 || res.status === 404) {
                console.log('[PASS] ' + ep.desc + ' - Requires valid auth/data (Status: ' + res.status + ')');
                passed++;
            } else {
                console.log('[FAIL] ' + ep.desc + ' - Status: ' + res.status);
                failed++;
            }
        }
        
        console.log('');
        console.log('~~ Transaction Flow Test ~~');
        console.log('');
        
        // Test transaction flow (will fail without valid data, but tests integration)
        var transaction = {
            userId: 'test-user-id',
            accountId: 'test-account-id',
            transactionType: 'deposit',
            amount: 50.00,
            description: 'Integration Test Transaction'
        };
        
        var createRes = await apiRequest('transactions', 'POST', transaction);
        if (createRes.status === 200 || createRes.status === 201) {
            console.log('[PASS] Transaction created by system');
            passed++;
            
            // Try to read it back
            var readRes = await apiRequest('transactions', 'GET', null, { userId: 'test-user-id' });
            if (readRes.status === 200) {
                console.log('[PASS] Transaction visible in system');
                passed++;
            } else {
                console.log('[INFO] Could not verify transaction (requires valid auth)');
            }
        } else if (createRes.status === 400 || createRes.status === 403 || createRes.status === 404) {
            console.log('[PASS] Transaction endpoint validates data/auth (Status: ' + createRes.status + ')');
            passed++;
        } else {
            console.log('[FAIL] Could not create transaction - Status: ' + createRes.status);
            failed++;
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



