#!/bin/bash

# Build the application
echo "Building the application..."
npm install
npm run build

# Verify build
if [ -d "dist" ]; then
  echo "Build successful! Output directory: dist"
  ls -la dist
else
  echo "Build failed: dist directory not found"
  exit 1
fi

echo "Deployment preparation complete!"