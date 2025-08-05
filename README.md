# Print Title Plugin for Obsidian

This plugin adds a "Print Title" button to your notes that displays the current note's title in a notice when clicked.

## Features

- Adds a "Print Title" button at the bottom of each note
- Shows the note's title in a notice when clicked
- Prevents button duplication when switching between notes

## Installation

### Using BRAT

1. Install the BRAT plugin
   - Open `Settings` -> `Community Plugins`
   - Disable Safe Mode
   - Browse and search for "BRAT" 
   - Install the latest version of Obsidian42 - BRAT

2. Add this plugin with BRAT
   - Open BRAT settings (`Settings` -> `BRAT`)
   - Click "Add Beta plugin"
   - Enter: `https://github.com/YOUR_USERNAME/print-title-obsidian-plugin`
   - Click "Add Plugin"
   - Enable the plugin in Community Plugins

### Manual Installation

1. Download `main.js` and `manifest.json` from the latest release
2. Create folder `your-vault/.obsidian/plugins/print-title-plugin/`
3. Copy the files into this folder
4. Reload Obsidian
5. Enable the plugin in Settings

## Usage

1. Open any note in Obsidian
2. You'll see a "Print Title" button at the bottom of the note
3. Click the button to see the note's title in a notice

## Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/print-title-obsidian-plugin
cd print-title-obsidian-plugin

# Install dependencies
npm install

# Compile TypeScript
npm run build
```

## Testing

This plugin includes automated UI tests using Playwright:

```bash
cd obsidian-plugin-dev/obsidian-docker
docker-compose -f docker-compose-simple.yml up --build
```

## Support

If you find this plugin useful, consider starring the repository!

## License

MIT