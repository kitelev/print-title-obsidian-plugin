import { App, TFile } from 'obsidian';
import { ExoFileContext, ExoAsset } from '../types/ExoTypes';
import { PrintTitleSettings } from '../types';
import { DataviewAdapter } from './DataviewAdapter';
import { AreaCreationService } from './AreaCreationService';

export class AreaLayoutService {
  private dataviewAdapter: DataviewAdapter;
  private areaCreationService: AreaCreationService;

  constructor(
    private app: App,
    private settings: PrintTitleSettings
  ) {
    this.dataviewAdapter = new DataviewAdapter(app);
    this.areaCreationService = new AreaCreationService(app, settings);
  }

  /**
   * Update settings reference
   */
  updateSettings(settings: PrintTitleSettings): void {
    this.settings = settings;
    this.areaCreationService.updateSettings(settings);
  }

  /**
   * Render area layout for ems__Area assets
   */
  async renderAreaLayout(container: HTMLElement, fileContext: ExoFileContext): Promise<void> {
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
    } catch (error) {
      console.error('[AreaLayoutService] Error rendering area layout:', error);
      this.renderError(container, `Failed to render area layout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Render area header with title and metadata
   */
  private renderAreaHeader(container: HTMLElement, fileContext: ExoFileContext): void {
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
  private async renderChildAreasSection(container: HTMLElement, fileContext: ExoFileContext): Promise<void> {
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
      } else {
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
            if (file instanceof TFile) {
              const leaf = this.app.workspace.getLeaf();
              await leaf.openFile(file);
            }
          });
        }
      }
    } catch (error) {
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
  private async renderUnresolvedTasksSection(container: HTMLElement, fileContext: ExoFileContext): Promise<void> {
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
      } else {
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
            if (file instanceof TFile) {
              const leaf = this.app.workspace.getLeaf();
              await leaf.openFile(file);
            }
          });
        }
      }
    } catch (error) {
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
  private async renderUnresolvedProjectsSection(container: HTMLElement, fileContext: ExoFileContext): Promise<void> {
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
      } else {
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
            if (file instanceof TFile) {
              const leaf = this.app.workspace.getLeaf();
              await leaf.openFile(file);
            }
          });
        }
      }
    } catch (error) {
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
  private async findUnresolvedEfforts(areaName: string, effortType: 'ems__Task' | 'ems__Project'): Promise<ExoAsset[]> {
    const api = this.dataviewAdapter.api;
    if (!api) return [];

    try {
      const efforts = api.pages().where((p: any) => {
        const instanceClass = p['exo__Instance_class'] || p['exo__instance_class'];
        const area = p['ems__Effort_area'];
        const status = p['ems__Effort_status'];
        
        // Check if this is the right type
        const isRightType = Array.isArray(instanceClass) 
          ? instanceClass.some((cls: any) => 
              typeof cls === 'string' ? cls.includes(effortType) : cls.path?.includes(effortType)
            )
          : typeof instanceClass === 'string' 
            ? instanceClass.includes(effortType)
            : instanceClass?.path?.includes(effortType);
        
        if (!isRightType || !area) return false;
        
        // Check if area matches
        const areaName_clean = typeof area === 'string' 
          ? area.replace(/[\[\]]/g, '')
          : area.path?.split('/').pop()?.replace('.md', '');
        
        const isInArea = areaName_clean === areaName;
        if (!isInArea) return false;
        
        // Check if unresolved (not Done)
        if (!status) return true; // No status means unresolved
        
        const statusText = typeof status === 'string' 
          ? status.replace(/[\[\]]/g, '').toLowerCase()
          : status.path?.split('/').pop()?.replace('.md', '').toLowerCase();
        
        return statusText !== 'done' && statusText !== 'completed';
      });

      return efforts.array().map((page: any) => this.dataviewAdapter.convertDataviewPageToExoAsset(page));
    } catch (error) {
      console.error('[AreaLayoutService] Error finding unresolved efforts:', error);
      return [];
    }
  }

  /**
   * Extract text from link reference
   */
  private extractLinkText(linkRef: string | { path: string }): string {
    if (typeof linkRef === 'string') {
      return linkRef.replace(/[\[\]]/g, '');
    } else if (linkRef?.path) {
      return linkRef.path.split('/').pop()?.replace('.md', '') || 'Unknown';
    }
    return 'Unknown';
  }

  /**
   * Apply area layout styles
   */
  private applyAreaLayoutStyles(container: HTMLElement): void {
    if (document.querySelector('#area-layout-styles')) return;

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
  private renderError(container: HTMLElement, message: string): void {
    container.innerHTML = '';
    container.createEl('div', {
      text: message,
      cls: 'area-error'
    });
  }

  /**
   * Debug logging
   */
  private log(message: string, ...args: any[]): void {
    if (this.settings.enableDebugMode) {
      console.log(`[AreaLayoutService] ${message}`, ...args);
    }
  }
}