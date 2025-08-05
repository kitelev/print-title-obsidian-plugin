"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewManager = void 0;
const obsidian_1 = require("obsidian");
class ViewManager {
    constructor(app, buttonService, settings, areaLayoutService) {
        this.app = app;
        this.buttonService = buttonService;
        this.settings = settings;
        this.areaLayoutService = areaLayoutService;
    }
    /**
     * Update settings reference
     */
    updateSettings(settings) {
        this.settings = settings;
        this.buttonService.updateSettings(settings);
    }
    /**
     * Add buttons to all currently open markdown views
     */
    addButtonToAllViews() {
        const markdownViews = this.app.workspace.getLeavesOfType('markdown');
        this.log(`Found ${markdownViews.length} markdown views`);
        markdownViews.forEach(leaf => {
            if (leaf.view instanceof obsidian_1.MarkdownView) {
                this.buttonService.addButtonToView(leaf.view);
            }
        });
    }
    /**
     * Handle file open event
     */
    onFileOpen(file) {
        this.log('File opened:', (file === null || file === void 0 ? void 0 : file.name) || 'unknown');
        if (file) {
            // Small delay to ensure view is ready
            setTimeout(async () => {
                this.addButtonToActiveView();
                // Check if this is an ems__Area file and render layout
                await this.renderAreaLayoutIfNeeded(file);
            }, 200);
        }
    }
    /**
     * Handle active leaf change event
     */
    onActiveLeafChange(leaf) {
        var _a;
        this.log('Active leaf changed:', ((_a = leaf === null || leaf === void 0 ? void 0 : leaf.view) === null || _a === void 0 ? void 0 : _a.getViewType()) || 'unknown');
        if (leaf && leaf.view instanceof obsidian_1.MarkdownView) {
            // Small delay to ensure view is ready
            setTimeout(async () => {
                const view = leaf.view;
                this.buttonService.addButtonToView(view);
                // Check if this is an ems__Area file and render layout
                if (view.file) {
                    await this.renderAreaLayoutIfNeeded(view.file);
                }
            }, 200);
        }
    }
    /**
     * Handle layout change event
     */
    onLayoutChange() {
        this.log('Layout changed, refreshing buttons');
        // Small delay to ensure layout is stable
        setTimeout(() => {
            this.addButtonToAllViews();
        }, 300);
    }
    /**
     * Add button to the currently active view
     */
    addButtonToActiveView() {
        const activeView = this.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView);
        if (activeView) {
            this.buttonService.addButtonToView(activeView);
        }
        else {
            this.log('No active MarkdownView found');
        }
    }
    /**
     * Refresh all buttons (remove and re-add)
     */
    refreshAllButtons() {
        this.log('Refreshing all buttons');
        // Remove existing buttons
        this.buttonService.cleanup();
        // Add buttons to all views after a short delay
        setTimeout(() => {
            this.addButtonToAllViews();
        }, 100);
    }
    /**
     * Clean up all buttons
     */
    cleanup() {
        this.log('Cleaning up view manager');
        this.buttonService.cleanup();
    }
    /**
     * Check if file is ems__Area and render layout if needed
     */
    async renderAreaLayoutIfNeeded(file) {
        var _a;
        // Get file cache to check frontmatter
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache === null || cache === void 0 ? void 0 : cache.frontmatter;
        if (!frontmatter || !frontmatter['exo__Instance_class']) {
            return;
        }
        const instanceClasses = Array.isArray(frontmatter['exo__Instance_class'])
            ? frontmatter['exo__Instance_class']
            : [frontmatter['exo__Instance_class']];
        // Check if this is an ems__Area
        const isArea = instanceClasses.some((cls) => { var _a; return typeof cls === 'string' ? cls.includes('ems__Area') : (_a = cls.path) === null || _a === void 0 ? void 0 : _a.includes('ems__Area'); });
        if (!isArea) {
            return;
        }
        this.log('Detected ems__Area file, rendering layout');
        // Find a container in the current view to render the layout
        const activeView = this.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView);
        if (!activeView || ((_a = activeView.file) === null || _a === void 0 ? void 0 : _a.path) !== file.path) {
            return;
        }
        // Create file context
        const fileContext = {
            fileName: file.name,
            filePath: file.path,
            file: file,
            frontmatter,
            currentPage: {
                file: {
                    path: file.path,
                    name: file.name,
                    link: null,
                    mtime: new Date(file.stat.mtime)
                },
                'exo__Instance_class': frontmatter['exo__Instance_class'] || [],
                ...frontmatter
            }
        };
        // Find or create a container for the area layout
        const contentEl = activeView.contentEl;
        let layoutContainer = contentEl.querySelector('.area-layout-auto-container');
        if (!layoutContainer) {
            // Create container after the frontmatter
            layoutContainer = contentEl.createDiv('area-layout-auto-container');
            // Try to insert after frontmatter or at the beginning of content
            const editorEl = contentEl.querySelector('.cm-editor');
            if (editorEl) {
                editorEl.insertAdjacentElement('afterend', layoutContainer);
            }
            else {
                // Fallback: add to the end of content
                contentEl.appendChild(layoutContainer);
            }
        }
        // Render the area layout
        try {
            await this.areaLayoutService.renderAreaLayout(layoutContainer, fileContext);
            this.log('Area layout rendered successfully');
        }
        catch (error) {
            console.error('[ViewManager] Error rendering area layout:', error);
        }
    }
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[PrintTitle ViewManager] ${message}`, ...args);
        }
    }
}
exports.ViewManager = ViewManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2VydmljZXMvVmlld01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW1FO0FBTW5FLE1BQWEsV0FBVztJQUN2QixZQUNTLEdBQVEsRUFDUixhQUE0QixFQUM1QixRQUE0QixFQUM1QixpQkFBb0M7UUFIcEMsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNSLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQzVCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7SUFDMUMsQ0FBQztJQUVKOztPQUVHO0lBQ0gsY0FBYyxDQUFDLFFBQTRCO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7T0FFRztJQUNILG1CQUFtQjtRQUNsQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLGFBQWEsQ0FBQyxNQUFNLGlCQUFpQixDQUFDLENBQUM7UUFFekQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxJQUFJLFlBQVksdUJBQVksRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVSxDQUFDLElBQWtCO1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLElBQUksS0FBSSxTQUFTLENBQUMsQ0FBQztRQUVsRCxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1Ysc0NBQXNDO1lBQ3RDLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDckIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdCLHVEQUF1RDtnQkFDdkQsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILGtCQUFrQixDQUFDLElBQTBCOztRQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUEsTUFBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSwwQ0FBRSxXQUFXLEVBQUUsS0FBSSxTQUFTLENBQUMsQ0FBQztRQUV6RSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxZQUFZLHVCQUFZLEVBQUUsQ0FBQztZQUMvQyxzQ0FBc0M7WUFDdEMsVUFBVSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBb0IsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLHVEQUF1RDtnQkFDdkQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2YsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO1lBQ0YsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFFL0MseUNBQXlDO1FBQ3pDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxxQkFBcUI7UUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsdUJBQVksQ0FBQyxDQUFDO1FBQ3hFLElBQUksVUFBVSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQzthQUFNLENBQUM7WUFDUCxJQUFJLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILGlCQUFpQjtRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFFbkMsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFN0IsK0NBQStDO1FBQy9DLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLHdCQUF3QixDQUFDLElBQVc7O1FBQ2pELHNDQUFzQztRQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsTUFBTSxXQUFXLEdBQUcsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFdBQVcsQ0FBQztRQUV2QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztZQUN6RCxPQUFPO1FBQ1IsQ0FBQztRQUVELE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDeEUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBRXhDLGdDQUFnQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUUsV0FDaEQsT0FBQSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUEsR0FBRyxDQUFDLElBQUksMENBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBLEVBQUEsQ0FDckYsQ0FBQztRQUVGLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNiLE9BQU87UUFDUixDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBRXRELDREQUE0RDtRQUM1RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBWSxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFBLE1BQUEsVUFBVSxDQUFDLElBQUksMENBQUUsSUFBSSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4RCxPQUFPO1FBQ1IsQ0FBQztRQUVELHNCQUFzQjtRQUN0QixNQUFNLFdBQVcsR0FBbUI7WUFDbkMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNuQixJQUFJLEVBQUUsSUFBSTtZQUNWLFdBQVc7WUFDWCxXQUFXLEVBQUU7Z0JBQ1osSUFBSSxFQUFFO29CQUNMLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsSUFBSSxFQUFFLElBQUk7b0JBQ1YsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUNoQztnQkFDRCxxQkFBcUIsRUFBRSxXQUFXLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFO2dCQUMvRCxHQUFHLFdBQVc7YUFDZDtTQUNELENBQUM7UUFFRixpREFBaUQ7UUFDakQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLGVBQWUsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLDZCQUE2QixDQUFnQixDQUFDO1FBRTVGLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN0Qix5Q0FBeUM7WUFDekMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUVwRSxpRUFBaUU7WUFDakUsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN2RCxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNkLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDN0QsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLHNDQUFzQztnQkFDdEMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0YsQ0FBQztRQUVELHlCQUF5QjtRQUN6QixJQUFJLENBQUM7WUFDSixNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNENBQTRDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNGLENBQUM7SUFFTyxHQUFHLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVztRQUMxQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsT0FBTyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0YsQ0FBQztDQUNEO0FBbk1ELGtDQW1NQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgTWFya2Rvd25WaWV3LCBURmlsZSwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEJ1dHRvblNlcnZpY2UgfSBmcm9tICcuL0J1dHRvblNlcnZpY2UnO1xuaW1wb3J0IHsgUHJpbnRUaXRsZVNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgQXJlYUxheW91dFNlcnZpY2UgfSBmcm9tICcuL0FyZWFMYXlvdXRTZXJ2aWNlJztcbmltcG9ydCB7IEV4b0ZpbGVDb250ZXh0IH0gZnJvbSAnLi4vdHlwZXMvRXhvVHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgVmlld01hbmFnZXIge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIGFwcDogQXBwLFxuXHRcdHByaXZhdGUgYnV0dG9uU2VydmljZTogQnV0dG9uU2VydmljZSxcblx0XHRwcml2YXRlIHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MsXG5cdFx0cHJpdmF0ZSBhcmVhTGF5b3V0U2VydmljZTogQXJlYUxheW91dFNlcnZpY2Vcblx0KSB7fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2V0dGluZ3MgcmVmZXJlbmNlXG5cdCAqL1xuXHR1cGRhdGVTZXR0aW5ncyhzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzKTogdm9pZCB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHRcdHRoaXMuYnV0dG9uU2VydmljZS51cGRhdGVTZXR0aW5ncyhzZXR0aW5ncyk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGJ1dHRvbnMgdG8gYWxsIGN1cnJlbnRseSBvcGVuIG1hcmtkb3duIHZpZXdzXG5cdCAqL1xuXHRhZGRCdXR0b25Ub0FsbFZpZXdzKCk6IHZvaWQge1xuXHRcdGNvbnN0IG1hcmtkb3duVmlld3MgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKCdtYXJrZG93bicpO1xuXHRcdHRoaXMubG9nKGBGb3VuZCAke21hcmtkb3duVmlld3MubGVuZ3RofSBtYXJrZG93biB2aWV3c2ApO1xuXG5cdFx0bWFya2Rvd25WaWV3cy5mb3JFYWNoKGxlYWYgPT4ge1xuXHRcdFx0aWYgKGxlYWYudmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xuXHRcdFx0XHR0aGlzLmJ1dHRvblNlcnZpY2UuYWRkQnV0dG9uVG9WaWV3KGxlYWYudmlldyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlIGZpbGUgb3BlbiBldmVudFxuXHQgKi9cblx0b25GaWxlT3BlbihmaWxlOiBURmlsZSB8IG51bGwpOiB2b2lkIHtcblx0XHR0aGlzLmxvZygnRmlsZSBvcGVuZWQ6JywgZmlsZT8ubmFtZSB8fCAndW5rbm93bicpO1xuXHRcdFxuXHRcdGlmIChmaWxlKSB7XG5cdFx0XHQvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgdmlldyBpcyByZWFkeVxuXHRcdFx0c2V0VGltZW91dChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYWRkQnV0dG9uVG9BY3RpdmVWaWV3KCk7XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gZW1zX19BcmVhIGZpbGUgYW5kIHJlbmRlciBsYXlvdXRcblx0XHRcdFx0YXdhaXQgdGhpcy5yZW5kZXJBcmVhTGF5b3V0SWZOZWVkZWQoZmlsZSk7XG5cdFx0XHR9LCAyMDApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgYWN0aXZlIGxlYWYgY2hhbmdlIGV2ZW50XG5cdCAqL1xuXHRvbkFjdGl2ZUxlYWZDaGFuZ2UobGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwpOiB2b2lkIHtcblx0XHR0aGlzLmxvZygnQWN0aXZlIGxlYWYgY2hhbmdlZDonLCBsZWFmPy52aWV3Py5nZXRWaWV3VHlwZSgpIHx8ICd1bmtub3duJyk7XG5cdFx0XG5cdFx0aWYgKGxlYWYgJiYgbGVhZi52aWV3IGluc3RhbmNlb2YgTWFya2Rvd25WaWV3KSB7XG5cdFx0XHQvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgdmlldyBpcyByZWFkeVxuXHRcdFx0c2V0VGltZW91dChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHZpZXcgPSBsZWFmLnZpZXcgYXMgTWFya2Rvd25WaWV3O1xuXHRcdFx0XHR0aGlzLmJ1dHRvblNlcnZpY2UuYWRkQnV0dG9uVG9WaWV3KHZpZXcpO1xuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGVtc19fQXJlYSBmaWxlIGFuZCByZW5kZXIgbGF5b3V0XG5cdFx0XHRcdGlmICh2aWV3LmZpbGUpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnJlbmRlckFyZWFMYXlvdXRJZk5lZWRlZCh2aWV3LmZpbGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAyMDApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgbGF5b3V0IGNoYW5nZSBldmVudFxuXHQgKi9cblx0b25MYXlvdXRDaGFuZ2UoKTogdm9pZCB7XG5cdFx0dGhpcy5sb2coJ0xheW91dCBjaGFuZ2VkLCByZWZyZXNoaW5nIGJ1dHRvbnMnKTtcblx0XHRcblx0XHQvLyBTbWFsbCBkZWxheSB0byBlbnN1cmUgbGF5b3V0IGlzIHN0YWJsZVxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5hZGRCdXR0b25Ub0FsbFZpZXdzKCk7XG5cdFx0fSwgMzAwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYnV0dG9uIHRvIHRoZSBjdXJyZW50bHkgYWN0aXZlIHZpZXdcblx0ICovXG5cdGFkZEJ1dHRvblRvQWN0aXZlVmlldygpOiB2b2lkIHtcblx0XHRjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRpZiAoYWN0aXZlVmlldykge1xuXHRcdFx0dGhpcy5idXR0b25TZXJ2aWNlLmFkZEJ1dHRvblRvVmlldyhhY3RpdmVWaWV3KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sb2coJ05vIGFjdGl2ZSBNYXJrZG93blZpZXcgZm91bmQnKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVmcmVzaCBhbGwgYnV0dG9ucyAocmVtb3ZlIGFuZCByZS1hZGQpXG5cdCAqL1xuXHRyZWZyZXNoQWxsQnV0dG9ucygpOiB2b2lkIHtcblx0XHR0aGlzLmxvZygnUmVmcmVzaGluZyBhbGwgYnV0dG9ucycpO1xuXHRcdFxuXHRcdC8vIFJlbW92ZSBleGlzdGluZyBidXR0b25zXG5cdFx0dGhpcy5idXR0b25TZXJ2aWNlLmNsZWFudXAoKTtcblx0XHRcblx0XHQvLyBBZGQgYnV0dG9ucyB0byBhbGwgdmlld3MgYWZ0ZXIgYSBzaG9ydCBkZWxheVxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5hZGRCdXR0b25Ub0FsbFZpZXdzKCk7XG5cdFx0fSwgMTAwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhbiB1cCBhbGwgYnV0dG9uc1xuXHQgKi9cblx0Y2xlYW51cCgpOiB2b2lkIHtcblx0XHR0aGlzLmxvZygnQ2xlYW5pbmcgdXAgdmlldyBtYW5hZ2VyJyk7XG5cdFx0dGhpcy5idXR0b25TZXJ2aWNlLmNsZWFudXAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBmaWxlIGlzIGVtc19fQXJlYSBhbmQgcmVuZGVyIGxheW91dCBpZiBuZWVkZWRcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgcmVuZGVyQXJlYUxheW91dElmTmVlZGVkKGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gR2V0IGZpbGUgY2FjaGUgdG8gY2hlY2sgZnJvbnRtYXR0ZXJcblx0XHRjb25zdCBjYWNoZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuXHRcdGNvbnN0IGZyb250bWF0dGVyID0gY2FjaGU/LmZyb250bWF0dGVyO1xuXHRcdFxuXHRcdGlmICghZnJvbnRtYXR0ZXIgfHwgIWZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBpbnN0YW5jZUNsYXNzZXMgPSBBcnJheS5pc0FycmF5KGZyb250bWF0dGVyWydleG9fX0luc3RhbmNlX2NsYXNzJ10pIFxuXHRcdFx0PyBmcm9udG1hdHRlclsnZXhvX19JbnN0YW5jZV9jbGFzcyddIFxuXHRcdFx0OiBbZnJvbnRtYXR0ZXJbJ2V4b19fSW5zdGFuY2VfY2xhc3MnXV07XG5cblx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGVtc19fQXJlYVxuXHRcdGNvbnN0IGlzQXJlYSA9IGluc3RhbmNlQ2xhc3Nlcy5zb21lKChjbHM6IGFueSkgPT4gXG5cdFx0XHR0eXBlb2YgY2xzID09PSAnc3RyaW5nJyA/IGNscy5pbmNsdWRlcygnZW1zX19BcmVhJykgOiBjbHMucGF0aD8uaW5jbHVkZXMoJ2Vtc19fQXJlYScpXG5cdFx0KTtcblxuXHRcdGlmICghaXNBcmVhKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5sb2coJ0RldGVjdGVkIGVtc19fQXJlYSBmaWxlLCByZW5kZXJpbmcgbGF5b3V0Jyk7XG5cblx0XHQvLyBGaW5kIGEgY29udGFpbmVyIGluIHRoZSBjdXJyZW50IHZpZXcgdG8gcmVuZGVyIHRoZSBsYXlvdXRcblx0XHRjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRpZiAoIWFjdGl2ZVZpZXcgfHwgYWN0aXZlVmlldy5maWxlPy5wYXRoICE9PSBmaWxlLnBhdGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBDcmVhdGUgZmlsZSBjb250ZXh0XG5cdFx0Y29uc3QgZmlsZUNvbnRleHQ6IEV4b0ZpbGVDb250ZXh0ID0ge1xuXHRcdFx0ZmlsZU5hbWU6IGZpbGUubmFtZSxcblx0XHRcdGZpbGVQYXRoOiBmaWxlLnBhdGgsXG5cdFx0XHRmaWxlOiBmaWxlLFxuXHRcdFx0ZnJvbnRtYXR0ZXIsXG5cdFx0XHRjdXJyZW50UGFnZToge1xuXHRcdFx0XHRmaWxlOiB7XG5cdFx0XHRcdFx0cGF0aDogZmlsZS5wYXRoLFxuXHRcdFx0XHRcdG5hbWU6IGZpbGUubmFtZSxcblx0XHRcdFx0XHRsaW5rOiBudWxsLFxuXHRcdFx0XHRcdG10aW1lOiBuZXcgRGF0ZShmaWxlLnN0YXQubXRpbWUpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdleG9fX0luc3RhbmNlX2NsYXNzJzogZnJvbnRtYXR0ZXJbJ2V4b19fSW5zdGFuY2VfY2xhc3MnXSB8fCBbXSxcblx0XHRcdFx0Li4uZnJvbnRtYXR0ZXJcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gRmluZCBvciBjcmVhdGUgYSBjb250YWluZXIgZm9yIHRoZSBhcmVhIGxheW91dFxuXHRcdGNvbnN0IGNvbnRlbnRFbCA9IGFjdGl2ZVZpZXcuY29udGVudEVsO1xuXHRcdGxldCBsYXlvdXRDb250YWluZXIgPSBjb250ZW50RWwucXVlcnlTZWxlY3RvcignLmFyZWEtbGF5b3V0LWF1dG8tY29udGFpbmVyJykgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XG5cdFx0aWYgKCFsYXlvdXRDb250YWluZXIpIHtcblx0XHRcdC8vIENyZWF0ZSBjb250YWluZXIgYWZ0ZXIgdGhlIGZyb250bWF0dGVyXG5cdFx0XHRsYXlvdXRDb250YWluZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KCdhcmVhLWxheW91dC1hdXRvLWNvbnRhaW5lcicpO1xuXHRcdFx0XG5cdFx0XHQvLyBUcnkgdG8gaW5zZXJ0IGFmdGVyIGZyb250bWF0dGVyIG9yIGF0IHRoZSBiZWdpbm5pbmcgb2YgY29udGVudFxuXHRcdFx0Y29uc3QgZWRpdG9yRWwgPSBjb250ZW50RWwucXVlcnlTZWxlY3RvcignLmNtLWVkaXRvcicpO1xuXHRcdFx0aWYgKGVkaXRvckVsKSB7XG5cdFx0XHRcdGVkaXRvckVsLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBsYXlvdXRDb250YWluZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRmFsbGJhY2s6IGFkZCB0byB0aGUgZW5kIG9mIGNvbnRlbnRcblx0XHRcdFx0Y29udGVudEVsLmFwcGVuZENoaWxkKGxheW91dENvbnRhaW5lcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUmVuZGVyIHRoZSBhcmVhIGxheW91dFxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmFyZWFMYXlvdXRTZXJ2aWNlLnJlbmRlckFyZWFMYXlvdXQobGF5b3V0Q29udGFpbmVyLCBmaWxlQ29udGV4dCk7XG5cdFx0XHR0aGlzLmxvZygnQXJlYSBsYXlvdXQgcmVuZGVyZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ1tWaWV3TWFuYWdlcl0gRXJyb3IgcmVuZGVyaW5nIGFyZWEgbGF5b3V0OicsIGVycm9yKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgW1ByaW50VGl0bGUgVmlld01hbmFnZXJdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcblx0XHR9XG5cdH1cbn0iXX0=