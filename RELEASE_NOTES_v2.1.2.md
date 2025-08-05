# Print Title Plugin v2.1.2 - Fixed Scrolling Issue

## 🐛 Bug Fix Release

This release fixes the scrolling issue in ems__Area files where the area layout was blocking content scrolling.

### What Was Fixed

- **Fixed**: Area layout no longer blocks content scrolling
- **Fixed**: Layout properly integrates with both reading and source modes
- **Fixed**: Layout container is correctly positioned within the scrollable area
- **Improved**: Better handling of mode switching (reading/source)

### Technical Details

- Area layout is now appended to the correct scrollable container
- Added proper CSS styling to separate content from layout
- Improved container detection for different view modes
- Layout automatically re-renders when switching between modes

### No Breaking Changes

All functionality remains the same:
- Automatic area layout rendering for ems__Area files
- Child area creation with "Create Child Area" button
- Print title button for regular files

### Installation

1. Download `main.js` and `manifest.json` from the release assets
2. Place them in `.obsidian/plugins/print-title-plugin/`
3. Reload Obsidian
4. Enable the plugin