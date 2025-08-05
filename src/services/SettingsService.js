"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintTitleSettingTab = void 0;
const obsidian_1 = require("obsidian");
class PrintTitleSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Print Title Plugin Settings' });
        // Button text setting
        new obsidian_1.Setting(containerEl)
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
        new obsidian_1.Setting(containerEl)
            .setName('Button position')
            .setDesc('Where to place the button in the note')
            .addDropdown(dropdown => dropdown
            .addOption('after-frontmatter', 'After frontmatter (smart)')
            .addOption('top-right', 'Top right corner')
            .addOption('bottom', 'Bottom of note')
            .setValue(this.plugin.settings.buttonPosition)
            .onChange(async (value) => {
            this.plugin.settings.buttonPosition = value;
            await this.plugin.saveSettings();
            this.plugin.refreshAllButtons();
        }));
        // Show icon setting
        new obsidian_1.Setting(containerEl)
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
        new obsidian_1.Setting(containerEl)
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
        new obsidian_1.Setting(containerEl)
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
        new obsidian_1.Setting(containerEl)
            .setName('Show enhanced information')
            .setDesc('Display additional file information in notifications (tags, word count, etc.)')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showEnhancedInfo)
            .onChange(async (value) => {
            this.plugin.settings.showEnhancedInfo = value;
            await this.plugin.saveSettings();
        }));
        // Button animation setting
        new obsidian_1.Setting(containerEl)
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
        new obsidian_1.Setting(containerEl)
            .setName('Show file statistics')
            .setDesc('Analyze and display file statistics in debug mode')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showFileStats)
            .onChange(async (value) => {
            this.plugin.settings.showFileStats = value;
            await this.plugin.saveSettings();
        }));
        // Debug mode setting
        new obsidian_1.Setting(containerEl)
            .setName('Debug mode')
            .setDesc('Enable detailed console logging for troubleshooting')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enableDebugMode)
            .onChange(async (value) => {
            this.plugin.settings.enableDebugMode = value;
            await this.plugin.saveSettings();
        }));
        // Custom CSS setting
        new obsidian_1.Setting(containerEl)
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
        new obsidian_1.Setting(containerEl)
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
exports.PrintTitleSettingTab = PrintTitleSettingTab;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2V0dGluZ3NTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEwRDtBQUkxRCxNQUFhLG9CQUFxQixTQUFRLDJCQUFnQjtJQUd6RCxZQUFZLEdBQVEsRUFBRSxNQUF3QjtRQUM3QyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxPQUFPO1FBQ04sTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUM3QixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFcEIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1FBRXBFLHNCQUFzQjtRQUN0QixJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxhQUFhLENBQUM7YUFDdEIsT0FBTyxDQUFDLDhCQUE4QixDQUFDO2FBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7YUFDbkIsY0FBYyxDQUFDLGFBQWEsQ0FBQzthQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2FBQ3pDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLEtBQUssSUFBSSxhQUFhLENBQUM7WUFDekQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sMEJBQTBCO1FBQzFCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2FBQzFCLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQzthQUNoRCxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRO2FBQy9CLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSwyQkFBMkIsQ0FBQzthQUMzRCxTQUFTLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDO2FBQzFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUM7YUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQzthQUM3QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQVUsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDNUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sb0JBQW9CO1FBQ3BCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUNwQixPQUFPLENBQUMseUNBQXlDLENBQUM7YUFDbEQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTTthQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2FBQ3ZDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN0QyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTixzQkFBc0I7UUFDdEIsSUFBSSxrQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsYUFBYSxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQzthQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO2FBQ25CLGNBQWMsQ0FBQyxJQUFJLENBQUM7YUFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUN6QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDeEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sZ0NBQWdDO1FBQ2hDLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLHVCQUF1QixDQUFDO2FBQ2hDLE9BQU8sQ0FBQyxxREFBcUQsQ0FBQzthQUM5RCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO2FBQ25CLGNBQWMsQ0FBQyxNQUFNLENBQUM7YUFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQzlELFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDekIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sd0JBQXdCO1FBQ3hCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLDJCQUEyQixDQUFDO2FBQ3BDLE9BQU8sQ0FBQywrRUFBK0UsQ0FBQzthQUN4RixTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNO2FBQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQzthQUMvQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztZQUM5QyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLDJCQUEyQjtRQUMzQixJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUN6QixPQUFPLENBQUMsa0RBQWtELENBQUM7YUFDM0QsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTTthQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO2FBQzVDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUMzQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTixxQkFBcUI7UUFDckIsSUFBSSxrQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsc0JBQXNCLENBQUM7YUFDL0IsT0FBTyxDQUFDLG1EQUFtRCxDQUFDO2FBQzVELFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU07YUFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQzthQUM1QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTixxQkFBcUI7UUFDckIsSUFBSSxrQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsWUFBWSxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxxREFBcUQsQ0FBQzthQUM5RCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNO2FBQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7YUFDOUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4scUJBQXFCO1FBQ3JCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLFlBQVksQ0FBQzthQUNyQixPQUFPLENBQUMscURBQXFELENBQUM7YUFDOUQsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTthQUN2QixjQUFjLENBQUMsOEZBQThGLENBQUM7YUFDOUcsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUN4QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4saUJBQWlCO1FBQ2pCLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN2RCxJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQzthQUM1QixPQUFPLENBQUMsNENBQTRDLENBQUM7YUFDckQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTTthQUN6QixhQUFhLENBQUMsT0FBTyxDQUFDO2FBQ3RCLFVBQVUsRUFBRTthQUNaLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNuQixvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1lBQy9ELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLDZCQUE2QjtRQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sY0FBYztRQUNkLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDOUMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsU0FBUyxHQUFHO29DQUNjLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU87Ozs7Ozs7OztHQVM3RCxDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBMUtELG9EQTBLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCBQcmludFRpdGxlUGx1Z2luIGZyb20gJy4uL21haW4nO1xuaW1wb3J0IHsgUHJpbnRUaXRsZVNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUHJpbnRUaXRsZVNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBQcmludFRpdGxlUGx1Z2luO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFByaW50VGl0bGVQbHVnaW4pIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcblxuXHRcdGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ1ByaW50IFRpdGxlIFBsdWdpbiBTZXR0aW5ncycgfSk7XG5cblx0XHQvLyBCdXR0b24gdGV4dCBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnQnV0dG9uIHRleHQnKVxuXHRcdFx0LnNldERlc2MoJ1RleHQgZGlzcGxheWVkIG9uIHRoZSBidXR0b24nKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignUHJpbnQgVGl0bGUnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYnV0dG9uVGV4dClcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmJ1dHRvblRleHQgPSB2YWx1ZSB8fCAnUHJpbnQgVGl0bGUnO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnJlZnJlc2hBbGxCdXR0b25zKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIEJ1dHRvbiBwb3NpdGlvbiBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnQnV0dG9uIHBvc2l0aW9uJylcblx0XHRcdC5zZXREZXNjKCdXaGVyZSB0byBwbGFjZSB0aGUgYnV0dG9uIGluIHRoZSBub3RlJylcblx0XHRcdC5hZGREcm9wZG93bihkcm9wZG93biA9PiBkcm9wZG93blxuXHRcdFx0XHQuYWRkT3B0aW9uKCdhZnRlci1mcm9udG1hdHRlcicsICdBZnRlciBmcm9udG1hdHRlciAoc21hcnQpJylcblx0XHRcdFx0LmFkZE9wdGlvbigndG9wLXJpZ2h0JywgJ1RvcCByaWdodCBjb3JuZXInKVxuXHRcdFx0XHQuYWRkT3B0aW9uKCdib3R0b20nLCAnQm90dG9tIG9mIG5vdGUnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYnV0dG9uUG9zaXRpb24pXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmJ1dHRvblBvc2l0aW9uID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4ucmVmcmVzaEFsbEJ1dHRvbnMoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0Ly8gU2hvdyBpY29uIHNldHRpbmdcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdTaG93IGljb24nKVxuXHRcdFx0LnNldERlc2MoJ0Rpc3BsYXkgYW4gaWNvbiBuZXh0IHRvIHRoZSBidXR0b24gdGV4dCcpXG5cdFx0XHQuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dJY29uKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvd0ljb24gPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5yZWZyZXNoQWxsQnV0dG9ucygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBCdXR0b24gaWNvbiBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnQnV0dG9uIGljb24nKVxuXHRcdFx0LnNldERlc2MoJ0ljb24gdG8gZGlzcGxheSAoZW1vamkgb3IgdGV4dCknKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcign8J+ThCcpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5idXR0b25JY29uKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuYnV0dG9uSWNvbiA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnJlZnJlc2hBbGxCdXR0b25zKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIE5vdGlmaWNhdGlvbiBkdXJhdGlvbiBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnTm90aWZpY2F0aW9uIGR1cmF0aW9uJylcblx0XHRcdC5zZXREZXNjKCdIb3cgbG9uZyBub3RpZmljYXRpb25zIGFyZSBkaXNwbGF5ZWQgKG1pbGxpc2Vjb25kcyknKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignMzAwMCcpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub3RpZmljYXRpb25EdXJhdGlvbi50b1N0cmluZygpKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZHVyYXRpb24gPSBwYXJzZUludCh2YWx1ZSkgfHwgMzAwMDtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub3RpZmljYXRpb25EdXJhdGlvbiA9IE1hdGgubWF4KDEwMDAsIE1hdGgubWluKDEwMDAwLCBkdXJhdGlvbikpO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBFbmhhbmNlZCBpbmZvIHNldHRpbmdcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdTaG93IGVuaGFuY2VkIGluZm9ybWF0aW9uJylcblx0XHRcdC5zZXREZXNjKCdEaXNwbGF5IGFkZGl0aW9uYWwgZmlsZSBpbmZvcm1hdGlvbiBpbiBub3RpZmljYXRpb25zICh0YWdzLCB3b3JkIGNvdW50LCBldGMuKScpXG5cdFx0XHQuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dFbmhhbmNlZEluZm8pXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93RW5oYW5jZWRJbmZvID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIEJ1dHRvbiBhbmltYXRpb24gc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0FuaW1hdGUgYnV0dG9uJylcblx0XHRcdC5zZXREZXNjKCdFbmFibGUgYnV0dG9uIGNsaWNrIGFuaW1hdGlvbnMgYW5kIGhvdmVyIGVmZmVjdHMnKVxuXHRcdFx0LmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hbmltYXRlQnV0dG9uKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuYW5pbWF0ZUJ1dHRvbiA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnJlZnJlc2hBbGxCdXR0b25zKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIEZpbGUgc3RhdHMgc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ1Nob3cgZmlsZSBzdGF0aXN0aWNzJylcblx0XHRcdC5zZXREZXNjKCdBbmFseXplIGFuZCBkaXNwbGF5IGZpbGUgc3RhdGlzdGljcyBpbiBkZWJ1ZyBtb2RlJylcblx0XHRcdC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvd0ZpbGVTdGF0cylcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dGaWxlU3RhdHMgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0Ly8gRGVidWcgbW9kZSBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnRGVidWcgbW9kZScpXG5cdFx0XHQuc2V0RGVzYygnRW5hYmxlIGRldGFpbGVkIGNvbnNvbGUgbG9nZ2luZyBmb3IgdHJvdWJsZXNob290aW5nJylcblx0XHRcdC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlRGVidWdNb2RlID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIEN1c3RvbSBDU1Mgc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0N1c3RvbSBDU1MnKVxuXHRcdFx0LnNldERlc2MoJ0FkZGl0aW9uYWwgQ1NTIHRvIHN0eWxlIHRoZSBidXR0b24gKGFkdmFuY2VkIHVzZXJzKScpXG5cdFx0XHQuYWRkVGV4dEFyZWEodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignLyogQ3VzdG9tIENTUyBmb3IgLnByaW50LXRpdGxlLWJ1dHRvbiAqL1xcbi5wcmludC10aXRsZS1idXR0b24ge1xcbiAgLyogWW91ciBzdHlsZXMgaGVyZSAqL1xcbn0nKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VzdG9tQ1NTKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VzdG9tQ1NTID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uYXBwbHlDdXN0b21TdHlsZXMoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0Ly8gUmVzZXQgc2V0dGluZ3Ncblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdSZXNldCBTZXR0aW5ncycgfSk7XG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnUmVzZXQgdG8gZGVmYXVsdHMnKVxuXHRcdFx0LnNldERlc2MoJ1Jlc2V0IGFsbCBzZXR0aW5ncyB0byB0aGVpciBkZWZhdWx0IHZhbHVlcycpXG5cdFx0XHQuYWRkQnV0dG9uKGJ1dHRvbiA9PiBidXR0b25cblx0XHRcdFx0LnNldEJ1dHRvblRleHQoJ1Jlc2V0Jylcblx0XHRcdFx0LnNldFdhcm5pbmcoKVxuXHRcdFx0XHQub25DbGljayhhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gUmVzZXQgdG8gZGVmYXVsdHNcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncyA9IHsgLi4udGhpcy5wbHVnaW4uZ2V0RGVmYXVsdFNldHRpbmdzKCkgfTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5yZWZyZXNoQWxsQnV0dG9ucygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLmFwcGx5Q3VzdG9tU3R5bGVzKCk7XG5cdFx0XHRcdFx0dGhpcy5kaXNwbGF5KCk7IC8vIFJlZnJlc2ggdGhlIHNldHRpbmdzIHBhbmVsXG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIFBsdWdpbiBpbmZvXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnQWJvdXQnIH0pO1xuXHRcdGNvbnN0IGFib3V0RWwgPSBjb250YWluZXJFbC5jcmVhdGVFbCgnZGl2Jyk7XG5cdFx0YWJvdXRFbC5pbm5lckhUTUwgPSBgXG5cdFx0XHQ8cD48c3Ryb25nPlByaW50IFRpdGxlIFBsdWdpbiB2JHt0aGlzLnBsdWdpbi5tYW5pZmVzdC52ZXJzaW9ufTwvc3Ryb25nPjwvcD5cblx0XHRcdDxwPkFkZHMgYSBjdXN0b21pemFibGUgYnV0dG9uIHRvIGRpc3BsYXkgdGhlIGN1cnJlbnQgbm90ZSdzIHRpdGxlLjwvcD5cblx0XHRcdDxwPkZlYXR1cmVzOjwvcD5cblx0XHRcdDx1bD5cblx0XHRcdFx0PGxpPlNtYXJ0IHBvc2l0aW9uaW5nIGFmdGVyIGZyb250bWF0dGVyPC9saT5cblx0XHRcdFx0PGxpPkN1c3RvbWl6YWJsZSBidXR0b24gdGV4dCBhbmQgaWNvbjwvbGk+XG5cdFx0XHRcdDxsaT5NdWx0aXBsZSBwb3NpdGlvbiBvcHRpb25zPC9saT5cblx0XHRcdFx0PGxpPkRlYnVnIG1vZGUgZm9yIHRyb3VibGVzaG9vdGluZzwvbGk+XG5cdFx0XHQ8L3VsPlxuXHRcdGA7XG5cdH1cbn0iXX0=