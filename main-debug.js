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
