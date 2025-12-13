const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log(' Regression Testing');
console.log('========================================');
console.log('');

var passed = 0;
var failed = 0;

var projectRoot = path.join(__dirname, '..');

console.log('Test 11.1: Project Files Existence');
console.log('');

var paths = [
    { p: 'app', type: 'dir', desc: 'App directory' },
    { p: 'app/api', type: 'dir', desc: 'API routes folder' },
    { p: 'components', type: 'dir', desc: 'Components folder' },
    { p: 'lib', type: 'dir', desc: 'Lib folder' },
    { p: 'package.json', type: 'file', desc: 'package.json' },
    { p: 'next.config.mjs', type: 'file', desc: 'Next.js config' },
    { p: 'tsconfig.json', type: 'file', desc: 'TypeScript config' },
    { p: 'README.md', type: 'file', desc: 'README file' }
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
console.log('Test 11.2: Configuration File Integrity');
console.log('');

try {
    var pkgPath = path.join(projectRoot, 'package.json');
    var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    var hasName = pkg.hasOwnProperty('name');
    var hasVersion = pkg.hasOwnProperty('version');
    var hasDependencies = pkg.hasOwnProperty('dependencies');
    var hasScripts = pkg.hasOwnProperty('scripts');
    
    var configOk = hasName && hasVersion && hasDependencies && hasScripts;
    console.log('package.json integrity:', configOk ? '[PASS]' : '[FAIL]');
    configOk ? passed++ : failed++;
    
    if (hasScripts) {
        var hasDev = pkg.scripts.hasOwnProperty('dev');
        var hasBuild = pkg.scripts.hasOwnProperty('build');
        console.log('Required scripts present:', (hasDev && hasBuild) ? '[PASS]' : '[FAIL]');
        (hasDev && hasBuild) ? passed++ : failed++;
    }
} catch (e) {
    console.log('[FAIL] Could not read package.json:', e.message);
    failed++;
}

console.log('');
console.log('Test 11.3: TypeScript Configuration');
console.log('');

try {
    var tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
        var tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        var hasCompilerOptions = tsconfig.hasOwnProperty('compilerOptions');
        console.log('TypeScript config valid:', hasCompilerOptions ? '[PASS]' : '[FAIL]');
        hasCompilerOptions ? passed++ : failed++;
    } else {
        console.log('[FAIL] tsconfig.json missing');
        failed++;
    }
} catch (e) {
    console.log('[FAIL] Could not read tsconfig.json:', e.message);
    failed++;
}

console.log('');
console.log('Test 11.4: Key API Routes Existence');
console.log('');

var apiRoutes = [
    { p: 'app/api/admin/users/route.ts', desc: 'Admin Users API' },
    { p: 'app/api/admin/customers/route.ts', desc: 'Admin Customers API' },
    { p: 'app/api/transactions/route.ts', desc: 'Transactions API' },
    { p: 'app/api/customer/summary/route.ts', desc: 'Customer Summary API' }
];

for (var i = 0; i < apiRoutes.length; i++) {
    var route = apiRoutes[i];
    var fullPath = path.join(projectRoot, route.p);
    if (fs.existsSync(fullPath)) {
        console.log('[PASS] ' + route.desc);
        passed++;
    } else {
        console.log('[FAIL] ' + route.desc + ' (not found)');
        failed++;
    }
}

console.log('');
console.log('Test 11.5: Library Files Existence');
console.log('');

var libFiles = [
    { p: 'lib/supabase-client.ts', desc: 'Supabase Client' },
    { p: 'lib/supabase-server.ts', desc: 'Supabase Server' },
    { p: 'lib/auth-context.tsx', desc: 'Auth Context' }
];

for (var i = 0; i < libFiles.length; i++) {
    var file = libFiles[i];
    var fullPath = path.join(projectRoot, file.p);
    if (fs.existsSync(fullPath)) {
        console.log('[PASS] ' + file.desc);
        passed++;
    } else {
        console.log('[INFO] ' + file.desc + ' (optional, may have different name)');
    }
}

console.log('');
console.log('========================================');
console.log('  RESULT: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');
console.log('');



