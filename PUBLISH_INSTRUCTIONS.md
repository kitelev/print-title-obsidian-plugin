# Publishing Print Title Plugin

The plugin is ready for publishing. Follow these steps:

## 1. Create GitHub Repository

### Option A: Using GitHub CLI
```bash
# First, authenticate with GitHub
gh auth login

# Then create and push the repository
gh repo create print-title-obsidian-plugin --public --source=. --remote=origin --push
```

### Option B: Using GitHub Web Interface
1. Go to https://github.com/new
2. Repository name: `print-title-obsidian-plugin`
3. Make it Public
4. Don't initialize with README (we already have one)
5. Create repository
6. Run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/print-title-obsidian-plugin.git
git branch -M main
git push -u origin main
```

## 2. Verify Files

Make sure these files are in the repository root:
- ✅ `main.js` - Compiled plugin code
- ✅ `manifest.json` - Plugin metadata
- ✅ `versions.json` - Version compatibility
- ✅ `README.md` - Documentation

## 3. Test BRAT Installation

1. Install BRAT in Obsidian:
   - Settings → Community plugins → Browse → Search "BRAT"
   - Install "Obsidian42 - BRAT"

2. Add your plugin:
   - Settings → BRAT → Add Beta plugin
   - Enter: `https://github.com/YOUR_USERNAME/print-title-obsidian-plugin`
   - Click "Add Plugin"

3. Enable the plugin:
   - Settings → Community plugins
   - Find "Print Title Plugin" and enable it

## 4. Create a Release (Optional)

```bash
# Tag the release
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Or use GitHub UI to create a release and attach main.js and manifest.json
```

## Current Repository Status

- Git repository: ✅ Initialized
- All files: ✅ Committed
- Ready to push: ✅ Yes

Just add a remote and push!