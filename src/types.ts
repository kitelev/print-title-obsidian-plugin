import { TFile } from 'obsidian';

export interface PrintTitleSettings {
	buttonText: string;
	buttonPosition: 'after-frontmatter' | 'top-right' | 'bottom';
	showIcon: boolean;
	buttonIcon: string;
	enableDebugMode: boolean;
	notificationDuration: number;
	customCSS: string;
	showEnhancedInfo: boolean;
	animateButton: boolean;
	showFileStats: boolean;
}

export interface FileContext {
	file: TFile;
	fileName: string;
	filePath: string;
	frontmatter?: Record<string, any>;
}

export interface ButtonConfig {
	text: string;
	icon?: string;
	position: 'after-frontmatter' | 'top-right' | 'bottom';
	className: string;
}

export const DEFAULT_SETTINGS: PrintTitleSettings = {
	buttonText: 'Print Title',
	buttonPosition: 'after-frontmatter',
	showIcon: true,
	buttonIcon: '📄',
	enableDebugMode: false,
	notificationDuration: 3000,
	customCSS: '',
	showEnhancedInfo: true,
	animateButton: true,
	showFileStats: true
};