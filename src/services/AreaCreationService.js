"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaCreationService = exports.AreaCreationModal = void 0;
const obsidian_1 = require("obsidian");
class AreaCreationModal extends obsidian_1.Modal {
    constructor(app, onSubmit) {
        super(app);
        this.result = { name: null };
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
            }
            else if (e.key === 'Escape') {
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
exports.AreaCreationModal = AreaCreationModal;
class AreaCreationService {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
    }
    /**
     * Update settings reference
     */
    updateSettings(settings) {
        this.settings = settings;
    }
    /**
     * Create a new child area for the given parent area
     */
    async createChildArea(parentContext) {
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
            new obsidian_1.Notice(`Created new child area: ${areaName}`);
            this.log(`Successfully created child area: ${areaName} at ${filePath}`);
        }
        catch (error) {
            const errorMessage = `Failed to create area: ${error instanceof Error ? error.message : String(error)}`;
            console.error('[AreaCreationService]', errorMessage, error);
            new obsidian_1.Notice(errorMessage);
        }
    }
    /**
     * Show modal to get area name from user
     */
    showAreaNameModal() {
        return new Promise((resolve) => {
            new AreaCreationModal(this.app, (result) => {
                resolve(result.name);
            }).open();
        });
    }
    /**
     * Prepare area creation data
     */
    prepareAreaCreationData(name, parentContext) {
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
    generateAreaContent(data) {
        return `---
exo__Asset_isDefinedBy: ${data.parentOntology}
exo__Asset_uid: ${data.uid}
exo__Asset_createdAt: ${data.createdAt}
exo__Instance_class:
  - "[[ems__Area]]"
ems__Area_parent: "[[${data.parentPath}]]"
---

# ${data.name}

\`\`\`dataviewjs
// Enhanced Print Title Plugin will render the area layout here
if (window.PrintTitleUI) {
  await window.PrintTitleUI.renderAreaLayout(dv, this);
} else {
  // Fallback for compatibility
  if (window.ExoUIRender) {
    await window.ExoUIRender(dv, this);
  } else {
    dv.paragraph("Area layout will be rendered when Print Title Plugin is active.");
  }
}
\`\`\``;
    }
    /**
     * Generate file path for the new area
     */
    generateAreaFilePath(name) {
        var _a;
        // Try to determine the appropriate folder based on current file location
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            const parentDir = ((_a = activeFile.parent) === null || _a === void 0 ? void 0 : _a.path) || '';
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
    async createAreaFile(filePath, content) {
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
    async openNewArea(filePath) {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof obsidian_1.TFile) {
            const leaf = this.app.workspace.getLeaf('tab');
            await leaf.openFile(file);
            this.app.workspace.setActiveLeaf(leaf, { focus: true });
        }
    }
    /**
     * Generate UUID for the area
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    /**
     * Get local timestamp without Z suffix
     */
    getLocalTimestamp() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }
    /**
     * Get parent ontology from file context
     */
    getParentOntology(parentContext) {
        var _a;
        const parentOntology = parentContext.currentPage['exo__Asset_isDefinedBy'];
        if (typeof parentOntology === 'object' && parentOntology.path) {
            return `"[[${(_a = parentOntology.path.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.md', '')}]]"`;
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
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[AreaCreationService] ${message}`, ...args);
        }
    }
}
exports.AreaCreationService = AreaCreationService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJlYUNyZWF0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFyZWFDcmVhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXFEO0FBSXJELE1BQWEsaUJBQWtCLFNBQVEsZ0JBQUs7SUFJMUMsWUFBWSxHQUFRLEVBQUUsUUFBbUQ7UUFDdkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBSkwsV0FBTSxHQUE0QixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUt2RCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRUQsTUFBTTtRQUNKLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDM0IsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWxCLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUU1RCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDN0MsY0FBYyxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBRTNDLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQzdDLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLG9CQUFvQjtTQUNsQyxDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDM0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQzVCLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztRQUM5QixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyw2Q0FBNkMsQ0FBQztRQUNuRSxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxLQUFLLENB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QztJQUNILENBQUM7Q0FDRjtBQXZMRCxrREF1TEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIFRGaWxlLCBOb3RpY2UsIE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgRXhvRmlsZUNvbnRleHQsIEFyZWFDcmVhdGlvbkRhdGEgfSBmcm9tICcuLi90eXBlcy9FeG9UeXBlcyc7XG5pbXBvcnQgeyBQcmludFRpdGxlU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBBcmVhQ3JlYXRpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSByZXN1bHQ6IHsgbmFtZTogc3RyaW5nIHwgbnVsbCB9ID0geyBuYW1lOiBudWxsIH07XG4gIHByaXZhdGUgb25TdWJtaXQ6IChyZXN1bHQ6IHsgbmFtZTogc3RyaW5nIHwgbnVsbCB9KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBvblN1Ym1pdDogKHJlc3VsdDogeyBuYW1lOiBzdHJpbmcgfCBudWxsIH0pID0+IHZvaWQpIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMub25TdWJtaXQgPSBvblN1Ym1pdDtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcblxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdDcmVhdGUgTmV3IENoaWxkIEFyZWEnIH0pO1xuXG4gICAgY29uc3QgaW5wdXRDb250YWluZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KCk7XG4gICAgaW5wdXRDb250YWluZXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzIwcHgnO1xuXG4gICAgY29uc3QgaW5wdXQgPSBpbnB1dENvbnRhaW5lci5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ0VudGVyIGFyZWEgbmFtZS4uLidcbiAgICB9KTtcbiAgICBpbnB1dC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBpbnB1dC5zdHlsZS5wYWRkaW5nID0gJzhweCc7XG4gICAgaW5wdXQuc3R5bGUuZm9udFNpemUgPSAnMTRweCc7XG4gICAgaW5wdXQuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlciknO1xuICAgIGlucHV0LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xuICAgIGlucHV0LnN0eWxlLmJhY2tncm91bmQgPSAndmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1mb3JtLWZpZWxkKSc7XG4gICAgaW5wdXQuc3R5bGUuY29sb3IgPSAndmFyKC0tdGV4dC1ub3JtYWwpJztcblxuICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoKTtcbiAgICBidXR0b25Db250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICBidXR0b25Db250YWluZXIuc3R5bGUuZ2FwID0gJzEwcHgnO1xuICAgIGJ1dHRvbkNvbnRhaW5lci5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdmbGV4LWVuZCc7XG5cbiAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBidXR0b25Db250YWluZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NhbmNlbCcgfSk7XG4gICAgY2FuY2VsQnV0dG9uLnN0eWxlLnBhZGRpbmcgPSAnOHB4IDE2cHgnO1xuICAgIGNhbmNlbEJ1dHRvbi5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKSc7XG4gICAgY2FuY2VsQnV0dG9uLnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xuICAgIGNhbmNlbEJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KSc7XG4gICAgY2FuY2VsQnV0dG9uLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtbm9ybWFsKSc7XG4gICAgY2FuY2VsQnV0dG9uLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgIGNvbnN0IGNyZWF0ZUJ1dHRvbiA9IGJ1dHRvbkNvbnRhaW5lci5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnQ3JlYXRlJyB9KTtcbiAgICBjcmVhdGVCdXR0b24uc3R5bGUucGFkZGluZyA9ICc4cHggMTZweCc7XG4gICAgY3JlYXRlQnV0dG9uLnN0eWxlLmJvcmRlciA9ICdub25lJztcbiAgICBjcmVhdGVCdXR0b24uc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgY3JlYXRlQnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSAndmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KSc7XG4gICAgY3JlYXRlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtb24tYWNjZW50KSc7XG4gICAgY3JlYXRlQnV0dG9uLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBpbnB1dC52YWx1ZS50cmltKCk7XG4gICAgICB0aGlzLnJlc3VsdC5uYW1lID0gbmFtZSB8fCBudWxsO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH07XG5cbiAgICBjcmVhdGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzdWJtaXQpO1xuICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHRoaXMucmVzdWx0Lm5hbWUgPSBudWxsO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgc3VibWl0KCk7XG4gICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICB0aGlzLnJlc3VsdC5uYW1lID0gbnVsbDtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRm9jdXMgaW5wdXRcbiAgICBzZXRUaW1lb3V0KCgpID0+IGlucHV0LmZvY3VzKCksIDUwKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKSB7XG4gICAgdGhpcy5vblN1Ym1pdCh0aGlzLnJlc3VsdCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFyZWFDcmVhdGlvblNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgIHByaXZhdGUgc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5nc1xuICApIHt9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBzZXR0aW5ncyByZWZlcmVuY2VcbiAgICovXG4gIHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MpOiB2b2lkIHtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGNoaWxkIGFyZWEgZm9yIHRoZSBnaXZlbiBwYXJlbnQgYXJlYVxuICAgKi9cbiAgYXN5bmMgY3JlYXRlQ2hpbGRBcmVhKHBhcmVudENvbnRleHQ6IEV4b0ZpbGVDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5sb2coJ0NyZWF0aW5nIGNoaWxkIGFyZWEgZm9yOicsIHBhcmVudENvbnRleHQuZmlsZU5hbWUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFyZWFOYW1lID0gYXdhaXQgdGhpcy5zaG93QXJlYU5hbWVNb2RhbCgpO1xuICAgICAgaWYgKCFhcmVhTmFtZSkge1xuICAgICAgICB0aGlzLmxvZygnQXJlYSBjcmVhdGlvbiBjYW5jZWxsZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjcmVhdGlvbkRhdGEgPSB0aGlzLnByZXBhcmVBcmVhQ3JlYXRpb25EYXRhKGFyZWFOYW1lLCBwYXJlbnRDb250ZXh0KTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdlbmVyYXRlQXJlYUNvbnRlbnQoY3JlYXRpb25EYXRhKTtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGhpcy5nZW5lcmF0ZUFyZWFGaWxlUGF0aChhcmVhTmFtZSk7XG5cbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQXJlYUZpbGUoZmlsZVBhdGgsIGNvbnRlbnQpO1xuICAgICAgYXdhaXQgdGhpcy5vcGVuTmV3QXJlYShmaWxlUGF0aCk7XG5cbiAgICAgIG5ldyBOb3RpY2UoYENyZWF0ZWQgbmV3IGNoaWxkIGFyZWE6ICR7YXJlYU5hbWV9YCk7XG4gICAgICB0aGlzLmxvZyhgU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgY2hpbGQgYXJlYTogJHthcmVhTmFtZX0gYXQgJHtmaWxlUGF0aH1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byBjcmVhdGUgYXJlYTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcmVhQ3JlYXRpb25TZXJ2aWNlXScsIGVycm9yTWVzc2FnZSwgZXJyb3IpO1xuICAgICAgbmV3IE5vdGljZShlcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IG1vZGFsIHRvIGdldCBhcmVhIG5hbWUgZnJvbSB1c2VyXG4gICAqL1xuICBwcml2YXRlIHNob3dBcmVhTmFtZU1vZGFsKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgbmV3IEFyZWFDcmVhdGlvbk1vZGFsKHRoaXMuYXBwLCAocmVzdWx0KSA9PiB7XG4gICAgICAgIHJlc29sdmUocmVzdWx0Lm5hbWUpO1xuICAgICAgfSkub3BlbigpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBhcmUgYXJlYSBjcmVhdGlvbiBkYXRhXG4gICAqL1xuICBwcml2YXRlIHByZXBhcmVBcmVhQ3JlYXRpb25EYXRhKG5hbWU6IHN0cmluZywgcGFyZW50Q29udGV4dDogRXhvRmlsZUNvbnRleHQpOiBBcmVhQ3JlYXRpb25EYXRhIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIHBhcmVudFBhdGg6IHBhcmVudENvbnRleHQuZmlsZU5hbWUucmVwbGFjZSgnLm1kJywgJycpLFxuICAgICAgcGFyZW50T250b2xvZ3k6IHRoaXMuZ2V0UGFyZW50T250b2xvZ3kocGFyZW50Q29udGV4dCksXG4gICAgICBjcmVhdGVkQXQ6IHRoaXMuZ2V0TG9jYWxUaW1lc3RhbXAoKSxcbiAgICAgIHVpZDogdGhpcy5nZW5lcmF0ZVVVSUQoKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYXJlYSBjb250ZW50IHdpdGggcHJvcGVyIGZyb250bWF0dGVyXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlQXJlYUNvbnRlbnQoZGF0YTogQXJlYUNyZWF0aW9uRGF0YSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAtLS1cbmV4b19fQXNzZXRfaXNEZWZpbmVkQnk6ICR7ZGF0YS5wYXJlbnRPbnRvbG9neX1cbmV4b19fQXNzZXRfdWlkOiAke2RhdGEudWlkfVxuZXhvX19Bc3NldF9jcmVhdGVkQXQ6ICR7ZGF0YS5jcmVhdGVkQXR9XG5leG9fX0luc3RhbmNlX2NsYXNzOlxuICAtIFwiW1tlbXNfX0FyZWFdXVwiXG5lbXNfX0FyZWFfcGFyZW50OiBcIltbJHtkYXRhLnBhcmVudFBhdGh9XV1cIlxuLS0tXG5cbiMgJHtkYXRhLm5hbWV9XG5cblxcYFxcYFxcYGRhdGF2aWV3anNcbi8vIEVuaGFuY2VkIFByaW50IFRpdGxlIFBsdWdpbiB3aWxsIHJlbmRlciB0aGUgYXJlYSBsYXlvdXQgaGVyZVxuaWYgKHdpbmRvdy5QcmludFRpdGxlVUkpIHtcbiAgYXdhaXQgd2luZG93LlByaW50VGl0bGVVSS5yZW5kZXJBcmVhTGF5b3V0KGR2LCB0aGlzKTtcbn0gZWxzZSB7XG4gIC8vIEZhbGxiYWNrIGZvciBjb21wYXRpYmlsaXR5XG4gIGlmICh3aW5kb3cuRXhvVUlSZW5kZXIpIHtcbiAgICBhd2FpdCB3aW5kb3cuRXhvVUlSZW5kZXIoZHYsIHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIGR2LnBhcmFncmFwaChcIkFyZWEgbGF5b3V0IHdpbGwgYmUgcmVuZGVyZWQgd2hlbiBQcmludCBUaXRsZSBQbHVnaW4gaXMgYWN0aXZlLlwiKTtcbiAgfVxufVxuXFxgXFxgXFxgYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBmaWxlIHBhdGggZm9yIHRoZSBuZXcgYXJlYVxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUFyZWFGaWxlUGF0aChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFRyeSB0byBkZXRlcm1pbmUgdGhlIGFwcHJvcHJpYXRlIGZvbGRlciBiYXNlZCBvbiBjdXJyZW50IGZpbGUgbG9jYXRpb25cbiAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICBpZiAoYWN0aXZlRmlsZSkge1xuICAgICAgY29uc3QgcGFyZW50RGlyID0gYWN0aXZlRmlsZS5wYXJlbnQ/LnBhdGggfHwgJyc7XG4gICAgICBpZiAocGFyZW50RGlyKSB7XG4gICAgICAgIHJldHVybiBgJHtwYXJlbnREaXJ9L0FyZWEgLSAke25hbWV9Lm1kYDtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gRmFsbGJhY2sgdG8gZGVmYXVsdCBhcmVhIGZvbGRlclxuICAgIHJldHVybiBgMDMgS25vd2xlZGdlL0FyZWFzL0FyZWEgLSAke25hbWV9Lm1kYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdGhlIGFyZWEgZmlsZVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVBcmVhRmlsZShmaWxlUGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPFRGaWxlPiB7XG4gICAgLy8gRW5zdXJlIHBhcmVudCBkaXJlY3RvcmllcyBleGlzdFxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBmaWxlUGF0aC5zdWJzdHJpbmcoMCwgZmlsZVBhdGgubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIXRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXJlbnRQYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlRm9sZGVyKHBhcmVudFBhdGgpO1xuICAgICAgdGhpcy5sb2coYENyZWF0ZWQgcGFyZW50IGRpcmVjdG9yeTogJHtwYXJlbnRQYXRofWApO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoZmlsZVBhdGgsIGNvbnRlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIG5ld2x5IGNyZWF0ZWQgYXJlYSBpbiBhIG5ldyB0YWJcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgb3Blbk5ld0FyZWEoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigndGFiJyk7XG4gICAgICBhd2FpdCBsZWFmLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLnNldEFjdGl2ZUxlYWYobGVhZiwgeyBmb2N1czogdHJ1ZSB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgVVVJRCBmb3IgdGhlIGFyZWFcbiAgICovXG4gIHByaXZhdGUgZ2VuZXJhdGVVVUlEKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgYyA9PiB7XG4gICAgICBjb25zdCByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMDtcbiAgICAgIHJldHVybiAoYyA9PT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KSkudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBsb2NhbCB0aW1lc3RhbXAgd2l0aG91dCBaIHN1ZmZpeFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRMb2NhbFRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgcmV0dXJuIGAke25vdy5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9VCR7U3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhub3cuZ2V0U2Vjb25kcygpKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBhcmVudCBvbnRvbG9neSBmcm9tIGZpbGUgY29udGV4dFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRQYXJlbnRPbnRvbG9neShwYXJlbnRDb250ZXh0OiBFeG9GaWxlQ29udGV4dCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyZW50T250b2xvZ3kgPSBwYXJlbnRDb250ZXh0LmN1cnJlbnRQYWdlWydleG9fX0Fzc2V0X2lzRGVmaW5lZEJ5J107XG4gICAgXG4gICAgaWYgKHR5cGVvZiBwYXJlbnRPbnRvbG9neSA9PT0gJ29iamVjdCcgJiYgcGFyZW50T250b2xvZ3kucGF0aCkge1xuICAgICAgcmV0dXJuIGBcIltbJHtwYXJlbnRPbnRvbG9neS5wYXRoLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5tZCcsICcnKX1dXVwiYDtcbiAgICB9XG4gICAgXG4gICAgaWYgKHR5cGVvZiBwYXJlbnRPbnRvbG9neSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBwYXJlbnRPbnRvbG9neTtcbiAgICB9XG4gICAgXG4gICAgLy8gRGVmYXVsdCBmYWxsYmFja1xuICAgIHJldHVybiAnXCJbWyFlbXNdXVwiJztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1ZyBsb2dnaW5nXG4gICAqL1xuICBwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0FyZWFDcmVhdGlvblNlcnZpY2VdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn0iXX0=