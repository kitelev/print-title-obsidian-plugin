"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonService = void 0;
class ButtonService {
    constructor(settings, notificationService, fileAnalysisService) {
        this.settings = settings;
        this.notificationService = notificationService;
        this.fileAnalysisService = fileAnalysisService;
        this.buttonMap = new WeakMap();
    }
    /**
     * Update settings reference
     */
    updateSettings(settings) {
        this.settings = settings;
    }
    /**
     * Add button to a specific view
     */
    addButtonToView(view) {
        if (!view || !view.file) {
            this.log('No valid view or file found');
            return;
        }
        const fileContext = this.createFileContext(view);
        this.log(`Adding button to view: ${fileContext.fileName}`);
        const contentEl = view.contentEl;
        // Check if button already exists
        if (this.buttonExists(contentEl)) {
            this.log('Button already exists in this view');
            return;
        }
        // Remove any old buttons
        this.removeExistingButtons(contentEl);
        // Create and insert button
        const buttonConfig = this.createButtonConfig();
        const button = this.createButton(buttonConfig, fileContext);
        this.insertButton(contentEl, button, buttonConfig.position);
        // Store reference
        this.buttonMap.set(contentEl, button);
        this.log('Button successfully added');
    }
    /**
     * Remove all buttons from the current view
     */
    removeButtonsFromView(view) {
        if (!view)
            return;
        const contentEl = view.contentEl;
        this.removeExistingButtons(contentEl);
        this.buttonMap.delete(contentEl);
    }
    /**
     * Clean up all buttons
     */
    cleanup() {
        const containers = document.querySelectorAll('.print-title-container');
        this.log(`Removing ${containers.length} button containers`);
        containers.forEach(el => el.remove());
        this.buttonMap = new WeakMap();
    }
    createFileContext(view) {
        const cache = view.app.metadataCache.getFileCache(view.file);
        return {
            file: view.file,
            fileName: view.file.name,
            filePath: view.file.path,
            frontmatter: cache === null || cache === void 0 ? void 0 : cache.frontmatter
        };
    }
    createButtonConfig() {
        const displayText = this.settings.showIcon
            ? `${this.settings.buttonIcon} ${this.settings.buttonText}`.trim()
            : this.settings.buttonText;
        return {
            text: displayText,
            icon: this.settings.showIcon ? this.settings.buttonIcon : undefined,
            position: this.settings.buttonPosition,
            className: 'print-title-button'
        };
    }
    buttonExists(contentEl) {
        const existingButton = this.buttonMap.get(contentEl);
        return !!(existingButton && contentEl.contains(existingButton));
    }
    removeExistingButtons(contentEl) {
        const oldContainers = contentEl.querySelectorAll('.print-title-container');
        oldContainers.forEach(container => container.remove());
    }
    createButton(config, context) {
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'print-title-container';
        this.styleContainer(buttonContainer, config.position, context);
        // Create the button
        const button = document.createElement('button');
        button.textContent = config.text;
        button.className = config.className;
        this.styleButton(button);
        // Add click handler
        button.addEventListener('click', (e) => this.handleButtonClick(e, context));
        // Add hover effects
        this.addHoverEffects(button);
        buttonContainer.appendChild(button);
        return button;
    }
    styleContainer(container, position, context) {
        const hasFrontmatter = !!(context.frontmatter && Object.keys(context.frontmatter).length > 0);
        if (position === 'after-frontmatter' && hasFrontmatter) {
            container.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 16px 0;
				padding: 8px 20px;
				border-top: 1px solid var(--background-modifier-border);
				border-bottom: 1px solid var(--background-modifier-border);
				background: var(--background-secondary);
			`;
        }
        else if (position === 'top-right' || (position === 'after-frontmatter' && !hasFrontmatter)) {
            container.style.cssText = `
				position: absolute;
				top: 20px;
				right: 20px;
				z-index: 100;
				display: flex;
				justify-content: center;
			`;
        }
        else {
            // bottom position
            container.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 20px 0;
				padding: 10px;
			`;
        }
    }
    styleButton(button) {
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
			-webkit-appearance: none;
			appearance: none;
		`;
    }
    addHoverEffects(button) {
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
    }
    async handleButtonClick(event, context) {
        event.preventDefault();
        event.stopPropagation();
        this.log(`Button clicked for file: ${context.fileName}`);
        try {
            // Show enhanced notification
            if (this.settings.showEnhancedInfo) {
                this.notificationService.showTitleNotification(context);
            }
            else {
                // Simple notification
                const message = `${this.settings.showIcon ? '📄 ' : ''}${context.file.basename}`;
                this.notificationService.showInfo(message.replace('ℹ️ ', ''));
            }
            // Visual feedback with animation
            const button = event.target;
            if (this.settings.animateButton) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'translateY(0)';
                }, 150);
            }
            // Log file analysis if debug mode is enabled
            if (this.settings.enableDebugMode && this.settings.showFileStats) {
                const analysis = await this.fileAnalysisService.analyzeFile(context);
                const stats = this.fileAnalysisService.getFileStats(analysis);
                this.log(`File stats: ${stats.join(', ')}`);
            }
        }
        catch (error) {
            this.log('Error handling button click:', error);
            this.notificationService.showError('Failed to process file information');
        }
    }
    insertButton(contentEl, button, position) {
        const container = button.parentElement;
        if (position === 'after-frontmatter') {
            const frontmatterElement = this.findFrontmatterInsertionPoint(contentEl);
            if (frontmatterElement) {
                frontmatterElement.insertAdjacentElement('afterend', container);
                this.log('Button inserted after frontmatter');
                return;
            }
        }
        // Fallback positions
        if (position === 'top-right' || position === 'after-frontmatter') {
            const firstChild = contentEl.firstElementChild;
            if (firstChild) {
                firstChild.insertAdjacentElement('beforebegin', container);
                this.log('Button inserted at top of content');
            }
            else {
                contentEl.appendChild(container);
                this.log('Button appended to empty content');
            }
        }
        else {
            // bottom position
            contentEl.appendChild(container);
            this.log('Button appended at bottom');
        }
    }
    findFrontmatterInsertionPoint(containerEl) {
        this.log('Looking for frontmatter insertion point...');
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
                this.log(`Found frontmatter with selector: ${selector}`);
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
                this.log('Found frontmatter-like element:', div.className);
                return div;
            }
        }
        this.log('No frontmatter found');
        return null;
    }
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[PrintTitle] ${message}`, ...args);
        }
    }
}
exports.ButtonService = ButtonService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJ1dHRvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EsTUFBYSxhQUFhO0lBR3pCLFlBQ1MsUUFBNEIsRUFDNUIsbUJBQXdDLEVBQ3hDLG1CQUF3QztRQUZ4QyxhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUM1Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFMekMsY0FBUyxHQUE0QyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBTXhFLENBQUM7SUFFSjs7T0FFRztJQUNILGNBQWMsQ0FBQyxRQUE0QjtRQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlLENBQUMsSUFBa0I7UUFDakMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDeEMsT0FBTztRQUNSLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFM0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUVqQyxpQ0FBaUM7UUFDakMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQy9DLE9BQU87UUFDUixDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV0QywyQkFBMkI7UUFD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LENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7WUFDM0IsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFMUQsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztnQkFDakMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0JBQzlCLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUM3QixXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFDOUIsR0FBRyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0QsT0FBTyxHQUFrQixDQUFDO1lBQzNCLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVPLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQzFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixPQUFPLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2pELENBQUM7SUFDRixDQUFDO0NBQ0Q7QUFoVEQsc0NBZ1RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWFya2Rvd25WaWV3LCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEZpbGVDb250ZXh0LCBCdXR0b25Db25maWcsIFByaW50VGl0bGVTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL05vdGlmaWNhdGlvblNlcnZpY2UnO1xuaW1wb3J0IHsgRmlsZUFuYWx5c2lzU2VydmljZSB9IGZyb20gJy4vRmlsZUFuYWx5c2lzU2VydmljZSc7XG5cbmV4cG9ydCBjbGFzcyBCdXR0b25TZXJ2aWNlIHtcblx0cHJpdmF0ZSBidXR0b25NYXA6IFdlYWtNYXA8SFRNTEVsZW1lbnQsIEhUTUxCdXR0b25FbGVtZW50PiA9IG5ldyBXZWFrTWFwKCk7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSBzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzLFxuXHRcdHByaXZhdGUgbm90aWZpY2F0aW9uU2VydmljZTogTm90aWZpY2F0aW9uU2VydmljZSxcblx0XHRwcml2YXRlIGZpbGVBbmFseXNpc1NlcnZpY2U6IEZpbGVBbmFseXNpc1NlcnZpY2Vcblx0KSB7fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2V0dGluZ3MgcmVmZXJlbmNlXG5cdCAqL1xuXHR1cGRhdGVTZXR0aW5ncyhzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzKTogdm9pZCB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBidXR0b24gdG8gYSBzcGVjaWZpYyB2aWV3XG5cdCAqL1xuXHRhZGRCdXR0b25Ub1ZpZXcodmlldzogTWFya2Rvd25WaWV3KTogdm9pZCB7XG5cdFx0aWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcblx0XHRcdHRoaXMubG9nKCdObyB2YWxpZCB2aWV3IG9yIGZpbGUgZm91bmQnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBmaWxlQ29udGV4dCA9IHRoaXMuY3JlYXRlRmlsZUNvbnRleHQodmlldyk7XG5cdFx0dGhpcy5sb2coYEFkZGluZyBidXR0b24gdG8gdmlldzogJHtmaWxlQ29udGV4dC5maWxlTmFtZX1gKTtcblxuXHRcdGNvbnN0IGNvbnRlbnRFbCA9IHZpZXcuY29udGVudEVsO1xuXHRcdFxuXHRcdC8vIENoZWNrIGlmIGJ1dHRvbiBhbHJlYWR5IGV4aXN0c1xuXHRcdGlmICh0aGlzLmJ1dHRvbkV4aXN0cyhjb250ZW50RWwpKSB7XG5cdFx0XHR0aGlzLmxvZygnQnV0dG9uIGFscmVhZHkgZXhpc3RzIGluIHRoaXMgdmlldycpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBhbnkgb2xkIGJ1dHRvbnNcblx0XHR0aGlzLnJlbW92ZUV4aXN0aW5nQnV0dG9ucyhjb250ZW50RWwpO1xuXG5cdFx0Ly8gQ3JlYXRlIGFuZCBpbnNlcnQgYnV0dG9uXG5cdFx0Y29uc3QgYnV0dG9uQ29uZmlnID0gdGhpcy5jcmVhdGVCdXR0b25Db25maWcoKTtcblx0XHRjb25zdCBidXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihidXR0b25Db25maWcsIGZpbGVDb250ZXh0KTtcblx0XHR0aGlzLmluc2VydEJ1dHRvbihjb250ZW50RWwsIGJ1dHRvbiwgYnV0dG9uQ29uZmlnLnBvc2l0aW9uKTtcblxuXHRcdC8vIFN0b3JlIHJlZmVyZW5jZVxuXHRcdHRoaXMuYnV0dG9uTWFwLnNldChjb250ZW50RWwsIGJ1dHRvbik7XG5cdFx0dGhpcy5sb2coJ0J1dHRvbiBzdWNjZXNzZnVsbHkgYWRkZWQnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYWxsIGJ1dHRvbnMgZnJvbSB0aGUgY3VycmVudCB2aWV3XG5cdCAqL1xuXHRyZW1vdmVCdXR0b25zRnJvbVZpZXcodmlldzogTWFya2Rvd25WaWV3KTogdm9pZCB7XG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XG5cblx0XHRjb25zdCBjb250ZW50RWwgPSB2aWV3LmNvbnRlbnRFbDtcblx0XHR0aGlzLnJlbW92ZUV4aXN0aW5nQnV0dG9ucyhjb250ZW50RWwpO1xuXHRcdHRoaXMuYnV0dG9uTWFwLmRlbGV0ZShjb250ZW50RWwpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFuIHVwIGFsbCBidXR0b25zXG5cdCAqL1xuXHRjbGVhbnVwKCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucHJpbnQtdGl0bGUtY29udGFpbmVyJyk7XG5cdFx0dGhpcy5sb2coYFJlbW92aW5nICR7Y29udGFpbmVycy5sZW5ndGh9IGJ1dHRvbiBjb250YWluZXJzYCk7XG5cdFx0Y29udGFpbmVycy5mb3JFYWNoKGVsID0+IGVsLnJlbW92ZSgpKTtcblx0XHR0aGlzLmJ1dHRvbk1hcCA9IG5ldyBXZWFrTWFwKCk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUZpbGVDb250ZXh0KHZpZXc6IE1hcmtkb3duVmlldyk6IEZpbGVDb250ZXh0IHtcblx0XHRjb25zdCBjYWNoZSA9IHZpZXcuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHZpZXcuZmlsZSEpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRmaWxlOiB2aWV3LmZpbGUhLFxuXHRcdFx0ZmlsZU5hbWU6IHZpZXcuZmlsZSEubmFtZSxcblx0XHRcdGZpbGVQYXRoOiB2aWV3LmZpbGUhLnBhdGgsXG5cdFx0XHRmcm9udG1hdHRlcjogY2FjaGU/LmZyb250bWF0dGVyXG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQnV0dG9uQ29uZmlnKCk6IEJ1dHRvbkNvbmZpZyB7XG5cdFx0Y29uc3QgZGlzcGxheVRleHQgPSB0aGlzLnNldHRpbmdzLnNob3dJY29uIFxuXHRcdFx0PyBgJHt0aGlzLnNldHRpbmdzLmJ1dHRvbkljb259ICR7dGhpcy5zZXR0aW5ncy5idXR0b25UZXh0fWAudHJpbSgpXG5cdFx0XHQ6IHRoaXMuc2V0dGluZ3MuYnV0dG9uVGV4dDtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0OiBkaXNwbGF5VGV4dCxcblx0XHRcdGljb246IHRoaXMuc2V0dGluZ3Muc2hvd0ljb24gPyB0aGlzLnNldHRpbmdzLmJ1dHRvbkljb24gOiB1bmRlZmluZWQsXG5cdFx0XHRwb3NpdGlvbjogdGhpcy5zZXR0aW5ncy5idXR0b25Qb3NpdGlvbixcblx0XHRcdGNsYXNzTmFtZTogJ3ByaW50LXRpdGxlLWJ1dHRvbidcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBidXR0b25FeGlzdHMoY29udGVudEVsOiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGV4aXN0aW5nQnV0dG9uID0gdGhpcy5idXR0b25NYXAuZ2V0KGNvbnRlbnRFbCk7XG5cdFx0cmV0dXJuICEhKGV4aXN0aW5nQnV0dG9uICYmIGNvbnRlbnRFbC5jb250YWlucyhleGlzdGluZ0J1dHRvbikpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVFeGlzdGluZ0J1dHRvbnMoY29udGVudEVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdGNvbnN0IG9sZENvbnRhaW5lcnMgPSBjb250ZW50RWwucXVlcnlTZWxlY3RvckFsbCgnLnByaW50LXRpdGxlLWNvbnRhaW5lcicpO1xuXHRcdG9sZENvbnRhaW5lcnMuZm9yRWFjaChjb250YWluZXIgPT4gY29udGFpbmVyLnJlbW92ZSgpKTtcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQnV0dG9uKGNvbmZpZzogQnV0dG9uQ29uZmlnLCBjb250ZXh0OiBGaWxlQ29udGV4dCk6IEhUTUxCdXR0b25FbGVtZW50IHtcblx0XHQvLyBDcmVhdGUgYnV0dG9uIGNvbnRhaW5lclxuXHRcdGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAncHJpbnQtdGl0bGUtY29udGFpbmVyJztcblx0XHR0aGlzLnN0eWxlQ29udGFpbmVyKGJ1dHRvbkNvbnRhaW5lciwgY29uZmlnLnBvc2l0aW9uLCBjb250ZXh0KTtcblxuXHRcdC8vIENyZWF0ZSB0aGUgYnV0dG9uXG5cdFx0Y29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5cdFx0YnV0dG9uLnRleHRDb250ZW50ID0gY29uZmlnLnRleHQ7XG5cdFx0YnV0dG9uLmNsYXNzTmFtZSA9IGNvbmZpZy5jbGFzc05hbWU7XG5cdFx0dGhpcy5zdHlsZUJ1dHRvbihidXR0b24pO1xuXG5cdFx0Ly8gQWRkIGNsaWNrIGhhbmRsZXJcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4gdGhpcy5oYW5kbGVCdXR0b25DbGljayhlLCBjb250ZXh0KSk7XG5cblx0XHQvLyBBZGQgaG92ZXIgZWZmZWN0c1xuXHRcdHRoaXMuYWRkSG92ZXJFZmZlY3RzKGJ1dHRvbik7XG5cblx0XHRidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcblx0XHRyZXR1cm4gYnV0dG9uO1xuXHR9XG5cblx0cHJpdmF0ZSBzdHlsZUNvbnRhaW5lcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBwb3NpdGlvbjogc3RyaW5nLCBjb250ZXh0OiBGaWxlQ29udGV4dCk6IHZvaWQge1xuXHRcdGNvbnN0IGhhc0Zyb250bWF0dGVyID0gISEoY29udGV4dC5mcm9udG1hdHRlciAmJiBPYmplY3Qua2V5cyhjb250ZXh0LmZyb250bWF0dGVyKS5sZW5ndGggPiAwKTtcblx0XHRcblx0XHRpZiAocG9zaXRpb24gPT09ICdhZnRlci1mcm9udG1hdHRlcicgJiYgaGFzRnJvbnRtYXR0ZXIpIHtcblx0XHRcdGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdFx0XHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0XHRcdFx0bWFyZ2luOiAxNnB4IDA7XG5cdFx0XHRcdHBhZGRpbmc6IDhweCAyMHB4O1xuXHRcdFx0XHRib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuXHRcdFx0XHRib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuXHRcdFx0XHRiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG5cdFx0XHRgO1xuXHRcdH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICd0b3AtcmlnaHQnIHx8IChwb3NpdGlvbiA9PT0gJ2FmdGVyLWZyb250bWF0dGVyJyAmJiAhaGFzRnJvbnRtYXR0ZXIpKSB7XG5cdFx0XHRjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdFx0XHR0b3A6IDIwcHg7XG5cdFx0XHRcdHJpZ2h0OiAyMHB4O1xuXHRcdFx0XHR6LWluZGV4OiAxMDA7XG5cdFx0XHRcdGRpc3BsYXk6IGZsZXg7XG5cdFx0XHRcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXHRcdFx0YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYm90dG9tIHBvc2l0aW9uXG5cdFx0XHRjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdFx0ZGlzcGxheTogZmxleDtcblx0XHRcdFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cdFx0XHRcdG1hcmdpbjogMjBweCAwO1xuXHRcdFx0XHRwYWRkaW5nOiAxMHB4O1xuXHRcdFx0YDtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHN0eWxlQnV0dG9uKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiB2b2lkIHtcblx0XHRidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdGJhY2tncm91bmQ6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCwgIzhiNWNmNik7XG5cdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1vbi1hY2NlbnQsIHdoaXRlKTtcblx0XHRcdGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCk7XG5cdFx0XHRib3JkZXItcmFkaXVzOiA2cHg7XG5cdFx0XHRwYWRkaW5nOiA4cHggMTZweDtcblx0XHRcdGZvbnQtc2l6ZTogMTNweDtcblx0XHRcdGZvbnQtd2VpZ2h0OiA1MDA7XG5cdFx0XHRjdXJzb3I6IHBvaW50ZXI7XG5cdFx0XHR0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXHRcdFx0Ym94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcblx0XHRcdC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcblx0XHRcdGFwcGVhcmFuY2U6IG5vbmU7XG5cdFx0YDtcblx0fVxuXG5cdHByaXZhdGUgYWRkSG92ZXJFZmZlY3RzKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiB2b2lkIHtcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcblx0XHRcdGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC0xcHgpJztcblx0XHRcdGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpJztcblx0XHR9KTtcblxuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSAndmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LCAjOGI1Y2Y2KSc7XG5cdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJveFNoYWRvdyA9ICcwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjEpJztcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlQnV0dG9uQ2xpY2soZXZlbnQ6IEV2ZW50LCBjb250ZXh0OiBGaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLmxvZyhgQnV0dG9uIGNsaWNrZWQgZm9yIGZpbGU6ICR7Y29udGV4dC5maWxlTmFtZX1gKTtcblxuXHRcdHRyeSB7XG5cdFx0XHQvLyBTaG93IGVuaGFuY2VkIG5vdGlmaWNhdGlvblxuXHRcdFx0aWYgKHRoaXMuc2V0dGluZ3Muc2hvd0VuaGFuY2VkSW5mbykge1xuXHRcdFx0XHR0aGlzLm5vdGlmaWNhdGlvblNlcnZpY2Uuc2hvd1RpdGxlTm90aWZpY2F0aW9uKGNvbnRleHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gU2ltcGxlIG5vdGlmaWNhdGlvblxuXHRcdFx0XHRjb25zdCBtZXNzYWdlID0gYCR7dGhpcy5zZXR0aW5ncy5zaG93SWNvbiA/ICfwn5OEICcgOiAnJ30ke2NvbnRleHQuZmlsZS5iYXNlbmFtZX1gO1xuXHRcdFx0XHR0aGlzLm5vdGlmaWNhdGlvblNlcnZpY2Uuc2hvd0luZm8obWVzc2FnZS5yZXBsYWNlKCfihLnvuI8gJywgJycpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVmlzdWFsIGZlZWRiYWNrIHdpdGggYW5pbWF0aW9uXG5cdFx0XHRjb25zdCBidXR0b24gPSBldmVudC50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5hbmltYXRlQnV0dG9uKSB7XG5cdFx0XHRcdGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUoMC45NSknO1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuXHRcdFx0XHR9LCAxNTApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBMb2cgZmlsZSBhbmFseXNpcyBpZiBkZWJ1ZyBtb2RlIGlzIGVuYWJsZWRcblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSAmJiB0aGlzLnNldHRpbmdzLnNob3dGaWxlU3RhdHMpIHtcblx0XHRcdFx0Y29uc3QgYW5hbHlzaXMgPSBhd2FpdCB0aGlzLmZpbGVBbmFseXNpc1NlcnZpY2UuYW5hbHl6ZUZpbGUoY29udGV4dCk7XG5cdFx0XHRcdGNvbnN0IHN0YXRzID0gdGhpcy5maWxlQW5hbHlzaXNTZXJ2aWNlLmdldEZpbGVTdGF0cyhhbmFseXNpcyk7XG5cdFx0XHRcdHRoaXMubG9nKGBGaWxlIHN0YXRzOiAke3N0YXRzLmpvaW4oJywgJyl9YCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMubG9nKCdFcnJvciBoYW5kbGluZyBidXR0b24gY2xpY2s6JywgZXJyb3IpO1xuXHRcdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlLnNob3dFcnJvcignRmFpbGVkIHRvIHByb2Nlc3MgZmlsZSBpbmZvcm1hdGlvbicpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaW5zZXJ0QnV0dG9uKGNvbnRlbnRFbDogSFRNTEVsZW1lbnQsIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQsIHBvc2l0aW9uOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCBjb250YWluZXIgPSBidXR0b24ucGFyZW50RWxlbWVudCE7XG5cblx0XHRpZiAocG9zaXRpb24gPT09ICdhZnRlci1mcm9udG1hdHRlcicpIHtcblx0XHRcdGNvbnN0IGZyb250bWF0dGVyRWxlbWVudCA9IHRoaXMuZmluZEZyb250bWF0dGVySW5zZXJ0aW9uUG9pbnQoY29udGVudEVsKTtcblx0XHRcdGlmIChmcm9udG1hdHRlckVsZW1lbnQpIHtcblx0XHRcdFx0ZnJvbnRtYXR0ZXJFbGVtZW50Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBjb250YWluZXIpO1xuXHRcdFx0XHR0aGlzLmxvZygnQnV0dG9uIGluc2VydGVkIGFmdGVyIGZyb250bWF0dGVyJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBGYWxsYmFjayBwb3NpdGlvbnNcblx0XHRpZiAocG9zaXRpb24gPT09ICd0b3AtcmlnaHQnIHx8IHBvc2l0aW9uID09PSAnYWZ0ZXItZnJvbnRtYXR0ZXInKSB7XG5cdFx0XHRjb25zdCBmaXJzdENoaWxkID0gY29udGVudEVsLmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0aWYgKGZpcnN0Q2hpbGQpIHtcblx0XHRcdFx0Zmlyc3RDaGlsZC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgY29udGFpbmVyKTtcblx0XHRcdFx0dGhpcy5sb2coJ0J1dHRvbiBpbnNlcnRlZCBhdCB0b3Agb2YgY29udGVudCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGVudEVsLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cdFx0XHRcdHRoaXMubG9nKCdCdXR0b24gYXBwZW5kZWQgdG8gZW1wdHkgY29udGVudCcpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBib3R0b20gcG9zaXRpb25cblx0XHRcdGNvbnRlbnRFbC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXHRcdFx0dGhpcy5sb2coJ0J1dHRvbiBhcHBlbmRlZCBhdCBib3R0b20nKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGZpbmRGcm9udG1hdHRlckluc2VydGlvblBvaW50KGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG5cdFx0dGhpcy5sb2coJ0xvb2tpbmcgZm9yIGZyb250bWF0dGVyIGluc2VydGlvbiBwb2ludC4uLicpO1xuXG5cdFx0Y29uc3QgZnJvbnRtYXR0ZXJTZWxlY3RvcnMgPSBbXG5cdFx0XHQnLm1ldGFkYXRhLXByb3BlcnRpZXMtY29udGFpbmVyJyxcblx0XHRcdCcubWV0YWRhdGEtY29udGFpbmVyJyxcblx0XHRcdCcuZnJvbnRtYXR0ZXItY29udGFpbmVyJyxcblx0XHRcdCcucHJvcGVydHktY29udGFpbmVyJyxcblx0XHRcdCcubWV0YWRhdGEtcHJvcGVydHktY29udGFpbmVyJyxcblx0XHRcdCcuZG9jdW1lbnQtcHJvcGVydGllcycsXG5cdFx0XHQnLm1hcmtkb3duLXByb3BlcnRpZXMnLFxuXHRcdFx0Jy5mcm9udG1hdHRlcicsXG5cdFx0XHQnW2RhdGEtcHJvcGVydHldJ1xuXHRcdF07XG5cblx0XHRmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIGZyb250bWF0dGVyU2VsZWN0b3JzKSB7XG5cdFx0XHRjb25zdCBlbGVtZW50cyA9IGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXHRcdFx0aWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29uc3QgbGFzdEVsZW1lbnQgPSBlbGVtZW50c1tlbGVtZW50cy5sZW5ndGggLSAxXSBhcyBIVE1MRWxlbWVudDtcblx0XHRcdFx0dGhpcy5sb2coYEZvdW5kIGZyb250bWF0dGVyIHdpdGggc2VsZWN0b3I6ICR7c2VsZWN0b3J9YCk7XG5cdFx0XHRcdHJldHVybiBsYXN0RWxlbWVudDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBGYWxsYmFjazogbG9vayBmb3IgZWxlbWVudHMgdGhhdCBsb29rIGxpa2UgcHJvcGVydGllc1xuXHRcdGNvbnN0IGFsbERpdnMgPSBBcnJheS5mcm9tKGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2RpdicpKTtcblx0XHRmb3IgKGNvbnN0IGRpdiBvZiBhbGxEaXZzKSB7XG5cdFx0XHRjb25zdCBjbGFzc05hbWUgPSBkaXYuY2xhc3NOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRjb25zdCB0ZXh0Q29udGVudCA9IChkaXYudGV4dENvbnRlbnQgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdGlmIChjbGFzc05hbWUuaW5jbHVkZXMoJ21ldGFkYXRhJykgfHwgXG5cdFx0XHRcdGNsYXNzTmFtZS5pbmNsdWRlcygncHJvcGVydHknKSB8fFxuXHRcdFx0XHR0ZXh0Q29udGVudC5pbmNsdWRlcygndGFnczonKSB8fFxuXHRcdFx0XHR0ZXh0Q29udGVudC5pbmNsdWRlcygndGl0bGU6JykgfHxcblx0XHRcdFx0ZGl2Lmhhc0F0dHJpYnV0ZSgnZGF0YS1wcm9wZXJ0eScpKSB7XG5cdFx0XHRcdHRoaXMubG9nKCdGb3VuZCBmcm9udG1hdHRlci1saWtlIGVsZW1lbnQ6JywgZGl2LmNsYXNzTmFtZSk7XG5cdFx0XHRcdHJldHVybiBkaXYgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5sb2coJ05vIGZyb250bWF0dGVyIGZvdW5kJyk7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgW1ByaW50VGl0bGVdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcblx0XHR9XG5cdH1cbn0iXX0=