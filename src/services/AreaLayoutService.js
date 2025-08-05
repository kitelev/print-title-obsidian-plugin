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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJlYUxheW91dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBcmVhTGF5b3V0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBc0M7QUFHdEMsdURBQW9EO0FBQ3BELCtEQUE0RDtBQUU1RCxNQUFhLGlCQUFpQjtJQUk1QixZQUNVLEdBQVEsRUFDUixRQUE0QjtRQUQ1QixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1IsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFFcEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUkseUNBQW1CLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxRQUE0QjtRQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFzQixFQUFFLFdBQTJCO1FBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTdELElBQUksQ0FBQztZQUNILGtCQUFrQjtZQUNsQixTQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUV6QiwrQkFBK0I7WUFDL0IsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hELEdBQUcsRUFBRSx1QkFBdUI7YUFDN0IsQ0FBQyxDQUFDO1lBRUgsa0JBQWtCO1lBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFcEQsMEJBQTBCO1lBQzFCLE1BQU0s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QUFLLENBQUMsRUFBRSxHQUFHLG9CQUFvQixDQUFDO1FBQ2hDLEtBQUssQ0FBQyxXQUFXLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBd0puQixDQUFDO1FBRUYsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0ssV0FBVyxDQUFDLFNBQXNCLEVBQUUsT0FBZTtRQUN6RCxTQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUN6QixTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtZQUN4QixJQUFJLEVBQUUsT0FBTztZQUNiLEdBQUcsRUFBRSxZQUFZO1NBQ2xCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ3pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixPQUFPLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3pELENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFyZ0JELDhDQXFnQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgRXhvRmlsZUNvbnRleHQsIEV4b0Fzc2V0IH0gZnJvbSAnLi4vdHlwZXMvRXhvVHlwZXMnO1xuaW1wb3J0IHsgUHJpbnRUaXRsZVNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgRGF0YXZpZXdBZGFwdGVyIH0gZnJvbSAnLi9EYXRhdmlld0FkYXB0ZXInO1xuaW1wb3J0IHsgQXJlYUNyZWF0aW9uU2VydmljZSB9IGZyb20gJy4vQXJlYUNyZWF0aW9uU2VydmljZSc7XG5cbmV4cG9ydCBjbGFzcyBBcmVhTGF5b3V0U2VydmljZSB7XG4gIHByaXZhdGUgZGF0YXZpZXdBZGFwdGVyOiBEYXRhdmlld0FkYXB0ZXI7XG4gIHByaXZhdGUgYXJlYUNyZWF0aW9uU2VydmljZTogQXJlYUNyZWF0aW9uU2VydmljZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgIHByaXZhdGUgc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5nc1xuICApIHtcbiAgICB0aGlzLmRhdGF2aWV3QWRhcHRlciA9IG5ldyBEYXRhdmlld0FkYXB0ZXIoYXBwKTtcbiAgICB0aGlzLmFyZWFDcmVhdGlvblNlcnZpY2UgPSBuZXcgQXJlYUNyZWF0aW9uU2VydmljZShhcHAsIHNldHRpbmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgc2V0dGluZ3MgcmVmZXJlbmNlXG4gICAqL1xuICB1cGRhdGVTZXR0aW5ncyhzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuYXJlYUNyZWF0aW9uU2VydmljZS51cGRhdGVTZXR0aW5ncyhzZXR0aW5ncyk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGFyZWEgbGF5b3V0IGZvciBlbXNfX0FyZWEgYXNzZXRzXG4gICAqL1xuICBhc3luYyByZW5kZXJBcmVhTGF5b3V0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGZpbGVDb250ZXh0OiBFeG9GaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nKCdSZW5kZXJpbmcgYXJlYSBsYXlvdXQgZm9yOicsIGZpbGVDb250ZXh0LmZpbGVOYW1lKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBDbGVhciBjb250YWluZXJcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblxuICAgICAgLy8gQ3JlYXRlIG1haW4gbGF5b3V0IGNvbnRhaW5lclxuICAgICAgY29uc3QgbGF5b3V0Q29udGFpbmVyID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIGNsczogJ2FyZWEtbGF5b3V0LWNvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgYXJlYSBoZWFkZXJcbiAgICAgIHRoaXMucmVuZGVyQXJlYUhlYWRlcihsYXlvdXRDb250YWluZXIsIGZpbGVDb250ZXh0KTtcblxuICAgICAgLy8gQWRkIGNoaWxkIGFyZWFzIHNlY3Rpb25cbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyQ2hpbGRBcmVhc1NlY3Rpb24obGF5b3V0Q29udGFpbmVyLCBmaWxlQ29udGV4dCk7XG5cbiAgICAgIC8vIEFkZCB1bnJlc29sdmVkIHRhc2tzIHNlY3Rpb25cbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyVW5yZXNvbHZlZFRhc2tzU2VjdGlvbihsYXlvdXRDb250YWluZXIsIGZpbGVDb250ZXh0KTtcblxuICAgICAgLy8gQWRkIHVucmVzb2x2ZWQgcHJvamVjdHMgc2VjdGlvblxuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJVbnJlc29sdmVkUHJvamVjdHNTZWN0aW9uKGxheW91dENvbnRhaW5lciwgZmlsZUNvbnRleHQpO1xuXG4gICAgICAvLyBBcHBseSBzdHlsZXNcbiAgICAgIHRoaXMuYXBwbHlBcmVhTGF5b3V0U3R5bGVzKGNvbnRhaW5lcik7XG5cbiAgICAgIHRoaXMubG9nKCdBcmVhIGxheW91dCByZW5kZXJlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0FyZWFMYXlvdXRTZXJ2aWNlXSBFcnJvciByZW5kZXJpbmcgYXJlYSBsYXlvdXQ6JywgZXJyb3IpO1xuICAgICAgdGhpcy5yZW5kZXJFcnJvcihjb250YWluZXIsIGBGYWlsZWQgdG8gcmVuZGVyIGFyZWEgbGF5b3V0OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGFyZWEgaGVhZGVyIHdpdGggdGl0bGUgYW5kIG1ldGFkYXRhXG4gICAqL1xuICBwcml2YXRlIHJlbmRlckFyZWFIZWFkZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgZmlsZUNvbnRleHQ6IEV4b0ZpbGVDb250ZXh0KTogdm9pZCB7XG4gICAgY29uc3QgaGVhZGVyID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtaGVhZGVyJyB9KTtcbiAgICBcbiAgICBjb25zdCB0aXRsZSA9IGhlYWRlci5jcmVhdGVFbCgnaDEnLCB7IFxuICAgICAgdGV4dDogZmlsZUNvbnRleHQuZmlsZS5iYXNlbmFtZSxcbiAgICAgIGNsczogJ2FyZWEtdGl0bGUnXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbWV0YWRhdGEgaWYgYXZhaWxhYmxlXG4gICAgY29uc3QgbWV0YWRhdGEgPSBmaWxlQ29udGV4dC5jdXJyZW50UGFnZTtcbiAgICBpZiAobWV0YWRhdGFbJ2V4b19fQXNzZXRfY3JlYXRlZEF0J10gfHwgbWV0YWRhdGFbJ2Vtc19fQXJlYV9wYXJlbnQnXSkge1xuICAgICAgY29uc3QgbWV0YUNvbnRhaW5lciA9IGhlYWRlci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdhcmVhLW1ldGFkYXRhJyB9KTtcbiAgICAgIFxuICAgICAgaWYgKG1ldGFkYXRhWydleG9fX0Fzc2V0X2NyZWF0ZWRBdCddKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKG1ldGFkYXRhWydleG9fX0Fzc2V0X2NyZWF0ZWRBdCddKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgbWV0YUNvbnRhaW5lci5jcmVhdGVFbCgnc3BhbicsIHsgXG4gICAgICAgICAgdGV4dDogYENyZWF0ZWQ6ICR7Y3JlYXRlZEF0fWAsXG4gICAgICAgICAgY2xzOiAnYXJlYS1tZXRhLWl0ZW0nXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAobWV0YWRhdGFbJ2Vtc19fQXJlYV9wYXJlbnQnXSkge1xuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmV4dHJhY3RMaW5rVGV4dChtZXRhZGF0YVsnZW1zX19BcmVhX3BhcmVudCddKTtcbiAgICAgICAgbWV0YUNvbnRhaW5lci5jcmVhdGVFbCgnc3BhbicsIHsgXG4gICAgICAgICAgdGV4dDogYFBhcmVudDogJHtwYXJlbnR9YCxcbiAgICAgICAgICBjbHM6ICdhcmVhLW1ldGEtaXRlbSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciBjaGlsZCBhcmVhcyBzZWN0aW9uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHJlbmRlckNoaWxkQXJlYXNTZWN0aW9uKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGZpbGVDb250ZXh0OiBFeG9GaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1zZWN0aW9uJyB9KTtcbiAgICBcbiAgICAvLyBTZWN0aW9uIGhlYWRlclxuICAgIGNvbnN0IGhlYWRlciA9IHNlY3Rpb24uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1zZWN0aW9uLWhlYWRlcicgfSk7XG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ/Cfk4EgQ2hpbGQgQXJlYXMnIH0pO1xuICAgIFxuICAgIC8vIENyZWF0ZSBjaGlsZCBhcmVhIGJ1dHRvblxuICAgIGNvbnN0IGNyZWF0ZUJ1dHRvbiA9IGhlYWRlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJysgQ3JlYXRlIENoaWxkIEFyZWEnLFxuICAgICAgY2xzOiAnYXJlYS1hY3Rpb24tYnV0dG9uIGNyZWF0ZS1jaGlsZC1idXR0b24nXG4gICAgfSk7XG4gICAgXG4gICAgY3JlYXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5hcmVhQ3JlYXRpb25TZXJ2aWNlLmNyZWF0ZUNoaWxkQXJlYShmaWxlQ29udGV4dCk7XG4gICAgfSk7XG5cbiAgICAvLyBDb250ZW50IGNvbnRhaW5lclxuICAgIGNvbnN0IGNvbnRlbnQgPSBzZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbi1jb250ZW50JyB9KTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXJlYU5hbWUgPSBmaWxlQ29udGV4dC5maWxlTmFtZS5yZXBsYWNlKCcubWQnLCAnJyk7XG4gICAgICBjb25zdCBjaGlsZEFyZWFzID0gYXdhaXQgdGhpcy5kYXRhdmlld0FkYXB0ZXIuZmluZENoaWxkQXJlYXMoYXJlYU5hbWUpO1xuICAgICAgXG4gICAgICBpZiAoY2hpbGRBcmVhcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGVudC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgICB0ZXh0OiAnTm8gY2hpbGQgYXJlYXMgZm91bmQnLFxuICAgICAgICAgIGNsczogJ2FyZWEtZW1wdHktc3RhdGUnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNvbnRlbnQuY3JlYXRlRWwoJ3VsJywgeyBjbHM6ICdhcmVhLWxpc3QnIH0pO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBhcmVhIG9mIGNoaWxkQXJlYXMpIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbGlzdC5jcmVhdGVFbCgnbGknLCB7IGNsczogJ2FyZWEtbGlzdC1pdGVtJyB9KTtcbiAgICAgICAgICBjb25zdCBsaW5rID0gaXRlbS5jcmVhdGVFbCgnYScsIHtcbiAgICAgICAgICAgIHRleHQ6IGFyZWEuZmlsZS5uYW1lLnJlcGxhY2UoJ0FyZWEgLSAnLCAnJykucmVwbGFjZSgnLm1kJywgJycpLFxuICAgICAgICAgICAgY2xzOiAnYXJlYS1saW5rJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChhcmVhLmZpbGUucGF0aCk7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpO1xuICAgICAgICAgICAgICBhd2FpdCBsZWFmLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcmVhTGF5b3V0U2VydmljZV0gRXJyb3IgbG9hZGluZyBjaGlsZCBhcmVhczonLCBlcnJvcik7XG4gICAgICBjb250ZW50LmNyZWF0ZUVsKCdwJywge1xuICAgICAgICB0ZXh0OiAnRXJyb3IgbG9hZGluZyBjaGlsZCBhcmVhcycsXG4gICAgICAgIGNsczogJ2FyZWEtZXJyb3InXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHVucmVzb2x2ZWQgdGFza3Mgc2VjdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJVbnJlc29sdmVkVGFza3NTZWN0aW9uKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGZpbGVDb250ZXh0OiBFeG9GaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1zZWN0aW9uJyB9KTtcbiAgICBcbiAgICAvLyBTZWN0aW9uIGhlYWRlclxuICAgIGNvbnN0IGhlYWRlciA9IHNlY3Rpb24uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1zZWN0aW9uLWhlYWRlcicgfSk7XG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ/Cfk4sgVW5yZXNvbHZlZCBUYXNrcycgfSk7XG5cbiAgICAvLyBDb250ZW50IGNvbnRhaW5lclxuICAgIGNvbnN0IGNvbnRlbnQgPSBzZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbi1jb250ZW50JyB9KTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXJlYU5hbWUgPSBmaWxlQ29udGV4dC5maWxlTmFtZS5yZXBsYWNlKCcubWQnLCAnJyk7XG4gICAgICBjb25zdCB0YXNrcyA9IGF3YWl0IHRoaXMuZmluZFVucmVzb2x2ZWRFZmZvcnRzKGFyZWFOYW1lLCAnZW1zX19UYXNrJyk7XG4gICAgICBcbiAgICAgIGlmICh0YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGVudC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgICB0ZXh0OiAnTm8gdW5yZXNvbHZlZCB0YXNrcycsXG4gICAgICAgICAgY2xzOiAnYXJlYS1lbXB0eS1zdGF0ZSdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsaXN0ID0gY29udGVudC5jcmVhdGVFbCgndWwnLCB7IGNsczogJ2FyZWEtbGlzdCcgfSk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbGlzdC5jcmVhdGVFbCgnbGknLCB7IGNsczogJ2FyZWEtbGlzdC1pdGVtJyB9KTtcbiAgICAgICAgICBjb25zdCBsaW5rID0gaXRlbS5jcmVhdGVFbCgnYScsIHtcbiAgICAgICAgICAgIHRleHQ6IHRhc2suZmlsZS5uYW1lLnJlcGxhY2UoJy5tZCcsICcnKSxcbiAgICAgICAgICAgIGNsczogJ2FyZWEtbGluaydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBBZGQgc3RhdHVzIGlmIGF2YWlsYWJsZVxuICAgICAgICAgIGlmICh0YXNrWydlbXNfX0VmZm9ydF9zdGF0dXMnXSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gdGhpcy5leHRyYWN0TGlua1RleHQodGFza1snZW1zX19FZmZvcnRfc3RhdHVzJ10pO1xuICAgICAgICAgICAgaXRlbS5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgICAgICAgICAgdGV4dDogYCAoJHtzdGF0dXN9KWAsXG4gICAgICAgICAgICAgIGNsczogJ2FyZWEtc3RhdHVzJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aCh0YXNrLmZpbGUucGF0aCk7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpO1xuICAgICAgICAgICAgICBhd2FpdCBsZWFmLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcmVhTGF5b3V0U2VydmljZV0gRXJyb3IgbG9hZGluZyB0YXNrczonLCBlcnJvcik7XG4gICAgICBjb250ZW50LmNyZWF0ZUVsKCdwJywge1xuICAgICAgICB0ZXh0OiAnRXJyb3IgbG9hZGluZyB0YXNrcycsXG4gICAgICAgIGNsczogJ2FyZWEtZXJyb3InXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHVucmVzb2x2ZWQgcHJvamVjdHMgc2VjdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJVbnJlc29sdmVkUHJvamVjdHNTZWN0aW9uKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGZpbGVDb250ZXh0OiBFeG9GaWxlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1zZWN0aW9uJyB9KTtcbiAgICBcbiAgICAvLyBTZWN0aW9uIGhlYWRlclxuICAgIGNvbnN0IGhlYWRlciA9IHNlY3Rpb24uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYXJlYS1zZWN0aW9uLWhlYWRlcicgfSk7XG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ/CfmoAgVW5yZXNvbHZlZCBQcm9qZWN0cycgfSk7XG5cbiAgICAvLyBDb250ZW50IGNvbnRhaW5lclxuICAgIGNvbnN0IGNvbnRlbnQgPSBzZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2FyZWEtc2VjdGlvbi1jb250ZW50JyB9KTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXJlYU5hbWUgPSBmaWxlQ29udGV4dC5maWxlTmFtZS5yZXBsYWNlKCcubWQnLCAnJyk7XG4gICAgICBjb25zdCBwcm9qZWN0cyA9IGF3YWl0IHRoaXMuZmluZFVucmVzb2x2ZWRFZmZvcnRzKGFyZWFOYW1lLCAnZW1zX19Qcm9qZWN0Jyk7XG4gICAgICBcbiAgICAgIGlmIChwcm9qZWN0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGVudC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgICB0ZXh0OiAnTm8gdW5yZXNvbHZlZCBwcm9qZWN0cycsXG4gICAgICAgICAgY2xzOiAnYXJlYS1lbXB0eS1zdGF0ZSdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsaXN0ID0gY29udGVudC5jcmVhdGVFbCgndWwnLCB7IGNsczogJ2FyZWEtbGlzdCcgfSk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHByb2plY3Qgb2YgcHJvamVjdHMpIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbGlzdC5jcmVhdGVFbCgnbGknLCB7IGNsczogJ2FyZWEtbGlzdC1pdGVtJyB9KTtcbiAgICAgICAgICBjb25zdCBsaW5rID0gaXRlbS5jcmVhdGVFbCgnYScsIHtcbiAgICAgICAgICAgIHRleHQ6IHByb2plY3QuZmlsZS5uYW1lLnJlcGxhY2UoJy5tZCcsICcnKSxcbiAgICAgICAgICAgIGNsczogJ2FyZWEtbGluaydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBBZGQgc3RhdHVzIGlmIGF2YWlsYWJsZVxuICAgICAgICAgIGlmIChwcm9qZWN0WydlbXNfX0VmZm9ydF9zdGF0dXMnXSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gdGhpcy5leHRyYWN0TGlua1RleHQocHJvamVjdFsnZW1zX19FZmZvcnRfc3RhdHVzJ10pO1xuICAgICAgICAgICAgaXRlbS5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgICAgICAgICAgdGV4dDogYCAoJHtzdGF0dXN9KWAsXG4gICAgICAgICAgICAgIGNsczogJ2FyZWEtc3RhdHVzJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwcm9qZWN0LmZpbGUucGF0aCk7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpO1xuICAgICAgICAgICAgICBhd2FpdCBsZWFmLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcmVhTGF5b3V0U2VydmljZV0gRXJyb3IgbG9hZGluZyBwcm9qZWN0czonLCBlcnJvcik7XG4gICAgICBjb250ZW50LmNyZWF0ZUVsKCdwJywge1xuICAgICAgICB0ZXh0OiAnRXJyb3IgbG9hZGluZyBwcm9qZWN0cycsXG4gICAgICAgIGNsczogJ2FyZWEtZXJyb3InXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCB1bnJlc29sdmVkIGVmZm9ydHMgKHRhc2tzL3Byb2plY3RzKSBmb3IgYW4gYXJlYVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBmaW5kVW5yZXNvbHZlZEVmZm9ydHMoYXJlYU5hbWU6IHN0cmluZywgZWZmb3J0VHlwZTogJ2Vtc19fVGFzaycgfCAnZW1zX19Qcm9qZWN0Jyk6IFByb21pc2U8RXhvQXNzZXRbXT4ge1xuICAgIGNvbnN0IGFwaSA9IHRoaXMuZGF0YXZpZXdBZGFwdGVyLmFwaTtcbiAgICBpZiAoIWFwaSkgcmV0dXJuIFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVmZm9ydHMgPSBhcGkucGFnZXMoKS53aGVyZSgocDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlQ2xhc3MgPSBwWydleG9fX0luc3RhbmNlX2NsYXNzJ10gfHwgcFsnZXhvX19pbnN0YW5jZV9jbGFzcyddO1xuICAgICAgICBjb25zdCBhcmVhID0gcFsnZW1zX19FZmZvcnRfYXJlYSddO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBwWydlbXNfX0VmZm9ydF9zdGF0dXMnXTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgdGhlIHJpZ2h0IHR5cGVcbiAgICAgICAgY29uc3QgaXNSaWdodFR5cGUgPSBBcnJheS5pc0FycmF5KGluc3RhbmNlQ2xhc3MpIFxuICAgICAgICAgID8gaW5zdGFuY2VDbGFzcy5zb21lKChjbHM6IGFueSkgPT4gXG4gICAgICAgICAgICAgIHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnID8gY2xzLmluY2x1ZGVzKGVmZm9ydFR5cGUpIDogY2xzLnBhdGg/LmluY2x1ZGVzKGVmZm9ydFR5cGUpXG4gICAgICAgICAgICApXG4gICAgICAgICAgOiB0eXBlb2YgaW5zdGFuY2VDbGFzcyA9PT0gJ3N0cmluZycgXG4gICAgICAgICAgICA/IGluc3RhbmNlQ2xhc3MuaW5jbHVkZXMoZWZmb3J0VHlwZSlcbiAgICAgICAgICAgIDogaW5zdGFuY2VDbGFzcz8ucGF0aD8uaW5jbHVkZXMoZWZmb3J0VHlwZSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWlzUmlnaHRUeXBlIHx8ICFhcmVhKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiBhcmVhIG1hdGNoZXNcbiAgICAgICAgY29uc3QgYXJlYU5hbWVfY2xlYW4gPSB0eXBlb2YgYXJlYSA9PT0gJ3N0cmluZycgXG4gICAgICAgICAgPyBhcmVhLnJlcGxhY2UoL1tcXFtcXF1dL2csICcnKVxuICAgICAgICAgIDogYXJlYS5wYXRoPy5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcubWQnLCAnJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpc0luQXJlYSA9IGFyZWFOYW1lX2NsZWFuID09PSBhcmVhTmFtZTtcbiAgICAgICAgaWYgKCFpc0luQXJlYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgdW5yZXNvbHZlZCAobm90IERvbmUpXG4gICAgICAgIGlmICghc3RhdHVzKSByZXR1cm4gdHJ1ZTsgLy8gTm8gc3RhdHVzIG1lYW5zIHVucmVzb2x2ZWRcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSB0eXBlb2Ygc3RhdHVzID09PSAnc3RyaW5nJyBcbiAgICAgICAgICA/IHN0YXR1cy5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIDogc3RhdHVzLnBhdGg/LnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5tZCcsICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHN0YXR1c1RleHQgIT09ICdkb25lJyAmJiBzdGF0dXNUZXh0ICE9PSAnY29tcGxldGVkJztcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZWZmb3J0cy5hcnJheSgpLm1hcCgocGFnZTogYW55KSA9PiB0aGlzLmRhdGF2aWV3QWRhcHRlci5jb252ZXJ0RGF0YXZpZXdQYWdlVG9FeG9Bc3NldChwYWdlKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcmVhTGF5b3V0U2VydmljZV0gRXJyb3IgZmluZGluZyB1bnJlc29sdmVkIGVmZm9ydHM6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IHRleHQgZnJvbSBsaW5rIHJlZmVyZW5jZVxuICAgKi9cbiAgcHJpdmF0ZSBleHRyYWN0TGlua1RleHQobGlua1JlZjogc3RyaW5nIHwgeyBwYXRoOiBzdHJpbmcgfSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBsaW5rUmVmID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGxpbmtSZWYucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpO1xuICAgIH0gZWxzZSBpZiAobGlua1JlZj8ucGF0aCkge1xuICAgICAgcmV0dXJuIGxpbmtSZWYucGF0aC5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcubWQnLCAnJykgfHwgJ1Vua25vd24nO1xuICAgIH1cbiAgICByZXR1cm4gJ1Vua25vd24nO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IGFyZWEgbGF5b3V0IHN0eWxlc1xuICAgKi9cbiAgcHJpdmF0ZSBhcHBseUFyZWFMYXlvdXRTdHlsZXMoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXJlYS1sYXlvdXQtc3R5bGVzJykpIHJldHVybjtcblxuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5pZCA9ICdhcmVhLWxheW91dC1zdHlsZXMnO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYFxuICAgICAgLmFyZWEtbGF5b3V0LWNvbnRhaW5lciB7XG4gICAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgICAgIG1heC13aWR0aDogOTAwcHg7XG4gICAgICAgIG1hcmdpbjogMCBhdXRvO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1oZWFkZXIge1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAzMHB4O1xuICAgICAgICBwYWRkaW5nLWJvdHRvbTogMTVweDtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDAgMCAxMHB4IDA7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW5vcm1hbCk7XG4gICAgICAgIGZvbnQtc2l6ZTogMmVtO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1tZXRhZGF0YSB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGdhcDogMTVweDtcbiAgICAgICAgZmxleC13cmFwOiB3cmFwO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1tZXRhLWl0ZW0ge1xuICAgICAgICBmb250LXNpemU6IDAuOWVtO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICAgICAgcGFkZGluZzogNHB4IDhweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1zZWN0aW9uIHtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtc2VjdGlvbi1oZWFkZXIge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDE1cHg7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLXNlY3Rpb24taGVhZGVyIGgyIHtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1ub3JtYWwpO1xuICAgICAgICBmb250LXNpemU6IDEuM2VtO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1hY3Rpb24tYnV0dG9uIHtcbiAgICAgICAgcGFkZGluZzogNnB4IDEycHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KTtcbiAgICAgICAgYmFja2dyb3VuZDogdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KTtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHQtb24tYWNjZW50KTtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBmb250LXNpemU6IDAuOWVtO1xuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1hY3Rpb24tYnV0dG9uOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZDogdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyKTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXIpO1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLXNlY3Rpb24tY29udGVudCB7XG4gICAgICAgIG1pbi1oZWlnaHQ6IDUwcHg7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLWxpc3Qge1xuICAgICAgICBsaXN0LXN0eWxlOiBub25lO1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgICAgICBtYXJnaW46IDA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLWxpc3QtaXRlbSB7XG4gICAgICAgIHBhZGRpbmc6IDhweCAwO1xuICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLWxpc3QtaXRlbTpsYXN0LWNoaWxkIHtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtbGluayB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LWFjY2VudCk7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBmbGV4OiAxO1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1saW5rOmhvdmVyIHtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHQtYWNjZW50LWhvdmVyKTtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC5hcmVhLXN0YXR1cyB7XG4gICAgICAgIGZvbnQtc2l6ZTogMC44ZW07XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcbiAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgICAgICAgcGFkZGluZzogMnB4IDZweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgICAgfVxuICAgICAgXG4gICAgICAuYXJlYS1lbXB0eS1zdGF0ZSB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcbiAgICAgICAgZm9udC1zdHlsZTogaXRhbGljO1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLmFyZWEtZXJyb3Ige1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1lcnJvcik7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgcGFkZGluZzogMTBweDtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnktYWx0KTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgfVxuICAgICAgXG4gICAgICAvKiBNb2JpbGUgcmVzcG9uc2l2ZW5lc3MgKi9cbiAgICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgICAgICAuYXJlYS1sYXlvdXQtY29udGFpbmVyIHtcbiAgICAgICAgICBwYWRkaW5nOiAxNXB4O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAuYXJlYS1zZWN0aW9uIHtcbiAgICAgICAgICBwYWRkaW5nOiAxNXB4O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAuYXJlYS1zZWN0aW9uLWhlYWRlciB7XG4gICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICAgICAgICBnYXA6IDEwcHg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC5hcmVhLW1ldGFkYXRhIHtcbiAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICAgIGdhcDogOHB4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgYDtcbiAgICBcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgZXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXJFcnJvcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgY2xzOiAnYXJlYS1lcnJvcidcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1ZyBsb2dnaW5nXG4gICAqL1xuICBwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0FyZWFMYXlvdXRTZXJ2aWNlXSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gICAgfVxuICB9XG59Il19