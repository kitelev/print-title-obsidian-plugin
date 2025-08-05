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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9CdXR0b25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFBLE1BQWEsYUFBYTtJQUd6QixZQUNTLEdBQVEsRUFDUixRQUE0QixFQUM1QixtQkFBd0MsRUFDeEMsbUJBQXdDLEVBQ3hDLG1CQUF3QyxFQUN4QyxlQUFnQztRQUxoQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFDNUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBUmpDLGNBQVMsR0FBNEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQVN4RSxDQUFDO0lBRUo7O09BRUc7SUFDSCxjQUFjLENBQUMsUUFBNEI7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFrQjtRQUN2QyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUN4QyxPQUFPO1FBQ1IsQ0FBQztRQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUEwQixXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUUzRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRWpDLGlDQUFpQztRQUNqQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFD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N0IsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNsQyxDQUFDO3FCQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztnQkFDRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7SUFDRixDQUFDO0lBRU8sR0FBRyxDQUFDLE9BQWUsRUFBRSxHQUFHLElBQVc7UUFDMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLE9BQU8sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNGLENBQUM7Q0FDRDtBQTNZRCxzQ0EyWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXJrZG93blZpZXcsIFRGaWxlLCBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBGaWxlQ29udGV4dCwgQnV0dG9uQ29uZmlnLCBQcmludFRpdGxlU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBFeG9GaWxlQ29udGV4dCB9IGZyb20gJy4uL3R5cGVzL0V4b1R5cGVzJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL05vdGlmaWNhdGlvblNlcnZpY2UnO1xuaW1wb3J0IHsgRmlsZUFuYWx5c2lzU2VydmljZSB9IGZyb20gJy4vRmlsZUFuYWx5c2lzU2VydmljZSc7XG5pbXBvcnQgeyBBcmVhQ3JlYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9BcmVhQ3JlYXRpb25TZXJ2aWNlJztcbmltcG9ydCB7IERhdGF2aWV3QWRhcHRlciB9IGZyb20gJy4vRGF0YXZpZXdBZGFwdGVyJztcblxuZXhwb3J0IGNsYXNzIEJ1dHRvblNlcnZpY2Uge1xuXHRwcml2YXRlIGJ1dHRvbk1hcDogV2Vha01hcDxIVE1MRWxlbWVudCwgSFRNTEJ1dHRvbkVsZW1lbnQ+ID0gbmV3IFdlYWtNYXAoKTtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIGFwcDogQXBwLFxuXHRcdHByaXZhdGUgc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5ncyxcblx0XHRwcml2YXRlIG5vdGlmaWNhdGlvblNlcnZpY2U6IE5vdGlmaWNhdGlvblNlcnZpY2UsXG5cdFx0cHJpdmF0ZSBmaWxlQW5hbHlzaXNTZXJ2aWNlOiBGaWxlQW5hbHlzaXNTZXJ2aWNlLFxuXHRcdHByaXZhdGUgYXJlYUNyZWF0aW9uU2VydmljZTogQXJlYUNyZWF0aW9uU2VydmljZSxcblx0XHRwcml2YXRlIGRhdGF2aWV3QWRhcHRlcjogRGF0YXZpZXdBZGFwdGVyXG5cdCkge31cblxuXHQvKipcblx0ICogVXBkYXRlIHNldHRpbmdzIHJlZmVyZW5jZVxuXHQgKi9cblx0dXBkYXRlU2V0dGluZ3Moc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5ncyk6IHZvaWQge1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYnV0dG9uIHRvIGEgc3BlY2lmaWMgdmlld1xuXHQgKi9cblx0YXN5bmMgYWRkQnV0dG9uVG9WaWV3KHZpZXc6IE1hcmtkb3duVmlldyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XG5cdFx0XHR0aGlzLmxvZygnTm8gdmFsaWQgdmlldyBvciBmaWxlIGZvdW5kJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgZmlsZUNvbnRleHQgPSB0aGlzLmNyZWF0ZUZpbGVDb250ZXh0KHZpZXcpO1xuXHRcdHRoaXMubG9nKGBBZGRpbmcgYnV0dG9uIHRvIHZpZXc6ICR7ZmlsZUNvbnRleHQuZmlsZU5hbWV9YCk7XG5cblx0XHRjb25zdCBjb250ZW50RWwgPSB2aWV3LmNvbnRlbnRFbDtcblx0XHRcblx0XHQvLyBDaGVjayBpZiBidXR0b24gYWxyZWFkeSBleGlzdHNcblx0XHRpZiAodGhpcy5idXR0b25FeGlzdHMoY29udGVudEVsKSkge1xuXHRcdFx0dGhpcy5sb2coJ0J1dHRvbiBhbHJlYWR5IGV4aXN0cyBpbiB0aGlzIHZpZXcnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBSZW1vdmUgYW55IG9sZCBidXR0b25zXG5cdFx0dGhpcy5yZW1vdmVFeGlzdGluZ0J1dHRvbnMoY29udGVudEVsKTtcblxuXHRcdC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gZW1zX19BcmVhIGFuZCBjcmVhdGUgYXBwcm9wcmlhdGUgYnV0dG9uXG5cdFx0Y29uc3QgaXNFbXNBcmVhID0gYXdhaXQgdGhpcy5pc0Vtc0FyZWFGaWxlKHZpZXcpO1xuXHRcdGNvbnN0IGJ1dHRvbkNvbmZpZyA9IHRoaXMuY3JlYXRlQnV0dG9uQ29uZmlnKGlzRW1zQXJlYSk7XG5cdFx0Y29uc3QgYnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oYnV0dG9uQ29uZmlnLCBmaWxlQ29udGV4dCwgaXNFbXNBcmVhKTtcblx0XHR0aGlzLmluc2VydEJ1dHRvbihjb250ZW50RWwsIGJ1dHRvbiwgYnV0dG9uQ29uZmlnLnBvc2l0aW9uKTtcblxuXHRcdC8vIFN0b3JlIHJlZmVyZW5jZVxuXHRcdHRoaXMuYnV0dG9uTWFwLnNldChjb250ZW50RWwsIGJ1dHRvbik7XG5cdFx0dGhpcy5sb2coJ0J1dHRvbiBzdWNjZXNzZnVsbHkgYWRkZWQnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYWxsIGJ1dHRvbnMgZnJvbSB0aGUgY3VycmVudCB2aWV3XG5cdCAqL1xuXHRyZW1vdmVCdXR0b25zRnJvbVZpZXcodmlldzogTWFya2Rvd25WaWV3KTogdm9pZCB7XG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XG5cblx0XHRjb25zdCBjb250ZW50RWwgPSB2aWV3LmNvbnRlbnRFbDtcblx0XHR0aGlzLnJlbW92ZUV4aXN0aW5nQnV0dG9ucyhjb250ZW50RWwpO1xuXHRcdHRoaXMuYnV0dG9uTWFwLmRlbGV0ZShjb250ZW50RWwpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFuIHVwIGFsbCBidXR0b25zXG5cdCAqL1xuXHRjbGVhbnVwKCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucHJpbnQtdGl0bGUtY29udGFpbmVyJyk7XG5cdFx0dGhpcy5sb2coYFJlbW92aW5nICR7Y29udGFpbmVycy5sZW5ndGh9IGJ1dHRvbiBjb250YWluZXJzYCk7XG5cdFx0Y29udGFpbmVycy5mb3JFYWNoKGVsID0+IGVsLnJlbW92ZSgpKTtcblx0XHR0aGlzLmJ1dHRvbk1hcCA9IG5ldyBXZWFrTWFwKCk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUZpbGVDb250ZXh0KHZpZXc6IE1hcmtkb3duVmlldyk6IEZpbGVDb250ZXh0IHtcblx0XHRjb25zdCBjYWNoZSA9IHZpZXcuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHZpZXcuZmlsZSEpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRmaWxlOiB2aWV3LmZpbGUhLFxuXHRcdFx0ZmlsZU5hbWU6IHZpZXcuZmlsZSEubmFtZSxcblx0XHRcdGZpbGVQYXRoOiB2aWV3LmZpbGUhLnBhdGgsXG5cdFx0XHRmcm9udG1hdHRlcjogY2FjaGU/LmZyb250bWF0dGVyXG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQnV0dG9uQ29uZmlnKGlzRW1zQXJlYTogYm9vbGVhbiA9IGZhbHNlKTogQnV0dG9uQ29uZmlnIHtcblx0XHRsZXQgZGlzcGxheVRleHQ6IHN0cmluZztcblx0XHRsZXQgYnV0dG9uQ2xhc3M6IHN0cmluZztcblxuXHRcdGlmIChpc0Vtc0FyZWEpIHtcblx0XHRcdC8vIFNwZWNpYWwgYnV0dG9uIGZvciBlbXNfX0FyZWEgZmlsZXNcblx0XHRcdGRpc3BsYXlUZXh0ID0gdGhpcy5zZXR0aW5ncy5zaG93SWNvbiBcblx0XHRcdFx0PyBg8J+Pl++4jyBDcmVhdGUgQ2hpbGQgQXJlYWBcblx0XHRcdFx0OiAnQ3JlYXRlIENoaWxkIEFyZWEnO1xuXHRcdFx0YnV0dG9uQ2xhc3MgPSAncHJpbnQtdGl0bGUtYnV0dG9uIGFyZWEtY3JlYXRlLWJ1dHRvbic7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFN0YW5kYXJkIHByaW50IHRpdGxlIGJ1dHRvblxuXHRcdFx0ZGlzcGxheVRleHQgPSB0aGlzLnNldHRpbmdzLnNob3dJY29uIFxuXHRcdFx0XHQ/IGAke3RoaXMuc2V0dGluZ3MuYnV0dG9uSWNvbn0gJHt0aGlzLnNldHRpbmdzLmJ1dHRvblRleHR9YC50cmltKClcblx0XHRcdFx0OiB0aGlzLnNldHRpbmdzLmJ1dHRvblRleHQ7XG5cdFx0XHRidXR0b25DbGFzcyA9ICdwcmludC10aXRsZS1idXR0b24nO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0OiBkaXNwbGF5VGV4dCxcblx0XHRcdGljb246IHRoaXMuc2V0dGluZ3Muc2hvd0ljb24gPyB0aGlzLnNldHRpbmdzLmJ1dHRvbkljb24gOiB1bmRlZmluZWQsXG5cdFx0XHRwb3NpdGlvbjogdGhpcy5zZXR0aW5ncy5idXR0b25Qb3NpdGlvbixcblx0XHRcdGNsYXNzTmFtZTogYnV0dG9uQ2xhc3Ncblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBidXR0b25FeGlzdHMoY29udGVudEVsOiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGV4aXN0aW5nQnV0dG9uID0gdGhpcy5idXR0b25NYXAuZ2V0KGNvbnRlbnRFbCk7XG5cdFx0cmV0dXJuICEhKGV4aXN0aW5nQnV0dG9uICYmIGNvbnRlbnRFbC5jb250YWlucyhleGlzdGluZ0J1dHRvbikpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVFeGlzdGluZ0J1dHRvbnMoY29udGVudEVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdGNvbnN0IG9sZENvbnRhaW5lcnMgPSBjb250ZW50RWwucXVlcnlTZWxlY3RvckFsbCgnLnByaW50LXRpdGxlLWNvbnRhaW5lcicpO1xuXHRcdG9sZENvbnRhaW5lcnMuZm9yRWFjaChjb250YWluZXIgPT4gY29udGFpbmVyLnJlbW92ZSgpKTtcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQnV0dG9uKGNvbmZpZzogQnV0dG9uQ29uZmlnLCBjb250ZXh0OiBGaWxlQ29udGV4dCwgaXNFbXNBcmVhOiBib29sZWFuID0gZmFsc2UpOiBIVE1MQnV0dG9uRWxlbWVudCB7XG5cdFx0Ly8gQ3JlYXRlIGJ1dHRvbiBjb250YWluZXJcblx0XHRjb25zdCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRidXR0b25Db250YWluZXIuY2xhc3NOYW1lID0gJ3ByaW50LXRpdGxlLWNvbnRhaW5lcic7XG5cdFx0dGhpcy5zdHlsZUNvbnRhaW5lcihidXR0b25Db250YWluZXIsIGNvbmZpZy5wb3NpdGlvbiwgY29udGV4dCk7XG5cblx0XHQvLyBDcmVhdGUgdGhlIGJ1dHRvblxuXHRcdGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXHRcdGJ1dHRvbi50ZXh0Q29udGVudCA9IGNvbmZpZy50ZXh0O1xuXHRcdGJ1dHRvbi5jbGFzc05hbWUgPSBjb25maWcuY2xhc3NOYW1lO1xuXHRcdHRoaXMuc3R5bGVCdXR0b24oYnV0dG9uKTtcblxuXHRcdC8vIEFkZCBjbGljayBoYW5kbGVyXG5cdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHRoaXMuaGFuZGxlQnV0dG9uQ2xpY2soZSwgY29udGV4dCwgaXNFbXNBcmVhKSk7XG5cblx0XHQvLyBBZGQgaG92ZXIgZWZmZWN0c1xuXHRcdHRoaXMuYWRkSG92ZXJFZmZlY3RzKGJ1dHRvbik7XG5cblx0XHRidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcblx0XHRyZXR1cm4gYnV0dG9uO1xuXHR9XG5cblx0cHJpdmF0ZSBzdHlsZUNvbnRhaW5lcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBwb3NpdGlvbjogc3RyaW5nLCBjb250ZXh0OiBGaWxlQ29udGV4dCk6IHZvaWQge1xuXHRcdGNvbnN0IGhhc0Zyb250bWF0dGVyID0gISEoY29udGV4dC5mcm9udG1hdHRlciAmJiBPYmplY3Qua2V5cyhjb250ZXh0LmZyb250bWF0dGVyKS5sZW5ndGggPiAwKTtcblx0XHRcblx0XHRpZiAocG9zaXRpb24gPT09ICdhZnRlci1mcm9udG1hdHRlcicgJiYgaGFzRnJvbnRtYXR0ZXIpIHtcblx0XHRcdGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gYFxuXHRcdFx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdFx0XHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0XHRcdFx0bWFyZ2luOiAxNnB4IDA7XG5cdFx0XHRcdHBhZGRpbmc6IDhweCAyMHB4O1xuXHRcdFx0XHRib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuXHRcdFx0XHRib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuXHRcdFx0XHRiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG5cdFx0XHRgO1xuXHRcdH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICd0b3AtcmlnaHQnIHx8IChwb3NpdGlvbiA9PT0gJ2FmdGVyLWZyb250bWF0dGVyJyAmJiAhaGFzRnJvbnRtYXR0ZXIpKSB7XG5cdFx0XHRjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdFx0XHR0b3A6IDIwcHg7XG5cdFx0XHRcdHJpZ2h0OiAyMHB4O1xuXHRcdFx0XHR6LWluZGV4OiAxMDA7XG5cdFx0XHRcdGRpc3BsYXk6IGZsZXg7XG5cdFx0XHRcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXHRcdFx0YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYm90dG9tIHBvc2l0aW9uXG5cdFx0XHRjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdFx0ZGlzcGxheTogZmxleDtcblx0XHRcdFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cdFx0XHRcdG1hcmdpbjogMjBweCAwO1xuXHRcdFx0XHRwYWRkaW5nOiAxMHB4O1xuXHRcdFx0YDtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHN0eWxlQnV0dG9uKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiB2b2lkIHtcblx0XHRidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcblx0XHRcdGJhY2tncm91bmQ6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCwgIzhiNWNmNik7XG5cdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1vbi1hY2NlbnQsIHdoaXRlKTtcblx0XHRcdGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCk7XG5cdFx0XHRib3JkZXItcmFkaXVzOiA2cHg7XG5cdFx0XHRwYWRkaW5nOiA4cHggMTZweDtcblx0XHRcdGZvbnQtc2l6ZTogMTNweDtcblx0XHRcdGZvbnQtd2VpZ2h0OiA1MDA7XG5cdFx0XHRjdXJzb3I6IHBvaW50ZXI7XG5cdFx0XHR0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXHRcdFx0Ym94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcblx0XHRcdC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcblx0XHRcdGFwcGVhcmFuY2U6IG5vbmU7XG5cdFx0YDtcblx0fVxuXG5cdHByaXZhdGUgYWRkSG92ZXJFZmZlY3RzKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiB2b2lkIHtcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcblx0XHRcdGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlciwgIzdjM2FlZCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC0xcHgpJztcblx0XHRcdGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpJztcblx0XHR9KTtcblxuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSAndmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LCAjOGI1Y2Y2KSc7XG5cdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuXHRcdFx0YnV0dG9uLnN0eWxlLmJveFNoYWRvdyA9ICcwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjEpJztcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlQnV0dG9uQ2xpY2soZXZlbnQ6IEV2ZW50LCBjb250ZXh0OiBGaWxlQ29udGV4dCwgaXNFbXNBcmVhOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5sb2coYEJ1dHRvbiBjbGlja2VkIGZvciBmaWxlOiAke2NvbnRleHQuZmlsZU5hbWV9LCBpc0Vtc0FyZWE6ICR7aXNFbXNBcmVhfWApO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChpc0Vtc0FyZWEpIHtcblx0XHRcdFx0Ly8gSGFuZGxlIGVtc19fQXJlYSBzcGVjaWZpYyBhY3Rpb24gLSBjcmVhdGUgY2hpbGQgYXJlYVxuXHRcdFx0XHRhd2FpdCB0aGlzLmhhbmRsZUFyZWFBY3Rpb24oY29udGV4dCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBIYW5kbGUgc3RhbmRhcmQgcHJpbnQgdGl0bGUgYWN0aW9uXG5cdFx0XHRcdGF3YWl0IHRoaXMuaGFuZGxlUHJpbnRUaXRsZUFjdGlvbihjb250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVmlzdWFsIGZlZWRiYWNrIHdpdGggYW5pbWF0aW9uXG5cdFx0XHRjb25zdCBidXR0b24gPSBldmVudC50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5hbmltYXRlQnV0dG9uKSB7XG5cdFx0XHRcdGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUoMC45NSknO1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRidXR0b24uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuXHRcdFx0XHR9LCAxNTApO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHR0aGlzLmxvZygnRXJyb3IgaGFuZGxpbmcgYnV0dG9uIGNsaWNrOicsIGVycm9yKTtcblx0XHRcdHRoaXMubm90aWZpY2F0aW9uU2VydmljZS5zaG93RXJyb3IoJ0ZhaWxlZCB0byBwcm9jZXNzIGFjdGlvbicpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZW1zX19BcmVhIHNwZWNpZmljIGFjdGlvbnNcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlQXJlYUFjdGlvbihjb250ZXh0OiBGaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMubG9nKCdIYW5kbGluZyBhcmVhIGFjdGlvbiAtIGNyZWF0aW5nIGNoaWxkIGFyZWEnKTtcblxuXHRcdC8vIENvbnZlcnQgdG8gRXhvRmlsZUNvbnRleHRcblx0XHRjb25zdCBleG9Db250ZXh0OiBFeG9GaWxlQ29udGV4dCA9IHtcblx0XHRcdGZpbGVOYW1lOiBjb250ZXh0LmZpbGVOYW1lLFxuXHRcdFx0ZmlsZVBhdGg6IGNvbnRleHQuZmlsZVBhdGgsXG5cdFx0XHRmaWxlOiBjb250ZXh0LmZpbGUsXG5cdFx0XHRmcm9udG1hdHRlcjogY29udGV4dC5mcm9udG1hdHRlcixcblx0XHRcdGN1cnJlbnRQYWdlOiB7XG5cdFx0XHRcdGZpbGU6IHtcblx0XHRcdFx0XHRwYXRoOiBjb250ZXh0LmZpbGUucGF0aCxcblx0XHRcdFx0XHRuYW1lOiBjb250ZXh0LmZpbGUubmFtZSxcblx0XHRcdFx0XHRsaW5rOiBudWxsLFxuXHRcdFx0XHRcdG10aW1lOiBuZXcgRGF0ZShjb250ZXh0LmZpbGUuc3RhdC5tdGltZSlcblx0XHRcdFx0fSxcblx0XHRcdFx0J2V4b19fSW5zdGFuY2VfY2xhc3MnOiBjb250ZXh0LmZyb250bWF0dGVyPy5bJ2V4b19fSW5zdGFuY2VfY2xhc3MnXSB8fCBbXSxcblx0XHRcdFx0Li4uY29udGV4dC5mcm9udG1hdHRlclxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRhd2FpdCB0aGlzLmFyZWFDcmVhdGlvblNlcnZpY2UuY3JlYXRlQ2hpbGRBcmVhKGV4b0NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBzdGFuZGFyZCBwcmludCB0aXRsZSBhY3Rpb25cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlUHJpbnRUaXRsZUFjdGlvbihjb250ZXh0OiBGaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIFNob3cgZW5oYW5jZWQgbm90aWZpY2F0aW9uXG5cdFx0aWYgKHRoaXMuc2V0dGluZ3Muc2hvd0VuaGFuY2VkSW5mbykge1xuXHRcdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlLnNob3dUaXRsZU5vdGlmaWNhdGlvbihjb250ZXh0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gU2ltcGxlIG5vdGlmaWNhdGlvblxuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGAke3RoaXMuc2V0dGluZ3Muc2hvd0ljb24gPyAn8J+ThCAnIDogJyd9JHtjb250ZXh0LmZpbGUuYmFzZW5hbWV9YDtcblx0XHRcdHRoaXMubm90aWZpY2F0aW9uU2VydmljZS5zaG93SW5mbyhtZXNzYWdlLnJlcGxhY2UoJ+KEue+4jyAnLCAnJykpO1xuXHRcdH1cblxuXHRcdC8vIExvZyBmaWxlIGFuYWx5c2lzIGlmIGRlYnVnIG1vZGUgaXMgZW5hYmxlZFxuXHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSAmJiB0aGlzLnNldHRpbmdzLnNob3dGaWxlU3RhdHMpIHtcblx0XHRcdGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgdGhpcy5maWxlQW5hbHlzaXNTZXJ2aWNlLmFuYWx5emVGaWxlKGNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc3RhdHMgPSB0aGlzLmZpbGVBbmFseXNpc1NlcnZpY2UuZ2V0RmlsZVN0YXRzKGFuYWx5c2lzKTtcblx0XHRcdHRoaXMubG9nKGBGaWxlIHN0YXRzOiAke3N0YXRzLmpvaW4oJywgJyl9YCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBpbnNlcnRCdXR0b24oY29udGVudEVsOiBIVE1MRWxlbWVudCwgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCwgcG9zaXRpb246IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRhaW5lciA9IGJ1dHRvbi5wYXJlbnRFbGVtZW50ITtcblxuXHRcdGlmIChwb3NpdGlvbiA9PT0gJ2FmdGVyLWZyb250bWF0dGVyJykge1xuXHRcdFx0Y29uc3QgZnJvbnRtYXR0ZXJFbGVtZW50ID0gdGhpcy5maW5kRnJvbnRtYXR0ZXJJbnNlcnRpb25Qb2ludChjb250ZW50RWwpO1xuXHRcdFx0aWYgKGZyb250bWF0dGVyRWxlbWVudCkge1xuXHRcdFx0XHRmcm9udG1hdHRlckVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNvbnRhaW5lcik7XG5cdFx0XHRcdHRoaXMubG9nKCdCdXR0b24gaW5zZXJ0ZWQgYWZ0ZXIgZnJvbnRtYXR0ZXInKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEZhbGxiYWNrIHBvc2l0aW9uc1xuXHRcdGlmIChwb3NpdGlvbiA9PT0gJ3RvcC1yaWdodCcgfHwgcG9zaXRpb24gPT09ICdhZnRlci1mcm9udG1hdHRlcicpIHtcblx0XHRcdGNvbnN0IGZpcnN0Q2hpbGQgPSBjb250ZW50RWwuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0XHRpZiAoZmlyc3RDaGlsZCkge1xuXHRcdFx0XHRmaXJzdENoaWxkLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCBjb250YWluZXIpO1xuXHRcdFx0XHR0aGlzLmxvZygnQnV0dG9uIGluc2VydGVkIGF0IHRvcCBvZiBjb250ZW50Jyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250ZW50RWwuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblx0XHRcdFx0dGhpcy5sb2coJ0J1dHRvbiBhcHBlbmRlZCB0byBlbXB0eSBjb250ZW50Jyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGJvdHRvbSBwb3NpdGlvblxuXHRcdFx0Y29udGVudEVsLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cdFx0XHR0aGlzLmxvZygnQnV0dG9uIGFwcGVuZGVkIGF0IGJvdHRvbScpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgZmluZEZyb250bWF0dGVySW5zZXJ0aW9uUG9pbnQoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcblx0XHR0aGlzLmxvZygnTG9va2luZyBmb3IgZnJvbnRtYXR0ZXIgaW5zZXJ0aW9uIHBvaW50Li4uJyk7XG5cblx0XHRjb25zdCBmcm9udG1hdHRlclNlbGVjdG9ycyA9IFtcblx0XHRcdCcubWV0YWRhdGEtcHJvcGVydGllcy1jb250YWluZXInLFxuXHRcdFx0Jy5tZXRhZGF0YS1jb250YWluZXInLFxuXHRcdFx0Jy5mcm9udG1hdHRlci1jb250YWluZXInLFxuXHRcdFx0Jy5wcm9wZXJ0eS1jb250YWluZXInLFxuXHRcdFx0Jy5tZXRhZGF0YS1wcm9wZXJ0eS1jb250YWluZXInLFxuXHRcdFx0Jy5kb2N1bWVudC1wcm9wZXJ0aWVzJyxcblx0XHRcdCcubWFya2Rvd24tcHJvcGVydGllcycsXG5cdFx0XHQnLmZyb250bWF0dGVyJyxcblx0XHRcdCdbZGF0YS1wcm9wZXJ0eV0nXG5cdFx0XTtcblxuXHRcdGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgZnJvbnRtYXR0ZXJTZWxlY3RvcnMpIHtcblx0XHRcdGNvbnN0IGVsZW1lbnRzID0gY29udGFpbmVyRWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdFx0XHRpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zdCBsYXN0RWxlbWVudCA9IGVsZW1lbnRzW2VsZW1lbnRzLmxlbmd0aCAtIDFdIGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHR0aGlzLmxvZyhgRm91bmQgZnJvbnRtYXR0ZXIgd2l0aCBzZWxlY3RvcjogJHtzZWxlY3Rvcn1gKTtcblx0XHRcdFx0cmV0dXJuIGxhc3RFbGVtZW50O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEZhbGxiYWNrOiBsb29rIGZvciBlbGVtZW50cyB0aGF0IGxvb2sgbGlrZSBwcm9wZXJ0aWVzXG5cdFx0Y29uc3QgYWxsRGl2cyA9IEFycmF5LmZyb20oY29udGFpbmVyRWwucXVlcnlTZWxlY3RvckFsbCgnZGl2JykpO1xuXHRcdGZvciAoY29uc3QgZGl2IG9mIGFsbERpdnMpIHtcblx0XHRcdGNvbnN0IGNsYXNzTmFtZSA9IGRpdi5jbGFzc05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdGNvbnN0IHRleHRDb250ZW50ID0gKGRpdi50ZXh0Q29udGVudCB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0aWYgKGNsYXNzTmFtZS5pbmNsdWRlcygnbWV0YWRhdGEnKSB8fCBcblx0XHRcdFx0Y2xhc3NOYW1lLmluY2x1ZGVzKCdwcm9wZXJ0eScpIHx8XG5cdFx0XHRcdHRleHRDb250ZW50LmluY2x1ZGVzKCd0YWdzOicpIHx8XG5cdFx0XHRcdHRleHRDb250ZW50LmluY2x1ZGVzKCd0aXRsZTonKSB8fFxuXHRcdFx0XHRkaXYuaGFzQXR0cmlidXRlKCdkYXRhLXByb3BlcnR5JykpIHtcblx0XHRcdFx0dGhpcy5sb2coJ0ZvdW5kIGZyb250bWF0dGVyLWxpa2UgZWxlbWVudDonLCBkaXYuY2xhc3NOYW1lKTtcblx0XHRcdFx0cmV0dXJuIGRpdiBhcyBIVE1MRWxlbWVudDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmxvZygnTm8gZnJvbnRtYXR0ZXIgZm91bmQnKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgY3VycmVudCBmaWxlIGlzIGFuIGVtc19fQXJlYSBhc3NldFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBpc0Vtc0FyZWFGaWxlKHZpZXc6IE1hcmtkb3duVmlldyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmICghdmlldyB8fCAhdmlldy5maWxlKSByZXR1cm4gZmFsc2U7XG5cblx0XHR0cnkge1xuXHRcdFx0Ly8gR2V0IGZpbGUgY2FjaGUgdG8gY2hlY2sgZnJvbnRtYXR0ZXJcblx0XHRcdGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUodmlldy5maWxlKTtcblx0XHRcdGNvbnN0IGZyb250bWF0dGVyID0gY2FjaGU/LmZyb250bWF0dGVyO1xuXHRcdFx0XG5cdFx0XHRpZiAoIWZyb250bWF0dGVyIHx8ICFmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgaW5zdGFuY2VDbGFzc2VzID0gQXJyYXkuaXNBcnJheShmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddKSBcblx0XHRcdFx0PyBmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddIFxuXHRcdFx0XHQ6IFtmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddXTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgYW55IG9mIHRoZSBpbnN0YW5jZSBjbGFzc2VzIGNvbnRhaW5zICdlbXNfX0FyZWEnXG5cdFx0XHRyZXR1cm4gaW5zdGFuY2VDbGFzc2VzLnNvbWUoKGNsczogYW55KSA9PiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY2xzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdHJldHVybiBjbHMuaW5jbHVkZXMoJ2Vtc19fQXJlYScpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNscyAmJiBjbHMucGF0aCkge1xuXHRcdFx0XHRcdHJldHVybiBjbHMucGF0aC5pbmNsdWRlcygnZW1zX19BcmVhJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMubG9nKCdFcnJvciBjaGVja2luZyBpZiBmaWxlIGlzIGVtc19fQXJlYTonLCBlcnJvcik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSkge1xuXHRcdFx0Y29uc29sZS5sb2coYFtQcmludFRpdGxlXSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG5cdFx0fVxuXHR9XG59Il19