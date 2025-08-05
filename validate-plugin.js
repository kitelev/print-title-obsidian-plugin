const fs = require('fs');

console.log('🔍 Validating Obsidian plugin...\n');

// Read the compiled main.js
const mainJs = fs.readFileSync('main.js', 'utf8');

let errors = 0;
let warnings = 0;

// Test 1: Module format
console.log('✅ Test 1: Module format');
if (mainJs.includes('import ') || mainJs.includes('export default')) {
  console.log('❌ FAIL: Uses ES6 modules (will cause "Cannot use import statement" error)');
  errors++;
} else if (mainJs.includes('exports.default') || mainJs.includes('module.exports')) {
  console.log('✅ PASS: Uses CommonJS format');
} else {
  console.log('⚠️  WARN: Unknown module format');
  warnings++;
}

// Test 2: Obsidian API usage
console.log('✅ Test 2: Obsidian API');
if (mainJs.includes('obsidian_1.Plugin')) {
  console.log('✅ PASS: Extends Plugin class correctly');
} else {
  console.log('❌ FAIL: Does not extend Plugin class');
  errors++;
}

if (mainJs.includes('obsidian_1.Notice')) {
  console.log('✅ PASS: Uses Notice API correctly');
} else {
  console.log('❌ FAIL: Notice API not found');
  errors++;
}

// Test 3: Plugin lifecycle
console.log('✅ Test 3: Plugin lifecycle');
if (mainJs.includes('onload()') && mainJs.includes('onunload()')) {
  console.log('✅ PASS: Has onload and onunload methods');
} else {
  console.log('❌ FAIL: Missing lifecycle methods');
  errors++;
}

// Test 4: Manifest validation
console.log('✅ Test 4: Manifest validation');
try {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  
  const required = ['id', 'name', 'version', 'minAppVersion'];
  const missing = required.filter(field => !manifest[field]);
  
  if (missing.length === 0) {
    console.log('✅ PASS: All required manifest fields present');
  } else {
    console.log(`❌ FAIL: Missing manifest fields: ${missing.join(', ')}`);
    errors++;
  }
} catch (e) {
  console.log('❌ FAIL: Invalid manifest.json');
  errors++;
}

// Final result
console.log('\n📊 Results:');
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors === 0) {
  console.log('\n🎉 Plugin validation PASSED! Ready for Obsidian.');
  process.exit(0);
} else {
  console.log('\n❌ Plugin validation FAILED. Fix errors before using.');
  process.exit(1);
}