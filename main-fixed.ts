import { App, Plugin, PluginSettingTab, Setting, Notice, WorkspaceLeaf, MarkdownView } from 'obsidian';

export default class PrintTitlePlugin extends Plugin {
	private buttonMap: WeakMap<HTMLElement, HTMLButtonElement> = new WeakMap();

	async onload() {
		console.log('🔌 Print Title Plugin: Loading v1.0.3...');
		
		// Register event handlers with proper binding
		this.registerEvent(
			this.app.workspace.on('file-open', this.onFileOpen.bind(this))
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', this.onActiveLeafChange.bind(this))
		);

		// Add button to currently open notes after a delay
		setTimeout(() => {
			console.log('🔌 Print Title Plugin: Adding buttons to existing notes');
			this.addButtonToAllViews();
		}, 1000);
	}

	private onFileOpen(file: any) {
		console.log('📄 File opened:', file?.name || 'unknown');
		if (file) {
			// Small delay to ensure view is ready
			setTimeout(() => this.addPrintButton(), 100);
		}
	}

	private onActiveLeafChange(leaf: WorkspaceLeaf | null) {
		console.log('🍃 Active leaf changed:', leaf?.view?.getViewType() || 'unknown');
		if (leaf && leaf.view instanceof MarkdownView) {
			// Small delay to ensure view is ready
			setTimeout(() => this.addPrintButton(), 100);
		}
	}

	private addButtonToAllViews() {
		const markdownViews = this.app.workspace.getLeavesOfType('markdown');
		console.log(`📄 Found ${markdownViews.length} markdown views`);
		
		markdownViews.forEach(leaf => {
			if (leaf.view instanceof MarkdownView) {
				this.addPrintButtonToView(leaf.view);
			}
		});
	}

	private addPrintButton() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			this.addPrintButtonToView(activeView);
		} else {
			console.log('❌ No active MarkdownView found');
		}
	}

	private addPrintButtonToView(view: MarkdownView) {
		console.log('🔘 Adding button to view:', view.file?.name || 'unnamed');
		
		// Use the leaf container as the key
		const leafContainer = view.containerEl;
		
		// Check if button already exists
		const existingButton = this.buttonMap.get(leafContainer);
		if (existingButton && leafContainer.contains(existingButton)) {
			console.log('✅ Button already exists in this view');
			return;
		}

		// Remove any existing buttons in this view
		const oldButtons = leafContainer.querySelectorAll('.print-title-button');
		oldButtons.forEach(btn => btn.remove());

		// Create button container div for better positioning
		const buttonContainer = leafContainer.createEl('div', {
			cls: 'print-title-container'
		});

		// Style the container
		buttonContainer.style.cssText = `
			position: sticky;
			bottom: 20px;
			z-index: 1000;
			display: flex;
			justify-content: center;
			margin: 20px 0;
			padding: 0 20px;
			pointer-events: none;
		`;

		// Create the button
		const button = buttonContainer.createEl('button', {
			text: 'Print Title',
			cls: 'print-title-button'
		});

		// Style the button with high visibility
		button.style.cssText = `
			background: var(--interactive-accent, #8b5cf6);
			color: var(--text-on-accent, white);
			border: 2px solid var(--interactive-accent-hover, #7c3aed);
			border-radius: 8px;
			padding: 12px 24px;
			font-size: 14px;
			font-weight: 600;
			cursor: pointer;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			transition: all 0.2s ease;
			pointer-events: auto;
			position: relative;
			z-index: 1001;
			min-width: 120px;
		`;

		// Add hover effects
		button.addEventListener('mouseenter', () => {
			button.style.transform = 'translateY(-2px)';
			button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
			button.style.background = 'var(--interactive-accent-hover, #7c3aed)';
		});
		
		button.addEventListener('mouseleave', () => {
			button.style.transform = 'translateY(0)';
			button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
			button.style.background = 'var(--interactive-accent, #8b5cf6)';
		});

		// Add click handler
		button.addEventListener('click', () => {
			const file = view.file;
			if (file) {
				console.log('🔔 Showing notice for:', file.basename);
				new Notice(`📄 Title: ${file.basename}`, 4000);
				
				// Add visual feedback
				button.style.transform = 'scale(0.95)';
				setTimeout(() => {
					button.style.transform = 'translateY(0)';
				}, 150);
			} else {
				console.log('❌ No file found for notice');
				new Notice('❌ No file found', 2000);
			}
		});

		// Insert the container at the end of the leaf
		leafContainer.appendChild(buttonContainer);
		
		// Store reference
		this.buttonMap.set(leafContainer, button);
		
		console.log('✅ Button container successfully added');
		console.log('🎯 Container classes:', buttonContainer.className);
		console.log('🎯 Button position:', button.getBoundingClientRect());
	}

	onunload() {
		console.log('🔌 Print Title Plugin: Unloading...');
		
		// Remove all buttons and containers
		const containers = document.querySelectorAll('.print-title-container');
		console.log(`🗑️ Removing ${containers.length} button containers`);
		containers.forEach(el => el.remove());
		
		// Clear button map
		this.buttonMap = new WeakMap();
	}
}