"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const types_1 = require("./types");
const ButtonService_1 = require("./services/ButtonService");
const ViewManager_1 = require("./services/ViewManager");
const SettingsService_1 = require("./services/SettingsService");
const NotificationService_1 = require("./services/NotificationService");
const FileAnalysisService_1 = require("./services/FileAnalysisService");
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
        this.buttonService = new ButtonService_1.ButtonService(this.settings, this.notificationService, this.fileAnalysisService);
        this.viewManager = new ViewManager_1.ViewManager(this.app, this.buttonService, this.settings);
        // Register settings tab
        this.addSettingTab(new SettingsService_1.PrintTitleSettingTab(this.app, this));
        // Register event handlers
        this.registerEventHandlers();
        // Apply custom styles
        this.applyCustomStyles();
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
        var _a, _b, _c, _d;
        await this.saveData(this.settings);
        // Update services with new settings
        (_a = this.notificationService) === null || _a === void 0 ? void 0 : _a.updateSettings(this.settings);
        (_b = this.fileAnalysisService) === null || _b === void 0 ? void 0 : _b.updateSettings(this.settings);
        (_c = this.buttonService) === null || _c === void 0 ? void 0 : _c.updateSettings(this.settings);
        (_d = this.viewManager) === null || _d === void 0 ? void 0 : _d.updateSettings(this.settings);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBMkU7QUFDM0UsbUNBQStEO0FBQy9ELDREQUF5RDtBQUN6RCx3REFBcUQ7QUFDckQsZ0VBQWtFO0FBQ2xFLHdFQUFxRTtBQUNyRSx3RUFBcUU7QUFFckUsTUFBcUIsZ0JBQWlCLFNBQVEsaUJBQU07SUFBcEQ7O1FBTVMsa0JBQWEsR0FBNEIsSUFBSSxDQUFDO0lBOE52RCxDQUFDO0lBNU5BLEtBQUssQ0FBQyxNQUFNO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBRWpELGdCQUFnQjtRQUNoQixNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUxQixzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUkseUNBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHlDQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFaEYsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxzQ0FBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFN0QsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxD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QUNLLGVBQWU7UUFDdEIsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxFQUFFLEdBQUcseUJBQXlCLENBQUM7WUFDdkMsT0FBTyxDQUFDLFdBQVcsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXVEckIsQ0FBQztZQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLENBQUM7SUFDRixDQUFDO0lBRUQ7O09BRUc7SUFDSyxHQUFHLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVzs7UUFDMUMsSUFBSSxNQUFBLElBQUksQ0FBQyxRQUFRLDBDQUFFLGVBQWUsRUFBRSxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLE9BQU8sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNGLENBQUM7Q0FDRDtBQXBPRCxtQ0FvT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIFBsdWdpbiwgVEZpbGUsIFdvcmtzcGFjZUxlYWYsIE1hcmtkb3duVmlldyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFByaW50VGl0bGVTZXR0aW5ncywgREVGQVVMVF9TRVRUSU5HUyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgQnV0dG9uU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvQnV0dG9uU2VydmljZSc7XG5pbXBvcnQgeyBWaWV3TWFuYWdlciB9IGZyb20gJy4vc2VydmljZXMvVmlld01hbmFnZXInO1xuaW1wb3J0IHsgUHJpbnRUaXRsZVNldHRpbmdUYWIgfSBmcm9tICcuL3NlcnZpY2VzL1NldHRpbmdzU2VydmljZSc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9Ob3RpZmljYXRpb25TZXJ2aWNlJztcbmltcG9ydCB7IEZpbGVBbmFseXNpc1NlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL0ZpbGVBbmFseXNpc1NlcnZpY2UnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmludFRpdGxlUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcblx0c2V0dGluZ3MhOiBQcmludFRpdGxlU2V0dGluZ3M7XG5cdHByaXZhdGUgYnV0dG9uU2VydmljZSE6IEJ1dHRvblNlcnZpY2U7XG5cdHByaXZhdGUgdmlld01hbmFnZXIhOiBWaWV3TWFuYWdlcjtcblx0cHJpdmF0ZSBub3RpZmljYXRpb25TZXJ2aWNlITogTm90aWZpY2F0aW9uU2VydmljZTtcblx0cHJpdmF0ZSBmaWxlQW5hbHlzaXNTZXJ2aWNlITogRmlsZUFuYWx5c2lzU2VydmljZTtcblx0cHJpdmF0ZSBjdXN0b21TdHlsZUVsOiBIVE1MU3R5bGVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXHRcdHRoaXMubG9nKCdMb2FkaW5nIFByaW50IFRpdGxlIFBsdWdpbiB2Mi4wLjAuLi4nKTtcblxuXHRcdC8vIExvYWQgc2V0dGluZ3Ncblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBzZXJ2aWNlc1xuXHRcdHRoaXMubm90aWZpY2F0aW9uU2VydmljZSA9IG5ldyBOb3RpZmljYXRpb25TZXJ2aWNlKHRoaXMuc2V0dGluZ3MpO1xuXHRcdHRoaXMuZmlsZUFuYWx5c2lzU2VydmljZSA9IG5ldyBGaWxlQW5hbHlzaXNTZXJ2aWNlKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzKTtcblx0XHR0aGlzLmJ1dHRvblNlcnZpY2UgPSBuZXcgQnV0dG9uU2VydmljZSh0aGlzLnNldHRpbmdzLCB0aGlzLm5vdGlmaWNhdGlvblNlcnZpY2UsIHRoaXMuZmlsZUFuYWx5c2lzU2VydmljZSk7XG5cdFx0dGhpcy52aWV3TWFuYWdlciA9IG5ldyBWaWV3TWFuYWdlcih0aGlzLmFwcCwgdGhpcy5idXR0b25TZXJ2aWNlLCB0aGlzLnNldHRpbmdzKTtcblxuXHRcdC8vIFJlZ2lzdGVyIHNldHRpbmdzIHRhYlxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUHJpbnRUaXRsZVNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuXHRcdC8vIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcblxuXHRcdC8vIEFwcGx5IGN1c3RvbSBzdHlsZXNcblx0XHR0aGlzLmFwcGx5Q3VzdG9tU3R5bGVzKCk7XG5cblx0XHQvLyBBZGQgYnV0dG9ucyB0byBleGlzdGluZyB2aWV3cyBhZnRlciBpbml0aWFsaXphdGlvblxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5sb2coJ0FkZGluZyBidXR0b25zIHRvIGV4aXN0aW5nIG5vdGVzJyk7XG5cdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLmFkZEJ1dHRvblRvQWxsVmlld3MoKTtcblx0XHR9LCAxMDAwKTtcblxuXHRcdHRoaXMubG9nKCdQbHVnaW4gbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0dGhpcy5sb2coJ1VubG9hZGluZyBQcmludCBUaXRsZSBQbHVnaW4uLi4nKTtcblx0XHRcblx0XHQvLyBDbGVhbiB1cCBhbGwgYnV0dG9ucyBhbmQgc2VydmljZXNcblx0XHR0aGlzLnZpZXdNYW5hZ2VyPy5jbGVhbnVwKCk7XG5cdFx0XG5cdFx0Ly8gUmVtb3ZlIGN1c3RvbSBzdHlsZXNcblx0XHRpZiAodGhpcy5jdXN0b21TdHlsZUVsKSB7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwucmVtb3ZlKCk7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMubG9nKCdQbHVnaW4gdW5sb2FkZWQnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhbGwgZXZlbnQgaGFuZGxlcnNcblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCk6IHZvaWQge1xuXHRcdC8vIEZpbGUgb3BlbiBldmVudFxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgKGZpbGU6IFRGaWxlIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLm9uRmlsZU9wZW4oZmlsZSk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cblx0XHQvLyBBY3RpdmUgbGVhZiBjaGFuZ2UgZXZlbnRcblx0XHR0aGlzLnJlZ2lzdGVyRXZlbnQoXG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2FjdGl2ZS1sZWFmLWNoYW5nZScsIChsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLm9uQWN0aXZlTGVhZkNoYW5nZShsZWFmKTtcblx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdC8vIExheW91dCBjaGFuZ2UgZXZlbnQgKHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZWRpdC9wcmV2aWV3IG1vZGUpXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdsYXlvdXQtY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZpZXdNYW5hZ2VyLm9uTGF5b3V0Q2hhbmdlKCk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cblx0XHQvLyBXb3Jrc3BhY2UgcmVzaXplIGV2ZW50XG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdyZXNpemUnLCAoKSA9PiB7XG5cdFx0XHRcdC8vIFJlZnJlc2ggYnV0dG9ucyBhZnRlciByZXNpemUgd2l0aCBhIHNtYWxsIGRlbGF5XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMudmlld01hbmFnZXIucmVmcmVzaEFsbEJ1dHRvbnMoKTtcblx0XHRcdFx0fSwgMjAwKTtcblx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdHRoaXMubG9nKCdFdmVudCBoYW5kbGVycyByZWdpc3RlcmVkJyk7XG5cdH1cblxuXHQvKipcblx0ICogTG9hZCBwbHVnaW4gc2V0dGluZ3Ncblx0ICovXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIHBsdWdpbiBzZXR0aW5nc1xuXHQgKi9cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdFx0XG5cdFx0Ly8gVXBkYXRlIHNlcnZpY2VzIHdpdGggbmV3IHNldHRpbmdzXG5cdFx0dGhpcy5ub3RpZmljYXRpb25TZXJ2aWNlPy51cGRhdGVTZXR0aW5ncyh0aGlzLnNldHRpbmdzKTtcblx0XHR0aGlzLmZpbGVBbmFseXNpc1NlcnZpY2U/LnVwZGF0ZVNldHRpbmdzKHRoaXMuc2V0dGluZ3MpO1xuXHRcdHRoaXMuYnV0dG9uU2VydmljZT8udXBkYXRlU2V0dGluZ3ModGhpcy5zZXR0aW5ncyk7XG5cdFx0dGhpcy52aWV3TWFuYWdlcj8udXBkYXRlU2V0dGluZ3ModGhpcy5zZXR0aW5ncyk7XG5cdFx0XG5cdFx0dGhpcy5sb2coJ1NldHRpbmdzIHNhdmVkIGFuZCBzZXJ2aWNlcyB1cGRhdGVkJyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGRlZmF1bHQgc2V0dGluZ3Ncblx0ICovXG5cdGdldERlZmF1bHRTZXR0aW5ncygpOiBQcmludFRpdGxlU2V0dGluZ3Mge1xuXHRcdHJldHVybiB7IC4uLkRFRkFVTFRfU0VUVElOR1MgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIGFsbCBidXR0b25zICh1c2VkIGJ5IHNldHRpbmdzKVxuXHQgKi9cblx0cmVmcmVzaEFsbEJ1dHRvbnMoKTogdm9pZCB7XG5cdFx0dGhpcy52aWV3TWFuYWdlcj8ucmVmcmVzaEFsbEJ1dHRvbnMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseSBjdXN0b20gQ1NTIHN0eWxlc1xuXHQgKi9cblx0YXBwbHlDdXN0b21TdHlsZXMoKTogdm9pZCB7XG5cdFx0Ly8gUmVtb3ZlIGV4aXN0aW5nIGN1c3RvbSBzdHlsZXNcblx0XHRpZiAodGhpcy5jdXN0b21TdHlsZUVsKSB7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwucmVtb3ZlKCk7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8vIEFwcGx5IG5ldyBjdXN0b20gc3R5bGVzIGlmIGFueVxuXHRcdGlmICh0aGlzLnNldHRpbmdzLmN1c3RvbUNTUy50cmltKCkpIHtcblx0XHRcdHRoaXMuY3VzdG9tU3R5bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdFx0XHR0aGlzLmN1c3RvbVN0eWxlRWwudGV4dENvbnRlbnQgPSBgXG5cdFx0XHRcdC8qIFByaW50IFRpdGxlIFBsdWdpbiBDdXN0b20gU3R5bGVzICovXG5cdFx0XHRcdCR7dGhpcy5zZXR0aW5ncy5jdXN0b21DU1N9XG5cdFx0XHRgO1xuXHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLmN1c3RvbVN0eWxlRWwpO1xuXHRcdFx0dGhpcy5sb2coJ0N1c3RvbSBzdHlsZXMgYXBwbGllZCcpO1xuXHRcdH1cblxuXHRcdC8vIEFwcGx5IGJhc2Ugc3R5bGVzXG5cdFx0dGhpcy5hcHBseUJhc2VTdHlsZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseSBiYXNlIHBsdWdpbiBzdHlsZXNcblx0ICovXG5cdHByaXZhdGUgYXBwbHlCYXNlU3R5bGVzKCk6IHZvaWQge1xuXHRcdGNvbnN0IGV4aXN0aW5nU3R5bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcHJpbnQtdGl0bGUtYmFzZS1zdHlsZXMnKTtcblx0XHRpZiAoIWV4aXN0aW5nU3R5bGUpIHtcblx0XHRcdGNvbnN0IHN0eWxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdFx0c3R5bGVFbC5pZCA9ICdwcmludC10aXRsZS1iYXNlLXN0eWxlcyc7XG5cdFx0XHRzdHlsZUVsLnRleHRDb250ZW50ID0gYFxuXHRcdFx0XHQvKiBQcmludCBUaXRsZSBQbHVnaW4gQmFzZSBTdHlsZXMgKi9cblx0XHRcdFx0LnByaW50LXRpdGxlLWNvbnRhaW5lciB7XG5cdFx0XHRcdFx0ei1pbmRleDogMTA7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC5wcmludC10aXRsZS1idXR0b24ge1xuXHRcdFx0XHRcdGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWludGVyZmFjZSk7XG5cdFx0XHRcdFx0d2hpdGUtc3BhY2U6IG5vd3JhcDtcblx0XHRcdFx0XHRvdXRsaW5lOiBub25lO1xuXHRcdFx0XHRcdHVzZXItc2VsZWN0OiBub25lO1xuXHRcdFx0XHRcdC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG5cdFx0XHRcdFx0LW1vei11c2VyLXNlbGVjdDogbm9uZTtcblx0XHRcdFx0XHQtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC5wcmludC10aXRsZS1idXR0b246Zm9jdXMge1xuXHRcdFx0XHRcdG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpO1xuXHRcdFx0XHRcdG91dGxpbmUtb2Zmc2V0OiAycHg7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC5wcmludC10aXRsZS1idXR0b246YWN0aXZlIHtcblx0XHRcdFx0XHR0cmFuc2Zvcm06IHNjYWxlKDAuOTUpICFpbXBvcnRhbnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8qIFJlc3BvbnNpdmUgYWRqdXN0bWVudHMgKi9cblx0XHRcdFx0QG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG5cdFx0XHRcdFx0LnByaW50LXRpdGxlLWNvbnRhaW5lciB7XG5cdFx0XHRcdFx0XHRtYXJnaW46IDEycHggMDtcblx0XHRcdFx0XHRcdHBhZGRpbmc6IDZweCAxNnB4O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQucHJpbnQtdGl0bGUtYnV0dG9uIHtcblx0XHRcdFx0XHRcdHBhZGRpbmc6IDZweCAxMnB4O1xuXHRcdFx0XHRcdFx0Zm9udC1zaXplOiAxMnB4O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LyogSGlnaCBjb250cmFzdCBtb2RlIHN1cHBvcnQgKi9cblx0XHRcdFx0QG1lZGlhIChwcmVmZXJzLWNvbnRyYXN0OiBoaWdoKSB7XG5cdFx0XHRcdFx0LnByaW50LXRpdGxlLWJ1dHRvbiB7XG5cdFx0XHRcdFx0XHRib3JkZXItd2lkdGg6IDJweDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8qIFJlZHVjZWQgbW90aW9uIHN1cHBvcnQgKi9cblx0XHRcdFx0QG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcblx0XHRcdFx0XHQucHJpbnQtdGl0bGUtYnV0dG9uIHtcblx0XHRcdFx0XHRcdHRyYW5zaXRpb246IG5vbmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC5wcmludC10aXRsZS1idXR0b246aG92ZXIge1xuXHRcdFx0XHRcdFx0dHJhbnNmb3JtOiBub25lO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0YDtcblx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlYnVnIGxvZ2dpbmdcblx0ICovXG5cdHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogYW55W10pOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zZXR0aW5ncz8uZW5hYmxlRGVidWdNb2RlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgW1ByaW50VGl0bGVdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcblx0XHR9XG5cdH1cbn0iXX0=