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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZpY2VzL1NldHRpbmdzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBMEQ7QUFJMUQsTUFBYSxvQkFBcUIsU0FBUSwyQkFBZ0I7SUFHekQsWUFBWSxHQUFRLEVBQUUsTUFBd0I7UUFDN0MsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTztRQUNOLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDN0IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXBCLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLDZCQUE2QixFQUFFLENBQUMsQ0FBQztRQUVwRSxzQkFBc0I7UUFDdEIsSUFBSSxrQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsYUFBYSxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQzthQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO2FBQ25CLGNBQWMsQ0FBQyxhQUFhLENBQUM7YUFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUN6QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLElBQUksYUFBYSxDQUFDO1lBQ3pELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLDBCQUEwQjtRQUMxQixJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzthQUMxQixPQUFPLENBQUMsdUNBQXVDLENBQUM7YUFDaEQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUTthQUMvQixTQUFTLENBQUMsbUJBQW1CLEVBQUUsMkJBQTJCLENBQUM7YUFDM0QsU0FBUyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQzthQUMxQyxTQUFTLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDO2FBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUM7YUFDN0MsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFVLEVBQUUsRUFBRTtZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQzVDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLG9CQUFvQjtRQUNwQixJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDcEIsT0FBTyxDQUFDLHlDQUF5QyxDQUFDO2FBQ2xELFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU07YUFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUN2QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sc0JBQXNCO1FBQ3RCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLGFBQWEsQ0FBQzthQUN0QixPQUFPLENBQUMsaUNBQWlDLENBQUM7YUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTthQUNuQixjQUFjLENBQUMsSUFBSSxDQUFDO2FBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDekMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLGdDQUFnQztRQUNoQyxJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzthQUNoQyxPQUFPLENBQUMscURBQXFELENBQUM7YUFDOUQsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTthQUNuQixjQUFjLENBQUMsTUFBTSxDQUFDO2FBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUM5RCxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLHdCQUF3QjtRQUN4QixJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQzthQUNwQyxPQUFPLENBQUMsK0VBQStFLENBQUM7YUFDeEYsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTTthQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7YUFDL0MsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDOUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFTiwyQkFBMkI7UUFDM0IsSUFBSSxrQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDekIsT0FBTyxDQUFDLGtEQUFrRCxDQUFDO2FBQzNELFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU07YUFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQzthQUM1QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4scUJBQXFCO1FBQ3JCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLHNCQUFzQixDQUFDO2FBQy9CLE9BQU8sQ0FBQyxtREFBbUQsQ0FBQzthQUM1RCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNO2FBQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7YUFDNUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQzNDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4scUJBQXFCO1FBQ3JCLElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7YUFDdEIsT0FBTyxDQUFDLFlBQVksQ0FBQzthQUNyQixPQUFPLENBQUMscURBQXFELENBQUM7YUFDOUQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTTthQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO2FBQzlDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUM3QyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLHFCQUFxQjtRQUNyQixJQUFJLGtCQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxZQUFZLENBQUM7YUFDckIsT0FBTyxDQUFDLHFEQUFxRCxDQUFDO2FBQzlELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7YUFDdkIsY0FBYyxDQUFDLDhGQUE4RixDQUFDO2FBQzlHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDeEMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLGlCQUFpQjtRQUNqQixXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDdkQsSUFBSSxrQkFBTyxDQUFDLFdBQVcsQ0FBQzthQUN0QixPQUFPLENBQUMsbUJBQW1CLENBQUM7YUFDNUIsT0FBTyxDQUFDLDRDQUE0QyxDQUFDO2FBQ3JELFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU07YUFDekIsYUFBYSxDQUFDLE9BQU8sQ0FBQzthQUN0QixVQUFVLEVBQUU7YUFDWixPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDbkIsb0JBQW9CO1lBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztZQUMvRCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyw2QkFBNkI7UUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVOLGNBQWM7UUFDZCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLFNBQVMsR0FBRztvQ0FDYyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPOzs7Ozs7Ozs7R0FTN0QsQ0FBQztJQUNILENBQUM7Q0FDRDtBQTFLRCxvREEwS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgUHJpbnRUaXRsZVBsdWdpbiBmcm9tICcuLi9tYWluJztcbmltcG9ydCB7IFByaW50VGl0bGVTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIFByaW50VGl0bGVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG5cdHBsdWdpbjogUHJpbnRUaXRsZVBsdWdpbjtcblxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQcmludFRpdGxlUGx1Z2luKSB7XG5cdFx0c3VwZXIoYXBwLCBwbHVnaW4pO1xuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xuXHR9XG5cblx0ZGlzcGxheSgpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuXHRcdGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdQcmludCBUaXRsZSBQbHVnaW4gU2V0dGluZ3MnIH0pO1xuXG5cdFx0Ly8gQnV0dG9uIHRleHQgc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0J1dHRvbiB0ZXh0Jylcblx0XHRcdC5zZXREZXNjKCdUZXh0IGRpc3BsYXllZCBvbiB0aGUgYnV0dG9uJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ1ByaW50IFRpdGxlJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmJ1dHRvblRleHQpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5idXR0b25UZXh0ID0gdmFsdWUgfHwgJ1ByaW50IFRpdGxlJztcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5yZWZyZXNoQWxsQnV0dG9ucygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBCdXR0b24gcG9zaXRpb24gc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0J1dHRvbiBwb3NpdGlvbicpXG5cdFx0XHQuc2V0RGVzYygnV2hlcmUgdG8gcGxhY2UgdGhlIGJ1dHRvbiBpbiB0aGUgbm90ZScpXG5cdFx0XHQuYWRkRHJvcGRvd24oZHJvcGRvd24gPT4gZHJvcGRvd25cblx0XHRcdFx0LmFkZE9wdGlvbignYWZ0ZXItZnJvbnRtYXR0ZXInLCAnQWZ0ZXIgZnJvbnRtYXR0ZXIgKHNtYXJ0KScpXG5cdFx0XHRcdC5hZGRPcHRpb24oJ3RvcC1yaWdodCcsICdUb3AgcmlnaHQgY29ybmVyJylcblx0XHRcdFx0LmFkZE9wdGlvbignYm90dG9tJywgJ0JvdHRvbSBvZiBub3RlJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmJ1dHRvblBvc2l0aW9uKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlOiBhbnkpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5idXR0b25Qb3NpdGlvbiA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnJlZnJlc2hBbGxCdXR0b25zKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIFNob3cgaWNvbiBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnU2hvdyBpY29uJylcblx0XHRcdC5zZXREZXNjKCdEaXNwbGF5IGFuIGljb24gbmV4dCB0byB0aGUgYnV0dG9uIHRleHQnKVxuXHRcdFx0LmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93SWNvbilcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dJY29uID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4ucmVmcmVzaEFsbEJ1dHRvbnMoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0Ly8gQnV0dG9uIGljb24gc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0J1dHRvbiBpY29uJylcblx0XHRcdC5zZXREZXNjKCdJY29uIHRvIGRpc3BsYXkgKGVtb2ppIG9yIHRleHQpJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ/Cfk4QnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYnV0dG9uSWNvbilcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmJ1dHRvbkljb24gPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5yZWZyZXNoQWxsQnV0dG9ucygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBOb3RpZmljYXRpb24gZHVyYXRpb24gc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ05vdGlmaWNhdGlvbiBkdXJhdGlvbicpXG5cdFx0XHQuc2V0RGVzYygnSG93IGxvbmcgbm90aWZpY2F0aW9ucyBhcmUgZGlzcGxheWVkIChtaWxsaXNlY29uZHMpJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJzMwMDAnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm90aWZpY2F0aW9uRHVyYXRpb24udG9TdHJpbmcoKSlcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGR1cmF0aW9uID0gcGFyc2VJbnQodmFsdWUpIHx8IDMwMDA7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Mubm90aWZpY2F0aW9uRHVyYXRpb24gPSBNYXRoLm1heCgxMDAwLCBNYXRoLm1pbigxMDAwMCwgZHVyYXRpb24pKTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0Ly8gRW5oYW5jZWQgaW5mbyBzZXR0aW5nXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnU2hvdyBlbmhhbmNlZCBpbmZvcm1hdGlvbicpXG5cdFx0XHQuc2V0RGVzYygnRGlzcGxheSBhZGRpdGlvbmFsIGZpbGUgaW5mb3JtYXRpb24gaW4gbm90aWZpY2F0aW9ucyAodGFncywgd29yZCBjb3VudCwgZXRjLiknKVxuXHRcdFx0LmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93RW5oYW5jZWRJbmZvKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvd0VuaGFuY2VkSW5mbyA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBCdXR0b24gYW5pbWF0aW9uIHNldHRpbmdcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdBbmltYXRlIGJ1dHRvbicpXG5cdFx0XHQuc2V0RGVzYygnRW5hYmxlIGJ1dHRvbiBjbGljayBhbmltYXRpb25zIGFuZCBob3ZlciBlZmZlY3RzJylcblx0XHRcdC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYW5pbWF0ZUJ1dHRvbilcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmFuaW1hdGVCdXR0b24gPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5yZWZyZXNoQWxsQnV0dG9ucygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBGaWxlIHN0YXRzIHNldHRpbmdcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdTaG93IGZpbGUgc3RhdGlzdGljcycpXG5cdFx0XHQuc2V0RGVzYygnQW5hbHl6ZSBhbmQgZGlzcGxheSBmaWxlIHN0YXRpc3RpY3MgaW4gZGVidWcgbW9kZScpXG5cdFx0XHQuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dGaWxlU3RhdHMpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaG93RmlsZVN0YXRzID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIERlYnVnIG1vZGUgc2V0dGluZ1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0RlYnVnIG1vZGUnKVxuXHRcdFx0LnNldERlc2MoJ0VuYWJsZSBkZXRhaWxlZCBjb25zb2xlIGxvZ2dpbmcgZm9yIHRyb3VibGVzaG9vdGluZycpXG5cdFx0XHQuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSlcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBDdXN0b20gQ1NTIHNldHRpbmdcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdDdXN0b20gQ1NTJylcblx0XHRcdC5zZXREZXNjKCdBZGRpdGlvbmFsIENTUyB0byBzdHlsZSB0aGUgYnV0dG9uIChhZHZhbmNlZCB1c2VycyknKVxuXHRcdFx0LmFkZFRleHRBcmVhKHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJy8qIEN1c3RvbSBDU1MgZm9yIC5wcmludC10aXRsZS1idXR0b24gKi9cXG4ucHJpbnQtdGl0bGUtYnV0dG9uIHtcXG4gIC8qIFlvdXIgc3R5bGVzIGhlcmUgKi9cXG59Jylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmN1c3RvbUNTUylcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmN1c3RvbUNTUyA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLmFwcGx5Q3VzdG9tU3R5bGVzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIFJlc2V0IHNldHRpbmdzXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnUmVzZXQgU2V0dGluZ3MnIH0pO1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ1Jlc2V0IHRvIGRlZmF1bHRzJylcblx0XHRcdC5zZXREZXNjKCdSZXNldCBhbGwgc2V0dGluZ3MgdG8gdGhlaXIgZGVmYXVsdCB2YWx1ZXMnKVxuXHRcdFx0LmFkZEJ1dHRvbihidXR0b24gPT4gYnV0dG9uXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdSZXNldCcpXG5cdFx0XHRcdC5zZXRXYXJuaW5nKClcblx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdC8vIFJlc2V0IHRvIGRlZmF1bHRzXG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MgPSB7IC4uLnRoaXMucGx1Z2luLmdldERlZmF1bHRTZXR0aW5ncygpIH07XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4ucmVmcmVzaEFsbEJ1dHRvbnMoKTtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5hcHBseUN1c3RvbVN0eWxlcygpO1xuXHRcdFx0XHRcdHRoaXMuZGlzcGxheSgpOyAvLyBSZWZyZXNoIHRoZSBzZXR0aW5ncyBwYW5lbFxuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBQbHVnaW4gaW5mb1xuXHRcdGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0Fib3V0JyB9KTtcblx0XHRjb25zdCBhYm91dEVsID0gY29udGFpbmVyRWwuY3JlYXRlRWwoJ2RpdicpO1xuXHRcdGFib3V0RWwuaW5uZXJIVE1MID0gYFxuXHRcdFx0PHA+PHN0cm9uZz5QcmludCBUaXRsZSBQbHVnaW4gdiR7dGhpcy5wbHVnaW4ubWFuaWZlc3QudmVyc2lvbn08L3N0cm9uZz48L3A+XG5cdFx0XHQ8cD5BZGRzIGEgY3VzdG9taXphYmxlIGJ1dHRvbiB0byBkaXNwbGF5IHRoZSBjdXJyZW50IG5vdGUncyB0aXRsZS48L3A+XG5cdFx0XHQ8cD5GZWF0dXJlczo8L3A+XG5cdFx0XHQ8dWw+XG5cdFx0XHRcdDxsaT5TbWFydCBwb3NpdGlvbmluZyBhZnRlciBmcm9udG1hdHRlcjwvbGk+XG5cdFx0XHRcdDxsaT5DdXN0b21pemFibGUgYnV0dG9uIHRleHQgYW5kIGljb248L2xpPlxuXHRcdFx0XHQ8bGk+TXVsdGlwbGUgcG9zaXRpb24gb3B0aW9uczwvbGk+XG5cdFx0XHRcdDxsaT5EZWJ1ZyBtb2RlIGZvciB0cm91Ymxlc2hvb3Rpbmc8L2xpPlxuXHRcdFx0PC91bD5cblx0XHRgO1xuXHR9XG59Il19