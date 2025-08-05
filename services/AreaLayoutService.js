"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaLayoutService = void 0;
const obsidian_1 = require("obsidian");
const DataviewAdapter_1 = require("./DataviewAdapter");
const AreaCreationService_1 = require("./AreaCreationService");
class AreaLayoutService {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
        this.dataviewAdapter = new DataviewAdapter_1.DataviewAdapter(app);
        this.areaCreationService = new AreaCreationService_1.AreaCreationService(app, settings);
    }
    /**
     * Update settings reference
     */
    updateSettings(settings) {
        this.settings = settings;
        this.areaCreationService.updateSettings(settings);
    }
    /**
     * Render area layout for ems__Area assets
     */
    async renderAreaLayout(container, fileContext) {
        this.log('Rendering area layout for:', fileContext.fileName);
        try {
            // Clear container
            container.innerHTML = '';
            // Create main layout container
            const layoutContainer = container.createEl('div', {
                cls: 'area-layout-container'
            });
            // Add area header
            this.renderAreaHeader(layoutContainer, fileContext);
            // Add child areas section
            await this.renderChildAreasSection(layoutContainer, fileContext);
            // Add unresolved tasks section
            await this.renderUnresolvedTasksSection(layoutContainer, fileContext);
            // Add unresolved projects section
            await this.renderUnresolvedProjectsSection(layoutContainer, fileContext);
            // Apply styles
            this.applyAreaLayoutStyles(container);
            this.log('Area layout rendered successfully');
        }
        catch (error) {
            console.error('[AreaLayoutService] Error rendering area layout:', error);
            this.renderError(container, `Failed to render area layout: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Render area header with title and metadata
     */
    renderAreaHeader(container, fileContext) {
        const header = container.createEl('div', { cls: 'area-header' });
        const title = header.createEl('h1', {
            text: fileContext.file.basename,
            cls: 'area-title'
        });
        // Add metadata if available
        const metadata = fileContext.currentPage;
        if (metadata['exo__Asset_createdAt'] || metadata['ems__Area_parent']) {
            const metaContainer = header.createEl('div', { cls: 'area-metadata' });
            if (metadata['exo__Asset_createdAt']) {
                const createdAt = new Date(metadata['exo__Asset_createdAt']).toLocaleDateString();
                metaContainer.createEl('span', {
                    text: `Created: ${createdAt}`,
                    cls: 'area-meta-item'
                });
            }
            if (metadata['ems__Area_parent']) {
                const parent = this.extractLinkText(metadata['ems__Area_parent']);
                metaContainer.createEl('span', {
                    text: `Parent: ${parent}`,
                    cls: 'area-meta-item'
                });
            }
        }
    }
    /**
     * Render child areas section
     */
    async renderChildAreasSection(container, fileContext) {
        const section = container.createEl('div', { cls: 'area-section' });
        // Section header
        const header = section.createEl('div', { cls: 'area-section-header' });
        header.createEl('h2', { text: '📁 Child Areas' });
        // Create child area button
        const createButton = header.createEl('button', {
            text: '+ Create Child Area',
            cls: 'area-action-button create-child-button'
        });
        createButton.addEventListener('click', async () => {
            await this.areaCreationService.createChildArea(fileContext);
        });
        // Content container
        const content = section.createEl('div', { cls: 'area-section-content' });
        try {
            const areaName = fileContext.fileName.replace('.md', '');
            const childAreas = await this.dataviewAdapter.findChildAreas(areaName);
            if (childAreas.length === 0) {
                content.createEl('p', {
                    text: 'No child areas found',
                    cls: 'area-empty-state'
                });
            }
            else {
                const list = content.createEl('ul', { cls: 'area-list' });
                for (const area of childAreas) {
                    const item = list.createEl('li', { cls: 'area-list-item' });
                    const link = item.createEl('a', {
                        text: area.file.name.replace('Area - ', '').replace('.md', ''),
                        cls: 'area-link'
                    });
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const file = this.app.vault.getAbstractFileByPath(area.file.path);
                        if (file instanceof obsidian_1.TFile) {
                            const leaf = this.app.workspace.getLeaf();
                            await leaf.openFile(file);
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error('[AreaLayoutService] Error loading child areas:', error);
            content.createEl('p', {
                text: 'Error loading child areas',
                cls: 'area-error'
            });
        }
    }
    /**
     * Render unresolved tasks section
     */
    async renderUnresolvedTasksSection(container, fileContext) {
        const section = container.createEl('div', { cls: 'area-section' });
        // Section header
        const header = section.createEl('div', { cls: 'area-section-header' });
        header.createEl('h2', { text: '📋 Unresolved Tasks' });
        // Content container
        const content = section.createEl('div', { cls: 'area-section-content' });
        try {
            const areaName = fileContext.fileName.replace('.md', '');
            const tasks = await this.findUnresolvedEfforts(areaName, 'ems__Task');
            if (tasks.length === 0) {
                content.createEl('p', {
                    text: 'No unresolved tasks',
                    cls: 'area-empty-state'
                });
            }
            else {
                const list = content.createEl('ul', { cls: 'area-list' });
                for (const task of tasks) {
                    const item = list.createEl('li', { cls: 'area-list-item' });
                    const link = item.createEl('a', {
                        text: task.file.name.replace('.md', ''),
                        cls: 'area-link'
                    });
                    // Add status if available
                    if (task['ems__Effort_status']) {
                        const status = this.extractLinkText(task['ems__Effort_status']);
                        item.createEl('span', {
                            text: ` (${status})`,
                            cls: 'area-status'
                        });
                    }
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const file = this.app.vault.getAbstractFileByPath(task.file.path);
                        if (file instanceof obsidian_1.TFile) {
                            const leaf = this.app.workspace.getLeaf();
                            await leaf.openFile(file);
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error('[AreaLayoutService] Error loading tasks:', error);
            content.createEl('p', {
                text: 'Error loading tasks',
                cls: 'area-error'
            });
        }
    }
    /**
     * Render unresolved projects section
     */
    async renderUnresolvedProjectsSection(container, fileContext) {
        const section = container.createEl('div', { cls: 'area-section' });
        // Section header
        const header = section.createEl('div', { cls: 'area-section-header' });
        header.createEl('h2', { text: '🚀 Unresolved Projects' });
        // Content container
        const content = section.createEl('div', { cls: 'area-section-content' });
        try {
            const areaName = fileContext.fileName.replace('.md', '');
            const projects = await this.findUnresolvedEfforts(areaName, 'ems__Project');
            if (projects.length === 0) {
                content.createEl('p', {
                    text: 'No unresolved projects',
                    cls: 'area-empty-state'
                });
            }
            else {
                const list = content.createEl('ul', { cls: 'area-list' });
                for (const project of projects) {
                    const item = list.createEl('li', { cls: 'area-list-item' });
                    const link = item.createEl('a', {
                        text: project.file.name.replace('.md', ''),
                        cls: 'area-link'
                    });
                    // Add status if available
                    if (project['ems__Effort_status']) {
                        const status = this.extractLinkText(project['ems__Effort_status']);
                        item.createEl('span', {
                            text: ` (${status})`,
                            cls: 'area-status'
                        });
                    }
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const file = this.app.vault.getAbstractFileByPath(project.file.path);
                        if (file instanceof obsidian_1.TFile) {
                            const leaf = this.app.workspace.getLeaf();
                            await leaf.openFile(file);
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error('[AreaLayoutService] Error loading projects:', error);
            content.createEl('p', {
                text: 'Error loading projects',
                cls: 'area-error'
            });
        }
    }
    /**
     * Find unresolved efforts (tasks/projects) for an area
     */
    async findUnresolvedEfforts(areaName, effortType) {
        const api = this.dataviewAdapter.api;
        if (!api)
            return [];
        try {
            const efforts = api.pages().where((p) => {
                var _a, _b, _c, _d, _e;
                const instanceClass = p['exo__Instance_class'] || p['exo__instance_class'];
                const area = p['ems__Effort_area'];
                const status = p['ems__Effort_status'];
                // Check if this is the right type
                const isRightType = Array.isArray(instanceClass)
                    ? instanceClass.some((cls) => { var _a; return typeof cls === 'string' ? cls.includes(effortType) : (_a = cls.path) === null || _a === void 0 ? void 0 : _a.includes(effortType); })
                    : typeof instanceClass === 'string'
                        ? instanceClass.includes(effortType)
                        : (_a = instanceClass === null || instanceClass === void 0 ? void 0 : instanceClass.path) === null || _a === void 0 ? void 0 : _a.includes(effortType);
                if (!isRightType || !area)
                    return false;
                // Check if area matches
                const areaName_clean = typeof area === 'string'
                    ? area.replace(/[\[\]]/g, '')
                    : (_c = (_b = area.path) === null || _b === void 0 ? void 0 : _b.split('/').pop()) === null || _c === void 0 ? void 0 : _c.replace('.md', '');
                const isInArea = areaName_clean === areaName;
                if (!isInArea)
                    return false;
                // Check if unresolved (not Done)
                if (!status)
                    return true; // No status means unresolved
                const statusText = typeof status === 'string'
                    ? status.replace(/[\[\]]/g, '').toLowerCase()
                    : (_e = (_d = status.path) === null || _d === void 0 ? void 0 : _d.split('/').pop()) === null || _e === void 0 ? void 0 : _e.replace('.md', '').toLowerCase();
                return statusText !== 'done' && statusText !== 'completed';
            });
            return efforts.array().map((page) => this.dataviewAdapter.convertDataviewPageToExoAsset(page));
        }
        catch (error) {
            console.error('[AreaLayoutService] Error finding unresolved efforts:', error);
            return [];
        }
    }
    /**
     * Extract text from link reference
     */
    extractLinkText(linkRef) {
        var _a;
        if (typeof linkRef === 'string') {
            return linkRef.replace(/[\[\]]/g, '');
        }
        else if (linkRef === null || linkRef === void 0 ? void 0 : linkRef.path) {
            return ((_a = linkRef.path.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.md', '')) || 'Unknown';
        }
        return 'Unknown';
    }
    /**
     * Apply area layout styles
     */
    applyAreaLayoutStyles(container) {
        if (document.querySelector('#area-layout-styles'))
            return;
        const style = document.createElement('style');
        style.id = 'area-layout-styles';
        style.textContent = `
      .area-layout-container {
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
      }
      
      .area-header {
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid var(--background-modifier-border);
      }
      
      .area-title {
        margin: 0 0 10px 0;
        color: var(--text-normal);
        font-size: 2em;
      }
      
      .area-metadata {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }
      
      .area-meta-item {
        font-size: 0.9em;
        color: var(--text-muted);
        background: var(--background-secondary);
        padding: 4px 8px;
        border-radius: 4px;
      }
      
      .area-section {
        margin-bottom: 30px;
        background: var(--background-secondary);
        border-radius: 8px;
        padding: 20px;
        border: 1px solid var(--background-modifier-border);
      }
      
      .area-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .area-section-header h2 {
        margin: 0;
        color: var(--text-normal);
        font-size: 1.3em;
      }
      
      .area-action-button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--interactive-accent);
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s ease;
      }
      
      .area-action-button:hover {
        background: var(--interactive-accent-hover);
        border-color: var(--interactive-accent-hover);
        transform: translateY(-1px);
      }
      
      .area-section-content {
        min-height: 50px;
      }
      
      .area-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .area-list-item {
        padding: 8px 0;
        border-bottom: 1px solid var(--background-modifier-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .area-list-item:last-child {
        border-bottom: none;
      }
      
      .area-link {
        color: var(--text-accent);
        text-decoration: none;
        font-weight: 500;
        cursor: pointer;
        flex: 1;
      }
      
      .area-link:hover {
        color: var(--text-accent-hover);
        text-decoration: underline;
      }
      
      .area-status {
        font-size: 0.8em;
        color: var(--text-muted);
        background: var(--background-primary);
        padding: 2px 6px;
        border-radius: 3px;
      }
      
      .area-empty-state {
        color: var(--text-muted);
        font-style: italic;
        text-align: center;
        padding: 20px;
        margin: 0;
      }
      
      .area-error {
        color: var(--text-error);
        text-align: center;
        padding: 10px;
        margin: 0;
        background: var(--background-primary-alt);
        border-radius: 4px;
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .area-layout-container {
          padding: 15px;
        }
        
        .area-section {
          padding: 15px;
        }
        
        .area-section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .area-metadata {
          flex-direction: column;
          gap: 8px;
        }
      }
    `;
        document.head.appendChild(style);
    }
    /**
     * Render error message
     */
    renderError(container, message) {
        container.innerHTML = '';
        container.createEl('div', {
            text: message,
            cls: 'area-error'
        });
    }
    /**
     * Debug logging
     */
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[AreaLayoutService] ${message}`, ...args);
        }
    }
}
exports.AreaLayoutService = AreaLayoutService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJlYUxheW91dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2VydmljZXMvQXJlYUxheW91dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXNDO0FBR3RDLHVEQUFvRDtBQUNwRCwrREFBNEQ7QUFFNUQsTUFBYSxpQkFBaUI7SUFJNUIsWUFDVSxHQUFRLEVBQ1IsUUFBNEI7UUFENUIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNSLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBRXBDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHlDQUFtQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjLENBQUMsUUFBNEI7UUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBc0IsRUFBRSxXQUEyQjtRQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUM7WUFDSCxrQkFBa0I7WUFDbEIsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFFekIsK0JBQStCO1lBQy9CLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO2dCQUNoRCxHQUFHLEVBQUUsdUJBQXVCO2FBQzdCLENBQUMsQ0FBQztZQUVILGtCQUFrQjtZQUNsQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRXBELDBC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QUFDLENBQUM7UUFDOUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQztRQUNoQyxLQUFLLENBQUMsV0FBVyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXdKbkIsQ0FBQztRQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNLLFdBQVcsQ0FBQyxTQUFzQixFQUFFLE9BQWU7UUFDekQsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDekIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDeEIsSUFBSSxFQUFFLE9BQU87WUFDYixHQUFHLEVBQUUsWUFBWTtTQUNsQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxHQUFHLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVztRQUN6QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsT0FBTyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBcmdCRCw4Q0FxZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEV4b0ZpbGVDb250ZXh0LCBFeG9Bc3NldCB9IGZyb20gJy4uL3R5cGVzL0V4b1R5cGVzJztcbmltcG9ydCB7IFByaW50VGl0bGVTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IERhdGF2aWV3QWRhcHRlciB9IGZyb20gJy4vRGF0YXZpZXdBZGFwdGVyJztcbmltcG9ydCB7IEFyZWFDcmVhdGlvblNlcnZpY2UgfSBmcm9tICcuL0FyZWFDcmVhdGlvblNlcnZpY2UnO1xuXG5leHBvcnQgY2xhc3MgQXJlYUxheW91dFNlcnZpY2Uge1xuICBwcml2YXRlIGRhdGF2aWV3QWRhcHRlcjogRGF0YXZpZXdBZGFwdGVyO1xuICBwcml2YXRlIGFyZWFDcmVhdGlvblNlcnZpY2U6IEFyZWFDcmVhdGlvblNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICBwcml2YXRlIHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3NcbiAgKSB7XG4gICAgdGhpcy5kYXRhdmlld0FkYXB0ZXIgPSBuZXcgRGF0YXZpZXdBZGFwdGVyKGFwcCk7XG4gICAgdGhpcy5hcmVhQ3JlYXRpb25TZXJ2aWNlID0gbmV3IEFyZWFDcmVhdGlvblNlcnZpY2UoYXBwLCBzZXR0aW5ncyk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHNldHRpbmdzIHJlZmVyZW5jZVxuICAgKi9cbiAgdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5ncyk6IHZvaWQge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLmFyZWFDcmVhdGlvblNlcnZpY2UudXBkYXRlU2V0dGluZ3Moc2V0dGluZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciBhcmVhIGxheW91dCBmb3IgZW1zX19BcmVhIGFzc2V0c1xuICAgKi9cbiAgYXN5bmMgcmVuZGVyQXJlYUxheW91dChjb250YWluZXI6IEhUTUxFbGVtZW50LCBmaWxlQ29udGV4dDogRXhvRmlsZUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmxvZygnUmVuZGVyaW5nIGFyZWEgbGF5b3V0IGZvcjonLCBmaWxlQ29udGV4dC5maWxlTmFtZSk7XG5cbiAgICB0cnkge1xuICAgICAgLy8gQ2xlYXIgY29udGFpbmVyXG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgIC8vIENyZWF0ZSBtYWluIGxheW91dCBjb250YWluZXJcbiAgICAgIGNvbnN0IGxheW91dENvbnRhaW5lciA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICBjbHM6ICdhcmVhLWxheW91dC1jb250YWluZXInXG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGFyZWEgaGVhZGVyXG4gICAgICB0aGlzLnJlbmRlckFyZWFIZWFkZXIobGF5b3V0Q29udGFpbmVyLCBmaWxlQ29udGV4dCk7XG5cbiAgICAgIC8vIEFkZCBjaGlsZCBhcmVhcyBzZWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlckNoaWxkQXJlYXNTZWN0aW9uKGxheW91dENvbnRhaW5lciwgZmlsZUNvbnRleHQpO1xuXG4gICAgICAvLyBBZGQgdW5yZXNvbHZlZCB0YXNrcyBzZWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlclVucmVzb2x2ZWRUYXNrc1NlY3Rpb24obGF5b3V0Q29udGFpbmVyLCBmaWxlQ29udGV4dCk7XG5cbiAgICAgIC8vIEFkZCB1bnJlc29sdmVkIHByb2plY3RzIHNlY3Rpb25cbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyVW5yZXNvbHZlZFByb2plY3RzU2VjdGlvbihsYXlvdXRDb250YWluZXIsIGZpbGVDb250ZXh0KTtcblxuICAgICAgLy8gQXBwbHkgc3R5bGVzXG4gICAgICB0aGlzLmFwcGx5QXJlYUxheW91dFN0eWxlcyhjb250YWluZXIpO1xuXG4gICAgICB0aGlzLmxvZygnQXJlYSBsYXlvdXQgcmVuZGVyZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcmVhTGF5b3V0U2VydmljZV0gRXJyb3IgcmVuZGVyaW5nIGFyZWEgbGF5b3V0OicsIGVycm9yKTtcbiAgICAgIHRoaXMucmVuZGVyRXJyb3IoY29udGFpbmVyLCBgRmFpbGVkIHRvIHJlbmRlciBhcmVhIGxheW91dDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciBhcmVhIGhlYWRlciB3aXRoIHRpdGxlIGFuZCBtZXRhZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXJBcmVhSGVhZGVyKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGZpbGVDb250ZXh0OiBFeG9GaWxlQ29udGV4dCk6IHZvaWQge1xuICAgIGNvbnN0IGhlYWRlciA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdhcmVhLWhlYWRlcicgfSk7XG4gICAgXG4gICAgY29uc3QgdGl0bGUgPSBoZWFkZXIuY3JlYXRlRWwoJ2gxJywgeyBcbiAgICAgIHRleHQ6IGZpbGVDb250ZXh0LmZpbGUuYmFzZW5hbWUsXG4gICAgICBjbHM6ICdhcmVhLXRpdGxlJ1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIG1ldGFkYXRhIGlmIGF2YWlsYWJsZVxuICAgIGNvbnN0IG1ldGFkYXRhID0gZmlsZUNvbnRleHQuY3VycmVudFBhZ2U7XG4gICAgaWYgKG1ldGFkYXRhWydleG9fX0Fzc2V0X2NyZWF0ZWRBdCddIHx8IG1ldGFkYXRhWydlbXNfX0FyZWFfcGFyZW50J10pIHtcbiAgICAgIGNvbnN0IG1ldGFDb250YWluZXIgPSBoZWFkZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1tZXRhZGF0YScgfSk7XG4gICAgICBcbiAgICAgIGlmIChtZXRhZGF0YVsnZXhvX19Bc3NldF9jcmVhdGVkQXQnXSkge1xuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZShtZXRhZGF0YVsnZXhvX19Bc3NldF9jcmVhdGVkQXQnXSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgIG1ldGFDb250YWluZXIuY3JlYXRlRWwoJ3NwYW4nLCB7IFxuICAgICAgICAgIHRleHQ6IGBDcmVhdGVkOiAke2NyZWF0ZWRBdH1gLFxuICAgICAgICAgIGNsczogJ2FyZWEtbWV0YS1pdGVtJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKG1ldGFkYXRhWydlbXNfX0FyZWFfcGFyZW50J10pIHtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5leHRyYWN0TGlua1RleHQobWV0YWRhdGFbJ2Vtc19fQXJlYV9wYXJlbnQnXSk7XG4gICAgICAgIG1ldGFDb250YWluZXIuY3JlYXRlRWwoJ3NwYW4nLCB7IFxuICAgICAgICAgIHRleHQ6IGBQYXJlbnQ6ICR7cGFyZW50fWAsXG4gICAgICAgICAgY2xzOiAnYXJlYS1tZXRhLWl0ZW0nXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgY2hpbGQgYXJlYXMgc2VjdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJDaGlsZEFyZWFzU2VjdGlvbihjb250YWluZXI6IEhUTUxFbGVtZW50LCBmaWxlQ29udGV4dDogRXhvRmlsZUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWN0aW9uID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbicgfSk7XG4gICAgXG4gICAgLy8gU2VjdGlvbiBoZWFkZXJcbiAgICBjb25zdCBoZWFkZXIgPSBzZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbi1oZWFkZXInIH0pO1xuICAgIGhlYWRlci5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICfwn5OBIENoaWxkIEFyZWFzJyB9KTtcbiAgICBcbiAgICAvLyBDcmVhdGUgY2hpbGQgYXJlYSBidXR0b25cbiAgICBjb25zdCBjcmVhdGVCdXR0b24gPSBoZWFkZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICcrIENyZWF0ZSBDaGlsZCBBcmVhJyxcbiAgICAgIGNsczogJ2FyZWEtYWN0aW9uLWJ1dHRvbiBjcmVhdGUtY2hpbGQtYnV0dG9uJ1xuICAgIH0pO1xuICAgIFxuICAgIGNyZWF0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuYXJlYUNyZWF0aW9uU2VydmljZS5jcmVhdGVDaGlsZEFyZWEoZmlsZUNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgLy8gQ29udGVudCBjb250YWluZXJcbiAgICBjb25zdCBjb250ZW50ID0gc2VjdGlvbi5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdhcmVhLXNlY3Rpb24tY29udGVudCcgfSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFyZWFOYW1lID0gZmlsZUNvbnRleHQuZmlsZU5hbWUucmVwbGFjZSgnLm1kJywgJycpO1xuICAgICAgY29uc3QgY2hpbGRBcmVhcyA9IGF3YWl0IHRoaXMuZGF0YXZpZXdBZGFwdGVyLmZpbmRDaGlsZEFyZWFzKGFyZWFOYW1lKTtcbiAgICAgIFxuICAgICAgaWYgKGNoaWxkQXJlYXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnRlbnQuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICAgICAgdGV4dDogJ05vIGNoaWxkIGFyZWFzIGZvdW5kJyxcbiAgICAgICAgICBjbHM6ICdhcmVhLWVtcHR5LXN0YXRlJ1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBjb250ZW50LmNyZWF0ZUVsKCd1bCcsIHsgY2xzOiAnYXJlYS1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgYXJlYSBvZiBjaGlsZEFyZWFzKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3QuY3JlYXRlRWwoJ2xpJywgeyBjbHM6ICdhcmVhLWxpc3QtaXRlbScgfSk7XG4gICAgICAgICAgY29uc3QgbGluayA9IGl0ZW0uY3JlYXRlRWwoJ2EnLCB7XG4gICAgICAgICAgICB0ZXh0OiBhcmVhLmZpbGUubmFtZS5yZXBsYWNlKCdBcmVhIC0gJywgJycpLnJlcGxhY2UoJy5tZCcsICcnKSxcbiAgICAgICAgICAgIGNsczogJ2FyZWEtbGluaydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYXJlYS5maWxlLnBhdGgpO1xuICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICBjb25zdCBsZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKTtcbiAgICAgICAgICAgICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQXJlYUxheW91dFNlcnZpY2VdIEVycm9yIGxvYWRpbmcgY2hpbGQgYXJlYXM6JywgZXJyb3IpO1xuICAgICAgY29udGVudC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgdGV4dDogJ0Vycm9yIGxvYWRpbmcgY2hpbGQgYXJlYXMnLFxuICAgICAgICBjbHM6ICdhcmVhLWVycm9yJ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB1bnJlc29sdmVkIHRhc2tzIHNlY3Rpb25cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyVW5yZXNvbHZlZFRhc2tzU2VjdGlvbihjb250YWluZXI6IEhUTUxFbGVtZW50LCBmaWxlQ29udGV4dDogRXhvRmlsZUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWN0aW9uID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbicgfSk7XG4gICAgXG4gICAgLy8gU2VjdGlvbiBoZWFkZXJcbiAgICBjb25zdCBoZWFkZXIgPSBzZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbi1oZWFkZXInIH0pO1xuICAgIGhlYWRlci5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICfwn5OLIFVucmVzb2x2ZWQgVGFza3MnIH0pO1xuXG4gICAgLy8gQ29udGVudCBjb250YWluZXJcbiAgICBjb25zdCBjb250ZW50ID0gc2VjdGlvbi5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdhcmVhLXNlY3Rpb24tY29udGVudCcgfSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFyZWFOYW1lID0gZmlsZUNvbnRleHQuZmlsZU5hbWUucmVwbGFjZSgnLm1kJywgJycpO1xuICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCB0aGlzLmZpbmRVbnJlc29sdmVkRWZmb3J0cyhhcmVhTmFtZSwgJ2Vtc19fVGFzaycpO1xuICAgICAgXG4gICAgICBpZiAodGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnRlbnQuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICAgICAgdGV4dDogJ05vIHVucmVzb2x2ZWQgdGFza3MnLFxuICAgICAgICAgIGNsczogJ2FyZWEtZW1wdHktc3RhdGUnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNvbnRlbnQuY3JlYXRlRWwoJ3VsJywgeyBjbHM6ICdhcmVhLWxpc3QnIH0pO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3QuY3JlYXRlRWwoJ2xpJywgeyBjbHM6ICdhcmVhLWxpc3QtaXRlbScgfSk7XG4gICAgICAgICAgY29uc3QgbGluayA9IGl0ZW0uY3JlYXRlRWwoJ2EnLCB7XG4gICAgICAgICAgICB0ZXh0OiB0YXNrLmZpbGUubmFtZS5yZXBsYWNlKCcubWQnLCAnJyksXG4gICAgICAgICAgICBjbHM6ICdhcmVhLWxpbmsnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQWRkIHN0YXR1cyBpZiBhdmFpbGFibGVcbiAgICAgICAgICBpZiAodGFza1snZW1zX19FZmZvcnRfc3RhdHVzJ10pIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMuZXh0cmFjdExpbmtUZXh0KHRhc2tbJ2Vtc19fRWZmb3J0X3N0YXR1cyddKTtcbiAgICAgICAgICAgIGl0ZW0uY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IGAgKCR7c3RhdHVzfSlgLFxuICAgICAgICAgICAgICBjbHM6ICdhcmVhLXN0YXR1cydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgodGFzay5maWxlLnBhdGgpO1xuICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICBjb25zdCBsZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKTtcbiAgICAgICAgICAgICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQXJlYUxheW91dFNlcnZpY2VdIEVycm9yIGxvYWRpbmcgdGFza3M6JywgZXJyb3IpO1xuICAgICAgY29udGVudC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgdGV4dDogJ0Vycm9yIGxvYWRpbmcgdGFza3MnLFxuICAgICAgICBjbHM6ICdhcmVhLWVycm9yJ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB1bnJlc29sdmVkIHByb2plY3RzIHNlY3Rpb25cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyVW5yZXNvbHZlZFByb2plY3RzU2VjdGlvbihjb250YWluZXI6IEhUTUxFbGVtZW50LCBmaWxlQ29udGV4dDogRXhvRmlsZUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWN0aW9uID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbicgfSk7XG4gICAgXG4gICAgLy8gU2VjdGlvbiBoZWFkZXJcbiAgICBjb25zdCBoZWFkZXIgPSBzZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbi1oZWFkZXInIH0pO1xuICAgIGhlYWRlci5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICfwn5qAIFVucmVzb2x2ZWQgUHJvamVjdHMnIH0pO1xuXG4gICAgLy8gQ29udGVudCBjb250YWluZXJcbiAgICBjb25zdCBjb250ZW50ID0gc2VjdGlvbi5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdhcmVhLXNlY3Rpb24tY29udGVudCcgfSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFyZWFOYW1lID0gZmlsZUNvbnRleHQuZmlsZU5hbWUucmVwbGFjZSgnLm1kJywgJycpO1xuICAgICAgY29uc3QgcHJvamVjdHMgPSBhd2FpdCB0aGlzLmZpbmRVbnJlc29sdmVkRWZmb3J0cyhhcmVhTmFtZSwgJ2Vtc19fUHJvamVjdCcpO1xuICAgICAgXG4gICAgICBpZiAocHJvamVjdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnRlbnQuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICAgICAgdGV4dDogJ05vIHVucmVzb2x2ZWQgcHJvamVjdHMnLFxuICAgICAgICAgIGNsczogJ2FyZWEtZW1wdHktc3RhdGUnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNvbnRlbnQuY3JlYXRlRWwoJ3VsJywgeyBjbHM6ICdhcmVhLWxpc3QnIH0pO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBwcm9qZWN0IG9mIHByb2plY3RzKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3QuY3JlYXRlRWwoJ2xpJywgeyBjbHM6ICdhcmVhLWxpc3QtaXRlbScgfSk7XG4gICAgICAgICAgY29uc3QgbGluayA9IGl0ZW0uY3JlYXRlRWwoJ2EnLCB7XG4gICAgICAgICAgICB0ZXh0OiBwcm9qZWN0LmZpbGUubmFtZS5yZXBsYWNlKCcubWQnLCAnJyksXG4gICAgICAgICAgICBjbHM6ICdhcmVhLWxpbmsnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQWRkIHN0YXR1cyBpZiBhdmFpbGFibGVcbiAgICAgICAgICBpZiAocHJvamVjdFsnZW1zX19FZmZvcnRfc3RhdHVzJ10pIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMuZXh0cmFjdExpbmtUZXh0KHByb2plY3RbJ2Vtc19fRWZmb3J0X3N0YXR1cyddKTtcbiAgICAgICAgICAgIGl0ZW0uY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IGAgKCR7c3RhdHVzfSlgLFxuICAgICAgICAgICAgICBjbHM6ICdhcmVhLXN0YXR1cydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocHJvamVjdC5maWxlLnBhdGgpO1xuICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICBjb25zdCBsZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKTtcbiAgICAgICAgICAgICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQXJlYUxheW91dFNlcnZpY2VdIEVycm9yIGxvYWRpbmcgcHJvamVjdHM6JywgZXJyb3IpO1xuICAgICAgY29udGVudC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgdGV4dDogJ0Vycm9yIGxvYWRpbmcgcHJvamVjdHMnLFxuICAgICAgICBjbHM6ICdhcmVhLWVycm9yJ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdW5yZXNvbHZlZCBlZmZvcnRzICh0YXNrcy9wcm9qZWN0cykgZm9yIGFuIGFyZWFcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZmluZFVucmVzb2x2ZWRFZmZvcnRzKGFyZWFOYW1lOiBzdHJpbmcsIGVmZm9ydFR5cGU6ICdlbXNfX1Rhc2snIHwgJ2Vtc19fUHJvamVjdCcpOiBQcm9taXNlPEV4b0Fzc2V0W10+IHtcbiAgICBjb25zdCBhcGkgPSB0aGlzLmRhdGF2aWV3QWRhcHRlci5hcGk7XG4gICAgaWYgKCFhcGkpIHJldHVybiBbXTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlZmZvcnRzID0gYXBpLnBhZ2VzKCkud2hlcmUoKHA6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBpbnN0YW5jZUNsYXNzID0gcFsnZXhvX19JbnN0YW5jZV9jbGFzcyddIHx8IHBbJ2V4b19faW5zdGFuY2VfY2xhc3MnXTtcbiAgICAgICAgY29uc3QgYXJlYSA9IHBbJ2Vtc19fRWZmb3J0X2FyZWEnXTtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gcFsnZW1zX19FZmZvcnRfc3RhdHVzJ107XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIHRoZSByaWdodCB0eXBlXG4gICAgICAgIGNvbnN0IGlzUmlnaHRUeXBlID0gQXJyYXkuaXNBcnJheShpbnN0YW5jZUNsYXNzKSBcbiAgICAgICAgICA/IGluc3RhbmNlQ2xhc3Muc29tZSgoY2xzOiBhbnkpID0+IFxuICAgICAgICAgICAgICB0eXBlb2YgY2xzID09PSAnc3RyaW5nJyA/IGNscy5pbmNsdWRlcyhlZmZvcnRUeXBlKSA6IGNscy5wYXRoPy5pbmNsdWRlcyhlZmZvcnRUeXBlKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIDogdHlwZW9mIGluc3RhbmNlQ2xhc3MgPT09ICdzdHJpbmcnIFxuICAgICAgICAgICAgPyBpbnN0YW5jZUNsYXNzLmluY2x1ZGVzKGVmZm9ydFR5cGUpXG4gICAgICAgICAgICA6IGluc3RhbmNlQ2xhc3M/LnBhdGg/LmluY2x1ZGVzKGVmZm9ydFR5cGUpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFpc1JpZ2h0VHlwZSB8fCAhYXJlYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgYXJlYSBtYXRjaGVzXG4gICAgICAgIGNvbnN0IGFyZWFOYW1lX2NsZWFuID0gdHlwZW9mIGFyZWEgPT09ICdzdHJpbmcnIFxuICAgICAgICAgID8gYXJlYS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnJylcbiAgICAgICAgICA6IGFyZWEucGF0aD8uc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLm1kJywgJycpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaXNJbkFyZWEgPSBhcmVhTmFtZV9jbGVhbiA9PT0gYXJlYU5hbWU7XG4gICAgICAgIGlmICghaXNJbkFyZWEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIHVucmVzb2x2ZWQgKG5vdCBEb25lKVxuICAgICAgICBpZiAoIXN0YXR1cykgcmV0dXJuIHRydWU7IC8vIE5vIHN0YXR1cyBtZWFucyB1bnJlc29sdmVkXG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0gdHlwZW9mIHN0YXR1cyA9PT0gJ3N0cmluZycgXG4gICAgICAgICAgPyBzdGF0dXMucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICA6IHN0YXR1cy5wYXRoPy5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcubWQnLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzdGF0dXNUZXh0ICE9PSAnZG9uZScgJiYgc3RhdHVzVGV4dCAhPT0gJ2NvbXBsZXRlZCc7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGVmZm9ydHMuYXJyYXkoKS5tYXAoKHBhZ2U6IGFueSkgPT4gdGhpcy5kYXRhdmlld0FkYXB0ZXIuY29udmVydERhdGF2aWV3UGFnZVRvRXhvQXNzZXQocGFnZSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQXJlYUxheW91dFNlcnZpY2VdIEVycm9yIGZpbmRpbmcgdW5yZXNvbHZlZCBlZmZvcnRzOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCB0ZXh0IGZyb20gbGluayByZWZlcmVuY2VcbiAgICovXG4gIHByaXZhdGUgZXh0cmFjdExpbmtUZXh0KGxpbmtSZWY6IHN0cmluZyB8IHsgcGF0aDogc3RyaW5nIH0pOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgbGlua1JlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBsaW5rUmVmLnJlcGxhY2UoL1tcXFtcXF1dL2csICcnKTtcbiAgICB9IGVsc2UgaWYgKGxpbmtSZWY/LnBhdGgpIHtcbiAgICAgIHJldHVybiBsaW5rUmVmLnBhdGguc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLm1kJywgJycpIHx8ICdVbmtub3duJztcbiAgICB9XG4gICAgcmV0dXJuICdVbmtub3duJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhcmVhIGxheW91dCBzdHlsZXNcbiAgICovXG4gIHByaXZhdGUgYXBwbHlBcmVhTGF5b3V0U3R5bGVzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FyZWEtbGF5b3V0LXN0eWxlcycpKSByZXR1cm47XG5cbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuaWQgPSAnYXJlYS1sYXlvdXQtc3R5bGVzJztcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbiAgICAgIC5hcmVhLWxheW91dC1jb250YWluZXIge1xuICAgICAgICBwYWRkaW5nOiAyMHB4O1xuICAgICAgICBtYXgtd2lkdGg6IDkwMHB4O1xuICAgICAgICBtYXJnaW46IDAgYXV0bztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtaGVhZGVyIHtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICAgICAgcGFkZGluZy1ib3R0b206IDE1cHg7XG4gICAgICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLXRpdGxlIHtcbiAgICAgICAgbWFyZ2luOiAwIDAgMTBweCAwO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1ub3JtYWwpO1xuICAgICAgICBmb250LXNpemU6IDJlbTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtbWV0YWRhdGEge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBnYXA6IDE1cHg7XG4gICAgICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtbWV0YS1pdGVtIHtcbiAgICAgICAgZm9udC1zaXplOiAwLjllbTtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpO1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgICAgIHBhZGRpbmc6IDRweCA4cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtc2VjdGlvbiB7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgICBwYWRkaW5nOiAyMHB4O1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLXNlY3Rpb24taGVhZGVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAxNXB4O1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1zZWN0aW9uLWhlYWRlciBoMiB7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbm9ybWFsKTtcbiAgICAgICAgZm9udC1zaXplOiAxLjNlbTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtYWN0aW9uLWJ1dHRvbiB7XG4gICAgICAgIHBhZGRpbmc6IDZweCAxMnB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW9uLWFjY2VudCk7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgZm9udC1zaXplOiAwLjllbTtcbiAgICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtYWN0aW9uLWJ1dHRvbjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcik7XG4gICAgICAgIGJvcmRlci1jb2xvcjogdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyKTtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1zZWN0aW9uLWNvbnRlbnQge1xuICAgICAgICBtaW4taGVpZ2h0OiA1MHB4O1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1saXN0IHtcbiAgICAgICAgbGlzdC1zdHlsZTogbm9uZTtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1saXN0LWl0ZW0ge1xuICAgICAgICBwYWRkaW5nOiA4cHggMDtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKTtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1saXN0LWl0ZW06bGFzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLWxpbmsge1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1hY2NlbnQpO1xuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgZmxleDogMTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtbGluazpob3ZlciB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LWFjY2VudC1ob3Zlcik7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1zdGF0dXMge1xuICAgICAgICBmb250LXNpemU6IDAuOGVtO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gICAgICAgIHBhZGRpbmc6IDJweCA2cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtZW1wdHktc3RhdGUge1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7XG4gICAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICBwYWRkaW5nOiAyMHB4O1xuICAgICAgICBtYXJnaW46IDA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLWVycm9yIHtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHQtZXJyb3IpO1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5LWFsdCk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLyogTW9iaWxlIHJlc3BvbnNpdmVuZXNzICovXG4gICAgICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICAgICAgLmFyZWEtbGF5b3V0LWNvbnRhaW5lciB7XG4gICAgICAgICAgcGFkZGluZzogMTVweDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLmFyZWEtc2VjdGlvbiB7XG4gICAgICAgICAgcGFkZGluZzogMTVweDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLmFyZWEtc2VjdGlvbi1oZWFkZXIge1xuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gICAgICAgICAgZ2FwOiAxMHB4O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAuYXJlYS1tZXRhZGF0YSB7XG4gICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgICBnYXA6IDhweDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIGA7XG4gICAgXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIHByaXZhdGUgcmVuZGVyRXJyb3IoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgIGNsczogJ2FyZWEtZXJyb3InXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVidWcgbG9nZ2luZ1xuICAgKi9cbiAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSkge1xuICAgICAgY29uc29sZS5sb2coYFtBcmVhTGF5b3V0U2VydmljZV0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxufSJdfQ==