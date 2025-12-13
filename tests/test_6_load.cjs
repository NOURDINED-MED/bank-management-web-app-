const http = require('http');

// Number of concurrent users to test
var CONCURRENT_USERS = 100;

console.log('');
console.log('========================================');
console.log(' Load Testing (' + CONCURRENT_USERS + ' concurrent users)');
console.log('========================================');
console.log('');
console.log('  Simulating: ' + CONCURRENT_USERS + ' concurrent users');
console.log('');

function apiGet(endpoint, queryParams) {
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
        var req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/' + endpoint + queryString,
            method: 'GET'
        }, function(res) {
            var data = '';
            res.on('data', function(chunk) { data += chunk; });
            res.on('end', function() { 
                resolve({ time: Date.now() - start, status: res.statusCode }); 
            });
        });
        req.on('error', function() { 
            resolve({ time: -1, status: 'ERROR' }); 
        });
        req.setTimeout(10000, function() {
            req.destroy();
            resolve({ time: -1, status: 'TIMEOUT' });
        });
        req.end();
    });
}

async function runTest() {
    var startTime = Date.now();
    var promises = [];
    var success = 0;
    var times = [];
    
    console.log('Sending requests...');
    
    for (var i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(apiGet('test-supabase', null));
        promises.push(apiGet('admin/stats', { userId: 'test-id-' + i }));
        promises.push(apiGet('admin/customers', { userId: 'test-id-' + i }));
        promises.push(apiGet('transactions', { userId: 'test-id-' + i }));
    }
    
    var totalRequests = promises.length;
    console.log('Total requests: ' + totalRequests);
    
    var responses = await Promise.all(promises);
    
    for (var r = 0; r < responses.length; r++) {
        if (responses[r].status === 200 || responses[r].status === 400 || responses[r].status === 403) {
            success++;
            if (responses[r].time > 0) {
                times.push(responses[r].time);
            }
        }
    }
    
    var totalTime = Date.now() - startTime;
    var sum = 0;
    for (var t = 0; t < times.length; t++) sum += times[t];
    var avgTime = times.length > 0 ? (sum / times.length).toFixed(2) : 'N/A';
    var reqPerSec = ((totalRequests / totalTime) * 1000).toFixed(2);
    
    console.log('');
    console.log('========================================');
    console.log('  LOAD TEST RESULTS');
    console.log('========================================');
    console.log('  Concurrent Users:    ' + CONCURRENT_USERS);
    console.log('  Total Requests:      ' + totalRequests);
    console.log('  Successful:         ' + success);
    console.log('  Failed:              ' + (totalRequests - success));
    console.log('  Total Time:          ' + totalTime + 'ms');
    console.log('  Avg Response Time:   ' + avgTime + 'ms');
    console.log('  Requests/Second:     ' + reqPerSec);
    console.log('========================================');
    console.log('');
    
    if (success >= totalRequests * 0.8) {
        console.log('PASSED - System handles ' + CONCURRENT_USERS + ' concurrent users!');
    } else {
        console.log('WARNING - Some requests failed (' + ((totalRequests - success) / totalRequests * 100).toFixed(1) + '% failure rate)');
    }
    console.log('');
}

runTest();



