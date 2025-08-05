# 🚀 Instant Test - Check if Button Works

Если кнопка всё ещё не видна, выполните этот код в консоли браузера (F12):

```javascript
// === INSTANT BUTTON TEST ===
console.log('🚀 Creating test button...');

// Remove any existing test buttons
document.querySelectorAll('.test-print-button').forEach(el => el.remove());

// Find active markdown view
const activeLeaf = app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
if (activeLeaf) {
    // Create highly visible test button
    const testButton = activeLeaf.containerEl.createEl('div');
    testButton.className = 'test-print-button';
    testButton.innerHTML = '<button style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: red; color: white; padding: 20px; font-size: 20px; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 0 20px rgba(255,0,0,0.5);">🎯 TEST BUTTON - CLICK ME!</button>';
    
    testButton.querySelector('button').addEventListener('click', () => {
        new (require('obsidian').Notice)('🎉 Test button works! Plugin should work too.', 5000);
        console.log('✅ Test button clicked successfully');
        
        // Check for actual plugin buttons
        const pluginButtons = document.querySelectorAll('.print-title-button');
        console.log(`Found ${pluginButtons.length} plugin buttons:`, pluginButtons);
        
        pluginButtons.forEach((btn, i) => {
            console.log(`Button ${i + 1}:`, {
                visible: btn.offsetWidth > 0 && btn.offsetHeight > 0,
                position: btn.getBoundingClientRect(),
                styles: window.getComputedStyle(btn),
                parent: btn.parentElement?.className
            });
            
            // Highlight plugin buttons
            btn.style.border = '5px solid red';
            btn.style.backgroundColor = 'yellow';
            btn.style.color = 'black';
            btn.style.zIndex = '9998';
        });
    });
    
    console.log('✅ Test button created at center of screen');
} else {
    console.log('❌ No active markdown view found');
}
```

## Что покажет этот тест:

1. **Красная кнопка по центру экрана** - если она появится, значит JavaScript работает
2. **При клике** покажет Notice и подсветит все кнопки плагина красной рамкой
3. **В консоли** выведет информацию о найденных кнопках плагина

## Если тест не работает:

1. Убедитесь, что открыта markdown заметка
2. Убедитесь, что плагин включен
3. Перезагрузите Obsidian
4. Проверьте, что BRAT обновил плагин до v1.0.3