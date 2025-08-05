#!/bin/bash
echo "Building plugin..."
npx tsc
echo "Build complete!"
ls -la main.js