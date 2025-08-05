const fs = require('fs');
const path = require('path');

console.log('Testing Obsidian plugin module format...\n');

// Read the compiled main.js
const mainJs = fs.readFileSync('main.js', 'utf8');

// Test 1: Check for ES6 import/export statements
const hasES6Import = mainJs.includes('import ') || mainJs.includes('export ');
const hasCommonJS = mainJs.includes('exports') || mainJs.includes('module.exports');

console.log('Test 1: Module format check');
console.log('- Has ES6 import/export:', hasES6Import);
console.log('- Has CommonJS exports:', hasCommonJS);

if (hasES6Import) {
  console.error('❌ FAIL: Plugin uses ES6 modules which Obsidian doesn\'t support');
  console.error('   Error: "Cannot use import statement outside a module"');
} else {
  console.log('✅ PASS: No ES6 import/export found');
}

// Test 2: Check first few lines
console.log('\nTest 2: First lines of main.js:');
const firstLines = mainJs.split('\n').slice(0, 5).join('\n');
console.log(firstLines);

// Test 3: Try to load as CommonJS
console.log('\nTest 3: Loading as CommonJS module...');
try {
  delete require.cache[require.resolve('./main.js')];
  const plugin = require('./main.js');
  console.log('✅ PASS: Module loaded successfully');
  console.log('Exports:', Object.keys(plugin));
} catch (error) {
  console.error('❌ FAIL: Cannot load module');
  console.error('Error:', error.message);
}

// Summary
console.log('\n=== Summary ===');
if (hasES6Import) {
  console.log('The plugin needs to be compiled to CommonJS format for Obsidian.');
  console.log('Fix: Update tsconfig.json to use "module": "commonjs"');
} else {
  console.log('Module format looks correct for Obsidian.');
}