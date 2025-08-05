import { App, Plugin, TFile, WorkspaceLeaf, MarkdownView } from 'obsidian';
import { PrintTitleSettings, DEFAULT_SETTINGS } from './types';
import { ButtonService } from './services/ButtonService';
import { ViewManager } from './services/ViewManager';
import { PrintTitleSettingTab } from './services/SettingsService';
import { NotificationService } from './services/NotificationService';
import { FileAnalysisService } from './services/FileAnalysisService';
import { DataviewAdapter } from './services/DataviewAdapter';
import { AreaLayoutService } from './services/AreaLayoutService';
import { AreaCreationService } from './services/AreaCreationService';

export default class PrintTitlePlugin extends Plugin {
	settings!: PrintTitleSettings;
	private buttonService!: ButtonService;
	private viewManager!: ViewManager;
	private notificationService!: NotificationService;
	private fileAnalysisService!: FileAnalysisService;
	private dataviewAdapter!: DataviewAdapter;
	private areaLayoutService!: AreaLayoutService;
	private areaCreationService!: AreaCreationService;
	private customStyleEl: HTMLStyleElement | null = null;

	async onload() {
		this.log('Loading Print Title Plugin v2.0.0...');

		// Load settings
		await this.loadSettings();

		// Initialize services
		this.notificationService = new NotificationService(this.settings);
		this.fileAnalysisService = new FileAnalysisService(this.app, this.settings);
		this.dataviewAdapter = new DataviewAdapter(this.app);
		this.areaLayoutService = new AreaLayoutService(this.app, this.settings);
		this.areaCreationService = new AreaCreationService(this.app, this.settings);
		this.buttonService = new ButtonService(this.app, this.settings, this.notificationService, this.fileAnalysisService, this.areaCreationService, this.dataviewAdapter);
		this.viewManager = new ViewManager(this.app, this.buttonService, this.settings, this.areaLayoutService);

		// Register settings tab
		this.addSettingTab(new PrintTitleSettingTab(this.app, this));

		// Register event handlers
		this.registerEventHandlers();

		// Apply custom styles
		this.applyCustomStyles();

		// Add buttons to existing views after initialization
		setTimeout(() => {
			this.log('Adding buttons to existing notes');
			this.viewManager.addButtonToAllViews();
		}, 1000);

		this.log('Plugin loaded successfully');
	}

	onunload() {
		this.log('Unloading Print Title Plugin...');
		
		// Clean up all buttons and services
		this.viewManager?.cleanup();
		
		// Remove custom styles
		if (this.customStyleEl) {
			this.customStyleEl.remove();
			this.customStyleEl = null;
		}

		this.log('Plugin unloaded');
	}

	/**
	 * Register all event handlers
	 */
	private registerEventHandlers(): void {
		// File open event
		this.registerEvent(
			this.app.workspace.on('file-open', (file: TFile | null) => {
				this.viewManager.onFileOpen(file);
			})
		);

		// Active leaf change event
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
				this.viewManager.onActiveLeafChange(leaf);
			})
		);

		// Layout change event (when switching between edit/preview mode)
		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.viewManager.onLayoutChange();
			})
		);

		// Workspace resize event
		this.registerEvent(
			this.app.workspace.on('resize', () => {
				// Refresh buttons after resize with a small delay
				setTimeout(() => {
					this.viewManager.refreshAllButtons();
				}, 200);
			})
		);

		this.log('Event handlers registered');
	}

	/**
	 * Load plugin settings
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * Save plugin settings
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		
		// Update services with new settings
		this.notificationService?.updateSettings(this.settings);
		this.fileAnalysisService?.updateSettings(this.settings);
		this.areaLayoutService?.updateSettings(this.settings);
		this.areaCreationService?.updateSettings(this.settings);
		this.buttonService?.updateSettings(this.settings);
		this.viewManager?.updateSettings(this.settings);
		
		this.log('Settings saved and services updated');
	}

	/**
	 * Get default settings
	 */
	getDefaultSettings(): PrintTitleSettings {
		return { ...DEFAULT_SETTINGS };
	}

	/**
	 * Refresh all buttons (used by settings)
	 */
	refreshAllButtons(): void {
		this.viewManager?.refreshAllButtons();
	}

	/**
	 * Apply custom CSS styles
	 */
	applyCustomStyles(): void {
		// Remove existing custom styles
		if (this.customStyleEl) {
			this.customStyleEl.remove();
			this.customStyleEl = null;
		}

		// Apply new custom styles if any
		if (this.settings.customCSS.trim()) {
			this.customStyleEl = document.createElement('style');
			this.customStyleEl.textContent = `
				/* Print Title Plugin Custom Styles */
				${this.settings.customCSS}
			`;
			document.head.appendChild(this.customStyleEl);
			this.log('Custom styles applied');
		}

		// Apply base styles
		this.applyBaseStyles();
	}

	/**
	 * Apply base plugin styles
	 */
	private applyBaseStyles(): void {
		const existingStyle = document.querySelector('#print-title-base-styles');
		if (!existingStyle) {
			const styleEl = document.createElement('style');
			styleEl.id = 'print-title-base-styles';
			styleEl.textContent = `
				/* Print Title Plugin Base Styles */
				.print-title-container {
					z-index: 10;
				}
				
				.print-title-button {
					font-family: var(--font-interface);
					white-space: nowrap;
					outline: none;
					user-select: none;
					-webkit-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
				}
				
				.print-title-button:focus {
					outline: 2px solid var(--interactive-accent);
					outline-offset: 2px;
				}
				
				.print-title-button:active {
					transform: scale(0.95) !important;
				}
				
				/* Responsive adjustments */
				@media (max-width: 768px) {
					.print-title-container {
						margin: 12px 0;
						padding: 6px 16px;
					}
					
					.print-title-button {
						padding: 6px 12px;
						font-size: 12px;
					}
				}
				
				/* High contrast mode support */
				@media (prefers-contrast: high) {
					.print-title-button {
						border-width: 2px;
					}
				}
				
				/* Reduced motion support */
				@media (prefers-reduced-motion: reduce) {
					.print-title-button {
						transition: none;
					}
					
					.print-title-button:hover {
						transform: none;
					}
				}
			`;
			document.head.appendChild(styleEl);
		}
	}


	/**
	 * Debug logging
	 */
	private log(message: string, ...args: any[]): void {
		if (this.settings?.enableDebugMode) {
			console.log(`[PrintTitle] ${message}`, ...args);
		}
	}
}