#!/usr/bin/env bash

set -euo pipefail

echo "Building shared_types package..."

# Navigate to the shared_types directory and build it
cd ../shared_types
npm install
npm run build

echo "shared_types build complete!"
