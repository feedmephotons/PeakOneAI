#!/bin/bash
echo "=== Gen6 Build Script ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

# Remove old .next_gen6 directory
rm -rf .next_gen6

export NEXT_DIST_DIR=.next_gen6
export NODE_OPTIONS='--max-old-space-size=2048'

echo "Running Next.js production build for Gen6..."
npm run build
echo "Build exited with code $?"
