# Installing Print Title Plugin via BRAT

BRAT (Beta Reviewer's Auto-update Tool) allows you to install beta plugins that aren't yet in the Community Plugins directory.

## Prerequisites

1. **Disable Safe Mode** in Obsidian
   - Go to Settings → Community plugins
   - Turn off "Safe mode"

2. **Install BRAT Plugin**
   - Click "Browse" in Community plugins
   - Search for "BRAT"
   - Install "Obsidian42 - BRAT"
   - Enable the BRAT plugin

## Installation Steps

1. **Open BRAT Settings**
   - Go to Settings → BRAT

2. **Add the Plugin**
   - Click "Add Beta plugin"
   - Paste this URL: `https://github.com/YOUR_USERNAME/print-title-obsidian-plugin`
   - Click "Add Plugin"

3. **Enable the Plugin**
   - Go to Settings → Community plugins
   - Find "Print Title Plugin" in the list
   - Toggle it on

## Updating

BRAT will automatically check for updates. You can also manually update:
- Go to Settings → BRAT
- Click "Update" next to the plugin

## Troubleshooting

If the plugin doesn't appear:
1. Make sure you've disabled Safe Mode
2. Try restarting Obsidian
3. Check that the GitHub repository is public
4. Verify that `main.js` and `manifest.json` exist in the repository

## Manual Installation Alternative

If BRAT doesn't work, you can install manually:

1. Download these files from the repository:
   - `main.js`
   - `manifest.json`

2. Create this folder in your vault:
   ```
   .obsidian/plugins/print-title-plugin/
   ```

3. Copy both files into that folder

4. Restart Obsidian and enable the plugin