"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const types_1 = require("./types");
const ButtonService_1 = require("./services/ButtonService");
const ViewManager_1 = require("./services/ViewManager");
const SettingsService_1 = require("./services/SettingsService");
const NotificationService_1 = require("./services/NotificationService");
const FileAnalysisService_1 = require("./services/FileAnalysisService");
const DataviewAdapter_1 = require("./services/DataviewAdapter");
const AreaLayoutService_1 = require("./services/AreaLayoutService");
const AreaCreationService_1 = require("./services/AreaCreationService");
class PrintTitlePlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.customStyleEl = null;
    }
    async onload() {
        this.log('Loading Print Title Plugin v2.0.0...');
        // Load settings
        await this.loadSettings();
        // Initialize services
        this.notificationService = new NotificationService_1.NotificationService(this.settings);
        this.fileAnalysisService = new FileAnalysisService_1.FileAnalysisService(this.app, this.settings);
        this.dataviewAdapter = new DataviewAdapter_1.DataviewAdapter(this.app);
        this.areaLayoutService = new AreaLayoutService_1.AreaLayoutService(this.app, this.settings);
        this.areaCreationService = new AreaCreationService_1.AreaCreationService(this.app, this.settings);
        this.buttonService = new ButtonService_1.ButtonService(this.app, this.settings, this.notificationService, this.fileAnalysisService, this.areaCreationService, this.dataviewAdapter);
        this.viewManager = new ViewManager_1.ViewManager(this.app, this.buttonService, this.settings);
        // Register settings tab
        this.addSettingTab(new SettingsService_1.PrintTitleSettingTab(this.app, this));
        // Register event handlers
        this.registerEventHandlers();
        // Apply custom styles
        this.applyCustomStyles();
        // Expose global API for dataviewjs integration
        this.exposeGlobalAPI();
        // Add buttons to existing views after initialization
        setTimeout(() => {
            this.log('Adding buttons to existing notes');
            this.viewManager.addButtonToAllViews();
        }, 1000);
        this.log('Plugin loaded successfully');
    }
    onunload() {
        var _a;
        this.log('Unloading Print Title Plugin...');
        // Clean up all buttons and services
        (_a = this.viewManager) === null || _a === void 0 ? void 0 : _a.cleanup();
        // Remove custom styles
        if (this.customStyleEl) {
            this.customStyleEl.remove();
            this.customStyleEl = null;
        }
        this.log('Plugin unloaded');
    }
    /**
     * Register all event handlers
     */
    registerEventHandlers() {
        // File open event
        this.registerEvent(this.app.workspace.on('file-open', (file) => {
            this.viewManager.onFileOpen(file);
        }));
        // Active leaf change event
        this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => {
            this.viewManager.onActiveLeafChange(leaf);
        }));
        // Layout change event (when switching between edit/preview mode)
        this.registerEvent(this.app.workspace.on('layout-change', () => {
            this.viewManager.onLayoutChange();
        }));
        // Workspace resize event
        this.registerEvent(this.app.workspace.on('resize', () => {
            // Refresh buttons after resize with a small delay
            setTimeout(() => {
                this.viewManager.refreshAllButtons();
            }, 200);
        }));
        this.log('Event handlers registered');
    }
    /**
     * Load plugin settings
     */
    async loadSettings() {
        this.settings = Object.assign({}, types_1.DEFAULT_SETTINGS, await this.loadData());
    }
    /**
     * Save plugin settings
     */
    async saveSettings() {
        var _a, _b, _c, _d, _e, _f;
        await this.saveData(this.settings);
        // Update services with new settings
        (_a = this.notificationService) === null || _a === void 0 ? void 0 : _a.updateSettings(this.settings);
        (_b = this.fileAnalysisService) === null || _b === void 0 ? void 0 : _b.updateSettings(this.settings);
        (_c = this.areaLayoutService) === null || _c === void 0 ? void 0 : _c.updateSettings(this.settings);
        (_d = this.areaCreationService) === null || _d === void 0 ? void 0 : _d.updateSettings(this.settings);
        (_e = this.buttonService) === null || _e === void 0 ? void 0 : _e.updateSettings(this.settings);
        (_f = this.viewManager) === null || _f === void 0 ? void 0 : _f.updateSettings(this.settings);
        this.log('Settings saved and services updated');
    }
    /**
     * Get default settings
     */
    getDefaultSettings() {
        return { ...types_1.DEFAULT_SETTINGS };
    }
    /**
     * Refresh all buttons (used by settings)
     */
    refreshAllButtons() {
        var _a;
        (_a = this.viewManager) === null || _a === void 0 ? void 0 : _a.refreshAllButtons();
    }
    /**
     * Apply custom CSS styles
     */
    applyCustomStyles() {
        // Remove existing custom styles
        if (this.customStyleEl) {
            this.customStyleEl.remove();
            this.customStyleEl = null;
        }
        // Apply new custom styles if any
        if (this.settings.customCSS.trim()) {
            this.customStyleEl = document.createElement('style');
            this.customStyleEl.textContent = `
				/* Print Title Plugin Custom Styles */
				${this.settings.customCSS}
			`;
            document.head.appendChild(this.customStyleEl);
            this.log('Custom styles applied');
        }
        // Apply base styles
        this.applyBaseStyles();
    }
    /**
     * Apply base plugin styles
     */
    applyBaseStyles() {
        const existingStyle = document.querySelector('#print-title-base-styles');
        if (!existingStyle) {
            const styleEl = document.createElement('style');
            styleEl.id = 'print-title-base-styles';
            styleEl.textContent = `
				/* Print Title Plugin Base Styles */
				.print-title-container {
					z-index: 10;
				}
				
				.print-title-button {
					font-family: var(--font-interface);
					white-space: nowrap;
					outline: none;
					user-select: none;
					-webkit-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
				}
				
				.print-title-button:focus {
					outline: 2px solid var(--interactive-accent);
					outline-offset: 2px;
				}
				
				.print-title-button:active {
					transform: scale(0.95) !important;
				}
				
				/* Responsive adjustments */
				@media (max-width: 768px) {
					.print-title-container {
						margin: 12px 0;
						padding: 6px 16px;
					}
					
					.print-title-button {
						padding: 6px 12px;
						font-size: 12px;
					}
				}
				
				/* High contrast mode support */
				@media (prefers-contrast: high) {
					.print-title-button {
						border-width: 2px;
					}
				}
				
				/* Reduced motion support */
				@media (prefers-reduced-motion: reduce) {
					.print-title-button {
						transition: none;
					}
					
					.print-title-button:hover {
						transform: none;
					}
				}
			`;
            document.head.appendChild(styleEl);
        }
    }
    /**
     * Expose global API for dataviewjs integration
     */
    exposeGlobalAPI() {
        window.PrintTitleUI = {
            renderAreaLayout: async (dv, context) => {
                this.log('Global API: renderAreaLayout called');
                // Get current file context
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    console.error('[PrintTitle] No active file for area layout');
                    return;
                }
                // Check if this is an ems__Area
                const cache = this.app.metadataCache.getFileCache(activeFile);
                const frontmatter = cache === null || cache === void 0 ? void 0 : cache.frontmatter;
                if (!frontmatter || !frontmatter['exo__Instance_class']) {
                    dv.paragraph('This file is not an Exo asset.');
                    return;
                }
                const instanceClasses = Array.isArray(frontmatter['exo__Instance_class'])
                    ? frontmatter['exo__Instance_class']
                    : [frontmatter['exo__Instance_class']];
                const isArea = instanceClasses.some((cls) => { var _a; return typeof cls === 'string' ? cls.includes('ems__Area') : (_a = cls.path) === null || _a === void 0 ? void 0 : _a.includes('ems__Area'); });
                if (!isArea) {
                    dv.paragraph('This asset is not an ems__Area.');
                    return;
                }
                // Create file context
                const fileContext = {
                    fileName: activeFile.name,
                    filePath: activeFile.path,
                    file: activeFile,
                    frontmatter,
                    currentPage: {
                        file: {
                            path: activeFile.path,
                            name: activeFile.name,
                            link: null,
                            mtime: new Date(activeFile.stat.mtime)
                        },
                        'exo__Instance_class': frontmatter['exo__Instance_class'] || [],
                        ...frontmatter
                    }
                };
                // Get container element
                const container = dv.container;
                try {
                    await this.areaLayoutService.renderAreaLayout(container, fileContext);
                }
                catch (error) {
                    console.error('[PrintTitle] Error rendering area layout:', error);
                    dv.paragraph(`Error rendering area layout: ${error instanceof Error ? error.message : String(error)}`);
                }
            },
            createChildArea: async (parentContext) => {
                this.log('Global API: createChildArea called');
                await this.areaCreationService.createChildArea(parentContext);
            }
        };
        this.log('Global API exposed as window.PrintTitleUI');
    }
    /**
     * Debug logging
     */
    log(message, ...args) {
        var _a;
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.enableDebugMode) {
            console.log(`[PrintTitle] ${message}`, ...args);
        }
    }
}
exports.default = PrintTitlePlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBMkU7QUFDM0UsbUNBQStEO0FBQy9ELDREQUF5RDtBQUN6RCx3REFBcUQ7QUFDckQsZ0VBQWtFO0FBQ2xFLHdFQUFxRTtBQUNyRSx3RUFBcUU7QUFDckUsZ0VBQTZEO0FBQzdELG9FQUFpRTtBQUNqRSx3RUFBcUU7QUFFckUsTUFBcUIsZ0JBQWlCLFNBQVEsaUJBQU07SUFBcEQ7O1FBU1Msa0JBQWEsR0FBNEIsSUFBSSxDQUFDO0lBaVR2RCxDQUFDO0lBL1NBLEtBQUssQ0FBQyxNQUFNO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBRWpELGdCQUFnQjtRQUNoQixNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUxQixzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUkseUNBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHlDQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSx5Q0FBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FB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LE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hHLENBQUM7WUFDRixDQUFDO1lBRUQsZUFBZSxFQUFFLEtBQUssRUFBRSxhQUFrQixFQUFFLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQy9ELENBQUM7U0FDRCxDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUNLLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXOztRQUMxQyxJQUFJLE1BQUEsSUFBSSxDQUFDLFFBQVEsMENBQUUsZUFBZSxFQUFFLENBQUM7WUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsT0FBTyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0YsQ0FBQztDQUNEO0FBMVRELG1DQTBUQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgUGx1Z2luLCBURmlsZSwgV29ya3NwYWNlTGVhZiwgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgUHJpbnRUaXRsZVNldHRpbmdzLCBERUZBVUxUX1NFVFRJTkdTIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBCdXR0b25TZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9CdXR0b25TZXJ2aWNlJztcbmltcG9ydCB7IFZpZXdNYW5hZ2VyIH0gZnJvbSAnLi9zZXJ2aWNlcy9WaWV3TWFuYWdlcic7XG5pbXBvcnQgeyBQcmludFRpdGxlU2V0dGluZ1RhYiB9IGZyb20gJy4vc2VydmljZXMvU2V0dGluZ3NTZXJ2aWNlJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL05vdGlmaWNhdGlvblNlcnZpY2UnO1xuaW1wb3J0IHsgRmlsZUFuYWx5c2lzU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvRmlsZUFuYWx5c2lzU2VydmljZSc7XG5pbXBvcnQgeyBEYXRhdmlld0FkYXB0ZXIgfSBmcm9tICcuL3NlcnZpY2VzL0RhdGF2aWV3QWRhcHRlcic7XG5pbXBvcnQgeyBBcmVhTGF5b3V0U2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvQXJlYUxheW91dFNlcnZpY2UnO1xuaW1wb3J0IHsgQXJlYUNyZWF0aW9uU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvQXJlYUNyZWF0aW9uU2VydmljZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW50VGl0bGVQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5ncyE6IFByaW50VGl0bGVTZXR0aW5ncztcblx0cHJpdmF0ZSBidXR0b25TZXJ2aWNlITogQnV0dG9uU2VydmljZTtcblx0cHJpdmF0ZSB2aWV3TWFuYWdlciE6IFZpZXdNYW5hZ2VyO1xuXHRwcml2YXRlIG5vdGlmaWNhdGlvblNlcnZpY2UhOiBOb3RpZmljYXRpb25TZXJ2aWNlO1xuXHRwcml2YXRlIGZpbGVBbmFseXNpc1NlcnZpY2UhOiBGaWxlQW5hbHlzaXNTZXJ2aWNlO1xuXHRwcml2YXRlIGRhdGF2aWV3QWRhcHRlciE6IERhdGF2aWV3QWRhcHRlcjtcblx0cHJpdmF0ZSBhcmVhTGF5b3V0U2VydmljZSE6IEFyZWFMYXlvdXRTZXJ2aWNlO1xuXHRwcml2YXRlIGFyZWFDcmVhdGlvblNlcnZpY2UhOiBBcmVhQ3JlYXRpb25TZXJ2aWNlO1xuXHRwcml2YXRlIGN1c3RvbVN0eWxlRWw6IEhUTUxTdHlsZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0dGhpcy5sb2coJ0xvYWRpbmcgUHJpbnQgVGl0bGUgUGx1Z2luIHYyLjAuMC4uLicpO1xuXG5cdFx0Ly8gTG9hZCBzZXR0aW5nc1xuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIHNlcnZpY2VzXG5cdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlID0gbmV3IE5vdGlmaWNhdGlvblNlcnZpY2UodGhpcy5zZXR0aW5ncyk7XG5cdFx0dGhpcy5maWxlQW5hbHlzaXNTZXJ2aWNlID0gbmV3IEZpbGVBbmFseXNpc1NlcnZpY2UodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3MpO1xuXHRcdHRoaXMuZGF0YXZpZXdBZGFwdGVyID0gbmV3IERhdGF2aWV3QWRhcHRlcih0aGlzLmFwcCk7XG5cdFx0dGhpcy5hcmVhTGF5b3V0U2VydmljZSA9IG5ldyBBcmVhTGF5b3V0U2VydmljZSh0aGlzLmFwcCwgdGhpcy5zZXR0aW5ncyk7XG5cdFx0dGhpcy5hcmVhQ3JlYXRpb25TZXJ2aWNlID0gbmV3IEFyZWFDcmVhdGlvblNlcnZpY2UodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3MpO1xuXHRcdHRoaXMuYnV0dG9uU2VydmljZSA9IG5ldyBCdXR0b25TZXJ2aWNlKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzLCB0aGlzLm5vdGlmaWNhdGlvblNlcnZpY2UsIHRoaXMuZmlsZUFuYWx5c2lzU2VydmljZSwgdGhpcy5hcmVhQ3JlYXRpb25TZXJ2aWNlLCB0aGlzLmRhdGF2aWV3QWRhcHRlcik7XG5cdFx0dGhpcy52aWV3TWFuYWdlciA9IG5ldyBWaWV3TWFuYWdlcih0aGlzLmFwcCwgdGhpcy5idXR0b25TZXJ2aWNlLCB0aGlzLnNldHRpbmdzKTtcblxuXHRcdC8vIFJlZ2lzdGVyIHNldHRpbmdzIHRhYlxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUHJpbnRUaXRsZVNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuXHRcdC8vIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcblxuXHRcdC8vIEFwcGx5IGN1c3RvbSBzdHlsZXNcblx0XHR0aGlzLmFwcGx5Q3VzdG9tU3R5bGVzKCk7XG5cblx0XHQvLyBFeHBvc2UgZ2xvYmFsIEFQSSBmb3IgZGF0YXZpZXdqcyBpbnRlZ3JhdGlvblxuXHRcdHRoaXMuZXhwb3NlR2xvYmFsQVBJKCk7XG5cblx0XHQvLyBBZGQgYnV0dG9ucyB0byBleGlzdGluZyB2aWV3cyBhZnRlciBpbml0aWFsaXphdGlvblxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5sb2coJ0FkZGluZyBidXR0b25zIHRvIGV4aXN0aW5nIG5vdGVzJyk7XG5cdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLmFkZEJ1dHRvblRvQWxsVmlld3MoKTtcblx0XHR9LCAxMDAwKTtcblxuXHRcdHRoaXMubG9nKCdQbHVnaW4gbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0dGhpcy5sb2coJ1VubG9hZGluZyBQcmludCBUaXRsZSBQbHVnaW4uLi4nKTtcblx0XHRcblx0XHQvLyBDbGVhbiB1cCBhbGwgYnV0dG9ucyBhbmQgc2VydmljZXNcblx0XHR0aGlzLnZpZXdNYW5hZ2VyPy5jbGVhbnVwKCk7XG5cdFx0XG5cdFx0Ly8gUmVtb3ZlIGN1c3RvbSBzdHlsZXNcblx0XHRpZiAodGhpcy5jdXN0b21TdHlsZUVsKSB7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwucmVtb3ZlKCk7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMubG9nKCdQbHVnaW4gdW5sb2FkZWQnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhbGwgZXZlbnQgaGFuZGxlcnNcblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCk6IHZvaWQge1xuXHRcdC8vIEZpbGUgb3BlbiBldmVudFxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgKGZpbGU6IFRGaWxlIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLm9uRmlsZU9wZW4oZmlsZSk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cblx0XHQvLyBBY3RpdmUgbGVhZiBjaGFuZ2UgZXZlbnRcblx0XHR0aGlzLnJlZ2lzdGVyRXZlbnQoXG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2FjdGl2ZS1sZWFmLWNoYW5nZScsIChsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLm9uQWN0aXZlTGVhZkNoYW5nZShsZWFmKTtcblx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdC8vIExheW91dCBjaGFuZ2UgZXZlbnQgKHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZWRpdC9wcmV2aWV3IG1vZGUpXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdsYXlvdXQtY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLm9uTGF5b3V0Q2hhbmdlKCk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cblx0XHQvLyBXb3Jrc3BhY2UgcmVzaXplIGV2ZW50XG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdyZXNpemUnLCAoKSA9PiB7XG5cdFx0XHRcdC8vIFJlZnJlc2ggYnV0dG9ucyBhZnRlciByZXNpemUgd2l0aCBhIHNtYWxsIGRlbGF5XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMudmlld01hbmFnZXIucmVmcmVzaEFsbEJ1dHRvbnMoKTtcblx0XHRcdFx0fSwgMjAwKTtcblx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdHRoaXMubG9nKCdFdmVudCBoYW5kbGVycyByZWdpc3RlcmVkJyk7XG5cdH1cblxuXHQvKipcblx0ICogTG9hZCBwbHVnaW4gc2V0dGluZ3Ncblx0ICovXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIHBsdWdpbiBzZXR0aW5nc1xuXHQgKi9cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdFx0XG5cdFx0Ly8gVXBkYXRlIHNlcnZpY2VzIHdpdGggbmV3IHNldHRpbmdzXG5cdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlPy51cGRhdGVTZXR0aW5ncyh0aGlzLnNldHRpbmdzKTtcblx0XHR0aGlzLmZpbGVBbmFseXNpc1NlcnZpY2U/LnVwZGF0ZVNldHRpbmdzKHRoaXMuc2V0dGluZ3MpO1xuXHRcdHRoaXMuYXJlYUxheW91dFNlcnZpY2U/LnVwZGF0ZVNldHRpbmdzKHRoaXMuc2V0dGluZ3MpO1xuXHRcdHRoaXMuYXJlYUNyZWF0aW9uU2VydmljZT8udXBkYXRlU2V0dGluZ3ModGhpcy5zZXR0aW5ncyk7XG5cdFx0dGhpcy5idXR0b25TZXJ2aWNlPy51cGRhdGVTZXR0aW5ncyh0aGlzLnNldHRpbmdzKTtcblx0XHR0aGlzLnZpZXdNYW5hZ2VyPy51cGRhdGVTZXR0aW5ncyh0aGlzLnNldHRpbmdzKTtcblx0XHRcblx0XHR0aGlzLmxvZygnU2V0dGluZ3Mgc2F2ZWQgYW5kIHNlcnZpY2VzIHVwZGF0ZWQnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgZGVmYXVsdCBzZXR0aW5nc1xuXHQgKi9cblx0Z2V0RGVmYXVsdFNldHRpbmdzKCk6IFByaW50VGl0bGVTZXR0aW5ncyB7XG5cdFx0cmV0dXJuIHsgLi4uREVGQVVMVF9TRVRUSU5HUyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggYWxsIGJ1dHRvbnMgKHVzZWQgYnkgc2V0dGluZ3MpXG5cdCAqL1xuXHRyZWZyZXNoQWxsQnV0dG9ucygpOiB2b2lkIHtcblx0XHR0aGlzLnZpZXdNYW5hZ2VyPy5yZWZyZXNoQWxsQnV0dG9ucygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IGN1c3RvbSBDU1Mgc3R5bGVzXG5cdCAqL1xuXHRhcHBseUN1c3RvbVN0eWxlcygpOiB2b2lkIHtcblx0XHQvLyBSZW1vdmUgZXhpc3RpbmcgY3VzdG9tIHN0eWxlc1xuXHRcdGlmICh0aGlzLmN1c3RvbVN0eWxlRWwpIHtcblx0XHRcdHRoaXMuY3VzdG9tU3R5bGVFbC5yZW1vdmUoKTtcblx0XHRcdHRoaXMuY3VzdG9tU3R5bGVFbCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gQXBwbHkgbmV3IGN1c3RvbSBzdHlsZXMgaWYgYW55XG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuY3VzdG9tQ1NTLnRyaW0oKSkge1xuXHRcdFx0dGhpcy5jdXN0b21TdHlsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblx0XHRcdHRoaXMuY3VzdG9tU3R5bGVFbC50ZXh0Q29udGVudCA9IGBcblx0XHRcdFx0LyogUHJpbnQgVGl0bGUgUGx1Z2luIEN1c3RvbSBTdHlsZXMgKi9cblx0XHRcdFx0JHt0aGlzLnNldHRpbmdzLmN1c3RvbUNTU31cblx0XHRcdGA7XG5cdFx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRoaXMuY3VzdG9tU3R5bGVFbCk7XG5cdFx0XHR0aGlzLmxvZygnQ3VzdG9tIHN0eWxlcyBhcHBsaWVkJyk7XG5cdFx0fVxuXG5cdFx0Ly8gQXBwbHkgYmFzZSBzdHlsZXNcblx0XHR0aGlzLmFwcGx5QmFzZVN0eWxlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IGJhc2UgcGx1Z2luIHN0eWxlc1xuXHQgKi9cblx0cHJpdmF0ZSBhcHBseUJhc2VTdHlsZXMoKTogdm9pZCB7XG5cdFx0Y29uc3QgZXhpc3RpbmdTdHlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcmludC10aXRsZS1iYXNlLXN0eWxlcycpO1xuXHRcdGlmICghZXhpc3RpbmdTdHlsZSkge1xuXHRcdFx0Y29uc3Qgc3R5bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdFx0XHRzdHlsZUVsLmlkID0gJ3ByaW50LXRpdGxlLWJhc2Utc3R5bGVzJztcblx0XHRcdHN0eWxlRWwudGV4dENvbnRlbnQgPSBgXG5cdFx0XHRcdC8qIFByaW50IFRpdGxlIFBsdWdpbiBCYXNlIFN0eWxlcyAqL1xuXHRcdFx0XHQucHJpbnQtdGl0bGUtY29udGFpbmVyIHtcblx0XHRcdFx0XHR6LWluZGV4OiAxMDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LnByaW50LXRpdGxlLWJ1dHRvbiB7XG5cdFx0XHRcdFx0Zm9udC1mYW1pbHk6IHZhcigtLWZvbnQtaW50ZXJmYWNlKTtcblx0XHRcdFx0XHR3aGl0ZS1zcGFjZTogbm93cmFwO1xuXHRcdFx0XHRcdG91dGxpbmU6IG5vbmU7XG5cdFx0XHRcdFx0dXNlci1zZWxlY3Q6IG5vbmU7XG5cdFx0XHRcdFx0LXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcblx0XHRcdFx0XHQtbW96LXVzZXItc2VsZWN0OiBub25lO1xuXHRcdFx0XHRcdC1tcy11c2VyLXNlbGVjdDogbm9uZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LnByaW50LXRpdGxlLWJ1dHRvbjpmb2N1cyB7XG5cdFx0XHRcdFx0b3V0bGluZTogMnB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7XG5cdFx0XHRcdFx0b3V0bGluZS1vZmZzZXQ6IDJweDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LnByaW50LXRpdGxlLWJ1dHRvbjphY3RpdmUge1xuXHRcdFx0XHRcdHRyYW5zZm9ybTogc2NhbGUoMC45NSkgIWltcG9ydGFudDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LyogUmVzcG9uc2l2ZSBhZGp1c3RtZW50cyAqL1xuXHRcdFx0XHRAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcblx0XHRcdFx0XHQucHJpbnQtdGl0bGUtY29udGFpbmVyIHtcblx0XHRcdFx0XHRcdG1hcmdpbjogMTJweCAwO1xuXHRcdFx0XHRcdFx0cGFkZGluZzogNnB4IDE2cHg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC5wcmludC10aXRsZS1idXR0b24ge1xuXHRcdFx0XHRcdFx0cGFkZGluZzogNnB4IDEycHg7XG5cdFx0XHRcdFx0XHRmb250LXNpemU6IDEycHg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvKiBIaWdoIGNvbnRyYXN0IG1vZGUgc3VwcG9ydCAqL1xuXHRcdFx0XHRAbWVkaWEgKHByZWZlcnMtY29udHJhc3Q6IGhpZ2gpIHtcblx0XHRcdFx0XHQucHJpbnQtdGl0bGUtYnV0dG9uIHtcblx0XHRcdFx0XHRcdGJvcmRlci13aWR0aDogMnB4O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LyogUmVkdWNlZCBtb3Rpb24gc3VwcG9ydCAqL1xuXHRcdFx0XHRAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuXHRcdFx0XHRcdC5wcmludC10aXRsZS1idXR0b24ge1xuXHRcdFx0XHRcdFx0dHJhbnNpdGlvbjogbm9uZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0LnByaW50LXRpdGxlLWJ1dHRvbjpob3ZlciB7XG5cdFx0XHRcdFx0XHR0cmFuc2Zvcm06IG5vbmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRgO1xuXHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRXhwb3NlIGdsb2JhbCBBUEkgZm9yIGRhdGF2aWV3anMgaW50ZWdyYXRpb25cblx0ICovXG5cdHByaXZhdGUgZXhwb3NlR2xvYmFsQVBJKCk6IHZvaWQge1xuXHRcdCh3aW5kb3cgYXMgYW55KS5QcmludFRpdGxlVUkgPSB7XG5cdFx0XHRyZW5kZXJBcmVhTGF5b3V0OiBhc3luYyAoZHY6IGFueSwgY29udGV4dDogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMubG9nKCdHbG9iYWwgQVBJOiByZW5kZXJBcmVhTGF5b3V0IGNhbGxlZCcpO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gR2V0IGN1cnJlbnQgZmlsZSBjb250ZXh0XG5cdFx0XHRcdGNvbnN0IGFjdGl2ZUZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuXHRcdFx0XHRpZiAoIWFjdGl2ZUZpbGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdbUHJpbnRUaXRsZV0gTm8gYWN0aXZlIGZpbGUgZm9yIGFyZWEgbGF5b3V0Jyk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhpcyBpcyBhbiBlbXNfX0FyZWFcblx0XHRcdFx0Y29uc3QgY2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShhY3RpdmVGaWxlKTtcblx0XHRcdFx0Y29uc3QgZnJvbnRtYXR0ZXIgPSBjYWNoZT8uZnJvbnRtYXR0ZXI7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoIWZyb250bWF0dGVyIHx8ICFmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddKSB7XG5cdFx0XHRcdFx0ZHYucGFyYWdyYXBoKCdUaGlzIGZpbGUgaXMgbm90IGFuIEV4byBhc3NldC4nKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBpbnN0YW5jZUNsYXNzZXMgPSBBcnJheS5pc0FycmF5KGZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10pIFxuXHRcdFx0XHRcdD8gZnJvbnRtYXR0ZXJbJ2V4b19fSW5zdGFuY2VfY2xhc3MnXSBcblx0XHRcdFx0XHQ6IFtmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddXTtcblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IGlzQXJlYSA9IGluc3RhbmNlQ2xhc3Nlcy5zb21lKChjbHM6IGFueSkgPT4gXG5cdFx0XHRcdFx0dHlwZW9mIGNscyA9PT0gJ3N0cmluZycgPyBjbHMuaW5jbHVkZXMoJ2Vtc19fQXJlYScpIDogY2xzLnBhdGg/LmluY2x1ZGVzKCdlbXNfX0FyZWEnKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGlmICghaXNBcmVhKSB7XG5cdFx0XHRcdFx0ZHYucGFyYWdyYXBoKCdUaGlzIGFzc2V0IGlzIG5vdCBhbiBlbXNfX0FyZWEuJyk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ3JlYXRlIGZpbGUgY29udGV4dFxuXHRcdFx0XHRjb25zdCBmaWxlQ29udGV4dCA9IHtcblx0XHRcdFx0XHRmaWxlTmFtZTogYWN0aXZlRmlsZS5uYW1lLFxuXHRcdFx0XHRcdGZpbGVQYXRoOiBhY3RpdmVGaWxlLnBhdGgsXG5cdFx0XHRcdFx0ZmlsZTogYWN0aXZlRmlsZSxcblx0XHRcdFx0XHRmcm9udG1hdHRlcixcblx0XHRcdFx0XHRjdXJyZW50UGFnZToge1xuXHRcdFx0XHRcdFx0ZmlsZToge1xuXHRcdFx0XHRcdFx0XHRwYXRoOiBhY3RpdmVGaWxlLnBhdGgsXG5cdFx0XHRcdFx0XHRcdG5hbWU6IGFjdGl2ZUZpbGUubmFtZSxcblx0XHRcdFx0XHRcdFx0bGluazogbnVsbCxcblx0XHRcdFx0XHRcdFx0bXRpbWU6IG5ldyBEYXRlKGFjdGl2ZUZpbGUuc3RhdC5tdGltZSlcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHQnZXhvX19JbnN0YW5jZV9jbGFzcyc6IGZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10gfHwgW10sXG5cdFx0XHRcdFx0XHQuLi5mcm9udG1hdHRlclxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHQvLyBHZXQgY29udGFpbmVyIGVsZW1lbnRcblx0XHRcdFx0Y29uc3QgY29udGFpbmVyID0gZHYuY29udGFpbmVyO1xuXHRcdFx0XHRcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmFyZWFMYXlvdXRTZXJ2aWNlLnJlbmRlckFyZWFMYXlvdXQoY29udGFpbmVyLCBmaWxlQ29udGV4dCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignW1ByaW50VGl0bGVdIEVycm9yIHJlbmRlcmluZyBhcmVhIGxheW91dDonLCBlcnJvcik7XG5cdFx0XHRcdFx0ZHYucGFyYWdyYXBoKGBFcnJvciByZW5kZXJpbmcgYXJlYSBsYXlvdXQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRjcmVhdGVDaGlsZEFyZWE6IGFzeW5jIChwYXJlbnRDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0dGhpcy5sb2coJ0dsb2JhbCBBUEk6IGNyZWF0ZUNoaWxkQXJlYSBjYWxsZWQnKTtcblx0XHRcdFx0YXdhaXQgdGhpcy5hcmVhQ3JlYXRpb25TZXJ2aWNlLmNyZWF0ZUNoaWxkQXJlYShwYXJlbnRDb250ZXh0KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5sb2coJ0dsb2JhbCBBUEkgZXhwb3NlZCBhcyB3aW5kb3cuUHJpbnRUaXRsZVVJJyk7XG5cdH1cblxuXHQvKipcblx0ICogRGVidWcgbG9nZ2luZ1xuXHQgKi9cblx0cHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnNldHRpbmdzPy5lbmFibGVEZWJ1Z01vZGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBbUHJpbnRUaXRsZV0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuXHRcdH1cblx0fVxufSJdfQ==