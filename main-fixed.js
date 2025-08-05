"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class PrintTitlePlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.buttonMap = new WeakMap();
    }
    async onload() {
        console.log('🔌 Print Title Plugin: Loading v1.0.3...');
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
        // Use the leaf container as the key
        const leafContainer = view.containerEl;
        // Check if button already exists
        const existingButton = this.buttonMap.get(leafContainer);
        if (existingButton && leafContainer.contains(existingButton)) {
            console.log('✅ Button already exists in this view');
            return;
        }
        // Remove any existing buttons in this view
        const oldButtons = leafContainer.querySelectorAll('.print-title-button');
        oldButtons.forEach(btn => btn.remove());
        // Create button container div for better positioning
        const buttonContainer = leafContainer.createEl('div', {
            cls: 'print-title-container'
        });
        // Style the container
        buttonContainer.style.cssText = `
			position: sticky;
			bottom: 20px;
			z-index: 1000;
			display: flex;
			justify-content: center;
			margin: 20px 0;
			padding: 0 20px;
			pointer-events: none;
		`;
        // Create the button
        const button = buttonContainer.createEl('button', {
            text: 'Print Title',
            cls: 'print-title-button'
        });
        // Style the button with high visibility
        button.style.cssText = `
			background: var(--interactive-accent, #8b5cf6);
			color: var(--text-on-accent, white);
			border: 2px solid var(--interactive-accent-hover, #7c3aed);
			border-radius: 8px;
			padding: 12px 24px;
			font-size: 14px;
			font-weight: 600;
			cursor: pointer;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			transition: all 0.2s ease;
			pointer-events: auto;
			position: relative;
			z-index: 1001;
			min-width: 120px;
		`;
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            button.style.background = 'var(--interactive-accent-hover, #7c3aed)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            button.style.background = 'var(--interactive-accent, #8b5cf6)';
        });
        // Add click handler
        button.addEventListener('click', () => {
            const file = view.file;
            if (file) {
                console.log('🔔 Showing notice for:', file.basename);
                new obsidian_1.Notice(`📄 Title: ${file.basename}`, 4000);
                // Add visual feedback
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
        // Insert the container at the end of the leaf
        leafContainer.appendChild(buttonContainer);
        // Store reference
        this.buttonMap.set(leafContainer, button);
        console.log('✅ Button container successfully added');
        console.log('🎯 Container classes:', buttonContainer.className);
        console.log('🎯 Button position:', button.getBoundingClientRect());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1maXhlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4tZml4ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBdUc7QUFFdkcsTUFBcUIsZ0JBQWlCLFNBQVEsaUJBQU07SUFBcEQ7O1FBQ1MsY0FBUyxHQUE0QyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBd0s1RSxDQUFDO0lBdEtBLEtBQUssQ0FBQyxNQUFNO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBRXhELDhDQUE4QztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQzlELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUMvRSxDQUFDO1FBRUYsbURBQW1EO1FBQ25ELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVPLFVBQVUsQ0FBQyxJQUFTO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxLQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELElBQUksSUFBSSxFQUFFLENBQUM7WUFDVixzQ0FBc0M7WUFDdEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxj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QztnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQzFDLElBQUksaUJBQU0sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCw4Q0FBOEM7UUFDOUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUzQyxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELFFBQVE7UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFFbkQsb0NBQW9DO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLFVBQVUsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLENBQUM7UUFDbkUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXRDLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFDaEMsQ0FBQztDQUNEO0FBektELG1DQXlLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBOb3RpY2UsIFdvcmtzcGFjZUxlYWYsIE1hcmtkb3duVmlldyB9IGZyb20gJ29ic2lkaWFuJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJpbnRUaXRsZVBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHByaXZhdGUgYnV0dG9uTWFwOiBXZWFrTWFwPEhUTUxFbGVtZW50LCBIVE1MQnV0dG9uRWxlbWVudD4gPSBuZXcgV2Vha01hcCgpO1xuXG5cdGFzeW5jIG9ubG9hZCgpIHtcblx0XHRjb25zb2xlLmxvZygn8J+UjCBQcmludCBUaXRsZSBQbHVnaW46IExvYWRpbmcgdjEuMC4zLi4uJyk7XG5cdFx0XG5cdFx0Ly8gUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnMgd2l0aCBwcm9wZXIgYmluZGluZ1xuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgdGhpcy5vbkZpbGVPcGVuLmJpbmQodGhpcykpXG5cdFx0KTtcblxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignYWN0aXZlLWxlYWYtY2hhbmdlJywgdGhpcy5vbkFjdGl2ZUxlYWZDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHQpO1xuXG5cdFx0Ly8gQWRkIGJ1dHRvbiB0byBjdXJyZW50bHkgb3BlbiBub3RlcyBhZnRlciBhIGRlbGF5XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygn8J+UjCBQcmludCBUaXRsZSBQbHVnaW46IEFkZGluZyBidXR0b25zIHRvIGV4aXN0aW5nIG5vdGVzJyk7XG5cdFx0XHR0aGlzLmFkZEJ1dHRvblRvQWxsVmlld3MoKTtcblx0XHR9LCAxMDAwKTtcblx0fVxuXG5cdHByaXZhdGUgb25GaWxlT3BlbihmaWxlOiBhbnkpIHtcblx0XHRjb25zb2xlLmxvZygn8J+ThCBGaWxlIG9wZW5lZDonLCBmaWxlPy5uYW1lIHx8ICd1bmtub3duJyk7XG5cdFx0aWYgKGZpbGUpIHtcblx0XHRcdC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB2aWV3IGlzIHJlYWR5XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuYWRkUHJpbnRCdXR0b24oKSwgMTAwKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uQWN0aXZlTGVhZkNoYW5nZShsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCkge1xuXHRcdGNvbnNvbGUubG9nKCfwn42DIEFjdGl2ZSBsZWFmIGNoYW5nZWQ6JywgbGVhZj8udmlldz8uZ2V0Vmlld1R5cGUoKSB8fCAndW5rbm93bicpO1xuXHRcdGlmIChsZWFmICYmIGxlYWYudmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xuXHRcdFx0Ly8gU21hbGwgZGVsYXkgdG8gZW5zdXJlIHZpZXcgaXMgcmVhZHlcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hZGRQcmludEJ1dHRvbigpLCAxMDApO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYWRkQnV0dG9uVG9BbGxWaWV3cygpIHtcblx0XHRjb25zdCBtYXJrZG93blZpZXdzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZSgnbWFya2Rvd24nKTtcblx0XHRjb25zb2xlLmxvZyhg8J+ThCBGb3VuZCAke21hcmtkb3duVmlld3MubGVuZ3RofSBtYXJrZG93biB2aWV3c2ApO1xuXHRcdFxuXHRcdG1hcmtkb3duVmlld3MuZm9yRWFjaChsZWFmID0+IHtcblx0XHRcdGlmIChsZWFmLnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcpIHtcblx0XHRcdFx0dGhpcy5hZGRQcmludEJ1dHRvblRvVmlldyhsZWFmLnZpZXcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBhZGRQcmludEJ1dHRvbigpIHtcblx0XHRjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRpZiAoYWN0aXZlVmlldykge1xuXHRcdFx0dGhpcy5hZGRQcmludEJ1dHRvblRvVmlldyhhY3RpdmVWaWV3KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ+KdjCBObyBhY3RpdmUgTWFya2Rvd25WaWV3IGZvdW5kJyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhZGRQcmludEJ1dHRvblRvVmlldyh2aWV3OiBNYXJrZG93blZpZXcpIHtcblx0XHRjb25zb2xlLmxvZygn8J+UmCBBZGRpbmcgYnV0dG9uIHRvIHZpZXc6Jywgdmlldy5maWxlPy5uYW1lIHx8ICd1bm5hbWVkJyk7XG5cdFx0XG5cdFx0Ly8gVXNlIHRoZSBsZWFmIGNvbnRhaW5lciBhcyB0aGUga2V5XG5cdFx0Y29uc3QgbGVhZkNvbnRhaW5lciA9IHZpZXcuY29udGFpbmVyRWw7XG5cdFx0XG5cdFx0Ly8gQ2hlY2sgaWYgYnV0dG9uIGFscmVhZHkgZXhpc3RzXG5cdFx0Y29uc3QgZXhpc3RpbmdCdXR0b24gPSB0aGlzLmJ1dHRvbk1hcC5nZXQobGVhZkNvbnRhaW5lcik7XG5cdFx0aWYgKGV4aXN0aW5nQnV0dG9uICYmIGxlYWZDb250YWluZXIuY29udGFpbnMoZXhpc3RpbmdCdXR0b24pKSB7XG5cdFx0XHRjb25zb2xlLmxvZygn4pyFIEJ1dHRvbiBhbHJlYWR5IGV4aXN0cyBpbiB0aGlzIHZpZXcnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgYW55IGV4aXN0aW5nIGJ1dHRvbnMgaW4gdGhpcyB2aWV3XG5cdFx0Y29uc3Qgb2xkQnV0dG9ucyA9IGxlYWZDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLnByaW50LXRpdGxlLWJ1dHRvbicpO1xuXHRcdG9sZEJ1dHRvbnMuZm9yRWFjaChidG4gPT4gYnRuLnJlbW92ZSgpKTtcblxuXHRcdC8vIENyZWF0ZSBidXR0b24gY29udGFpbmVyIGRpdiBmb3IgYmV0dGVyIHBvc2l0aW9uaW5nXG5cdFx0Y29uc3QgYnV0dG9uQ29udGFpbmVyID0gbGVhZkNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuXHRcdFx0Y2xzOiAncHJpbnQtdGl0bGUtY29udGFpbmVyJ1xuXHRcdH0pO1xuXG5cdFx0Ly8gU3R5bGUgdGhlIGNvbnRhaW5lclxuXHRcdGJ1dHRvbkNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0cG9zaXRpb246IHN0aWNreTtcblx0XHRcdGJvdHRvbTogMjBweDtcblx0XHRcdHotaW5kZXg6IDEwMDA7XG5cdFx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cdFx0XHRtYXJnaW46IDIwcHggMDtcblx0XHRcdHBhZGRpbmc6IDAgMjBweDtcblx0XHRcdHBvaW50ZXItZXZlbnRzOiBub25lO1xuXHRcdGA7XG5cblx0XHQvLyBDcmVhdGUgdGhlIGJ1dHRvblxuXHRcdGNvbnN0IGJ1dHRvbiA9IGJ1dHRvbkNvbnRhaW5lci5jcmVhdGVFbCgnYnV0dG9uJywge1xuXHRcdFx0dGV4dDogJ1ByaW50IFRpdGxlJyxcblx0XHRcdGNsczogJ3ByaW50LXRpdGxlLWJ1dHRvbidcblx0XHR9KTtcblxuXHRcdC8vIFN0eWxlIHRoZSBidXR0b24gd2l0aCBoaWdoIHZpc2liaWxpdHlcblx0XHRidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdGJhY2tncm91bmQ6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCwgIzhiNWNmNik7XG5cdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1vbi1hY2NlbnQsIHdoaXRlKTtcblx0XHRcdGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCk7XG5cdFx0XHRib3JkZXItcmFkaXVzOiA4cHg7XG5cdFx0XHRwYWRkaW5nOiAxMnB4IDI0cHg7XG5cdFx0XHRmb250LXNpemU6IDE0cHg7XG5cdFx0XHRmb250LXdlaWdodDogNjAwO1xuXHRcdFx0Y3Vyc29yOiBwb2ludGVyO1xuXHRcdFx0Ym94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xuXHRcdFx0dHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblx0XHRcdHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuXHRcdFx0cG9zaXRpb246IHJlbGF0aXZlO1xuXHRcdFx0ei1pbmRleDogMTAwMTtcblx0XHRcdG1pbi13aWR0aDogMTIwcHg7XG5cdFx0YDtcblxuXHRcdC8vIEFkZCBob3ZlciBlZmZlY3RzXG5cdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG5cdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTJweCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJveFNoYWRvdyA9ICcwIDZweCAxNnB4IHJnYmEoMCwgMCwgMCwgMC4yKSc7XG5cdFx0XHRidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXIsICM3YzNhZWQpJztcblx0XHR9KTtcblx0XHRcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcblx0XHRcdGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwKSc7XG5cdFx0XHRidXR0b24uc3R5bGUuYm94U2hhZG93ID0gJzAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjE1KSc7XG5cdFx0XHRidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQsICM4YjVjZjYpJztcblx0XHR9KTtcblxuXHRcdC8vIEFkZCBjbGljayBoYW5kbGVyXG5cdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZmlsZSA9IHZpZXcuZmlsZTtcblx0XHRcdGlmIChmaWxlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCfwn5SUIFNob3dpbmcgbm90aWNlIGZvcjonLCBmaWxlLmJhc2VuYW1lKTtcblx0XHRcdFx0bmV3IE5vdGljZShg8J+ThCBUaXRsZTogJHtmaWxlLmJhc2VuYW1lfWAsIDQwMDApO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQWRkIHZpc3VhbCBmZWVkYmFja1xuXHRcdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlKDAuOTUpJztcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0YnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDApJztcblx0XHRcdFx0fSwgMTUwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCfinYwgTm8gZmlsZSBmb3VuZCBmb3Igbm90aWNlJyk7XG5cdFx0XHRcdG5ldyBOb3RpY2UoJ+KdjCBObyBmaWxlIGZvdW5kJywgMjAwMCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBJbnNlcnQgdGhlIGNvbnRhaW5lciBhdCB0aGUgZW5kIG9mIHRoZSBsZWFmXG5cdFx0bGVhZkNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuXHRcdFxuXHRcdC8vIFN0b3JlIHJlZmVyZW5jZVxuXHRcdHRoaXMuYnV0dG9uTWFwLnNldChsZWFmQ29udGFpbmVyLCBidXR0b24pO1xuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCfinIUgQnV0dG9uIGNvbnRhaW5lciBzdWNjZXNzZnVsbHkgYWRkZWQnKTtcblx0XHRjb25zb2xlLmxvZygn8J+OryBDb250YWluZXIgY2xhc3NlczonLCBidXR0b25Db250YWluZXIuY2xhc3NOYW1lKTtcblx0XHRjb25zb2xlLmxvZygn8J+OryBCdXR0b24gcG9zaXRpb246JywgYnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcblx0fVxuXG5cdG9udW5sb2FkKCkge1xuXHRcdGNvbnNvbGUubG9nKCfwn5SMIFByaW50IFRpdGxlIFBsdWdpbjogVW5sb2FkaW5nLi4uJyk7XG5cdFx0XG5cdFx0Ly8gUmVtb3ZlIGFsbCBidXR0b25zIGFuZCBjb250YWluZXJzXG5cdFx0Y29uc3QgY29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmludC10aXRsZS1jb250YWluZXInKTtcblx0XHRjb25zb2xlLmxvZyhg8J+Xke+4jyBSZW1vdmluZyAke2NvbnRhaW5lcnMubGVuZ3RofSBidXR0b24gY29udGFpbmVyc2ApO1xuXHRcdGNvbnRhaW5lcnMuZm9yRWFjaChlbCA9PiBlbC5yZW1vdmUoKSk7XG5cdFx0XG5cdFx0Ly8gQ2xlYXIgYnV0dG9uIG1hcFxuXHRcdHRoaXMuYnV0dG9uTWFwID0gbmV3IFdlYWtNYXAoKTtcblx0fVxufSJdfQ==