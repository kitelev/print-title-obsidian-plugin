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

		// Wait a bit more to ensure the view is fully loaded
		await new Promise(resolve => setTimeout(resolve, 500));

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
		
		// Remove any existing layout containers first
		const existingContainers = contentEl.querySelectorAll('.area-layout-auto-container');
		existingContainers.forEach(el => el.remove());
		
		// Create new container
		const layoutContainer = contentEl.createDiv('area-layout-auto-container');
		
		// Check if we're in reading mode or source mode
		const isReadingMode = contentEl.querySelector('.markdown-reading-view') !== null;
		
		if (isReadingMode) {
			// In reading mode, append to the markdown preview section
			const readingView = contentEl.querySelector('.markdown-reading-view');
			if (readingView) {
				const previewSection = readingView.querySelector('.markdown-preview-section');
				if (previewSection && previewSection.parentElement) {
					// Insert after all preview sections
					previewSection.parentElement.appendChild(layoutContainer);
				} else {
					readingView.appendChild(layoutContainer);
				}
			}
		} else {
			// In source mode, we need to append to the CodeMirror content
			const sourceView = contentEl.querySelector('.markdown-source-view');
			if (sourceView) {
				const cmContent = sourceView.querySelector('.cm-content');
				if (cmContent && cmContent.parentElement) {
					// Create a wrapper div in the scrollable area
					const wrapper = cmContent.parentElement;
					wrapper.appendChild(layoutContainer);
				} else {
					sourceView.appendChild(layoutContainer);
				}
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