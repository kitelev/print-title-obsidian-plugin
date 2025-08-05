// Paste this in Browser Console (F12) when in Obsidian to debug button visibility

console.log('🔍 Debugging button visibility...');

// Find all print-title buttons
const buttons = document.querySelectorAll('.print-title-button');
console.log(`Found ${buttons.length} print-title buttons`);

buttons.forEach((button, index) => {
    console.log(`\n📋 Button ${index + 1} analysis:`);
    console.log('- Text:', button.textContent);
    console.log('- Parent:', button.parentElement?.className || button.parentElement?.tagName);
    console.log('- Computed styles:');
    
    const styles = window.getComputedStyle(button);
    const relevantStyles = {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        position: styles.position,
        top: styles.top,
        left: styles.left,
        width: styles.width,
        height: styles.height,
        margin: styles.margin,
        padding: styles.padding,
        zIndex: styles.zIndex,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize
    };
    
    console.table(relevantStyles);
    
    // Check if button is in viewport
    const rect = button.getBoundingClientRect();
    console.log('- Position:', {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        inViewport: rect.top >= 0 && rect.left >= 0 && 
                   rect.bottom <= window.innerHeight && 
                   rect.right <= window.innerWidth
    });
    
    // Highlight the button temporarily
    button.style.border = '3px solid red';
    button.style.backgroundColor = 'yellow';
    button.style.color = 'black';
    button.style.zIndex = '9999';
    button.style.position = 'relative';
    
    setTimeout(() => {
        button.style.border = '';
        button.style.backgroundColor = 'var(--interactive-accent)';
        button.style.color = 'var(--text-on-accent)';
        button.style.zIndex = '';
        button.style.position = '';
    }, 3000);
    
    console.log('🟡 Button highlighted for 3 seconds');
});

// Also check the markdown container structure
console.log('\n🏗️ Container structure:');
const markdownView = document.querySelector('.markdown-preview-view');
if (markdownView) {
    console.log('Markdown view found:', markdownView);
    console.log('Children:', Array.from(markdownView.children).map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent?.substring(0, 50) + '...'
    })));
}