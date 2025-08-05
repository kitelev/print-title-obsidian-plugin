"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class PrintTitlePlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.buttonMap = new WeakMap();
    }
    async onload() {
        console.log('🔌 Print Title Plugin: Loading v1.0.4 (Smart Positioning)...');
        // Register event handlers with proper binding
        this.registerEvent(this.app.workspace.on('file-open', this.onFileOpen.bind(this)));
        this.registerEvent(this.app.workspace.on('active-leaf-change', this.onActiveLeafChange.bind(this)));
        // Add button to currently open notes after a delay
        setTimeout(() => {
            console.log('🔌 Print Title Plugin: Adding buttons to existing notes');
            this.addButtonToAllViews();
        }, 1000);
    }
    onFileOpen(file) {
        console.log('📄 File opened:', (file === null || file === void 0 ? void 0 : file.name) || 'unknown');
        if (file) {
            // Small delay to ensure view is ready
            setTimeout(() => this.addPrintButton(), 200);
        }
    }
    onActiveLeafChange(leaf) {
        var _a;
        console.log('🍃 Active leaf changed:', ((_a = leaf === null || leaf === void 0 ? void 0 : leaf.view) === null || _a === void 0 ? void 0 : _a.getViewType()) || 'unknown');
        if (leaf && leaf.view instanceof obsidian_1.MarkdownView) {
            // Small delay to ensure view is ready
            setTimeout(() => this.addPrintButton(), 200);
        }
    }
    addButtonToAllViews() {
        const markdownViews = this.app.workspace.getLeavesOfType('markdown');
        console.log(`📄 Found ${markdownViews.length} markdown views`);
        markdownViews.forEach(leaf => {
            if (leaf.view instanceof obsidian_1.MarkdownView) {
                this.addPrintButtonToView(leaf.view);
            }
        });
    }
    addPrintButton() {
        const activeView = this.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView);
        if (activeView) {
            this.addPrintButtonToView(activeView);
        }
        else {
            console.log('❌ No active MarkdownView found');
        }
    }
    findFrontmatterInsertionPoint(containerEl) {
        console.log('🔍 Looking for frontmatter insertion point...');
        // Selectors for frontmatter/properties in Obsidian (in order of preference)
        const frontmatterSelectors = [
            '.metadata-properties-container',
            '.metadata-container',
            '.frontmatter-container',
            '.property-container',
            '.metadata-property-container',
            '.document-properties',
            '.markdown-properties',
            '.frontmatter',
            '[data-property]'
        ];
        for (const selector of frontmatterSelectors) {
            const elements = containerEl.querySelectorAll(selector);
            if (elements.length > 0) {
                const lastElement = elements[elements.length - 1];
                console.log(`✅ Found frontmatter with selector: ${selector}`);
                console.log(`   Element: ${lastElement.tagName}.${lastElement.className}`);
                return lastElement;
            }
        }
        // Fallback: look for elements that look like properties
        const allDivs = Array.from(containerEl.querySelectorAll('div'));
        for (const div of allDivs) {
            const className = div.className.toLowerCase();
            const textContent = (div.textContent || '').toLowerCase();
            if (className.includes('metadata') ||
                className.includes('property') ||
                textContent.includes('tags:') ||
                textContent.includes('title:') ||
                div.hasAttribute('data-property')) {
                console.log('✅ Found frontmatter-like element:', div.className);
                return div;
            }
        }
        console.log('❌ No frontmatter found');
        return null;
    }
    addPrintButtonToView(view) {
        var _a;
        console.log('🔘 Adding button to view:', ((_a = view.file) === null || _a === void 0 ? void 0 : _a.name) || 'unnamed');
        // Use the content element instead of container for better positioning
        const contentEl = view.contentEl;
        // Check if button already exists
        const existingButton = this.buttonMap.get(contentEl);
        if (existingButton && contentEl.contains(existingButton)) {
            console.log('✅ Button already exists in this view');
            return;
        }
        // Remove any existing buttons in this view
        const oldContainers = contentEl.querySelectorAll('.print-title-container');
        oldContainers.forEach(container => container.remove());
        // Find frontmatter insertion point
        const frontmatterElement = this.findFrontmatterInsertionPoint(contentEl);
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'print-title-container';
        // Style the container based on insertion method
        if (frontmatterElement) {
            // Insert after frontmatter - inline with content
            buttonContainer.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 16px 0;
				padding: 8px 20px;
				border-top: 1px solid var(--background-modifier-border);
				border-bottom: 1px solid var(--background-modifier-border);
				background: var(--background-secondary);
			`;
        }
        else {
            // No frontmatter - float at top right
            buttonContainer.style.cssText = `
				position: absolute;
				top: 20px;
				right: 20px;
				z-index: 100;
				display: flex;
				justify-content: center;
			`;
        }
        // Create the button
        const button = document.createElement('button');
        button.textContent = 'Print Title';
        button.className = 'print-title-button';
        // Style the button
        button.style.cssText = `
			background: var(--interactive-accent, #8b5cf6);
			color: var(--text-on-accent, white);
			border: 1px solid var(--interactive-accent-hover, #7c3aed);
			border-radius: 6px;
			padding: 8px 16px;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s ease;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		`;
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--interactive-accent-hover, #7c3aed)';
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--interactive-accent, #8b5cf6)';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
        // Add click handler
        button.addEventListener('click', () => {
            const file = view.file;
            if (file) {
                console.log('🔔 Showing notice for:', file.basename);
                new obsidian_1.Notice(`📄 ${file.basename}`, 3000);
                // Visual feedback
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'translateY(0)';
                }, 150);
            }
            else {
                console.log('❌ No file found for notice');
                new obsidian_1.Notice('❌ No file found', 2000);
            }
        });
        // Add button to container
        buttonContainer.appendChild(button);
        // Insert the container in the right place
        if (frontmatterElement) {
            // Insert after frontmatter
            frontmatterElement.insertAdjacentElement('afterend', buttonContainer);
            console.log('✅ Button inserted after frontmatter');
        }
        else {
            // Insert at the beginning of content if no frontmatter
            const firstChild = contentEl.firstElementChild;
            if (firstChild) {
                firstChild.insertAdjacentElement('beforebegin', buttonContainer);
                console.log('✅ Button inserted at top of content (no frontmatter)');
            }
            else {
                contentEl.appendChild(buttonContainer);
                console.log('✅ Button appended to empty content');
            }
        }
        // Store reference
        this.buttonMap.set(contentEl, button);
        console.log('✅ Smart positioning complete');
        console.log('🎯 Container placement:', frontmatterElement ? 'after-frontmatter' : 'top-of-content');
    }
    onunload() {
        console.log('🔌 Print Title Plugin: Unloading...');
        // Remove all buttons and containers
        const containers = document.querySelectorAll('.print-title-container');
        console.log(`🗑️ Removing ${containers.length} button containers`);
        containers.forEach(el => el.remove());
        // Clear button map
        this.buttonMap = new WeakMap();
    }
}
exports.default = PrintTitlePlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1zbWFydC1wb3NpdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4tc21hcnQtcG9zaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBdUc7QUFFdkcsTUFBcUIsZ0JBQWlCLFNBQVEsaUJBQU07SUFBcEQ7O1FBQ1MsY0FBUyxHQUE0QyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBK081RSxDQUFDO0lBN09BLEtBQUssQ0FBQyxNQUFNO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1FBRTVFLDhDQUE4QztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQzlELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUMvRSxDQUFDO1FBRUYsbURBQW1EO1FBQ25ELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVPLFVBQVUsQ0FBQyxJQUFTO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxLQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELElBQUksSUFBSSxFQUFFLENBQUM7WUFDVixzQ0FBc0M7WUFDdEMsVUFBVSxDQUFDLEdBQUcsRUFB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R0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQ2hDLENBQUM7Q0FDRDtBQWhQRCxtQ0FnUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTm90aWNlLCBXb3Jrc3BhY2VMZWFmLCBNYXJrZG93blZpZXcgfSBmcm9tICdvYnNpZGlhbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW50VGl0bGVQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRwcml2YXRlIGJ1dHRvbk1hcDogV2Vha01hcDxIVE1MRWxlbWVudCwgSFRNTEJ1dHRvbkVsZW1lbnQ+ID0gbmV3IFdlYWtNYXAoKTtcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0Y29uc29sZS5sb2coJ/CflIwgUHJpbnQgVGl0bGUgUGx1Z2luOiBMb2FkaW5nIHYxLjAuNCAoU21hcnQgUG9zaXRpb25pbmcpLi4uJyk7XG5cdFx0XG5cdFx0Ly8gUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnMgd2l0aCBwcm9wZXIgYmluZGluZ1xuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgdGhpcy5vbkZpbGVPcGVuLmJpbmQodGhpcykpXG5cdFx0KTtcblxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignYWN0aXZlLWxlYWYtY2hhbmdlJywgdGhpcy5vbkFjdGl2ZUxlYWZDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHQpO1xuXG5cdFx0Ly8gQWRkIGJ1dHRvbiB0byBjdXJyZW50bHkgb3BlbiBub3RlcyBhZnRlciBhIGRlbGF5XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygn8J+UjCBQcmludCBUaXRsZSBQbHVnaW46IEFkZGluZyBidXR0b25zIHRvIGV4aXN0aW5nIG5vdGVzJyk7XG5cdFx0XHR0aGlzLmFkZEJ1dHRvblRvQWxsVmlld3MoKTtcblx0XHR9LCAxMDAwKTtcblx0fVxuXG5cdHByaXZhdGUgb25GaWxlT3BlbihmaWxlOiBhbnkpIHtcblx0XHRjb25zb2xlLmxvZygn8J+ThCBGaWxlIG9wZW5lZDonLCBmaWxlPy5uYW1lIHx8ICd1bmtub3duJyk7XG5cdFx0aWYgKGZpbGUpIHtcblx0XHRcdC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB2aWV3IGlzIHJlYWR5XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuYWRkUHJpbnRCdXR0b24oKSwgMjAwKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uQWN0aXZlTGVhZkNoYW5nZShsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCkge1xuXHRcdGNvbnNvbGUubG9nKCfwn42DIEFjdGl2ZSBsZWFmIGNoYW5nZWQ6JywgbGVhZj8udmlldz8uZ2V0Vmlld1R5cGUoKSB8fCAndW5rbm93bicpO1xuXHRcdGlmIChsZWFmICYmIGxlYWYudmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xuXHRcdFx0Ly8gU21hbGwgZGVsYXkgdG8gZW5zdXJlIHZpZXcgaXMgcmVhZHlcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hZGRQcmludEJ1dHRvbigpLCAyMDApO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYWRkQnV0dG9uVG9BbGxWaWV3cygpIHtcblx0XHRjb25zdCBtYXJrZG93blZpZXdzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZSgnbWFya2Rvd24nKTtcblx0XHRjb25zb2xlLmxvZyhg8J+ThCBGb3VuZCAke21hcmtkb3duVmlld3MubGVuZ3RofSBtYXJrZG93biB2aWV3c2ApO1xuXHRcdFxuXHRcdG1hcmtkb3duVmlld3MuZm9yRWFjaChsZWFmID0+IHtcblx0XHRcdGlmIChsZWFmLnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcpIHtcblx0XHRcdFx0dGhpcy5hZGRQcmludEJ1dHRvblRvVmlldyhsZWFmLnZpZXcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBhZGRQcmludEJ1dHRvbigpIHtcblx0XHRjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRpZiAoYWN0aXZlVmlldykge1xuXHRcdFx0dGhpcy5hZGRQcmludEJ1dHRvblRvVmlldyhhY3RpdmVWaWV3KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ+KdjCBObyBhY3RpdmUgTWFya2Rvd25WaWV3IGZvdW5kJyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBmaW5kRnJvbnRtYXR0ZXJJbnNlcnRpb25Qb2ludChjb250YWluZXJFbDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuXHRcdGNvbnNvbGUubG9nKCfwn5SNIExvb2tpbmcgZm9yIGZyb250bWF0dGVyIGluc2VydGlvbiBwb2ludC4uLicpO1xuXHRcdFxuXHRcdC8vIFNlbGVjdG9ycyBmb3IgZnJvbnRtYXR0ZXIvcHJvcGVydGllcyBpbiBPYnNpZGlhbiAoaW4gb3JkZXIgb2YgcHJlZmVyZW5jZSlcblx0XHRjb25zdCBmcm9udG1hdHRlclNlbGVjdG9ycyA9IFtcblx0XHRcdCcubWV0YWRhdGEtcHJvcGVydGllcy1jb250YWluZXInLFxuXHRcdFx0Jy5tZXRhZGF0YS1jb250YWluZXInLFxuXHRcdFx0Jy5mcm9udG1hdHRlci1jb250YWluZXInLFxuXHRcdFx0Jy5wcm9wZXJ0eS1jb250YWluZXInLFxuXHRcdFx0Jy5tZXRhZGF0YS1wcm9wZXJ0eS1jb250YWluZXInLFxuXHRcdFx0Jy5kb2N1bWVudC1wcm9wZXJ0aWVzJyxcblx0XHRcdCcubWFya2Rvd24tcHJvcGVydGllcycsXG5cdFx0XHQnLmZyb250bWF0dGVyJyxcblx0XHRcdCdbZGF0YS1wcm9wZXJ0eV0nXG5cdFx0XTtcblx0XHRcblx0XHRmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIGZyb250bWF0dGVyU2VsZWN0b3JzKSB7XG5cdFx0XHRjb25zdCBlbGVtZW50cyA9IGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXHRcdFx0aWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29uc3QgbGFzdEVsZW1lbnQgPSBlbGVtZW50c1tlbGVtZW50cy5sZW5ndGggLSAxXSBhcyBIVE1MRWxlbWVudDtcblx0XHRcdFx0Y29uc29sZS5sb2coYOKchSBGb3VuZCBmcm9udG1hdHRlciB3aXRoIHNlbGVjdG9yOiAke3NlbGVjdG9yfWApO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgICAgRWxlbWVudDogJHtsYXN0RWxlbWVudC50YWdOYW1lfS4ke2xhc3RFbGVtZW50LmNsYXNzTmFtZX1gKTtcblx0XHRcdFx0cmV0dXJuIGxhc3RFbGVtZW50O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBGYWxsYmFjazogbG9vayBmb3IgZWxlbWVudHMgdGhhdCBsb29rIGxpa2UgcHJvcGVydGllc1xuXHRcdGNvbnN0IGFsbERpdnMgPSBBcnJheS5mcm9tKGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RpdicpKTtcblx0XHRmb3IgKGNvbnN0IGRpdiBvZiBhbGxEaXZzKSB7XG5cdFx0XHRjb25zdCBjbGFzc05hbWUgPSBkaXYuY2xhc3NOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRjb25zdCB0ZXh0Q29udGVudCA9IChkaXYudGV4dENvbnRlbnQgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcblx0XHRcdGlmIChjbGFzc05hbWUuaW5jbHVkZXMoJ21ldGFkYXRhJykgfHwgXG5cdFx0XHRcdGNsYXNzTmFtZS5pbmNsdWRlcygncHJvcGVydHknKSB8fFxuXHRcdFx0XHR0ZXh0Q29udGVudC5pbmNsdWRlcygndGFnczonKSB8fFxuXHRcdFx0XHR0ZXh0Q29udGVudC5pbmNsdWRlcygndGl0bGU6JykgfHxcblx0XHRcdFx0ZGl2Lmhhc0F0dHJpYnV0ZSgnZGF0YS1wcm9wZXJ0eScpKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCfinIUgRm91bmQgZnJvbnRtYXR0ZXItbGlrZSBlbGVtZW50OicsIGRpdi5jbGFzc05hbWUpO1xuXHRcdFx0XHRyZXR1cm4gZGl2IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRjb25zb2xlLmxvZygn4p2MIE5vIGZyb250bWF0dGVyIGZvdW5kJyk7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRwcml2YXRlIGFkZFByaW50QnV0dG9uVG9WaWV3KHZpZXc6IE1hcmtkb3duVmlldykge1xuXHRcdGNvbnNvbGUubG9nKCfwn5SYIEFkZGluZyBidXR0b24gdG8gdmlldzonLCB2aWV3LmZpbGU/Lm5hbWUgfHwgJ3VubmFtZWQnKTtcblx0XHRcblx0XHQvLyBVc2UgdGhlIGNvbnRlbnQgZWxlbWVudCBpbnN0ZWFkIG9mIGNvbnRhaW5lciBmb3IgYmV0dGVyIHBvc2l0aW9uaW5nXG5cdFx0Y29uc3QgY29udGVudEVsID0gdmlldy5jb250ZW50RWw7XG5cdFx0XG5cdFx0Ly8gQ2hlY2sgaWYgYnV0dG9uIGFscmVhZHkgZXhpc3RzXG5cdFx0Y29uc3QgZXhpc3RpbmdCdXR0b24gPSB0aGlzLmJ1dHRvbk1hcC5nZXQoY29udGVudEVsKTtcblx0XHRpZiAoZXhpc3RpbmdCdXR0b24gJiYgY29udGVudEVsLmNvbnRhaW5zKGV4aXN0aW5nQnV0dG9uKSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ+KchSBCdXR0b24gYWxyZWFkeSBleGlzdHMgaW4gdGhpcyB2aWV3Jyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGFueSBleGlzdGluZyBidXR0b25zIGluIHRoaXMgdmlld1xuXHRcdGNvbnN0IG9sZENvbnRhaW5lcnMgPSBjb250ZW50RWwucXVlcnlTZWxlY3RvckFsbCgnLnByaW50LXRpdGxlLWNvbnRhaW5lcicpO1xuXHRcdG9sZENvbnRhaW5lcnMuZm9yRWFjaChjb250YWluZXIgPT4gY29udGFpbmVyLnJlbW92ZSgpKTtcblxuXHRcdC8vIEZpbmQgZnJvbnRtYXR0ZXIgaW5zZXJ0aW9uIHBvaW50XG5cdFx0Y29uc3QgZnJvbnRtYXR0ZXJFbGVtZW50ID0gdGhpcy5maW5kRnJvbnRtYXR0ZXJJbnNlcnRpb25Qb2ludChjb250ZW50RWwpO1xuXHRcdFxuXHRcdC8vIENyZWF0ZSBidXR0b24gY29udGFpbmVyXG5cdFx0Y29uc3QgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0YnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdwcmludC10aXRsZS1jb250YWluZXInO1xuXHRcdFxuXHRcdC8vIFN0eWxlIHRoZSBjb250YWluZXIgYmFzZWQgb24gaW5zZXJ0aW9uIG1ldGhvZFxuXHRcdGlmIChmcm9udG1hdHRlckVsZW1lbnQpIHtcblx0XHRcdC8vIEluc2VydCBhZnRlciBmcm9udG1hdHRlciAtIGlubGluZSB3aXRoIGNvbnRlbnRcblx0XHRcdGJ1dHRvbkNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdFx0XHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0XHRcdFx0bWFyZ2luOiAxNnB4IDA7XG5cdFx0XHRcdHBhZGRpbmc6IDhweCAyMHB4O1xuXHRcdFx0XHRib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuXHRcdFx0XHRib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuXHRcdFx0XHRiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG5cdFx0XHRgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBObyBmcm9udG1hdHRlciAtIGZsb2F0IGF0IHRvcCByaWdodFxuXHRcdFx0YnV0dG9uQ29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSBgXG5cdFx0XHRcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcblx0XHRcdFx0dG9wOiAyMHB4O1xuXHRcdFx0XHRyaWdodDogMjBweDtcblx0XHRcdFx0ei1pbmRleDogMTAwO1xuXHRcdFx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdFx0XHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0XHRcdGA7XG5cdFx0fVxuXG5cdFx0Ly8gQ3JlYXRlIHRoZSBidXR0b25cblx0XHRjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcblx0XHRidXR0b24udGV4dENvbnRlbnQgPSAnUHJpbnQgVGl0bGUnO1xuXHRcdGJ1dHRvbi5jbGFzc05hbWUgPSAncHJpbnQtdGl0bGUtYnV0dG9uJztcblxuXHRcdC8vIFN0eWxlIHRoZSBidXR0b25cblx0XHRidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdGJhY2tncm91bmQ6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCwgIzhiNWNmNik7XG5cdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1vbi1hY2NlbnQsIHdoaXRlKTtcblx0XHRcdGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCk7XG5cdFx0XHRib3JkZXItcmFkaXVzOiA2cHg7XG5cdFx0XHRwYWRkaW5nOiA4cHggMTZweDtcblx0XHRcdGZvbnQtc2l6ZTogMTNweDtcblx0XHRcdGZvbnQtd2VpZ2h0OiA1MDA7XG5cdFx0XHRjdXJzb3I6IHBvaW50ZXI7XG5cdFx0XHR0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXHRcdFx0Ym94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcblx0XHRgO1xuXG5cdFx0Ly8gQWRkIGhvdmVyIGVmZmVjdHNcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcblx0XHRcdGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC0xcHgpJztcblx0XHRcdGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpJztcblx0XHR9KTtcblx0XHRcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcblx0XHRcdGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWludGVyYWN0aXZlLWFjY2VudCwgIzhiNWNmNiknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDApJztcblx0XHRcdGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnMCAycHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xKSc7XG5cdFx0fSk7XG5cblx0XHQvLyBBZGQgY2xpY2sgaGFuZGxlclxuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0XHRcdGNvbnN0IGZpbGUgPSB2aWV3LmZpbGU7XG5cdFx0XHRpZiAoZmlsZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygn8J+UlCBTaG93aW5nIG5vdGljZSBmb3I6JywgZmlsZS5iYXNlbmFtZSk7XG5cdFx0XHRcdG5ldyBOb3RpY2UoYPCfk4QgJHtmaWxlLmJhc2VuYW1lfWAsIDMwMDApO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVmlzdWFsIGZlZWRiYWNrXG5cdFx0XHRcdGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUoMC45NSknO1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuXHRcdFx0XHR9LCAxNTApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ+KdjCBObyBmaWxlIGZvdW5kIGZvciBub3RpY2UnKTtcblx0XHRcdFx0bmV3IE5vdGljZSgn4p2MIE5vIGZpbGUgZm91bmQnLCAyMDAwKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEFkZCBidXR0b24gdG8gY29udGFpbmVyXG5cdFx0YnV0dG9uQ29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cblx0XHQvLyBJbnNlcnQgdGhlIGNvbnRhaW5lciBpbiB0aGUgcmlnaHQgcGxhY2Vcblx0XHRpZiAoZnJvbnRtYXR0ZXJFbGVtZW50KSB7XG5cdFx0XHQvLyBJbnNlcnQgYWZ0ZXIgZnJvbnRtYXR0ZXJcblx0XHRcdGZyb250bWF0dGVyRWxlbWVudC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgYnV0dG9uQ29udGFpbmVyKTtcblx0XHRcdGNvbnNvbGUubG9nKCfinIUgQnV0dG9uIGluc2VydGVkIGFmdGVyIGZyb250bWF0dGVyJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEluc2VydCBhdCB0aGUgYmVnaW5uaW5nIG9mIGNvbnRlbnQgaWYgbm8gZnJvbnRtYXR0ZXJcblx0XHRcdGNvbnN0IGZpcnN0Q2hpbGQgPSBjb250ZW50RWwuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0XHRpZiAoZmlyc3RDaGlsZCkge1xuXHRcdFx0XHRmaXJzdENoaWxkLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCBidXR0b25Db250YWluZXIpO1xuXHRcdFx0XHRjb25zb2xlLmxvZygn4pyFIEJ1dHRvbiBpbnNlcnRlZCBhdCB0b3Agb2YgY29udGVudCAobm8gZnJvbnRtYXR0ZXIpJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50RWwuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ+KchSBCdXR0b24gYXBwZW5kZWQgdG8gZW1wdHkgY29udGVudCcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBTdG9yZSByZWZlcmVuY2Vcblx0XHR0aGlzLmJ1dHRvbk1hcC5zZXQoY29udGVudEVsLCBidXR0b24pO1xuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCfinIUgU21hcnQgcG9zaXRpb25pbmcgY29tcGxldGUnKTtcblx0XHRjb25zb2xlLmxvZygn8J+OryBDb250YWluZXIgcGxhY2VtZW50OicsIGZyb250bWF0dGVyRWxlbWVudCA/ICdhZnRlci1mcm9udG1hdHRlcicgOiAndG9wLW9mLWNvbnRlbnQnKTtcblx0fVxuXG5cdG9udW5sb2FkKCkge1xuXHRcdGNvbnNvbGUubG9nKCfwn5SMIFByaW50IFRpdGxlIFBsdWdpbjogVW5sb2FkaW5nLi4uJyk7XG5cdFx0XG5cdFx0Ly8gUmVtb3ZlIGFsbCBidXR0b25zIGFuZCBjb250YWluZXJzXG5cdFx0Y29uc3QgY29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmludC10aXRsZS1jb250YWluZXInKTtcblx0XHRjb25zb2xlLmxvZyhg8J+Xke+4jyBSZW1vdmluZyAke2NvbnRhaW5lcnMubGVuZ3RofSBidXR0b24gY29udGFpbmVyc2ApO1xuXHRcdGNvbnRhaW5lcnMuZm9yRWFjaChlbCA9PiBlbC5yZW1vdmUoKSk7XG5cdFx0XG5cdFx0Ly8gQ2xlYXIgYnV0dG9uIG1hcFxuXHRcdHRoaXMuYnV0dG9uTWFwID0gbmV3IFdlYWtNYXAoKTtcblx0fVxufSJdfQ==