# Print Title Plugin v2.1.1 - Fixed Bundle Issue

## 🐛 Bug Fix Release

This release fixes the critical bundling issue that prevented the plugin from loading in Obsidian.

### What Was Fixed

- **Fixed**: Plugin now properly bundles all dependencies into a single `main.js` file
- **Fixed**: Removed invalid require() calls for local modules that caused "Cannot find module './types'" error
- **Fixed**: Plugin now loads correctly in Obsidian without any errors

### Technical Details

- Switched from TypeScript compiler (tsc) to esbuild for proper bundling
- All TypeScript modules are now bundled into a single file
- External dependency (obsidian) is properly marked as external

### Installation

1. Download `main.js` and `manifest.json` from the release assets
2. Place them in `.obsidian/plugins/print-title-plugin/`
3. Reload Obsidian
4. Enable the plugin

### No Changes to Functionality

This is purely a bug fix release. All features from v2.1.0 remain the same:
- Automatic area layout rendering for ems__Area files
- Child area creation
- Print title button for regular files