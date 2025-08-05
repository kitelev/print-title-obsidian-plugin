import { App, Plugin, PluginSettingTab, Setting, Notice, WorkspaceLeaf, MarkdownView } from 'obsidian';

export default class PrintTitlePlugin extends Plugin {
	private buttonMap: WeakMap<HTMLElement, HTMLButtonElement> = new WeakMap();

	async onload() {
		console.log('🔌 Print Title Plugin: Loading v1.0.4 (Smart Positioning)...');
		
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
			setTimeout(() => this.addPrintButton(), 200);
		}
	}

	private onActiveLeafChange(leaf: WorkspaceLeaf | null) {
		console.log('🍃 Active leaf changed:', leaf?.view?.getViewType() || 'unknown');
		if (leaf && leaf.view instanceof MarkdownView) {
			// Small delay to ensure view is ready
			setTimeout(() => this.addPrintButton(), 200);
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

	private findFrontmatterInsertionPoint(containerEl: HTMLElement): HTMLElement | null {
		console.log('🔍 Looking for frontmatter insertion point...');
		
		// Selectors for frontmatter/properties in Obsidian (in order of preference)
		const frontmatterSelectors = [
			'.metadata-properties-container',
			'.metadata-container',
			'.frontmatter-container',
			'.property-container',
			'.metadata-property-container',
			'.document-properties',
			'.markdown-properties',
			'.frontmatter',
			'[data-property]'
		];
		
		for (const selector of frontmatterSelectors) {
			const elements = containerEl.querySelectorAll(selector);
			if (elements.length > 0) {
				const lastElement = elements[elements.length - 1] as HTMLElement;
				console.log(`✅ Found frontmatter with selector: ${selector}`);
				console.log(`   Element: ${lastElement.tagName}.${lastElement.className}`);
				return lastElement;
			}
		}
		
		// Fallback: look for elements that look like properties
		const allDivs = Array.from(containerEl.querySelectorAll('div'));
		for (const div of allDivs) {
			const className = div.className.toLowerCase();
			const textContent = (div.textContent || '').toLowerCase();
			
			if (className.includes('metadata') || 
				className.includes('property') ||
				textContent.includes('tags:') ||
				textContent.includes('title:') ||
				div.hasAttribute('data-property')) {
				console.log('✅ Found frontmatter-like element:', div.className);
				return div as HTMLElement;
			}
		}
		
		console.log('❌ No frontmatter found');
		return null;
	}

	private addPrintButtonToView(view: MarkdownView) {
		console.log('🔘 Adding button to view:', view.file?.name || 'unnamed');
		
		// Use the content element instead of container for better positioning
		const contentEl = view.contentEl;
		
		// Check if button already exists
		const existingButton = this.buttonMap.get(contentEl);
		if (existingButton && contentEl.contains(existingButton)) {
			console.log('✅ Button already exists in this view');
			return;
		}

		// Remove any existing buttons in this view
		const oldContainers = contentEl.querySelectorAll('.print-title-container');
		oldContainers.forEach(container => container.remove());

		// Find frontmatter insertion point
		const frontmatterElement = this.findFrontmatterInsertionPoint(contentEl);
		
		// Create button container
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'print-title-container';
		
		// Style the container based on insertion method
		if (frontmatterElement) {
			// Insert after frontmatter - inline with content
			buttonContainer.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 16px 0;
				padding: 8px 20px;
				border-top: 1px solid var(--background-modifier-border);
				border-bottom: 1px solid var(--background-modifier-border);
				background: var(--background-secondary);
			`;
		} else {
			// No frontmatter - float at top right
			buttonContainer.style.cssText = `
				position: absolute;
				top: 20px;
				right: 20px;
				z-index: 100;
				display: flex;
				justify-content: center;
			`;
		}

		// Create the button
		const button = document.createElement('button');
		button.textContent = 'Print Title';
		button.className = 'print-title-button';

		// Style the button
		button.style.cssText = `
			background: var(--interactive-accent, #8b5cf6);
			color: var(--text-on-accent, white);
			border: 1px solid var(--interactive-accent-hover, #7c3aed);
			border-radius: 6px;
			padding: 8px 16px;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s ease;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		`;

		// Add hover effects
		button.addEventListener('mouseenter', () => {
			button.style.background = 'var(--interactive-accent-hover, #7c3aed)';
			button.style.transform = 'translateY(-1px)';
			button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
		});
		
		button.addEventListener('mouseleave', () => {
			button.style.background = 'var(--interactive-accent, #8b5cf6)';
			button.style.transform = 'translateY(0)';
			button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
		});

		// Add click handler
		button.addEventListener('click', () => {
			const file = view.file;
			if (file) {
				console.log('🔔 Showing notice for:', file.basename);
				new Notice(`📄 ${file.basename}`, 3000);
				
				// Visual feedback
				button.style.transform = 'scale(0.95)';
				setTimeout(() => {
					button.style.transform = 'translateY(0)';
				}, 150);
			} else {
				console.log('❌ No file found for notice');
				new Notice('❌ No file found', 2000);
			}
		});

		// Add button to container
		buttonContainer.appendChild(button);

		// Insert the container in the right place
		if (frontmatterElement) {
			// Insert after frontmatter
			frontmatterElement.insertAdjacentElement('afterend', buttonContainer);
			console.log('✅ Button inserted after frontmatter');
		} else {
			// Insert at the beginning of content if no frontmatter
			const firstChild = contentEl.firstElementChild;
			if (firstChild) {
				firstChild.insertAdjacentElement('beforebegin', buttonContainer);
				console.log('✅ Button inserted at top of content (no frontmatter)');
			} else {
				contentEl.appendChild(buttonContainer);
				console.log('✅ Button appended to empty content');
			}
		}
		
		// Store reference
		this.buttonMap.set(contentEl, button);
		
		console.log('✅ Smart positioning complete');
		console.log('🎯 Container placement:', frontmatterElement ? 'after-frontmatter' : 'top-of-content');
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