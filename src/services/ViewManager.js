"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewManager = void 0;
const obsidian_1 = require("obsidian");
class ViewManager {
    constructor(app, buttonService, settings) {
        this.app = app;
        this.buttonService = buttonService;
        this.settings = settings;
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
            setTimeout(() => {
                this.addButtonToActiveView();
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
            setTimeout(() => {
                this.buttonService.addButtonToView(leaf.view);
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
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[PrintTitle ViewManager] ${message}`, ...args);
        }
    }
}
exports.ViewManager = ViewManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWaWV3TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUU7QUFJbkUsTUFBYSxXQUFXO0lBQ3ZCLFlBQ1MsR0FBUSxFQUNSLGFBQTRCLEVBQzVCLFFBQTRCO1FBRjVCLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFDUixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixhQUFRLEdBQVIsUUFBUSxDQUFvQjtJQUNsQyxDQUFDO0lBRUo7O09BRUc7SUFDSCxjQUFjLENBQUMsUUFBNEI7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsbUJBQW1CO1FBQ2xCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsYUFBYSxDQUFDLE1BQU0saUJBQWlCLENBQUMsQ0FBQztRQUV6RCxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLElBQUksWUFBWSx1QkFBWSxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVLENBQUMsSUFBa0I7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSSxLQUFJLFNBQVMsQ0FBQyxDQUFDO1FBRWxELElBQUksSUFBSSxFQUFFLENBQUM7WUFDVixzQ0FBc0M7WUFDdEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM5QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0JBQWtCLENBQUMsSUFBMEI7O1FBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsQ0FBQSxNQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxJQUFJLDBDQUFFLFdBQVcsRUFBRSxLQUFJLFNBQVMsQ0FBQyxDQUFDO1FBRXpFLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLFlBQVksdUJBQVksRUFBRSxDQUFDO1lBQy9DLHNDQUFzQztZQUN0QyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFvQixDQUFDLENBQUM7WUFDL0QsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFFL0MseUNBQXlDO1FBQ3pDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxxQkFBcUI7UUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsdUJBQVksQ0FBQyxDQUFDO1FBQ3hFLElBQUksVUFBVSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQzthQUFNLENBQUM7WUFDUCxJQUFJLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILGlCQUFpQjtRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFFbkMsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFN0IsK0NBQStDO1FBQy9DLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVPLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQzFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixPQUFPLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzdELENBQUM7SUFDRixDQUFDO0NBQ0Q7QUE3R0Qsa0NBNkdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFRGaWxlLCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgQnV0dG9uU2VydmljZSB9IGZyb20gJy4vQnV0dG9uU2VydmljZSc7XG5pbXBvcnQgeyBQcmludFRpdGxlU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBWaWV3TWFuYWdlciB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgYXBwOiBBcHAsXG5cdFx0cHJpdmF0ZSBidXR0b25TZXJ2aWNlOiBCdXR0b25TZXJ2aWNlLFxuXHRcdHByaXZhdGUgc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5nc1xuXHQpIHt9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzZXR0aW5ncyByZWZlcmVuY2Vcblx0ICovXG5cdHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MpOiB2b2lkIHtcblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cdFx0dGhpcy5idXR0b25TZXJ2aWNlLnVwZGF0ZVNldHRpbmdzKHNldHRpbmdzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYnV0dG9ucyB0byBhbGwgY3VycmVudGx5IG9wZW4gbWFya2Rvd24gdmlld3Ncblx0ICovXG5cdGFkZEJ1dHRvblRvQWxsVmlld3MoKTogdm9pZCB7XG5cdFx0Y29uc3QgbWFya2Rvd25WaWV3cyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoJ21hcmtkb3duJyk7XG5cdFx0dGhpcy5sb2coYEZvdW5kICR7bWFya2Rvd25WaWV3cy5sZW5ndGh9IG1hcmtkb3duIHZpZXdzYCk7XG5cblx0XHRtYXJrZG93blZpZXdzLmZvckVhY2gobGVhZiA9PiB7XG5cdFx0XHRpZiAobGVhZi52aWV3IGluc3RhbmNlb2YgTWFya2Rvd25WaWV3KSB7XG5cdFx0XHRcdHRoaXMuYnV0dG9uU2VydmljZS5hZGRCdXR0b25Ub1ZpZXcobGVhZi52aWV3KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZmlsZSBvcGVuIGV2ZW50XG5cdCAqL1xuXHRvbkZpbGVPcGVuKGZpbGU6IFRGaWxlIHwgbnVsbCk6IHZvaWQge1xuXHRcdHRoaXMubG9nKCdGaWxlIG9wZW5lZDonLCBmaWxlPy5uYW1lIHx8ICd1bmtub3duJyk7XG5cdFx0XG5cdFx0aWYgKGZpbGUpIHtcblx0XHRcdC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB2aWV3IGlzIHJlYWR5XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dGhpcy5hZGRCdXR0b25Ub0FjdGl2ZVZpZXcoKTtcblx0XHRcdH0sIDIwMCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBhY3RpdmUgbGVhZiBjaGFuZ2UgZXZlbnRcblx0ICovXG5cdG9uQWN0aXZlTGVhZkNoYW5nZShsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCk6IHZvaWQge1xuXHRcdHRoaXMubG9nKCdBY3RpdmUgbGVhZiBjaGFuZ2VkOicsIGxlYWY/LnZpZXc/LmdldFZpZXdUeXBlKCkgfHwgJ3Vua25vd24nKTtcblx0XHRcblx0XHRpZiAobGVhZiAmJiBsZWFmLnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcpIHtcblx0XHRcdC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB2aWV3IGlzIHJlYWR5XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dGhpcy5idXR0b25TZXJ2aWNlLmFkZEJ1dHRvblRvVmlldyhsZWFmLnZpZXcgYXMgTWFya2Rvd25WaWV3KTtcblx0XHRcdH0sIDIwMCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBsYXlvdXQgY2hhbmdlIGV2ZW50XG5cdCAqL1xuXHRvbkxheW91dENoYW5nZSgpOiB2b2lkIHtcblx0XHR0aGlzLmxvZygnTGF5b3V0IGNoYW5nZWQsIHJlZnJlc2hpbmcgYnV0dG9ucycpO1xuXHRcdFxuXHRcdC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSBsYXlvdXQgaXMgc3RhYmxlXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aGlzLmFkZEJ1dHRvblRvQWxsVmlld3MoKTtcblx0XHR9LCAzMDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBidXR0b24gdG8gdGhlIGN1cnJlbnRseSBhY3RpdmUgdmlld1xuXHQgKi9cblx0YWRkQnV0dG9uVG9BY3RpdmVWaWV3KCk6IHZvaWQge1xuXHRcdGNvbnN0IGFjdGl2ZVZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuXHRcdGlmIChhY3RpdmVWaWV3KSB7XG5cdFx0XHR0aGlzLmJ1dHRvblNlcnZpY2UuYWRkQnV0dG9uVG9WaWV3KGFjdGl2ZVZpZXcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxvZygnTm8gYWN0aXZlIE1hcmtkb3duVmlldyBmb3VuZCcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIGFsbCBidXR0b25zIChyZW1vdmUgYW5kIHJlLWFkZClcblx0ICovXG5cdHJlZnJlc2hBbGxCdXR0b25zKCk6IHZvaWQge1xuXHRcdHRoaXMubG9nKCdSZWZyZXNoaW5nIGFsbCBidXR0b25zJyk7XG5cdFx0XG5cdFx0Ly8gUmVtb3ZlIGV4aXN0aW5nIGJ1dHRvbnNcblx0XHR0aGlzLmJ1dHRvblNlcnZpY2UuY2xlYW51cCgpO1xuXHRcdFxuXHRcdC8vIEFkZCBidXR0b25zIHRvIGFsbCB2aWV3cyBhZnRlciBhIHNob3J0IGRlbGF5XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aGlzLmFkZEJ1dHRvblRvQWxsVmlld3MoKTtcblx0XHR9LCAxMDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFuIHVwIGFsbCBidXR0b25zXG5cdCAqL1xuXHRjbGVhbnVwKCk6IHZvaWQge1xuXHRcdHRoaXMubG9nKCdDbGVhbmluZyB1cCB2aWV3IG1hbmFnZXInKTtcblx0XHR0aGlzLmJ1dHRvblNlcnZpY2UuY2xlYW51cCgpO1xuXHR9XG5cblx0cHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSkge1xuXHRcdFx0Y29uc29sZS5sb2coYFtQcmludFRpdGxlIFZpZXdNYW5hZ2VyXSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG5cdFx0fVxuXHR9XG59Il19