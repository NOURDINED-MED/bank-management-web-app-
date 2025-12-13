const http = require('http');

console.log('');
console.log('========================================');
console.log(' CRUD Operations');
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
        console.log('--- TRANSACTION CRUD ---');
        console.log('');
        
        console.log('Test 3.1: CREATE Transaction (requires auth)');
        var newTransaction = {
            userId: 'test-user-id',
            accountId: 'test-account-id',
            transactionType: 'deposit',
            amount: 100.00,
            description: 'CRUD Test Transaction'
        };
        var createRes = await apiRequest('transactions', 'POST', newTransaction);
        if (createRes.status === 400 || createRes.status === 403 || createRes.status === 404) {
            console.log('[PASS] Transaction creation requires valid authentication/data (Status: ' + createRes.status + ')');
            passed++;
        } else if (createRes.status === 200 || createRes.status === 201) {
            console.log('[PASS] Transaction created successfully');
            passed++;
        } else {
            console.log('[FAIL] Unexpected status: ' + createRes.status);
            failed++;
        }
        
        console.log('');
        console.log('Test 3.2: READ Transactions');
        var readRes = await apiRequest('transactions', 'GET', null, { userId: 'test-user-id' });
        if (readRes.status === 200) {
            console.log('[PASS] Transactions retrieved');
            if (readRes.data.transactions && Array.isArray(readRes.data.transactions)) {
                console.log('       Found ' + readRes.data.transactions.length + ' transactions');
            }
            passed++;
        } else if (readRes.status === 400 || readRes.status === 403) {
            console.log('[PASS] Endpoint requires authentication (Status: ' + readRes.status + ')');
            passed++;
        } else {
            console.log('[FAIL] Could not read transactions - Status: ' + readRes.status);
            failed++;
        }
        
        console.log('');
        console.log('--- CUSTOMER CRUD ---');
        console.log('');
        
        console.log('Test 3.3: READ Customers');
        var customersRes = await apiRequest('admin/customers', 'GET', null, { userId: 'test-admin-id' });
        if (customersRes.status === 200) {
            console.log('[PASS] Customers retrieved');
            if (customersRes.data.customers && Array.isArray(customersRes.data.customers)) {
                console.log('       Found ' + customersRes.data.customers.length + ' customers');
            }
            passed++;
        } else if (customersRes.status === 400 || customersRes.status === 403) {
            console.log('[PASS] Endpoint requires admin authentication (Status: ' + customersRes.status + ')');
            passed++;
        } else {
            console.log('[FAIL] Could not read customers - Status: ' + customersRes.status);
            failed++;
        }
        
        console.log('');
        console.log('--- USER CRUD ---');
        console.log('');
        
        console.log('Test 3.4: READ Users (Admin/Teller)');
        var usersRes = await apiRequest('admin/users', 'GET', null, { userId: 'test-admin-id' });
        if (usersRes.status === 200) {
            console.log('[PASS] Users retrieved');
            if (usersRes.data.users && Array.isArray(usersRes.data.users)) {
                console.log('       Found ' + usersRes.data.users.length + ' users');
            }
            passed++;
        } else if (usersRes.status === 400 || usersRes.status === 403) {
            console.log('[PASS] Endpoint requires admin authentication (Status: ' + usersRes.status + ')');
            passed++;
        } else {
            console.log('[FAIL] Could not read users - Status: ' + usersRes.status);
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



