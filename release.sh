#!/bin/bash

# Build the plugin
echo "Building plugin..."
npm run build

# Check if main.js exists
if [ ! -f "main.js" ]; then
    echo "Error: main.js not found. Build may have failed."
    exit 1
fi

# Check if manifest.json exists
if [ ! -f "manifest.json" ]; then
    echo "Error: manifest.json not found."
    exit 1
fi

echo "Build complete!"
echo ""
echo "To create a release on GitHub:"
echo "1. Push your changes: git push origin main"
echo "2. Go to https://github.com/YOUR_USERNAME/print-title-obsidian-plugin/releases"
echo "3. Click 'Create a new release'"
echo "4. Tag version: v1.0.0"
echo "5. Release title: Print Title Plugin v1.0.0"
echo "6. Attach these files:"
echo "   - main.js"
echo "   - manifest.json"
echo "7. Publish release"
echo ""
echo "BRAT will use the files from the main branch, not the release."