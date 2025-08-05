# Print Title Plugin v2.0.0 - Exo-UI Integration Release

## 🎉 Major Update: Exo-UI System Integration

This release introduces comprehensive integration with the Exo-UI plugin functionality, transforming the Print Title Plugin into a smart, context-aware tool.

### ✨ New Features

1. **Smart Context-Aware Buttons**
   - Regular files: Show "Print Title" button
   - ems__Area assets: Show "Create Child Area" button

2. **Child Area Creation (Дочерняя зона)**
   - Modal-based interface for creating child areas
   - Automatic frontmatter generation with proper Exo asset structure
   - UUID generation for unique asset identification

3. **Area Layout Rendering**
   - Complete UI for ems__Area assets
   - Display child areas with navigation
   - Show unresolved tasks and projects
   - Interactive buttons for quick actions

4. **Dataview Integration**
   - Full Dataview API adapter
   - Query assets by class
   - Find child areas and related efforts
   - Global API for dataviewjs blocks

5. **Global API for Dataviewjs**
   ```javascript
   window.PrintTitleUI.renderAreaLayout(dv, this)
   window.PrintTitleUI.createChildArea(parentContext)
   ```

### 🔧 Technical Improvements

- **Service Architecture**: Modular services for area creation, layout rendering, and Dataview integration
- **Type System**: Complete ExoAsset type definitions
- **Button Service**: Enhanced to detect file types and show appropriate actions
- **Error Handling**: Comprehensive error handling throughout the integration

### 📝 Usage

1. **For regular files**: The plugin works as before, showing a "Print Title" button

2. **For ems__Area files**: 
   - Create a file with frontmatter:
     ```yaml
     ---
     exo__Instance_class: ["[[ems__Area]]"]
     ---
     ```
   - The plugin will show a "Create Child Area" button
   - Click to create child areas with proper hierarchy

3. **In dataviewjs blocks**:
   ```javascript
   if (window.PrintTitleUI) {
     await window.PrintTitleUI.renderAreaLayout(dv, this)
   }
   ```

### 🚀 Installation

1. Download `print-title-plugin-v2.0.0.zip`
2. Extract `main.js` and `manifest.json` to your vault's `.obsidian/plugins/print-title-plugin/` folder
3. Reload Obsidian
4. Enable the plugin in Settings

### ⚠️ Requirements

- Obsidian v1.5.3 or higher
- Dataview plugin (for full functionality)

### 🐛 Bug Fixes

- Fixed TypeScript compilation issues
- Improved button positioning logic
- Enhanced file type detection

### 📌 Notes

This is a major release that significantly extends the plugin's functionality. The original print title functionality remains intact while adding comprehensive support for the Exo asset system.