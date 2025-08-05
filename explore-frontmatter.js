// Paste this in Browser Console (F12) to explore frontmatter structure in Obsidian

console.log('🔍 Exploring Obsidian frontmatter structure...');

// Find the active markdown view
const activeView = app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
if (!activeView) {
    console.log('❌ No active markdown view found');
} else {
    console.log('✅ Active view found:', activeView.file?.name);
    
    const contentEl = activeView.contentEl;
    const containerEl = activeView.containerEl;
    
    console.log('\n📋 Searching for frontmatter elements...');
    
    // Common selectors for frontmatter in Obsidian
    const frontmatterSelectors = [
        '.frontmatter',
        '.metadata-container',
        '.metadata-property-container', 
        '.metadata-properties-container',
        '.property-container',
        '.frontmatter-container',
        '.cm-embed-block.cm-callout.metadata-container',
        '.markdown-properties',
        '.document-properties',
        '.metadata-content'
    ];
    
    let foundElements = [];
    
    frontmatterSelectors.forEach(selector => {
        const elements = containerEl.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
            elements.forEach((el, i) => {
                console.log(`  Element ${i + 1}:`, {
                    tagName: el.tagName,
                    className: el.className,
                    textContent: el.textContent?.substring(0, 100) + '...',
                    position: el.getBoundingClientRect()
                });
                foundElements.push({ selector, element: el });
            });
        }
    });
    
    if (foundElements.length === 0) {
        console.log('❌ No frontmatter elements found with common selectors');
        console.log('\n🔍 Analyzing all elements in content...');
        
        // Analyze all children to find patterns
        const allElements = Array.from(containerEl.querySelectorAll('*'));
        const potentialFrontmatter = allElements.filter(el => {
            const className = el.className.toLowerCase();
            const content = el.textContent?.toLowerCase() || '';
            return className.includes('metadata') || 
                   className.includes('property') || 
                   className.includes('frontmatter') ||
                   content.includes('tags:') ||
                   content.includes('title:') ||
                   el.hasAttribute('data-property');
        });
        
        console.log(`🔍 Found ${potentialFrontmatter.length} potential frontmatter elements:`);
        potentialFrontmatter.forEach((el, i) => {
            console.log(`  ${i + 1}. ${el.tagName}.${el.className}`, el.textContent?.substring(0, 50));
        });
    }
    
    // Show the structure of the first few elements
    console.log('\n🏗️ Content structure (first 10 elements):');
    const children = Array.from(contentEl.children).slice(0, 10);
    children.forEach((child, i) => {
        console.log(`${i + 1}. ${child.tagName}.${child.className}`, {
            text: child.textContent?.substring(0, 50) + '...',
            hasMetadata: child.className.includes('metadata') || child.className.includes('property')
        });
    });
    
    // Test button insertion after potential frontmatter
    console.log('\n🧪 Testing button insertion points...');
    
    if (foundElements.length > 0) {
        const testButton = document.createElement('div');
        testButton.innerHTML = '<div style="background: orange; color: black; padding: 10px; margin: 10px 0; text-align: center; border-radius: 5px;">🧪 TEST INSERTION POINT</div>';
        testButton.className = 'test-insertion-point';
        
        // Try inserting after the first frontmatter element
        const firstFrontmatter = foundElements[0].element;
        firstFrontmatter.insertAdjacentElement('afterend', testButton);
        
        console.log('✅ Test insertion point added after frontmatter');
        setTimeout(() => testButton.remove(), 5000);
    } else {
        console.log('⚠️ No frontmatter found - would insert at top of content');
    }
}