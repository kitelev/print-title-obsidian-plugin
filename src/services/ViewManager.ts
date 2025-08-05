import { App, MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';
import { ButtonService } from './ButtonService';
import { PrintTitleSettings } from '../types';
import { AreaLayoutService } from './AreaLayoutService';
import { ExoFileContext } from '../types/ExoTypes';

export class ViewManager {
	constructor(
		private app: App,
		private buttonService: ButtonService,
		private settings: PrintTitleSettings,
		private areaLayoutService: AreaLayoutService
	) {}

	/**
	 * Update settings reference
	 */
	updateSettings(settings: PrintTitleSettings): void {
		this.settings = settings;
		this.buttonService.updateSettings(settings);
	}

	/**
	 * Add buttons to all currently open markdown views
	 */
	addButtonToAllViews(): void {
		const markdownViews = this.app.workspace.getLeavesOfType('markdown');
		this.log(`Found ${markdownViews.length} markdown views`);

		markdownViews.forEach(leaf => {
			if (leaf.view instanceof MarkdownView) {
				this.buttonService.addButtonToView(leaf.view);
			}
		});
	}

	/**
	 * Handle file open event
	 */
	onFileOpen(file: TFile | null): void {
		this.log('File opened:', file?.name || 'unknown');
		
		if (file) {
			// Small delay to ensure view is ready
			setTimeout(async () => {
				this.addButtonToActiveView();
				// Check if this is an ems__Area file and render layout
				await this.renderAreaLayoutIfNeeded(file);
			}, 200);
		}
	}

	/**
	 * Handle active leaf change event
	 */
	onActiveLeafChange(leaf: WorkspaceLeaf | null): void {
		this.log('Active leaf changed:', leaf?.view?.getViewType() || 'unknown');
		
		if (leaf && leaf.view instanceof MarkdownView) {
			// Small delay to ensure view is ready
			setTimeout(async () => {
				const view = leaf.view as MarkdownView;
				this.buttonService.addButtonToView(view);
				// Check if this is an ems__Area file and render layout
				if (view.file) {
					await this.renderAreaLayoutIfNeeded(view.file);
				}
			}, 200);
		}
	}

	/**
	 * Handle layout change event
	 */
	onLayoutChange(): void {
		this.log('Layout changed, refreshing buttons');
		
		// Small delay to ensure layout is stable
		setTimeout(() => {
			this.addButtonToAllViews();
		}, 300);
	}

	/**
	 * Add button to the currently active view
	 */
	addButtonToActiveView(): void {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			this.buttonService.addButtonToView(activeView);
		} else {
			this.log('No active MarkdownView found');
		}
	}

	/**
	 * Refresh all buttons (remove and re-add)
	 */
	refreshAllButtons(): void {
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
	cleanup(): void {
		this.log('Cleaning up view manager');
		this.buttonService.cleanup();
	}

	/**
	 * Check if file is ems__Area and render layout if needed
	 */
	private async renderAreaLayoutIfNeeded(file: TFile): Promise<void> {
		// Get file cache to check frontmatter
		const cache = this.app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter;
		
		if (!frontmatter || !frontmatter['exo__Instance_class']) {
			return;
		}

		const instanceClasses = Array.isArray(frontmatter['exo__Instance_class']) 
			? frontmatter['exo__Instance_class'] 
			: [frontmatter['exo__Instance_class']];

		// Check if this is an ems__Area
		const isArea = instanceClasses.some((cls: any) => 
			typeof cls === 'string' ? cls.includes('ems__Area') : cls.path?.includes('ems__Area')
		);

		if (!isArea) {
			return;
		}

		this.log('Detected ems__Area file, rendering layout');

		// Find a container in the current view to render the layout
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView || activeView.file?.path !== file.path) {
			return;
		}

		// Create file context
		const fileContext: ExoFileContext = {
			fileName: file.name,
			filePath: file.path,
			file: file,
			frontmatter,
			currentPage: {
				file: {
					path: file.path,
					name: file.name,
					link: null,
					mtime: new Date(file.stat.mtime)
				},
				'exo__Instance_class': frontmatter['exo__Instance_class'] || [],
				...frontmatter
			}
		};

		// Find or create a container for the area layout
		const contentEl = activeView.contentEl;
		let layoutContainer = contentEl.querySelector('.area-layout-auto-container') as HTMLElement;
		
		if (!layoutContainer) {
			// Create container after the frontmatter
			layoutContainer = contentEl.createDiv('area-layout-auto-container');
			
			// Try to insert after frontmatter or at the beginning of content
			const editorEl = contentEl.querySelector('.cm-editor');
			if (editorEl) {
				editorEl.insertAdjacentElement('afterend', layoutContainer);
			} else {
				// Fallback: add to the end of content
				contentEl.appendChild(layoutContainer);
			}
		}

		// Render the area layout
		try {
			await this.areaLayoutService.renderAreaLayout(layoutContainer, fileContext);
			this.log('Area layout rendered successfully');
		} catch (error) {
			console.error('[ViewManager] Error rendering area layout:', error);
		}
	}

	private log(message: string, ...args: any[]): void {
		if (this.settings.enableDebugMode) {
			console.log(`[PrintTitle ViewManager] ${message}`, ...args);
		}
	}
}