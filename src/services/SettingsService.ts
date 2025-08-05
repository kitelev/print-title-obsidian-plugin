import { App, PluginSettingTab, Setting } from 'obsidian';
import PrintTitlePlugin from '../main';
import { PrintTitleSettings } from '../types';

export class PrintTitleSettingTab extends PluginSettingTab {
	plugin: PrintTitlePlugin;

	constructor(app: App, plugin: PrintTitlePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Print Title Plugin Settings' });

		// Button text setting
		new Setting(containerEl)
			.setName('Button text')
			.setDesc('Text displayed on the button')
			.addText(text => text
				.setPlaceholder('Print Title')
				.setValue(this.plugin.settings.buttonText)
				.onChange(async (value) => {
					this.plugin.settings.buttonText = value || 'Print Title';
					await this.plugin.saveSettings();
					this.plugin.refreshAllButtons();
				}));

		// Button position setting
		new Setting(containerEl)
			.setName('Button position')
			.setDesc('Where to place the button in the note')
			.addDropdown(dropdown => dropdown
				.addOption('after-frontmatter', 'After frontmatter (smart)')
				.addOption('top-right', 'Top right corner')
				.addOption('bottom', 'Bottom of note')
				.setValue(this.plugin.settings.buttonPosition)
				.onChange(async (value: any) => {
					this.plugin.settings.buttonPosition = value;
					await this.plugin.saveSettings();
					this.plugin.refreshAllButtons();
				}));

		// Show icon setting
		new Setting(containerEl)
			.setName('Show icon')
			.setDesc('Display an icon next to the button text')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showIcon)
				.onChange(async (value) => {
					this.plugin.settings.showIcon = value;
					await this.plugin.saveSettings();
					this.plugin.refreshAllButtons();
				}));

		// Button icon setting
		new Setting(containerEl)
			.setName('Button icon')
			.setDesc('Icon to display (emoji or text)')
			.addText(text => text
				.setPlaceholder('📄')
				.setValue(this.plugin.settings.buttonIcon)
				.onChange(async (value) => {
					this.plugin.settings.buttonIcon = value;
					await this.plugin.saveSettings();
					this.plugin.refreshAllButtons();
				}));

		// Notification duration setting
		new Setting(containerEl)
			.setName('Notification duration')
			.setDesc('How long notifications are displayed (milliseconds)')
			.addText(text => text
				.setPlaceholder('3000')
				.setValue(this.plugin.settings.notificationDuration.toString())
				.onChange(async (value) => {
					const duration = parseInt(value) || 3000;
					this.plugin.settings.notificationDuration = Math.max(1000, Math.min(10000, duration));
					await this.plugin.saveSettings();
				}));

		// Enhanced info setting
		new Setting(containerEl)
			.setName('Show enhanced information')
			.setDesc('Display additional file information in notifications (tags, word count, etc.)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showEnhancedInfo)
				.onChange(async (value) => {
					this.plugin.settings.showEnhancedInfo = value;
					await this.plugin.saveSettings();
				}));

		// Button animation setting
		new Setting(containerEl)
			.setName('Animate button')
			.setDesc('Enable button click animations and hover effects')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.animateButton)
				.onChange(async (value) => {
					this.plugin.settings.animateButton = value;
					await this.plugin.saveSettings();
					this.plugin.refreshAllButtons();
				}));

		// File stats setting
		new Setting(containerEl)
			.setName('Show file statistics')
			.setDesc('Analyze and display file statistics in debug mode')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showFileStats)
				.onChange(async (value) => {
					this.plugin.settings.showFileStats = value;
					await this.plugin.saveSettings();
				}));

		// Debug mode setting
		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc('Enable detailed console logging for troubleshooting')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableDebugMode)
				.onChange(async (value) => {
					this.plugin.settings.enableDebugMode = value;
					await this.plugin.saveSettings();
				}));

		// Custom CSS setting
		new Setting(containerEl)
			.setName('Custom CSS')
			.setDesc('Additional CSS to style the button (advanced users)')
			.addTextArea(text => text
				.setPlaceholder('/* Custom CSS for .print-title-button */\n.print-title-button {\n  /* Your styles here */\n}')
				.setValue(this.plugin.settings.customCSS)
				.onChange(async (value) => {
					this.plugin.settings.customCSS = value;
					await this.plugin.saveSettings();
					this.plugin.applyCustomStyles();
				}));

		// Reset settings
		containerEl.createEl('h3', { text: 'Reset Settings' });
		new Setting(containerEl)
			.setName('Reset to defaults')
			.setDesc('Reset all settings to their default values')
			.addButton(button => button
				.setButtonText('Reset')
				.setWarning()
				.onClick(async () => {
					// Reset to defaults
					this.plugin.settings = { ...this.plugin.getDefaultSettings() };
					await this.plugin.saveSettings();
					this.plugin.refreshAllButtons();
					this.plugin.applyCustomStyles();
					this.display(); // Refresh the settings panel
				}));

		// Plugin info
		containerEl.createEl('h3', { text: 'About' });
		const aboutEl = containerEl.createEl('div');
		aboutEl.innerHTML = `
			<p><strong>Print Title Plugin v${this.plugin.manifest.version}</strong></p>
			<p>Adds a customizable button to display the current note's title.</p>
			<p>Features:</p>
			<ul>
				<li>Smart positioning after frontmatter</li>
				<li>Customizable button text and icon</li>
				<li>Multiple position options</li>
				<li>Debug mode for troubleshooting</li>
			</ul>
		`;
	}
}