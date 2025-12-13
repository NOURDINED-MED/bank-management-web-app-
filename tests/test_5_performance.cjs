const http = require('http');

console.log('');
console.log('========================================');
console.log(' Performance Testing');
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
        
        var start = Date.now();
        var req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/' + endpoint + queryString,
            method: 'GET'
        }, function(res) {
            var data = '';
            res.on('data', function(chunk) { data += chunk; });
            res.on('end', function() { resolve(Date.now() - start); });
        });
        req.on('error', function() { resolve(-1); });
        req.setTimeout(5000, function() {
            req.destroy();
            resolve(-1);
        });
        req.end();
    });
}

async function runTest() {
    var iterations = 10;
    console.log('Running ' + iterations + ' requests per endpoint...');
    console.log('');
    
    var endpoints = [
        { name: 'test-supabase', params: null },
        { name: 'admin/stats', params: { userId: 'test-id' } },
        { name: 'admin/customers', params: { userId: 'test-id' } },
        { name: 'transactions', params: { userId: 'test-id' } }
    ];
    var passed = 0;
    
    for (var e = 0; e < endpoints.length; e++) {
        var ep = endpoints[e];
        var times = [];
        
        for (var i = 0; i < iterations; i++) {
            var time = await apiGet(ep.name, ep.params);
            if (time > 0) {
                times.push(time);
            }
        }
        
        if (times.length > 0) {
            var sum = 0;
            for (var t = 0; t < times.length; t++) sum += times[t];
            var avg = sum / times.length;
            var min = Math.min.apply(null, times);
            var max = Math.max.apply(null, times);
            
            var status = avg < 500 ? 'PASS' : 'SLOW';
            console.log('[' + status + '] ' + ep.name + ' - Avg: ' + avg.toFixed(1) + 'ms, Min: ' + min + 'ms, Max: ' + max + 'ms');
            
            if (avg < 500) passed++;
        } else {
            console.log('[FAIL] ' + ep.name + ' - All requests failed or timed out');
        }
    }
    
    console.log('');
    console.log('========================================');
    console.log('  RESULT: ' + passed + '/' + endpoints.length + ' endpoints meet target (<500ms)');
    console.log('========================================');
    console.log('');
}

runTest();



