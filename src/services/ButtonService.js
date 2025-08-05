"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonService = void 0;
class ButtonService {
    constructor(app, settings, notificationService, fileAnalysisService, areaCreationService, dataviewAdapter) {
        this.app = app;
        this.settings = settings;
        this.notificationService = notificationService;
        this.fileAnalysisService = fileAnalysisService;
        this.areaCreationService = areaCreationService;
        this.dataviewAdapter = dataviewAdapter;
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
    async addButtonToView(view) {
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
        // Check if this is an ems__Area and create appropriate button
        const isEmsArea = await this.isEmsAreaFile(view);
        const buttonConfig = this.createButtonConfig(isEmsArea);
        const button = this.createButton(buttonConfig, fileContext, isEmsArea);
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
    createButtonConfig(isEmsArea = false) {
        let displayText;
        let buttonClass;
        if (isEmsArea) {
            // Special button for ems__Area files
            displayText = this.settings.showIcon
                ? `🏗️ Create Child Area`
                : 'Create Child Area';
            buttonClass = 'print-title-button area-create-button';
        }
        else {
            // Standard print title button
            displayText = this.settings.showIcon
                ? `${this.settings.buttonIcon} ${this.settings.buttonText}`.trim()
                : this.settings.buttonText;
            buttonClass = 'print-title-button';
        }
        return {
            text: displayText,
            icon: this.settings.showIcon ? this.settings.buttonIcon : undefined,
            position: this.settings.buttonPosition,
            className: buttonClass
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
    createButton(config, context, isEmsArea = false) {
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
        button.addEventListener('click', (e) => this.handleButtonClick(e, context, isEmsArea));
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
    async handleButtonClick(event, context, isEmsArea = false) {
        event.preventDefault();
        event.stopPropagation();
        this.log(`Button clicked for file: ${context.fileName}, isEmsArea: ${isEmsArea}`);
        try {
            if (isEmsArea) {
                // Handle ems__Area specific action - create child area
                await this.handleAreaAction(context);
            }
            else {
                // Handle standard print title action
                await this.handlePrintTitleAction(context);
            }
            // Visual feedback with animation
            const button = event.target;
            if (this.settings.animateButton) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'translateY(0)';
                }, 150);
            }
        }
        catch (error) {
            this.log('Error handling button click:', error);
            this.notificationService.showError('Failed to process action');
        }
    }
    /**
     * Handle ems__Area specific actions
     */
    async handleAreaAction(context) {
        var _a;
        this.log('Handling area action - creating child area');
        // Convert to ExoFileContext
        const exoContext = {
            fileName: context.fileName,
            filePath: context.filePath,
            file: context.file,
            frontmatter: context.frontmatter,
            currentPage: {
                file: {
                    path: context.file.path,
                    name: context.file.name,
                    link: null,
                    mtime: new Date(context.file.stat.mtime)
                },
                'exo__Instance_class': ((_a = context.frontmatter) === null || _a === void 0 ? void 0 : _a['exo__Instance_class']) || [],
                ...context.frontmatter
            }
        };
        await this.areaCreationService.createChildArea(exoContext);
    }
    /**
     * Handle standard print title action
     */
    async handlePrintTitleAction(context) {
        // Show enhanced notification
        if (this.settings.showEnhancedInfo) {
            this.notificationService.showTitleNotification(context);
        }
        else {
            // Simple notification
            const message = `${this.settings.showIcon ? '📄 ' : ''}${context.file.basename}`;
            this.notificationService.showInfo(message.replace('ℹ️ ', ''));
        }
        // Log file analysis if debug mode is enabled
        if (this.settings.enableDebugMode && this.settings.showFileStats) {
            const analysis = await this.fileAnalysisService.analyzeFile(context);
            const stats = this.fileAnalysisService.getFileStats(analysis);
            this.log(`File stats: ${stats.join(', ')}`);
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
    /**
     * Check if the current file is an ems__Area asset
     */
    async isEmsAreaFile(view) {
        if (!view || !view.file)
            return false;
        try {
            // Get file cache to check frontmatter
            const cache = this.app.metadataCache.getFileCache(view.file);
            const frontmatter = cache === null || cache === void 0 ? void 0 : cache.frontmatter;
            if (!frontmatter || !frontmatter['exo__Instance_class']) {
                return false;
            }
            const instanceClasses = Array.isArray(frontmatter['exo__Instance_class'])
                ? frontmatter['exo__Instance_class']
                : [frontmatter['exo__Instance_class']];
            // Check if any of the instance classes contains 'ems__Area'
            return instanceClasses.some((cls) => {
                if (typeof cls === 'string') {
                    return cls.includes('ems__Area');
                }
                else if (cls && cls.path) {
                    return cls.path.includes('ems__Area');
                }
                return false;
            });
        }
        catch (error) {
            this.log('Error checking if file is ems__Area:', error);
            return false;
        }
    }
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[PrintTitle] ${message}`, ...args);
        }
    }
}
exports.ButtonService = ButtonService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJ1dHRvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsTUFBYSxhQUFhO0lBR3pCLFlBQ1MsR0FBUSxFQUNSLFFBQTRCLEVBQzVCLG1CQUF3QyxFQUN4QyxtQkFBd0MsRUFDeEMsbUJBQXdDLEVBQ3hDLGVBQWdDO1FBTGhDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFDUixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUM1Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFSakMsY0FBUyxHQUE0QyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBU3hFLENBQUM7SUFFSjs7T0FFRztJQUNILGNBQWMsQ0FBQyxRQUE0QjtRQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQWtCO1FBQ3ZDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3hDLE9BQU87UUFDUixDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFakMsaUNBQWlDO1FBQ2pDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ2xD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QyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7cUJBQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUM1QixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2dCQUNELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNGLENBQUM7SUFFTyxHQUFHLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVztRQUMxQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsT0FBTyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0YsQ0FBQztDQUNEO0FBM1lELHNDQTJZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hcmtkb3duVmlldywgVEZpbGUsIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEZpbGVDb250ZXh0LCBCdXR0b25Db25maWcsIFByaW50VGl0bGVTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IEV4b0ZpbGVDb250ZXh0IH0gZnJvbSAnLi4vdHlwZXMvRXhvVHlwZXMnO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uU2VydmljZSB9IGZyb20gJy4vTm90aWZpY2F0aW9uU2VydmljZSc7XG5pbXBvcnQgeyBGaWxlQW5hbHlzaXNTZXJ2aWNlIH0gZnJvbSAnLi9GaWxlQW5hbHlzaXNTZXJ2aWNlJztcbmltcG9ydCB7IEFyZWFDcmVhdGlvblNlcnZpY2UgfSBmcm9tICcuL0FyZWFDcmVhdGlvblNlcnZpY2UnO1xuaW1wb3J0IHsgRGF0YXZpZXdBZGFwdGVyIH0gZnJvbSAnLi9EYXRhdmlld0FkYXB0ZXInO1xuXG5leHBvcnQgY2xhc3MgQnV0dG9uU2VydmljZSB7XG5cdHByaXZhdGUgYnV0dG9uTWFwOiBXZWFrTWFwPEhUTUxFbGVtZW50LCBIVE1MQnV0dG9uRWxlbWVudD4gPSBuZXcgV2Vha01hcCgpO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgYXBwOiBBcHAsXG5cdFx0cHJpdmF0ZSBzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzLFxuXHRcdHByaXZhdGUgbm90aWZpY2F0aW9uU2VydmljZTogTm90aWZpY2F0aW9uU2VydmljZSxcblx0XHRwcml2YXRlIGZpbGVBbmFseXNpc1NlcnZpY2U6IEZpbGVBbmFseXNpc1NlcnZpY2UsXG5cdFx0cHJpdmF0ZSBhcmVhQ3JlYXRpb25TZXJ2aWNlOiBBcmVhQ3JlYXRpb25TZXJ2aWNlLFxuXHRcdHByaXZhdGUgZGF0YXZpZXdBZGFwdGVyOiBEYXRhdmlld0FkYXB0ZXJcblx0KSB7fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2V0dGluZ3MgcmVmZXJlbmNlXG5cdCAqL1xuXHR1cGRhdGVTZXR0aW5ncyhzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzKTogdm9pZCB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBidXR0b24gdG8gYSBzcGVjaWZpYyB2aWV3XG5cdCAqL1xuXHRhc3luYyBhZGRCdXR0b25Ub1ZpZXcodmlldzogTWFya2Rvd25WaWV3KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcblx0XHRcdHRoaXMubG9nKCdObyB2YWxpZCB2aWV3IG9yIGZpbGUgZm91bmQnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBmaWxlQ29udGV4dCA9IHRoaXMuY3JlYXRlRmlsZUNvbnRleHQodmlldyk7XG5cdFx0dGhpcy5sb2coYEFkZGluZyBidXR0b24gdG8gdmlldzogJHtmaWxlQ29udGV4dC5maWxlTmFtZX1gKTtcblxuXHRcdGNvbnN0IGNvbnRlbnRFbCA9IHZpZXcuY29udGVudEVsO1xuXHRcdFxuXHRcdC8vIENoZWNrIGlmIGJ1dHRvbiBhbHJlYWR5IGV4aXN0c1xuXHRcdGlmICh0aGlzLmJ1dHRvbkV4aXN0cyhjb250ZW50RWwpKSB7XG5cdFx0XHR0aGlzLmxvZygnQnV0dG9uIGFscmVhZHkgZXhpc3RzIGluIHRoaXMgdmlldycpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBhbnkgb2xkIGJ1dHRvbnNcblx0XHR0aGlzLnJlbW92ZUV4aXN0aW5nQnV0dG9ucyhjb250ZW50RWwpO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgdGhpcyBpcyBhbiBlbXNfX0FyZWEgYW5kIGNyZWF0ZSBhcHByb3ByaWF0ZSBidXR0b25cblx0XHRjb25zdCBpc0Vtc0FyZWEgPSBhd2FpdCB0aGlzLmlzRW1zQXJlYUZpbGUodmlldyk7XG5cdFx0Y29uc3QgYnV0dG9uQ29uZmlnID0gdGhpcy5jcmVhdGVCdXR0b25Db25maWcoaXNFbXNBcmVhKTtcblx0XHRjb25zdCBidXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihidXR0b25Db25maWcsIGZpbGVDb250ZXh0LCBpc0Vtc0FyZWEpO1xuXHRcdHRoaXMuaW5zZXJ0QnV0dG9uKGNvbnRlbnRFbCwgYnV0dG9uLCBidXR0b25Db25maWcucG9zaXRpb24pO1xuXG5cdFx0Ly8gU3RvcmUgcmVmZXJlbmNlXG5cdFx0dGhpcy5idXR0b25NYXAuc2V0KGNvbnRlbnRFbCwgYnV0dG9uKTtcblx0XHR0aGlzLmxvZygnQnV0dG9uIHN1Y2Nlc3NmdWxseSBhZGRlZCcpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhbGwgYnV0dG9ucyBmcm9tIHRoZSBjdXJyZW50IHZpZXdcblx0ICovXG5cdHJlbW92ZUJ1dHRvbnNGcm9tVmlldyh2aWV3OiBNYXJrZG93blZpZXcpOiB2b2lkIHtcblx0XHRpZiAoIXZpZXcpIHJldHVybjtcblxuXHRcdGNvbnN0IGNvbnRlbnRFbCA9IHZpZXcuY29udGVudEVsO1xuXHRcdHRoaXMucmVtb3ZlRXhpc3RpbmdCdXR0b25zKGNvbnRlbnRFbCk7XG5cdFx0dGhpcy5idXR0b25NYXAuZGVsZXRlKGNvbnRlbnRFbCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYW4gdXAgYWxsIGJ1dHRvbnNcblx0ICovXG5cdGNsZWFudXAoKTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmludC10aXRsZS1jb250YWluZXInKTtcblx0XHR0aGlzLmxvZyhgUmVtb3ZpbmcgJHtjb250YWluZXJzLmxlbmd0aH0gYnV0dG9uIGNvbnRhaW5lcnNgKTtcblx0XHRjb250YWluZXJzLmZvckVhY2goZWwgPT4gZWwucmVtb3ZlKCkpO1xuXHRcdHRoaXMuYnV0dG9uTWFwID0gbmV3IFdlYWtNYXAoKTtcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlRmlsZUNvbnRleHQodmlldzogTWFya2Rvd25WaWV3KTogRmlsZUNvbnRleHQge1xuXHRcdGNvbnN0IGNhY2hlID0gdmlldy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUodmlldy5maWxlISk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpbGU6IHZpZXcuZmlsZSEsXG5cdFx0XHRmaWxlTmFtZTogdmlldy5maWxlIS5uYW1lLFxuXHRcdFx0ZmlsZVBhdGg6IHZpZXcuZmlsZSEucGF0aCxcblx0XHRcdGZyb250bWF0dGVyOiBjYWNoZT8uZnJvbnRtYXR0ZXJcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVCdXR0b25Db25maWcoaXNFbXNBcmVhOiBib29sZWFuID0gZmFsc2UpOiBCdXR0b25Db25maWcge1xuXHRcdGxldCBkaXNwbGF5VGV4dDogc3RyaW5nO1xuXHRcdGxldCBidXR0b25DbGFzczogc3RyaW5nO1xuXG5cdFx0aWYgKGlzRW1zQXJlYSkge1xuXHRcdFx0Ly8gU3BlY2lhbCBidXR0b24gZm9yIGVtc19fQXJlYSBmaWxlc1xuXHRcdFx0ZGlzcGxheVRleHQgPSB0aGlzLnNldHRpbmdzLnNob3dJY29uIFxuXHRcdFx0XHQ/IGDwn4+X77iPIENyZWF0ZSBDaGlsZCBBcmVhYFxuXHRcdFx0XHQ6ICdDcmVhdGUgQ2hpbGQgQXJlYSc7XG5cdFx0XHRidXR0b25DbGFzcyA9ICdwcmludC10aXRsZS1idXR0b24gYXJlYS1jcmVhdGUtYnV0dG9uJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gU3RhbmRhcmQgcHJpbnQgdGl0bGUgYnV0dG9uXG5cdFx0XHRkaXNwbGF5VGV4dCA9IHRoaXMuc2V0dGluZ3Muc2hvd0ljb24gXG5cdFx0XHRcdD8gYCR7dGhpcy5zZXR0aW5ncy5idXR0b25JY29ufSAke3RoaXMuc2V0dGluZ3MuYnV0dG9uVGV4dH1gLnRyaW0oKVxuXHRcdFx0XHQ6IHRoaXMuc2V0dGluZ3MuYnV0dG9uVGV4dDtcblx0XHRcdGJ1dHRvbkNsYXNzID0gJ3ByaW50LXRpdGxlLWJ1dHRvbic7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRleHQ6IGRpc3BsYXlUZXh0LFxuXHRcdFx0aWNvbjogdGhpcy5zZXR0aW5ncy5zaG93SWNvbiA/IHRoaXMuc2V0dGluZ3MuYnV0dG9uSWNvbiA6IHVuZGVmaW5lZCxcblx0XHRcdHBvc2l0aW9uOiB0aGlzLnNldHRpbmdzLmJ1dHRvblBvc2l0aW9uLFxuXHRcdFx0Y2xhc3NOYW1lOiBidXR0b25DbGFzc1xuXHRcdH07XG5cdH1cblxuXHRwcml2YXRlIGJ1dHRvbkV4aXN0cyhjb250ZW50RWw6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgZXhpc3RpbmdCdXR0b24gPSB0aGlzLmJ1dHRvbk1hcC5nZXQoY29udGVudEVsKTtcblx0XHRyZXR1cm4gISEoZXhpc3RpbmdCdXR0b24gJiYgY29udGVudEVsLmNvbnRhaW5zKGV4aXN0aW5nQnV0dG9uKSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZUV4aXN0aW5nQnV0dG9ucyhjb250ZW50RWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG5cdFx0Y29uc3Qgb2xkQ29udGFpbmVycyA9IGNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsKCcucHJpbnQtdGl0bGUtY29udGFpbmVyJyk7XG5cdFx0b2xkQ29udGFpbmVycy5mb3JFYWNoKGNvbnRhaW5lciA9PiBjb250YWluZXIucmVtb3ZlKCkpO1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVCdXR0b24oY29uZmlnOiBCdXR0b25Db25maWcsIGNvbnRleHQ6IEZpbGVDb250ZXh0LCBpc0Vtc0FyZWE6IGJvb2xlYW4gPSBmYWxzZSk6IEhUTUxCdXR0b25FbGVtZW50IHtcblx0XHQvLyBDcmVhdGUgYnV0dG9uIGNvbnRhaW5lclxuXHRcdGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdGJ1dHRvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAncHJpbnQtdGl0bGUtY29udGFpbmVyJztcblx0XHR0aGlzLnN0eWxlQ29udGFpbmVyKGJ1dHRvbkNvbnRhaW5lciwgY29uZmlnLnBvc2l0aW9uLCBjb250ZXh0KTtcblxuXHRcdC8vIENyZWF0ZSB0aGUgYnV0dG9uXG5cdFx0Y29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5cdFx0YnV0dG9uLnRleHRDb250ZW50ID0gY29uZmlnLnRleHQ7XG5cdFx0YnV0dG9uLmNsYXNzTmFtZSA9IGNvbmZpZy5jbGFzc05hbWU7XG5cdFx0dGhpcy5zdHlsZUJ1dHRvbihidXR0b24pO1xuXG5cdFx0Ly8gQWRkIGNsaWNrIGhhbmRsZXJcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4gdGhpcy5oYW5kbGVCdXR0b25DbGljayhlLCBjb250ZXh0LCBpc0Vtc0FyZWEpKTtcblxuXHRcdC8vIEFkZCBob3ZlciBlZmZlY3RzXG5cdFx0dGhpcy5hZGRIb3ZlckVmZmVjdHMoYnV0dG9uKTtcblxuXHRcdGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b24pO1xuXHRcdHJldHVybiBidXR0b247XG5cdH1cblxuXHRwcml2YXRlIHN0eWxlQ29udGFpbmVyKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHBvc2l0aW9uOiBzdHJpbmcsIGNvbnRleHQ6IEZpbGVDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgaGFzRnJvbnRtYXR0ZXIgPSAhIShjb250ZXh0LmZyb250bWF0dGVyICYmIE9iamVjdC5rZXlzKGNvbnRleHQuZnJvbnRtYXR0ZXIpLmxlbmd0aCA+IDApO1xuXHRcdFxuXHRcdGlmIChwb3NpdGlvbiA9PT0gJ2FmdGVyLWZyb250bWF0dGVyJyAmJiBoYXNGcm9udG1hdHRlcikge1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSBgXG5cdFx0XHRcdGRpc3BsYXk6IGZsZXg7XG5cdFx0XHRcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXHRcdFx0XHRtYXJnaW46IDE2cHggMDtcblx0XHRcdFx0cGFkZGluZzogOHB4IDIwcHg7XG5cdFx0XHRcdGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcik7XG5cdFx0XHRcdGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcik7XG5cdFx0XHRcdGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcblx0XHRcdGA7XG5cdFx0fSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3RvcC1yaWdodCcgfHwgKHBvc2l0aW9uID09PSAnYWZ0ZXItZnJvbnRtYXR0ZXInICYmICFoYXNGcm9udG1hdHRlcikpIHtcblx0XHRcdGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0XHRwb3NpdGlvbjogYWJzb2x1dGU7XG5cdFx0XHRcdHRvcDogMjBweDtcblx0XHRcdFx0cmlnaHQ6IDIwcHg7XG5cdFx0XHRcdHotaW5kZXg6IDEwMDtcblx0XHRcdFx0ZGlzcGxheTogZmxleDtcblx0XHRcdFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cdFx0XHRgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBib3R0b20gcG9zaXRpb25cblx0XHRcdGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdFx0XHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0XHRcdFx0bWFyZ2luOiAyMHB4IDA7XG5cdFx0XHRcdHBhZGRpbmc6IDEwcHg7XG5cdFx0XHRgO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc3R5bGVCdXR0b24oYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCk6IHZvaWQge1xuXHRcdGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0YmFja2dyb3VuZDogdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LCAjOGI1Y2Y2KTtcblx0XHRcdGNvbG9yOiB2YXIoLS10ZXh0LW9uLWFjY2VudCwgd2hpdGUpO1xuXHRcdFx0Ym9yZGVyOiAxcHggc29saWQgdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyLCAjN2MzYWVkKTtcblx0XHRcdGJvcmRlci1yYWRpdXM6IDZweDtcblx0XHRcdHBhZGRpbmc6IDhweCAxNnB4O1xuXHRcdFx0Zm9udC1zaXplOiAxM3B4O1xuXHRcdFx0Zm9udC13ZWlnaHQ6IDUwMDtcblx0XHRcdGN1cnNvcjogcG9pbnRlcjtcblx0XHRcdHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG5cdFx0XHRib3gtc2hhZG93OiAwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuXHRcdFx0LXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xuXHRcdFx0YXBwZWFyYW5jZTogbm9uZTtcblx0XHRgO1xuXHR9XG5cblx0cHJpdmF0ZSBhZGRIb3ZlckVmZmVjdHMoYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCk6IHZvaWQge1xuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSAndmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyLCAjN2MzYWVkKSc7XG5cdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTFweCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJveFNoYWRvdyA9ICcwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xNSknO1xuXHRcdH0pO1xuXG5cdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG5cdFx0XHRidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQsICM4YjVjZjYpJztcblx0XHRcdGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwKSc7XG5cdFx0XHRidXR0b24uc3R5bGUuYm94U2hhZG93ID0gJzAgMnB4IDhweCByZ2JhKDAsIDAsIDAsIDAuMSknO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVCdXR0b25DbGljayhldmVudDogRXZlbnQsIGNvbnRleHQ6IEZpbGVDb250ZXh0LCBpc0Vtc0FyZWE6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLmxvZyhgQnV0dG9uIGNsaWNrZWQgZm9yIGZpbGU6ICR7Y29udGV4dC5maWxlTmFtZX0sIGlzRW1zQXJlYTogJHtpc0Vtc0FyZWF9YCk7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKGlzRW1zQXJlYSkge1xuXHRcdFx0XHQvLyBIYW5kbGUgZW1zX19BcmVhIHNwZWNpZmljIGFjdGlvbiAtIGNyZWF0ZSBjaGlsZCBhcmVhXG5cdFx0XHRcdGF3YWl0IHRoaXMuaGFuZGxlQXJlYUFjdGlvbihjb250ZXh0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEhhbmRsZSBzdGFuZGFyZCBwcmludCB0aXRsZSBhY3Rpb25cblx0XHRcdFx0YXdhaXQgdGhpcy5oYW5kbGVQcmludFRpdGxlQWN0aW9uKGNvbnRleHQpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBWaXN1YWwgZmVlZGJhY2sgd2l0aCBhbmltYXRpb25cblx0XHRcdGNvbnN0IGJ1dHRvbiA9IGV2ZW50LnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLmFuaW1hdGVCdXR0b24pIHtcblx0XHRcdFx0YnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZSgwLjk1KSc7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwKSc7XG5cdFx0XHRcdH0sIDE1MCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMubG9nKCdFcnJvciBoYW5kbGluZyBidXR0b24gY2xpY2s6JywgZXJyb3IpO1xuXHRcdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlLnNob3dFcnJvcignRmFpbGVkIHRvIHByb2Nlc3MgYWN0aW9uJyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBlbXNfX0FyZWEgc3BlY2lmaWMgYWN0aW9uc1xuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVBcmVhQWN0aW9uKGNvbnRleHQ6IEZpbGVDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5sb2coJ0hhbmRsaW5nIGFyZWEgYWN0aW9uIC0gY3JlYXRpbmcgY2hpbGQgYXJlYScpO1xuXG5cdFx0Ly8gQ29udmVydCB0byBFeG9GaWxlQ29udGV4dFxuXHRcdGNvbnN0IGV4b0NvbnRleHQ6IEV4b0ZpbGVDb250ZXh0ID0ge1xuXHRcdFx0ZmlsZU5hbWU6IGNvbnRleHQuZmlsZU5hbWUsXG5cdFx0XHRmaWxlUGF0aDogY29udGV4dC5maWxlUGF0aCxcblx0XHRcdGZpbGU6IGNvbnRleHQuZmlsZSxcblx0XHRcdGZyb250bWF0dGVyOiBjb250ZXh0LmZyb250bWF0dGVyLFxuXHRcdFx0Y3VycmVudFBhZ2U6IHtcblx0XHRcdFx0ZmlsZToge1xuXHRcdFx0XHRcdHBhdGg6IGNvbnRleHQuZmlsZS5wYXRoLFxuXHRcdFx0XHRcdG5hbWU6IGNvbnRleHQuZmlsZS5uYW1lLFxuXHRcdFx0XHRcdGxpbms6IG51bGwsXG5cdFx0XHRcdFx0bXRpbWU6IG5ldyBEYXRlKGNvbnRleHQuZmlsZS5zdGF0Lm10aW1lKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnZXhvX19JbnN0YW5jZV9jbGFzcyc6IGNvbnRleHQuZnJvbnRtYXR0ZXI/LlsnZXhvX19JbnN0YW5jZV9jbGFzcyddIHx8IFtdLFxuXHRcdFx0XHQuLi5jb250ZXh0LmZyb250bWF0dGVyXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGF3YWl0IHRoaXMuYXJlYUNyZWF0aW9uU2VydmljZS5jcmVhdGVDaGlsZEFyZWEoZXhvQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlIHN0YW5kYXJkIHByaW50IHRpdGxlIGFjdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVQcmludFRpdGxlQWN0aW9uKGNvbnRleHQ6IEZpbGVDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gU2hvdyBlbmhhbmNlZCBub3RpZmljYXRpb25cblx0XHRpZiAodGhpcy5zZXR0aW5ncy5zaG93RW5oYW5jZWRJbmZvKSB7XG5cdFx0XHR0aGlzLm5vdGlmaWNhdGlvblNlcnZpY2Uuc2hvd1RpdGxlTm90aWZpY2F0aW9uKGNvbnRleHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBTaW1wbGUgbm90aWZpY2F0aW9uXG5cdFx0XHRjb25zdCBtZXNzYWdlID0gYCR7dGhpcy5zZXR0aW5ncy5zaG93SWNvbiA/ICfwn5OEICcgOiAnJ30ke2NvbnRleHQuZmlsZS5iYXNlbmFtZX1gO1xuXHRcdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlLnNob3dJbmZvKG1lc3NhZ2UucmVwbGFjZSgn4oS577iPICcsICcnKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTG9nIGZpbGUgYW5hbHlzaXMgaWYgZGVidWcgbW9kZSBpcyBlbmFibGVkXG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlICYmIHRoaXMuc2V0dGluZ3Muc2hvd0ZpbGVTdGF0cykge1xuXHRcdFx0Y29uc3QgYW5hbHlzaXMgPSBhd2FpdCB0aGlzLmZpbGVBbmFseXNpc1NlcnZpY2UuYW5hbHl6ZUZpbGUoY29udGV4dCk7XG5cdFx0XHRjb25zdCBzdGF0cyA9IHRoaXMuZmlsZUFuYWx5c2lzU2VydmljZS5nZXRGaWxlU3RhdHMoYW5hbHlzaXMpO1xuXHRcdFx0dGhpcy5sb2coYEZpbGUgc3RhdHM6ICR7c3RhdHMuam9pbignLCAnKX1gKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGluc2VydEJ1dHRvbihjb250ZW50RWw6IEhUTUxFbGVtZW50LCBidXR0b246IEhUTUxCdXR0b25FbGVtZW50LCBwb3NpdGlvbjogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGFpbmVyID0gYnV0dG9uLnBhcmVudEVsZW1lbnQhO1xuXG5cdFx0aWYgKHBvc2l0aW9uID09PSAnYWZ0ZXItZnJvbnRtYXR0ZXInKSB7XG5cdFx0XHRjb25zdCBmcm9udG1hdHRlckVsZW1lbnQgPSB0aGlzLmZpbmRGcm9udG1hdHRlckluc2VydGlvblBvaW50KGNvbnRlbnRFbCk7XG5cdFx0XHRpZiAoZnJvbnRtYXR0ZXJFbGVtZW50KSB7XG5cdFx0XHRcdGZyb250bWF0dGVyRWxlbWVudC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgY29udGFpbmVyKTtcblx0XHRcdFx0dGhpcy5sb2coJ0J1dHRvbiBpbnNlcnRlZCBhZnRlciBmcm9udG1hdHRlcicpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gRmFsbGJhY2sgcG9zaXRpb25zXG5cdFx0aWYgKHBvc2l0aW9uID09PSAndG9wLXJpZ2h0JyB8fCBwb3NpdGlvbiA9PT0gJ2FmdGVyLWZyb250bWF0dGVyJykge1xuXHRcdFx0Y29uc3QgZmlyc3RDaGlsZCA9IGNvbnRlbnRFbC5maXJzdEVsZW1lbnRDaGlsZDtcblx0XHRcdGlmIChmaXJzdENoaWxkKSB7XG5cdFx0XHRcdGZpcnN0Q2hpbGQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIGNvbnRhaW5lcik7XG5cdFx0XHRcdHRoaXMubG9nKCdCdXR0b24gaW5zZXJ0ZWQgYXQgdG9wIG9mIGNvbnRlbnQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnRlbnRFbC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXHRcdFx0XHR0aGlzLmxvZygnQnV0dG9uIGFwcGVuZGVkIHRvIGVtcHR5IGNvbnRlbnQnKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYm90dG9tIHBvc2l0aW9uXG5cdFx0XHRjb250ZW50RWwuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblx0XHRcdHRoaXMubG9nKCdCdXR0b24gYXBwZW5kZWQgYXQgYm90dG9tJyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBmaW5kRnJvbnRtYXR0ZXJJbnNlcnRpb25Qb2ludChjb250YWluZXJFbDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuXHRcdHRoaXMubG9nKCdMb29raW5nIGZvciBmcm9udG1hdHRlciBpbnNlcnRpb24gcG9pbnQuLi4nKTtcblxuXHRcdGNvbnN0IGZyb250bWF0dGVyU2VsZWN0b3JzID0gW1xuXHRcdFx0Jy5tZXRhZGF0YS1wcm9wZXJ0aWVzLWNvbnRhaW5lcicsXG5cdFx0XHQnLm1ldGFkYXRhLWNvbnRhaW5lcicsXG5cdFx0XHQnLmZyb250bWF0dGVyLWNvbnRhaW5lcicsXG5cdFx0XHQnLnByb3BlcnR5LWNvbnRhaW5lcicsXG5cdFx0XHQnLm1ldGFkYXRhLXByb3BlcnR5LWNvbnRhaW5lcicsXG5cdFx0XHQnLmRvY3VtZW50LXByb3BlcnRpZXMnLFxuXHRcdFx0Jy5tYXJrZG93bi1wcm9wZXJ0aWVzJyxcblx0XHRcdCcuZnJvbnRtYXR0ZXInLFxuXHRcdFx0J1tkYXRhLXByb3BlcnR5XSdcblx0XHRdO1xuXG5cdFx0Zm9yIChjb25zdCBzZWxlY3RvciBvZiBmcm9udG1hdHRlclNlbGVjdG9ycykge1xuXHRcdFx0Y29uc3QgZWxlbWVudHMgPSBjb250YWluZXJFbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblx0XHRcdGlmIChlbGVtZW50cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnN0IGxhc3RFbGVtZW50ID0gZWxlbWVudHNbZWxlbWVudHMubGVuZ3RoIC0gMV0gYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRcdHRoaXMubG9nKGBGb3VuZCBmcm9udG1hdHRlciB3aXRoIHNlbGVjdG9yOiAke3NlbGVjdG9yfWApO1xuXHRcdFx0XHRyZXR1cm4gbGFzdEVsZW1lbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gRmFsbGJhY2s6IGxvb2sgZm9yIGVsZW1lbnRzIHRoYXQgbG9vayBsaWtlIHByb3BlcnRpZXNcblx0XHRjb25zdCBhbGxEaXZzID0gQXJyYXkuZnJvbShjb250YWluZXJFbC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYnKSk7XG5cdFx0Zm9yIChjb25zdCBkaXYgb2YgYWxsRGl2cykge1xuXHRcdFx0Y29uc3QgY2xhc3NOYW1lID0gZGl2LmNsYXNzTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0Y29uc3QgdGV4dENvbnRlbnQgPSAoZGl2LnRleHRDb250ZW50IHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHRpZiAoY2xhc3NOYW1lLmluY2x1ZGVzKCdtZXRhZGF0YScpIHx8IFxuXHRcdFx0XHRjbGFzc05hbWUuaW5jbHVkZXMoJ3Byb3BlcnR5JykgfHxcblx0XHRcdFx0dGV4dENvbnRlbnQuaW5jbHVkZXMoJ3RhZ3M6JykgfHxcblx0XHRcdFx0dGV4dENvbnRlbnQuaW5jbHVkZXMoJ3RpdGxlOicpIHx8XG5cdFx0XHRcdGRpdi5oYXNBdHRyaWJ1dGUoJ2RhdGEtcHJvcGVydHknKSkge1xuXHRcdFx0XHR0aGlzLmxvZygnRm91bmQgZnJvbnRtYXR0ZXItbGlrZSBlbGVtZW50OicsIGRpdi5jbGFzc05hbWUpO1xuXHRcdFx0XHRyZXR1cm4gZGl2IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMubG9nKCdObyBmcm9udG1hdHRlciBmb3VuZCcpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSBjdXJyZW50IGZpbGUgaXMgYW4gZW1zX19BcmVhIGFzc2V0XG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIGlzRW1zQXJlYUZpbGUodmlldzogTWFya2Rvd25WaWV3KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0aWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHJldHVybiBmYWxzZTtcblxuXHRcdHRyeSB7XG5cdFx0XHQvLyBHZXQgZmlsZSBjYWNoZSB0byBjaGVjayBmcm9udG1hdHRlclxuXHRcdFx0Y29uc3QgY2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xuXHRcdFx0Y29uc3QgZnJvbnRtYXR0ZXIgPSBjYWNoZT8uZnJvbnRtYXR0ZXI7XG5cdFx0XHRcblx0XHRcdGlmICghZnJvbnRtYXR0ZXIgfHwgIWZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10pIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBpbnN0YW5jZUNsYXNzZXMgPSBBcnJheS5pc0FycmF5KGZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10pIFxuXHRcdFx0XHQ/IGZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10gXG5cdFx0XHRcdDogW2Zyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ11dO1xuXG5cdFx0XHQvLyBDaGVjayBpZiBhbnkgb2YgdGhlIGluc3RhbmNlIGNsYXNzZXMgY29udGFpbnMgJ2Vtc19fQXJlYSdcblx0XHRcdHJldHVybiBpbnN0YW5jZUNsYXNzZXMuc29tZSgoY2xzOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNscy5pbmNsdWRlcygnZW1zX19BcmVhJyk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2xzICYmIGNscy5wYXRoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNscy5wYXRoLmluY2x1ZGVzKCdlbXNfX0FyZWEnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5sb2coJ0Vycm9yIGNoZWNraW5nIGlmIGZpbGUgaXMgZW1zX19BcmVhOicsIGVycm9yKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgW1ByaW50VGl0bGVdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcblx0XHR9XG5cdH1cbn0iXX0=