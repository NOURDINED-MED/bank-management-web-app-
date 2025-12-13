const http = require('http');

// Number of items to test
var ITEMS_TO_TEST = 50;

console.log('');
console.log('========================================');
console.log('  Concurrent Testing (Data Volume)');
console.log('========================================');
console.log('');
console.log('  Testing with: ' + ITEMS_TO_TEST + ' requests');
console.log('');

function apiRequest(endpoint, method, data, queryParams) {
    return new Promise(function(resolve) {
        var queryString = '';
        if (queryParams) {
            var params = [];
            for (var key in queryParams) {
                params.push(key + '=' + encodeURIComponent(queryParams[key]));
            }
            queryString = '?' + params.join('&');
        }
        
        var start = Date.now();
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
                    resolve({ status: res.statusCode, data: JSON.parse(body || '{}'), time: Date.now() - start });
                } catch (e) {
                    resolve({ status: res.statusCode, data: {}, time: Date.now() - start });
                }
            });
        });
        req.on('error', function() { resolve({ status: 'ERROR', time: -1 }); });
        req.setTimeout(10000, function() {
            req.destroy();
            resolve({ status: 'TIMEOUT', time: -1 });
        });
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    var requestTimes = [];
    
    console.log('PHASE 1: Sending ' + ITEMS_TO_TEST + ' concurrent requests...');
    var createStart = Date.now();
    var promises = [];
    
    for (var i = 0; i < ITEMS_TO_TEST; i++) {
        promises.push(apiRequest('test-supabase', 'GET'));
        promises.push(apiRequest('admin/stats', 'GET', null, { userId: 'test-id-' + i }));
    }
    
    var responses = await Promise.all(promises);
    
    for (var r = 0; r < responses.length; r++) {
        if (responses[r].time > 0) {
            requestTimes.push(responses[r].time);
        }
    }
    
    var createTotal = Date.now() - createStart;
    var sum = 0;
    for (var t = 0; t < requestTimes.length; t++) sum += requestTimes[t];
    var createAvg = requestTimes.length > 0 ? (sum / requestTimes.length).toFixed(2) : 'N/A';
    
    console.log('');
    console.log('  Total Time: ' + createTotal + 'ms');
    console.log('  Avg Response Time: ' + createAvg + 'ms per request');
    console.log('  Successful Requests: ' + requestTimes.length + '/' + responses.length);
    
    console.log('');
    console.log('PHASE 2: Reading data...');
    var readStart = Date.now();
    var readRes = await apiRequest('transactions', 'GET', null, { userId: 'test-id', limit: 10 });
    var readTime = Date.now() - readStart;
    console.log('  Read Time: ' + readTime + 'ms');
    
    console.log('');
    console.log('========================================');
    console.log('  DATA TEST SUMMARY');
    console.log('========================================');
    console.log('  Requests Tested:    ' + ITEMS_TO_TEST * 2);
    console.log('  Total Time:         ' + createTotal + 'ms');
    console.log('  Avg Response Time:  ' + createAvg + 'ms');
    console.log('  Read Time:          ' + readTime + 'ms');
    console.log('========================================');
    console.log('');
    
    if (requestTimes.length >= responses.length * 0.8) {
        console.log('PASSED - System handles ' + ITEMS_TO_TEST + ' concurrent requests!');
    } else {
        console.log('WARNING - Some requests failed');
    }
    console.log('');
}

runTest();



