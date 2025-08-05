# Quick Start - Print Title Plugin

## Repository is Ready! 

All files are prepared and committed. The plugin is ready to be published.

## Next Steps:

### 1. Push to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/print-title-obsidian-plugin.git

# Push the code
git push -u origin master
```

### 2. Install via BRAT
Once pushed, anyone can install your plugin:

1. Install BRAT from Obsidian Community Plugins
2. Go to BRAT settings
3. Click "Add Beta plugin" 
4. Enter: `https://github.com/YOUR_GITHUB_USERNAME/print-title-obsidian-plugin`
5. Enable the plugin in Community Plugins

## Files Ready for BRAT ✅

- `main.js` - Compiled plugin code
- `manifest.json` - Plugin metadata  
- `versions.json` - Version compatibility
- `README.md` - Documentation

## Testing Locally

To test before publishing:
```bash
# Copy to your vault
cp main.js manifest.json ~/.obsidian/plugins/print-title-plugin/

# Restart Obsidian and enable the plugin
```

That's it! Your plugin is ready to share with the Obsidian community via BRAT.