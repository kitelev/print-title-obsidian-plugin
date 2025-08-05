import { Plugin, Notice, MarkdownView } from 'obsidian';
export default class PrintTitlePlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.buttonMap = new WeakMap();
    }
    async onload() {
        this.registerEvent(this.app.workspace.on('file-open', (file) => {
            if (file) {
                this.addPrintButton();
            }
        }));
        this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => {
            if (leaf) {
                this.addPrintButton();
            }
        }));
        this.app.workspace.trigger('layout-change');
    }
    addPrintButton() {
        const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeLeaf)
            return;
        const contentEl = activeLeaf.contentEl;
        const existingButton = this.buttonMap.get(contentEl);
        if (existingButton && contentEl.contains(existingButton)) {
            return;
        }
        const button = contentEl.createEl('button', {
            text: 'Print Title',
            cls: 'print-title-button'
        });
        button.style.display = 'block';
        button.style.margin = '10px auto';
        button.style.padding = '5px 15px';
        button.addEventListener('click', () => {
            const file = activeLeaf.file;
            if (file) {
                new Notice(file.basename);
            }
        });
        contentEl.appendChild(button);
        this.buttonMap.set(contentEl, button);
    }
    onunload() {
        document.querySelectorAll('.print-title-button').forEach(el => el.remove());
    }
}
