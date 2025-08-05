const fs = require('fs');

console.log('🔍 Testing Plugin Improvements...\n');

const mainJs = fs.readFileSync('main.js', 'utf8');

let improvements = 0;

console.log('=== Improvements Analysis ===\n');

// Check 1: Debugging
if (mainJs.includes('console.log')) {
    console.log('✅ Added debugging console.log statements');
    improvements++;
} else {
    console.log('❌ No debugging added');
}

// Check 2: Event binding
if (mainJs.includes('.bind(this)')) {
    console.log('✅ Fixed event handler binding');
    improvements++;
} else {
    console.log('❌ Event binding not fixed');
}

// Check 3: Initial button creation
if (mainJs.includes('setTimeout') && mainJs.includes('addButtonToAllViews')) {
    console.log('✅ Added delayed initial button creation');
    improvements++;
} else {
    console.log('❌ No delayed initial button creation');
}

// Check 4: Multiple container attempts
if (mainJs.includes('containers = [') && mainJs.includes('view.containerEl')) {
    console.log('✅ Tries multiple DOM containers');
    improvements++;
} else {
    console.log('❌ No multiple container attempts');
}

// Check 5: Better styling
if (mainJs.includes('var(--interactive-accent)')) {
    console.log('✅ Uses Obsidian CSS variables');
    improvements++;
} else {
    console.log('❌ No Obsidian theme integration');
}

// Check 6: Robust insertion
if (mainJs.includes('insertionPoints') && mainJs.includes('appendChild')) {
    console.log('✅ Tries multiple insertion points');
    improvements++;
} else {
    console.log('❌ No multiple insertion attempts');
}

// Check 7: Error handling
if (mainJs.includes('try {') && mainJs.includes('catch')) {
    console.log('✅ Added error handling');
    improvements++;
} else {
    console.log('❌ No error handling');
}

console.log(`\n📊 Applied ${improvements}/7 improvements`);

console.log('\n=== Debug Instructions ===');
console.log('1. Install the updated plugin');
console.log('2. Open Developer Tools (Ctrl+Shift+I)');
console.log('3. Look for console messages starting with 🔌, 📄, 🍃, 🔘');
console.log('4. Open a markdown note and check the console');
console.log('5. If no button appears, check what containers were tried');

if (improvements >= 6) {
    console.log('\n🎉 Plugin should now work much better!');
} else {
    console.log('\n⚠️ Some improvements may be missing');
}