"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class PrintTitlePlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.buttonMap = new WeakMap();
    }
    async onload() {
        console.log('🔌 Print Title Plugin: Loading...');
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
            setTimeout(() => this.addPrintButton(), 100);
        }
    }
    onActiveLeafChange(leaf) {
        var _a;
        console.log('🍃 Active leaf changed:', ((_a = leaf === null || leaf === void 0 ? void 0 : leaf.view) === null || _a === void 0 ? void 0 : _a.getViewType()) || 'unknown');
        if (leaf && leaf.view instanceof obsidian_1.MarkdownView) {
            // Small delay to ensure view is ready
            setTimeout(() => this.addPrintButton(), 100);
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
    addPrintButtonToView(view) {
        var _a;
        console.log('🔘 Adding button to view:', ((_a = view.file) === null || _a === void 0 ? void 0 : _a.name) || 'unnamed');
        // Try different container elements
        const containers = [
            view.contentEl, // Main content
            view.containerEl, // Container
            view.contentEl.parentElement, // Parent of content
        ].filter(Boolean);
        for (const containerEl of containers) {
            if (!containerEl)
                continue;
            console.log('🎯 Trying container:', containerEl.className || containerEl.tagName);
            // Check if button already exists in this container
            const existingButton = this.buttonMap.get(containerEl);
            if (existingButton && containerEl.contains(existingButton)) {
                console.log('✅ Button already exists in this container');
                return;
            }
            // Remove any existing buttons in this container
            const oldButtons = containerEl.querySelectorAll('.print-title-button');
            oldButtons.forEach(btn => btn.remove());
            // Create new button
            const button = containerEl.createEl('button', {
                text: 'Print Title',
                cls: 'print-title-button'
            });
            // Style the button
            button.style.cssText = `
				display: block;
				margin: 10px auto;
				padding: 8px 16px;
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-size: 14px;
			`;
            // Add hover effect
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '0.8';
            });
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '1';
            });
            // Add click handler
            button.addEventListener('click', () => {
                const file = view.file;
                if (file) {
                    console.log('🔔 Showing notice for:', file.basename);
                    new obsidian_1.Notice(`📄 ${file.basename}`, 3000);
                }
                else {
                    console.log('❌ No file found for notice');
                    new obsidian_1.Notice('No file found', 2000);
                }
            });
            // Try different insertion points
            const insertionPoints = [
                containerEl, // End of container
                containerEl.querySelector('.view-content'), // End of view content
                containerEl.querySelector('.markdown-preview-view'), // End of preview
            ].filter(Boolean);
            let inserted = false;
            for (const insertPoint of insertionPoints) {
                if (insertPoint && insertPoint !== button.parentElement) {
                    try {
                        insertPoint.appendChild(button);
                        console.log('✅ Button inserted into:', insertPoint.className || insertPoint.tagName);
                        inserted = true;
                        break;
                    }
                    catch (e) {
                        console.log('❌ Failed to insert into:', insertPoint.className || insertPoint.tagName);
                    }
                }
            }
            if (inserted) {
                this.buttonMap.set(containerEl, button);
                console.log('✅ Button successfully added and mapped');
                return; // Success, don't try other containers
            }
        }
        console.log('❌ Failed to add button to any container');
    }
    onunload() {
        console.log('🔌 Print Title Plugin: Unloading...');
        // Remove all buttons
        const buttons = document.querySelectorAll('.print-title-button');
        console.log(`🗑️ Removing ${buttons.length} buttons`);
        buttons.forEach(el => el.remove());
        // Clear button map
        this.buttonMap = new WeakMap();
    }
}
exports.default = PrintTitlePlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1kZWJ1Zy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4tZGVidWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBdUc7QUFFdkcsTUFBcUIsZ0JBQWlCLFNBQVEsaUJBQU07SUFBcEQ7O1FBQ1MsY0FBUyxHQUE0QyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBcUs1RSxDQUFDO0lBbktBLEtBQUssQ0FBQyxNQUFNO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBRWpELDhDQUE4QztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQzlELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUMvRSxDQUFDO1FBRUYsbURBQW1EO1FBQ25ELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVPLFVBQVUsQ0FBQyxJQUFTO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxLQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELElBQUksSUFBSSxFQUFFLENBQUM7WUFDVixzQ0FBc0M7WUFDdEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxj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QUFDLEdBQUcsQ0FBQyxnQkFBZ0IsT0FBTyxDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUM7UUFDdEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRW5DLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFDaEMsQ0FBQztDQUNEO0FBdEtELG1DQXNLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBOb3RpY2UsIFdvcmtzcGFjZUxlYWYsIE1hcmtkb3duVmlldyB9IGZyb20gJ29ic2lkaWFuJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJpbnRUaXRsZVBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHByaXZhdGUgYnV0dG9uTWFwOiBXZWFrTWFwPEhUTUxFbGVtZW50LCBIVE1MQnV0dG9uRWxlbWVudD4gPSBuZXcgV2Vha01hcCgpO1xuXG5cdGFzeW5jIG9ubG9hZCgpIHtcblx0XHRjb25zb2xlLmxvZygn8J+UjCBQcmludCBUaXRsZSBQbHVnaW46IExvYWRpbmcuLi4nKTtcblx0XHRcblx0XHQvLyBSZWdpc3RlciBldmVudCBoYW5kbGVycyB3aXRoIHByb3BlciBiaW5kaW5nXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdmaWxlLW9wZW4nLCB0aGlzLm9uRmlsZU9wZW4uYmluZCh0aGlzKSlcblx0XHQpO1xuXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdhY3RpdmUtbGVhZi1jaGFuZ2UnLCB0aGlzLm9uQWN0aXZlTGVhZkNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdCk7XG5cblx0XHQvLyBBZGQgYnV0dG9uIHRvIGN1cnJlbnRseSBvcGVuIG5vdGVzIGFmdGVyIGEgZGVsYXlcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCfwn5SMIFByaW50IFRpdGxlIFBsdWdpbjogQWRkaW5nIGJ1dHRvbnMgdG8gZXhpc3Rpbmcgbm90ZXMnKTtcblx0XHRcdHRoaXMuYWRkQnV0dG9uVG9BbGxWaWV3cygpO1xuXHRcdH0sIDEwMDApO1xuXHR9XG5cblx0cHJpdmF0ZSBvbkZpbGVPcGVuKGZpbGU6IGFueSkge1xuXHRcdGNvbnNvbGUubG9nKCfwn5OEIEZpbGUgb3BlbmVkOicsIGZpbGU/Lm5hbWUgfHwgJ3Vua25vd24nKTtcblx0XHRpZiAoZmlsZSkge1xuXHRcdFx0Ly8gU21hbGwgZGVsYXkgdG8gZW5zdXJlIHZpZXcgaXMgcmVhZHlcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hZGRQcmludEJ1dHRvbigpLCAxMDApO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25BY3RpdmVMZWFmQ2hhbmdlKGxlYWY6IFdvcmtzcGFjZUxlYWYgfCBudWxsKSB7XG5cdFx0Y29uc29sZS5sb2coJ/CfjYMgQWN0aXZlIGxlYWYgY2hhbmdlZDonLCBsZWFmPy52aWV3Py5nZXRWaWV3VHlwZSgpIHx8ICd1bmtub3duJyk7XG5cdFx0aWYgKGxlYWYgJiYgbGVhZi52aWV3IGluc3RhbmNlb2YgTWFya2Rvd25WaWV3KSB7XG5cdFx0XHQvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgdmlldyBpcyByZWFkeVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmFkZFByaW50QnV0dG9uKCksIDEwMCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhZGRCdXR0b25Ub0FsbFZpZXdzKCkge1xuXHRcdGNvbnN0IG1hcmtkb3duVmlld3MgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKCdtYXJrZG93bicpO1xuXHRcdGNvbnNvbGUubG9nKGDwn5OEIEZvdW5kICR7bWFya2Rvd25WaWV3cy5sZW5ndGh9IG1hcmtkb3duIHZpZXdzYCk7XG5cdFx0XG5cdFx0bWFya2Rvd25WaWV3cy5mb3JFYWNoKGxlYWYgPT4ge1xuXHRcdFx0aWYgKGxlYWYudmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xuXHRcdFx0XHR0aGlzLmFkZFByaW50QnV0dG9uVG9WaWV3KGxlYWYudmlldyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGFkZFByaW50QnV0dG9uKCkge1xuXHRcdGNvbnN0IGFjdGl2ZVZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuXHRcdGlmIChhY3RpdmVWaWV3KSB7XG5cdFx0XHR0aGlzLmFkZFByaW50QnV0dG9uVG9WaWV3KGFjdGl2ZVZpZXcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZygn4p2MIE5vIGFjdGl2ZSBNYXJrZG93blZpZXcgZm91bmQnKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFkZFByaW50QnV0dG9uVG9WaWV3KHZpZXc6IE1hcmtkb3duVmlldykge1xuXHRcdGNvbnNvbGUubG9nKCfwn5SYIEFkZGluZyBidXR0b24gdG8gdmlldzonLCB2aWV3LmZpbGU/Lm5hbWUgfHwgJ3VubmFtZWQnKTtcblx0XHRcblx0XHQvLyBUcnkgZGlmZmVyZW50IGNvbnRhaW5lciBlbGVtZW50c1xuXHRcdGNvbnN0IGNvbnRhaW5lcnMgPSBbXG5cdFx0XHR2aWV3LmNvbnRlbnRFbCwgICAgICAgICAgIC8vIE1haW4gY29udGVudFxuXHRcdFx0dmlldy5jb250YWluZXJFbCwgICAgICAgICAvLyBDb250YWluZXJcblx0XHRcdHZpZXcuY29udGVudEVsLnBhcmVudEVsZW1lbnQsIC8vIFBhcmVudCBvZiBjb250ZW50XG5cdFx0XS5maWx0ZXIoQm9vbGVhbik7XG5cblx0XHRmb3IgKGNvbnN0IGNvbnRhaW5lckVsIG9mIGNvbnRhaW5lcnMpIHtcblx0XHRcdGlmICghY29udGFpbmVyRWwpIGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZygn8J+OryBUcnlpbmcgY29udGFpbmVyOicsIGNvbnRhaW5lckVsLmNsYXNzTmFtZSB8fCBjb250YWluZXJFbC50YWdOYW1lKTtcblx0XHRcdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgYnV0dG9uIGFscmVhZHkgZXhpc3RzIGluIHRoaXMgY29udGFpbmVyXG5cdFx0XHRjb25zdCBleGlzdGluZ0J1dHRvbiA9IHRoaXMuYnV0dG9uTWFwLmdldChjb250YWluZXJFbCk7XG5cdFx0XHRpZiAoZXhpc3RpbmdCdXR0b24gJiYgY29udGFpbmVyRWwuY29udGFpbnMoZXhpc3RpbmdCdXR0b24pKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCfinIUgQnV0dG9uIGFscmVhZHkgZXhpc3RzIGluIHRoaXMgY29udGFpbmVyJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVtb3ZlIGFueSBleGlzdGluZyBidXR0b25zIGluIHRoaXMgY29udGFpbmVyXG5cdFx0XHRjb25zdCBvbGRCdXR0b25zID0gY29udGFpbmVyRWwucXVlcnlTZWxlY3RvckFsbCgnLnByaW50LXRpdGxlLWJ1dHRvbicpO1xuXHRcdFx0b2xkQnV0dG9ucy5mb3JFYWNoKGJ0biA9PiBidG4ucmVtb3ZlKCkpO1xuXG5cdFx0XHQvLyBDcmVhdGUgbmV3IGJ1dHRvblxuXHRcdFx0Y29uc3QgYnV0dG9uID0gY29udGFpbmVyRWwuY3JlYXRlRWwoJ2J1dHRvbicsIHtcblx0XHRcdFx0dGV4dDogJ1ByaW50IFRpdGxlJyxcblx0XHRcdFx0Y2xzOiAncHJpbnQtdGl0bGUtYnV0dG9uJ1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFN0eWxlIHRoZSBidXR0b25cblx0XHRcdGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0XHRkaXNwbGF5OiBibG9jaztcblx0XHRcdFx0bWFyZ2luOiAxMHB4IGF1dG87XG5cdFx0XHRcdHBhZGRpbmc6IDhweCAxNnB4O1xuXHRcdFx0XHRiYWNrZ3JvdW5kOiB2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpO1xuXHRcdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1vbi1hY2NlbnQpO1xuXHRcdFx0XHRib3JkZXI6IG5vbmU7XG5cdFx0XHRcdGJvcmRlci1yYWRpdXM6IDRweDtcblx0XHRcdFx0Y3Vyc29yOiBwb2ludGVyO1xuXHRcdFx0XHRmb250LXNpemU6IDE0cHg7XG5cdFx0XHRgO1xuXG5cdFx0XHQvLyBBZGQgaG92ZXIgZWZmZWN0XG5cdFx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcblx0XHRcdFx0YnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAnMC44Jztcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcblx0XHRcdFx0YnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gQWRkIGNsaWNrIGhhbmRsZXJcblx0XHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0XHRcdFx0Y29uc3QgZmlsZSA9IHZpZXcuZmlsZTtcblx0XHRcdFx0aWYgKGZpbGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygn8J+UlCBTaG93aW5nIG5vdGljZSBmb3I6JywgZmlsZS5iYXNlbmFtZSk7XG5cdFx0XHRcdFx0bmV3IE5vdGljZShg8J+ThCAke2ZpbGUuYmFzZW5hbWV9YCwgMzAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KdjCBObyBmaWxlIGZvdW5kIGZvciBub3RpY2UnKTtcblx0XHRcdFx0XHRuZXcgTm90aWNlKCdObyBmaWxlIGZvdW5kJywgMjAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBUcnkgZGlmZmVyZW50IGluc2VydGlvbiBwb2ludHNcblx0XHRcdGNvbnN0IGluc2VydGlvblBvaW50cyA9IFtcblx0XHRcdFx0Y29udGFpbmVyRWwsICAgICAgICAgICAgICAgICAgICAvLyBFbmQgb2YgY29udGFpbmVyXG5cdFx0XHRcdGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3IoJy52aWV3LWNvbnRlbnQnKSwgLy8gRW5kIG9mIHZpZXcgY29udGVudFxuXHRcdFx0XHRjb250YWluZXJFbC5xdWVyeVNlbGVjdG9yKCcubWFya2Rvd24tcHJldmlldy12aWV3JyksIC8vIEVuZCBvZiBwcmV2aWV3XG5cdFx0XHRdLmZpbHRlcihCb29sZWFuKTtcblxuXHRcdFx0bGV0IGluc2VydGVkID0gZmFsc2U7XG5cdFx0XHRmb3IgKGNvbnN0IGluc2VydFBvaW50IG9mIGluc2VydGlvblBvaW50cykge1xuXHRcdFx0XHRpZiAoaW5zZXJ0UG9pbnQgJiYgaW5zZXJ0UG9pbnQgIT09IGJ1dHRvbi5wYXJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGluc2VydFBvaW50LmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygn4pyFIEJ1dHRvbiBpbnNlcnRlZCBpbnRvOicsIGluc2VydFBvaW50LmNsYXNzTmFtZSB8fCBpbnNlcnRQb2ludC50YWdOYW1lKTtcblx0XHRcdFx0XHRcdGluc2VydGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCfinYwgRmFpbGVkIHRvIGluc2VydCBpbnRvOicsIGluc2VydFBvaW50LmNsYXNzTmFtZSB8fCBpbnNlcnRQb2ludC50YWdOYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGluc2VydGVkKSB7XG5cdFx0XHRcdHRoaXMuYnV0dG9uTWFwLnNldChjb250YWluZXJFbCwgYnV0dG9uKTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ+KchSBCdXR0b24gc3VjY2Vzc2Z1bGx5IGFkZGVkIGFuZCBtYXBwZWQnKTtcblx0XHRcdFx0cmV0dXJuOyAvLyBTdWNjZXNzLCBkb24ndCB0cnkgb3RoZXIgY29udGFpbmVyc1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRjb25zb2xlLmxvZygn4p2MIEZhaWxlZCB0byBhZGQgYnV0dG9uIHRvIGFueSBjb250YWluZXInKTtcblx0fVxuXG5cdG9udW5sb2FkKCkge1xuXHRcdGNvbnNvbGUubG9nKCfwn5SMIFByaW50IFRpdGxlIFBsdWdpbjogVW5sb2FkaW5nLi4uJyk7XG5cdFx0XG5cdFx0Ly8gUmVtb3ZlIGFsbCBidXR0b25zXG5cdFx0Y29uc3QgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmludC10aXRsZS1idXR0b24nKTtcblx0XHRjb25zb2xlLmxvZyhg8J+Xke+4jyBSZW1vdmluZyAke2J1dHRvbnMubGVuZ3RofSBidXR0b25zYCk7XG5cdFx0YnV0dG9ucy5mb3JFYWNoKGVsID0+IGVsLnJlbW92ZSgpKTtcblx0XHRcblx0XHQvLyBDbGVhciBidXR0b24gbWFwXG5cdFx0dGhpcy5idXR0b25NYXAgPSBuZXcgV2Vha01hcCgpO1xuXHR9XG59Il19