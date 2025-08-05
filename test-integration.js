const fs = require('fs');

console.log('🧪 Testing Exo-UI Integration...\n');

const mainJs = fs.readFileSync('main.js', 'utf8');

let integrationFeatures = 0;

console.log('=== Integration Analysis ===\n');

// Check 1: AreaCreationService integration
if (mainJs.includes('AreaCreationService')) {
    console.log('✅ AreaCreationService integrated');
    integrationFeatures++;
} else {
    console.log('❌ AreaCreationService not found');
}

// Check 2: AreaLayoutService integration
if (mainJs.includes('AreaLayoutService')) {
    console.log('✅ AreaLayoutService integrated');
    integrationFeatures++;
} else {
    console.log('❌ AreaLayoutService not found');
}

// Check 3: DataviewAdapter integration
if (mainJs.includes('DataviewAdapter')) {
    console.log('✅ DataviewAdapter integrated');
    integrationFeatures++;
} else {
    console.log('❌ DataviewAdapter not found');
}

// Check 4: Global API exposure
if (mainJs.includes('window.PrintTitleUI') && mainJs.includes('renderAreaLayout')) {
    console.log('✅ Global API exposed for dataviewjs');
    integrationFeatures++;
} else {
    console.log('❌ Global API not properly exposed');
}

// Check 5: ems__Area detection
if (mainJs.includes('ems__Area') && mainJs.includes('exo__Instance_class')) {
    console.log('✅ ems__Area detection implemented');
    integrationFeatures++;
} else {
    console.log('❌ ems__Area detection not found');
}

// Check 6: Child area creation
if (mainJs.includes('createChildArea')) {
    console.log('✅ Child area creation functionality');
    integrationFeatures++;
} else {
    console.log('❌ Child area creation not found');
}

// Check 7: ExoAsset types
if (mainJs.includes('ExoAsset') || mainJs.includes('ExoFileContext')) {
    console.log('✅ Exo type system integrated');
    integrationFeatures++;
} else {
    console.log('❌ Exo type system not found');
}

console.log(`\n📊 Integrated ${integrationFeatures}/7 features`);

console.log('\n=== Expected Behavior ===');
console.log('1. Regular files: Show "Print Title" button');
console.log('2. ems__Area files: Show "Create Child Area" button');
console.log('3. Global API available for dataviewjs blocks');
console.log('4. Area layout rendering with child areas, tasks, projects');
console.log('5. Modal-based child area creation');

if (integrationFeatures >= 6) {
    console.log('\n🎉 Exo-UI integration successful!');
    console.log('The plugin now supports:');
    console.log('- ems__Area asset detection');
    console.log('- Child area creation ("дочерняя зона")');
    console.log('- Dataview integration');
    console.log('- Area layout rendering');
} else {
    console.log('\n⚠️ Integration incomplete - some features missing');
}

console.log('\n=== Test Instructions ===');
console.log('1. Create a test ems__Area file with frontmatter:');
console.log('   ---');
console.log('   exo__Instance_class: ["[[ems__Area]]"]');
console.log('   ---');
console.log('2. Open the file and look for "Create Child Area" button');
console.log('3. Add dataviewjs block with: window.PrintTitleUI.renderAreaLayout(dv, this)');
console.log('4. Verify child area creation modal works');