# Print Title Plugin v2.0.0

A sophisticated Obsidian plugin that adds a smart, configurable button to display note titles with enhanced file analysis and customizable positioning. Built following Obsidian plugin development best practices with a clean service-oriented architecture.

## 🚀 Features

### Core Functionality
- **Smart Button Placement**: Automatically positions after frontmatter properties or in configurable locations
- **Enhanced Notifications**: Rich notifications with file metadata, word counts, and statistics  
- **File Analysis**: Deep analysis of note content including complexity assessment
- **Multiple Position Options**: After frontmatter, top-right corner, or bottom of note
- **Customizable Styling**: Full CSS customization support with theme integration

### Advanced Features  
- **Service Architecture**: Clean separation of concerns with dedicated services
- **Memory Management**: Efficient button tracking with WeakMap
- **Event Handling**: Proper Obsidian event registration and cleanup
- **Responsive Design**: Mobile and desktop compatibility
- **Accessibility**: ARIA labels and keyboard navigation support
- **Debug Mode**: Comprehensive logging for troubleshooting

## 📱 Installation

### Via BRAT (Beta Reviewer's Auto-update Tool)
1. Install BRAT plugin from Obsidian Community Plugins
2. Add `kitelev/print-title-obsidian-plugin` to BRAT
3. Enable "Print Title Plugin" in Community Plugins settings

### Manual Installation
1. Download the latest release from GitHub
2. Extract files to `.obsidian/plugins/print-title-plugin/`
3. Enable the plugin in Obsidian settings

## ⚙️ Configuration

Access plugin settings through **Settings → Community Plugins → Print Title Plugin**

### Basic Settings
- **Button Text**: Customize the button label (default: "Print Title")
- **Button Position**: Choose placement strategy
  - `After frontmatter` - Smart insertion after YAML properties (recommended)
  - `Top right` - Floating button in corner  
  - `Bottom` - Fixed position at note bottom
- **Show Icon**: Display emoji icon next to text
- **Button Icon**: Customize the icon (default: 📄)

### Advanced Settings
- **Enhanced Information**: Show detailed file stats in notifications
- **Animate Button**: Enable hover effects and click animations
- **File Statistics**: Analyze word count, links, tags, and complexity
- **Notification Duration**: Control how long notices are displayed (1-10 seconds)
- **Debug Mode**: Enable detailed console logging

### Custom Styling
Add custom CSS to override default button appearance:

```css
.print-title-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-weight: bold;
}

.print-title-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
```

## 🏗️ Architecture

The plugin follows clean architecture principles with service-oriented design:

### Core Services
- **ButtonService**: Manages button creation, styling, and click handling
- **ViewManager**: Handles Obsidian workspace events and view lifecycle  
- **NotificationService**: Creates rich, styled notifications with file context
- **FileAnalysisService**: Analyzes note content for metrics and complexity
- **SettingsService**: Manages plugin configuration UI

### Key Design Patterns
- **Dependency Injection**: Services receive dependencies through constructors
- **Single Responsibility**: Each service has one clear purpose
- **Event-Driven**: Responds to Obsidian workspace events properly
- **Memory Safe**: Uses WeakMap for DOM element tracking
- **TypeScript First**: Comprehensive type definitions and interfaces

## 🎯 Smart Positioning

The plugin intelligently detects frontmatter/properties sections using multiple strategies:

1. **CSS Selectors**: Searches for standard Obsidian property containers
2. **Content Analysis**: Identifies YAML-like patterns in note content  
3. **Fallback Positioning**: Gracefully handles edge cases

Supported frontmatter formats:
```yaml
---
title: My Note
tags: [work, important]  
created: 2025-01-15
---
```

## 📊 File Analysis

When enabled, the plugin provides detailed file metrics:

- **Word Count**: Accurate word counting with pattern matching
- **Character Count**: Non-whitespace character analysis  
- **Link Analysis**: Internal links and embeds counting
- **Tag Detection**: Frontmatter and inline tag counting
- **Media Detection**: Image and attachment identification
- **Reading Time**: Estimated reading duration (250 WPM)
- **Complexity Assessment**: Simple/Moderate/Complex classification

## 🎨 Theming & Customization

The plugin respects Obsidian's theming system:

### CSS Variables Used
- `--interactive-accent` - Primary button color
- `--text-on-accent` - Button text color  
- `--background-secondary` - Container background
- `--background-modifier-border` - Border colors
- `--font-interface` - Button font family

### Responsive Breakpoints
- Mobile devices: Smaller padding and fonts
- High contrast mode: Enhanced borders  
- Reduced motion: Disabled animations

## 🛠️ Development

### Building from Source
```bash
npm install
npm run build    # Production build
npm run dev      # Development with watch
```

### Project Structure
```
src/
├── main.ts                 # Plugin entry point
├── types.ts               # TypeScript interfaces
└── services/
    ├── ButtonService.ts      # Button management
    ├── ViewManager.ts        # View lifecycle  
    ├── SettingsService.ts    # Configuration UI
    ├── NotificationService.ts # Enhanced notices
    └── FileAnalysisService.ts # Content analysis
```

### Best Practices Implemented
- ✅ Proper event registration and cleanup
- ✅ TypeScript strict mode compliance
- ✅ Service-oriented architecture  
- ✅ Memory leak prevention
- ✅ Error handling and logging
- ✅ Accessibility support
- ✅ Mobile compatibility
- ✅ Theme integration

## 🧪 Testing

The plugin includes comprehensive testing infrastructure:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Test coverage includes:
- Unit tests for all services
- Integration tests for button behavior
- Event handling verification
- Error condition testing
- Memory leak prevention

## 🐛 Troubleshooting

### Common Issues

**Button not appearing:**
1. Enable debug mode in settings
2. Check browser console for errors
3. Verify plugin is enabled and up-to-date
4. Try switching position to "Top right"

**Styling conflicts:**
1. Clear custom CSS in settings
2. Check for theme compatibility
3. Disable other button-related plugins temporarily

**Performance issues:**
1. Disable enhanced information if many large files
2. Turn off file statistics analysis
3. Reduce notification duration

### Debug Information
With debug mode enabled, check console for:
- Plugin loading confirmation
- Button creation events  
- File analysis results
- Event handling logs

## 🤝 Contributing

Contributions welcome! Please:
1. Follow existing code style and architecture
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## 📝 Changelog

### v2.0.0 - Major Architecture Overhaul
- **Service-oriented architecture** with clean separation of concerns
- **Enhanced notifications** with file metadata and statistics
- **File analysis service** for content metrics and complexity
- **Improved settings UI** with additional customization options
- **Better error handling** and user feedback
- **Performance optimizations** and memory management
- **Accessibility improvements** with ARIA support
- **Mobile responsiveness** and theme integration

### v1.0.4 - Smart Positioning
- Smart frontmatter detection and positioning
- Multiple fallback strategies for button placement
- Improved CSS selectors for property detection

### v1.0.0-1.0.3 - Foundation
- Basic button functionality
- Initial positioning system  
- Core notification system
- BRAT compatibility

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Inspired by best practices from the Obsidian plugin development community
- Architecture patterns derived from the exo-ui-plugin
- Built with ❤️ for the Obsidian community