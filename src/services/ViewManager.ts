import { App, MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';
import { ButtonService } from './ButtonService';
import { PrintTitleSettings } from '../types';

export class ViewManager {
	constructor(
		private app: App,
		private buttonService: ButtonService,
		private settings: PrintTitleSettings
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
			setTimeout(() => {
				this.addButtonToActiveView();
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
			setTimeout(() => {
				this.buttonService.addButtonToView(leaf.view as MarkdownView);
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

	private log(message: string, ...args: any[]): void {
		if (this.settings.enableDebugMode) {
			console.log(`[PrintTitle ViewManager] ${message}`, ...args);
		}
	}
}