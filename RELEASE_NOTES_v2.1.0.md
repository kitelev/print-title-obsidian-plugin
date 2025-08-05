# Print Title Plugin v2.1.0 - Automatic Area Layout Rendering

## 🎯 Key Changes from v2.0.0

This release removes the dependency on dataviewjs blocks and implements automatic rendering for ems__Area files.

### ✨ What's New

1. **Automatic Area Layout Rendering**
   - ems__Area files now automatically display their layout when opened
   - No need for dataviewjs blocks in the file content
   - Layouts appear below the file content automatically

2. **Simplified Child Area Creation**
   - New child areas are created with clean frontmatter only
   - No dataviewjs code blocks added to new files
   - Cleaner, more maintainable area files

### 🔄 What Changed

- **Removed**: Global API for dataviewjs (`window.PrintTitleUI`)
- **Removed**: dataviewjs code blocks from newly created areas
- **Added**: Automatic detection and rendering of ems__Area layouts
- **Improved**: ViewManager now handles area layout rendering

### 📝 Usage

1. **For ems__Area files**: 
   - Open any file with `exo__Instance_class: ["[[ems__Area]]"]` in frontmatter
   - The area layout will automatically render below the content
   - Use the "Create Child Area" button to add child areas

2. **For regular files**: 
   - Works as before with the "Print Title" button

### 🚀 Installation

1. Download `print-title-plugin-v2.1.0.zip`
2. Extract `main.js` and `manifest.json` to `.obsidian/plugins/print-title-plugin/`
3. Reload Obsidian
4. Enable the plugin

### ⚠️ Breaking Changes

- If you were using `window.PrintTitleUI` API in dataviewjs blocks, these will no longer work
- Existing areas with dataviewjs blocks will still work but show the code as text
- Recommended to remove dataviewjs blocks from existing area files

### 🐛 Bug Fixes

- Fixed potential memory leaks from global API
- Improved layout container management
- Better error handling for area rendering

### 📌 Notes

This version simplifies the plugin architecture by removing the dependency on dataviewjs and making area layouts render automatically based on asset configuration.