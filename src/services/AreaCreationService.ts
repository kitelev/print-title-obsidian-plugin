import { App, TFile, Notice, Modal } from 'obsidian';
import { ExoFileContext, AreaCreationData } from '../types/ExoTypes';
import { PrintTitleSettings } from '../types';

export class AreaCreationModal extends Modal {
  private result: { name: string | null } = { name: null };
  private onSubmit: (result: { name: string | null }) => void;

  constructor(app: App, onSubmit: (result: { name: string | null }) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Create New Child Area' });

    const inputContainer = contentEl.createDiv();
    inputContainer.style.marginBottom = '20px';

    const input = inputContainer.createEl('input', {
      type: 'text',
      placeholder: 'Enter area name...'
    });
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.fontSize = '14px';
    input.style.border = '1px solid var(--background-modifier-border)';
    input.style.borderRadius = '4px';
    input.style.background = 'var(--background-modifier-form-field)';
    input.style.color = 'var(--text-normal)';

    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'flex-end';

    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.border = '1px solid var(--background-modifier-border)';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.background = 'var(--background-secondary)';
    cancelButton.style.color = 'var(--text-normal)';
    cancelButton.style.cursor = 'pointer';

    const createButton = buttonContainer.createEl('button', { text: 'Create' });
    createButton.style.padding = '8px 16px';
    createButton.style.border = 'none';
    createButton.style.borderRadius = '4px';
    createButton.style.background = 'var(--interactive-accent)';
    createButton.style.color = 'var(--text-on-accent)';
    createButton.style.cursor = 'pointer';

    const submit = () => {
      const name = input.value.trim();
      this.result.name = name || null;
      this.close();
    };

    createButton.addEventListener('click', submit);
    cancelButton.addEventListener('click', () => {
      this.result.name = null;
      this.close();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submit();
      } else if (e.key === 'Escape') {
        this.result.name = null;
        this.close();
      }
    });

    // Focus input
    setTimeout(() => input.focus(), 50);
  }

  onClose() {
    this.onSubmit(this.result);
  }
}

export class AreaCreationService {
  constructor(
    private app: App,
    private settings: PrintTitleSettings
  ) {}

  /**
   * Update settings reference
   */
  updateSettings(settings: PrintTitleSettings): void {
    this.settings = settings;
  }

  /**
   * Create a new child area for the given parent area
   */
  async createChildArea(parentContext: ExoFileContext): Promise<void> {
    this.log('Creating child area for:', parentContext.fileName);

    try {
      const areaName = await this.showAreaNameModal();
      if (!areaName) {
        this.log('Area creation cancelled');
        return;
      }

      const creationData = this.prepareAreaCreationData(areaName, parentContext);
      const content = this.generateAreaContent(creationData);
      const filePath = this.generateAreaFilePath(areaName);

      await this.createAreaFile(filePath, content);
      await this.openNewArea(filePath);

      new Notice(`Created new child area: ${areaName}`);
      this.log(`Successfully created child area: ${areaName} at ${filePath}`);
    } catch (error) {
      const errorMessage = `Failed to create area: ${error instanceof Error ? error.message : String(error)}`;
      console.error('[AreaCreationService]', errorMessage, error);
      new Notice(errorMessage);
    }
  }

  /**
   * Show modal to get area name from user
   */
  private showAreaNameModal(): Promise<string | null> {
    return new Promise((resolve) => {
      new AreaCreationModal(this.app, (result) => {
        resolve(result.name);
      }).open();
    });
  }

  /**
   * Prepare area creation data
   */
  private prepareAreaCreationData(name: string, parentContext: ExoFileContext): AreaCreationData {
    return {
      name,
      parentPath: parentContext.fileName.replace('.md', ''),
      parentOntology: this.getParentOntology(parentContext),
      createdAt: this.getLocalTimestamp(),
      uid: this.generateUUID()
    };
  }

  /**
   * Generate area content with proper frontmatter
   */
  private generateAreaContent(data: AreaCreationData): string {
    return `---
exo__Asset_isDefinedBy: ${data.parentOntology}
exo__Asset_uid: ${data.uid}
exo__Asset_createdAt: ${data.createdAt}
exo__Instance_class:
  - "[[ems__Area]]"
ems__Area_parent: "[[${data.parentPath}]]"
---

# ${data.name}

`;
  }

  /**
   * Generate file path for the new area
   */
  private generateAreaFilePath(name: string): string {
    // Try to determine the appropriate folder based on current file location
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      const parentDir = activeFile.parent?.path || '';
      if (parentDir) {
        return `${parentDir}/Area - ${name}.md`;
      }
    }
    
    // Fallback to default area folder
    return `03 Knowledge/Areas/Area - ${name}.md`;
  }

  /**
   * Create the area file
   */
  private async createAreaFile(filePath: string, content: string): Promise<TFile> {
    // Ensure parent directories exist
    const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
    if (parentPath && !this.app.vault.getAbstractFileByPath(parentPath)) {
      await this.app.vault.createFolder(parentPath);
      this.log(`Created parent directory: ${parentPath}`);
    }

    return await this.app.vault.create(filePath, content);
  }

  /**
   * Open the newly created area in a new tab
   */
  private async openNewArea(filePath: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.openFile(file);
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
    }
  }

  /**
   * Generate UUID for the area
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /**
   * Get local timestamp without Z suffix
   */
  private getLocalTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }

  /**
   * Get parent ontology from file context
   */
  private getParentOntology(parentContext: ExoFileContext): string {
    const parentOntology = parentContext.currentPage['exo__Asset_isDefinedBy'];
    
    if (typeof parentOntology === 'object' && parentOntology.path) {
      return `"[[${parentOntology.path.split('/').pop()?.replace('.md', '')}]]"`;
    }
    
    if (typeof parentOntology === 'string') {
      return parentOntology;
    }
    
    // Default fallback
    return '"[[!ems]]"';
  }

  /**
   * Debug logging
   */
  private log(message: string, ...args: any[]): void {
    if (this.settings.enableDebugMode) {
      console.log(`[AreaCreationService] ${message}`, ...args);
    }
  }
}