import { MarkdownView, TFile, App } from 'obsidian';
import { FileContext, ButtonConfig, PrintTitleSettings } from '../types';
import { ExoFileContext } from '../types/ExoTypes';
import { NotificationService } from './NotificationService';
import { FileAnalysisService } from './FileAnalysisService';
import { AreaCreationService } from './AreaCreationService';
import { DataviewAdapter } from './DataviewAdapter';

export class ButtonService {
	private buttonMap: WeakMap<HTMLElement, HTMLButtonElement> = new WeakMap();

	constructor(
		private app: App,
		private settings: PrintTitleSettings,
		private notificationService: NotificationService,
		private fileAnalysisService: FileAnalysisService,
		private areaCreationService: AreaCreationService,
		private dataviewAdapter: DataviewAdapter
	) {}

	/**
	 * Update settings reference
	 */
	updateSettings(settings: PrintTitleSettings): void {
		this.settings = settings;
	}

	/**
	 * Add button to a specific view
	 */
	async addButtonToView(view: MarkdownView): Promise<void> {
		if (!view || !view.file) {
			this.log('No valid view or file found');
			return;
		}

		const fileContext = this.createFileContext(view);
		this.log(`Adding button to view: ${fileContext.fileName}`);

		const contentEl = view.contentEl;
		
		// Check if button already exists
		if (this.buttonExists(contentEl)) {
			this.log('Button already exists in this view');
			return;
		}

		// Remove any old buttons
		this.removeExistingButtons(contentEl);

		// Check if this is an ems__Area and create appropriate button
		const isEmsArea = await this.isEmsAreaFile(view);
		const buttonConfig = this.createButtonConfig(isEmsArea);
		const button = this.createButton(buttonConfig, fileContext, isEmsArea);
		this.insertButton(contentEl, button, buttonConfig.position);

		// Store reference
		this.buttonMap.set(contentEl, button);
		this.log('Button successfully added');
	}

	/**
	 * Remove all buttons from the current view
	 */
	removeButtonsFromView(view: MarkdownView): void {
		if (!view) return;

		const contentEl = view.contentEl;
		this.removeExistingButtons(contentEl);
		this.buttonMap.delete(contentEl);
	}

	/**
	 * Clean up all buttons
	 */
	cleanup(): void {
		const containers = document.querySelectorAll('.print-title-container');
		this.log(`Removing ${containers.length} button containers`);
		containers.forEach(el => el.remove());
		this.buttonMap = new WeakMap();
	}

	private createFileContext(view: MarkdownView): FileContext {
		const cache = view.app.metadataCache.getFileCache(view.file!);
		return {
			file: view.file!,
			fileName: view.file!.name,
			filePath: view.file!.path,
			frontmatter: cache?.frontmatter
		};
	}

	private createButtonConfig(isEmsArea: boolean = false): ButtonConfig {
		let displayText: string;
		let buttonClass: string;

		if (isEmsArea) {
			// Special button for ems__Area files
			displayText = this.settings.showIcon 
				? `🏗️ Create Child Area`
				: 'Create Child Area';
			buttonClass = 'print-title-button area-create-button';
		} else {
			// Standard print title button
			displayText = this.settings.showIcon 
				? `${this.settings.buttonIcon} ${this.settings.buttonText}`.trim()
				: this.settings.buttonText;
			buttonClass = 'print-title-button';
		}

		return {
			text: displayText,
			icon: this.settings.showIcon ? this.settings.buttonIcon : undefined,
			position: this.settings.buttonPosition,
			className: buttonClass
		};
	}

	private buttonExists(contentEl: HTMLElement): boolean {
		const existingButton = this.buttonMap.get(contentEl);
		return !!(existingButton && contentEl.contains(existingButton));
	}

	private removeExistingButtons(contentEl: HTMLElement): void {
		const oldContainers = contentEl.querySelectorAll('.print-title-container');
		oldContainers.forEach(container => container.remove());
	}

	private createButton(config: ButtonConfig, context: FileContext, isEmsArea: boolean = false): HTMLButtonElement {
		// Create button container
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'print-title-container';
		this.styleContainer(buttonContainer, config.position, context);

		// Create the button
		const button = document.createElement('button');
		button.textContent = config.text;
		button.className = config.className;
		this.styleButton(button);

		// Add click handler
		button.addEventListener('click', (e) => this.handleButtonClick(e, context, isEmsArea));

		// Add hover effects
		this.addHoverEffects(button);

		buttonContainer.appendChild(button);
		return button;
	}

	private styleContainer(container: HTMLElement, position: string, context: FileContext): void {
		const hasFrontmatter = !!(context.frontmatter && Object.keys(context.frontmatter).length > 0);
		
		if (position === 'after-frontmatter' && hasFrontmatter) {
			container.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 16px 0;
				padding: 8px 20px;
				border-top: 1px solid var(--background-modifier-border);
				border-bottom: 1px solid var(--background-modifier-border);
				background: var(--background-secondary);
			`;
		} else if (position === 'top-right' || (position === 'after-frontmatter' && !hasFrontmatter)) {
			container.style.cssText = `
				position: absolute;
				top: 20px;
				right: 20px;
				z-index: 100;
				display: flex;
				justify-content: center;
			`;
		} else {
			// bottom position
			container.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 20px 0;
				padding: 10px;
			`;
		}
	}

	private styleButton(button: HTMLButtonElement): void {
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
			-webkit-appearance: none;
			appearance: none;
		`;
	}

	private addHoverEffects(button: HTMLButtonElement): void {
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
	}

	private async handleButtonClick(event: Event, context: FileContext, isEmsArea: boolean = false): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		this.log(`Button clicked for file: ${context.fileName}, isEmsArea: ${isEmsArea}`);

		try {
			if (isEmsArea) {
				// Handle ems__Area specific action - create child area
				await this.handleAreaAction(context);
			} else {
				// Handle standard print title action
				await this.handlePrintTitleAction(context);
			}

			// Visual feedback with animation
			const button = event.target as HTMLButtonElement;
			if (this.settings.animateButton) {
				button.style.transform = 'scale(0.95)';
				setTimeout(() => {
					button.style.transform = 'translateY(0)';
				}, 150);
			}
		} catch (error) {
			this.log('Error handling button click:', error);
			this.notificationService.showError('Failed to process action');
		}
	}

	/**
	 * Handle ems__Area specific actions
	 */
	private async handleAreaAction(context: FileContext): Promise<void> {
		this.log('Handling area action - creating child area');

		// Convert to ExoFileContext
		const exoContext: ExoFileContext = {
			fileName: context.fileName,
			filePath: context.filePath,
			file: context.file,
			frontmatter: context.frontmatter,
			currentPage: {
				file: {
					path: context.file.path,
					name: context.file.name,
					link: null,
					mtime: new Date(context.file.stat.mtime)
				},
				'exo__Instance_class': context.frontmatter?.['exo__Instance_class'] || [],
				...context.frontmatter
			}
		};

		await this.areaCreationService.createChildArea(exoContext);
	}

	/**
	 * Handle standard print title action
	 */
	private async handlePrintTitleAction(context: FileContext): Promise<void> {
		// Show enhanced notification
		if (this.settings.showEnhancedInfo) {
			this.notificationService.showTitleNotification(context);
		} else {
			// Simple notification
			const message = `${this.settings.showIcon ? '📄 ' : ''}${context.file.basename}`;
			this.notificationService.showInfo(message.replace('ℹ️ ', ''));
		}

		// Log file analysis if debug mode is enabled
		if (this.settings.enableDebugMode && this.settings.showFileStats) {
			const analysis = await this.fileAnalysisService.analyzeFile(context);
			const stats = this.fileAnalysisService.getFileStats(analysis);
			this.log(`File stats: ${stats.join(', ')}`);
		}
	}

	private insertButton(contentEl: HTMLElement, button: HTMLButtonElement, position: string): void {
		const container = button.parentElement!;

		if (position === 'after-frontmatter') {
			const frontmatterElement = this.findFrontmatterInsertionPoint(contentEl);
			if (frontmatterElement) {
				frontmatterElement.insertAdjacentElement('afterend', container);
				this.log('Button inserted after frontmatter');
				return;
			}
		}

		// Fallback positions
		if (position === 'top-right' || position === 'after-frontmatter') {
			const firstChild = contentEl.firstElementChild;
			if (firstChild) {
				firstChild.insertAdjacentElement('beforebegin', container);
				this.log('Button inserted at top of content');
			} else {
				contentEl.appendChild(container);
				this.log('Button appended to empty content');
			}
		} else {
			// bottom position
			contentEl.appendChild(container);
			this.log('Button appended at bottom');
		}
	}

	private findFrontmatterInsertionPoint(containerEl: HTMLElement): HTMLElement | null {
		this.log('Looking for frontmatter insertion point...');

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
				this.log(`Found frontmatter with selector: ${selector}`);
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
				this.log('Found frontmatter-like element:', div.className);
				return div as HTMLElement;
			}
		}

		this.log('No frontmatter found');
		return null;
	}

	/**
	 * Check if the current file is an ems__Area asset
	 */
	private async isEmsAreaFile(view: MarkdownView): Promise<boolean> {
		if (!view || !view.file) return false;

		try {
			// Get file cache to check frontmatter
			const cache = this.app.metadataCache.getFileCache(view.file);
			const frontmatter = cache?.frontmatter;
			
			if (!frontmatter || !frontmatter['exo__Instance_class']) {
				return false;
			}

			const instanceClasses = Array.isArray(frontmatter['exo__Instance_class']) 
				? frontmatter['exo__Instance_class'] 
				: [frontmatter['exo__Instance_class']];

			// Check if any of the instance classes contains 'ems__Area'
			return instanceClasses.some((cls: any) => {
				if (typeof cls === 'string') {
					return cls.includes('ems__Area');
				} else if (cls && cls.path) {
					return cls.path.includes('ems__Area');
				}
				return false;
			});
		} catch (error) {
			this.log('Error checking if file is ems__Area:', error);
			return false;
		}
	}

	private log(message: string, ...args: any[]): void {
		if (this.settings.enableDebugMode) {
			console.log(`[PrintTitle] ${message}`, ...args);
		}
	}
}