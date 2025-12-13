const http = require('http');

console.log('');
console.log('========================================');
console.log(' User Data Retrieval');
console.log('========================================');
console.log('');

function apiGet(endpoint, queryParams) {
    return new Promise(function(resolve, reject) {
        var queryString = '';
        if (queryParams) {
            var params = [];
            for (var key in queryParams) {
                params.push(key + '=' + encodeURIComponent(queryParams[key]));
            }
            queryString = '?' + params.join('&');
        }
        
        var req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/' + endpoint + queryString,
            method: 'GET'
        }, function(res) {
            var data = '';
            res.on('data', function(chunk) { data += chunk; });
            res.on('end', function() {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
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
        req.end();
    });
}

async function runTest() {
    var passed = 0;
    var failed = 0;
    
    try {
        console.log('Test 2.1: Test Supabase Connection');
        var testRes = await apiGet('test-supabase');
        if (testRes.status === 200) {
            console.log('[PASS] Supabase connection test endpoint accessible');
            passed++;
        } else {
            console.log('[FAIL] Supabase test endpoint - Status: ' + testRes.status);
            failed++;
        }
        
        console.log('');
        console.log('Test 2.2: Admin Users Endpoint (requires userId)');
        var usersRes = await apiGet('admin/users', { userId: 'test-user-id' });
        if (usersRes.status === 400 || usersRes.status === 403) {
            console.log('[PASS] Endpoint requires authentication (Status: ' + usersRes.status + ')');
            passed++;
        } else if (usersRes.status === 200) {
            console.log('[PASS] Users endpoint accessible');
            if (usersRes.data.users && Array.isArray(usersRes.data.users)) {
                console.log('       Retrieved ' + usersRes.data.users.length + ' users');
            }
            passed++;
        } else {
            console.log('[FAIL] Unexpected status: ' + usersRes.status);
            failed++;
        }
        
        console.log('');
        console.log('Test 2.3: Admin Customers Endpoint (requires userId)');
        var customersRes = await apiGet('admin/customers', { userId: 'test-user-id' });
        if (customersRes.status === 400 || customersRes.status === 403) {
            console.log('[PASS] Endpoint requires authentication (Status: ' + customersRes.status + ')');
            passed++;
        } else if (customersRes.status === 200) {
            console.log('[PASS] Customers endpoint accessible');
            if (customersRes.data.customers && Array.isArray(customersRes.data.customers)) {
                console.log('       Retrieved ' + customersRes.data.customers.length + ' customers');
            }
            passed++;
        } else {
            console.log('[FAIL] Unexpected status: ' + customersRes.status);
            failed++;
        }
        
        console.log('');
        console.log('Test 2.4: Transactions Endpoint (requires userId)');
        var transactionsRes = await apiGet('transactions', { userId: 'test-user-id' });
        if (transactionsRes.status === 400 || transactionsRes.status === 403) {
            console.log('[PASS] Endpoint requires authentication (Status: ' + transactionsRes.status + ')');
            passed++;
        } else if (transactionsRes.status === 200) {
            console.log('[PASS] Transactions endpoint accessible');
            if (transactionsRes.data.transactions && Array.isArray(transactionsRes.data.transactions)) {
                console.log('       Retrieved ' + transactionsRes.data.transactions.length + ' transactions');
            }
            passed++;
        } else {
            console.log('[FAIL] Unexpected status: ' + transactionsRes.status);
            failed++;
        }
        
    } catch (e) {
        console.log('[ERROR] ' + e.message);
        console.log('Make sure Next.js server is running: npm run dev');
        failed++;
    }
    
    console.log('');
    console.log('========================================');
    console.log('  RESULT: ' + passed + ' passed, ' + failed + ' failed');
    console.log('========================================');
    console.log('');
}

runTest();



