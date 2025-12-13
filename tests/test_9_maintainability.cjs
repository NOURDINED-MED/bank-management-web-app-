const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log(' Maintainability Testing');
console.log('========================================');
console.log('');

var passed = 0;
var failed = 0;

// Get project root (parent of tests directory)
var projectRoot = path.join(__dirname, '..');

console.log('Test 9.1: Project Structure');
console.log('');

var paths = [
    { p: 'app', type: 'dir', desc: 'App directory' },
    { p: 'app/api', type: 'dir', desc: 'API routes folder' },
    { p: 'components', type: 'dir', desc: 'Components folder' },
    { p: 'lib', type: 'dir', desc: 'Lib folder' },
    { p: 'package.json', type: 'file', desc: 'package.json' },
    { p: 'next.config.mjs', type: 'file', desc: 'Next.js config' }
];

for (var i = 0; i < paths.length; i++) {
    var item = paths[i];
    try {
        var fullPath = path.join(projectRoot, item.p);
        var stats = fs.statSync(fullPath);
        var ok = (item.type === 'dir' && stats.isDirectory()) || (item.type === 'file' && stats.isFile());
        if (ok) {
            console.log('[PASS] ' + item.desc);
            passed++;
        } else {
            console.log('[FAIL] ' + item.desc);
            failed++;
        }
    } catch (e) {
        console.log('[FAIL] ' + item.desc + ' (not found)');
        failed++;
    }
}

console.log('');
console.log('Test 9.2: Code Metrics');
console.log('');

try {
    var appPath = path.join(projectRoot, 'app');
    var componentsPath = path.join(projectRoot, 'components');
    var libPath = path.join(projectRoot, 'lib');
    var tsxCount = 0;
    var tsCount = 0;
    var totalLines = 0;
    
    function scan(dir) {
        if (!fs.existsSync(dir)) return;
        var files = fs.readdirSync(dir);
        for (var f = 0; f < files.length; f++) {
            var full = path.join(dir, files[f]);
            try {
                var stats = fs.statSync(full);
                if (stats.isDirectory()) {
                    scan(full);
                } else if (files[f].endsWith('.tsx')) {
                    tsxCount++;
                    totalLines += fs.readFileSync(full, 'utf8').split('\n').length;
                } else if (files[f].endsWith('.ts')) {
                    tsCount++;
                    totalLines += fs.readFileSync(full, 'utf8').split('\n').length;
                }
            } catch (e) {
                // Skip files that can't be read
            }
        }
    }
    
    scan(appPath);
    scan(componentsPath);
    scan(libPath);
    
    console.log('  React Components (.tsx): ' + tsxCount);
    console.log('  TypeScript Files (.ts):  ' + tsCount);
    console.log('  Total Lines of Code:     ' + totalLines);
    var avgLines = (tsxCount + tsCount) > 0 ? Math.round(totalLines / (tsxCount + tsCount)) : 0;
    console.log('  Avg Lines per File:      ' + avgLines);
    console.log('');
    console.log('[PASS] Code metrics collected');
    passed++;
    
} catch (e) {
    console.log('[ERROR] ' + e.message);
    failed++;
}

console.log('');
console.log('Test 9.3: Dependencies');
console.log('');

try {
    var pkgPath = path.join(projectRoot, 'package.json');
    var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    var deps = Object.keys(pkg.dependencies || {});
    var devDeps = Object.keys(pkg.devDependencies || {});
    console.log('  Dependencies: ' + deps.length);
    console.log('  Dev Dependencies: ' + devDeps.length);
    console.log('');
    console.log('[PASS] Dependencies checked');
    passed++;
} catch (e) {
    console.log('[FAIL] Could not read package.json: ' + e.message);
    failed++;
}

console.log('');
console.log('Test 9.4: Configuration Files');
console.log('');

var configFiles = [
    { name: 'next.config.mjs', desc: 'Next.js config' },
    { name: 'tsconfig.json', desc: 'TypeScript config' },
    { name: 'package.json', desc: 'Package config' }
];

for (var i = 0; i < configFiles.length; i++) {
    var file = configFiles[i];
    var fullPath = path.join(projectRoot, file.name);
    if (fs.existsSync(fullPath)) {
        console.log('[PASS] ' + file.desc);
        passed++;
    } else {
        console.log('[FAIL] ' + file.desc + ' missing');
        failed++;
    }
}

console.log('');
console.log('========================================');
console.log('  RESULT: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');
console.log('');



