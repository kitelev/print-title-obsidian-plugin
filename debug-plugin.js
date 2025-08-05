const fs = require('fs');

console.log('🔍 Debugging Print Title Plugin Issues...\n');

// Read the compiled main.js
const mainJs = fs.readFileSync('main.js', 'utf8');

console.log('=== Potential Issues Analysis ===\n');

let issues = [];

// Issue 1: Event timing
console.log('1. Event Registration Analysis:');
if (mainJs.includes("this.app.workspace.trigger('layout-change')")) {
    console.log('   ❓ Triggers layout-change immediately on load');
    console.log('   Problem: May fire before workspace is ready');
    issues.push('Event timing: layout-change triggered too early');
}

// Issue 2: Missing initial call
console.log('\n2. Initial Button Creation:');
if (!mainJs.includes('setTimeout') && !mainJs.includes('setImmediate')) {
    console.log('   ❌ No delayed initial call to addPrintButton()');
    console.log('   Problem: Button won\'t appear on already open notes');
    issues.push('Missing initial button creation for existing notes');
}

// Issue 3: DOM targeting
console.log('\n3. DOM Element Targeting:');
if (mainJs.includes('contentEl.appendChild(button)')) {
    console.log('   ❓ Appends to contentEl directly');
    console.log('   Problem: contentEl might be the wrong target');
    issues.push('Possible wrong DOM target (contentEl vs containerEl)');
}

// Issue 4: Event handler issues
console.log('\n4. Event Handler Analysis:');
const eventPatterns = mainJs.match(/this\.app\.workspace\.on\([^)]+\)/g);
if (eventPatterns) {
    eventPatterns.forEach(pattern => {
        console.log(`   Found: ${pattern}`);
    });
    
    if (!mainJs.includes('this.addPrintButton.bind(this)')) {
        console.log('   ❓ Not using .bind(this) - context might be lost');
        issues.push('Potential context binding issue');
    }
}

// Issue 5: Better debug version needed
console.log('\n=== Recommended Fixes ===\n');

console.log('1. Add debugging console.log statements');
console.log('2. Use setTimeout for initial button creation');
console.log('3. Try different DOM targets (containerEl instead of contentEl)');
console.log('4. Add more robust event handling');
console.log('5. Test with both Reading and Editing views');

console.log(`\n📊 Found ${issues.length} potential issues:`);
issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
});

console.log('\n🔧 Creating improved debug version...');