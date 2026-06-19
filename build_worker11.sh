#!/bin/bash
echo "=== Worker 11 Production Build ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

# Export requested environment variables
export NEXT_DIST_DIR=".next_worker11"
export NEXT_DISABLE_SENTRY=1
export SENTRY_DISABLE=1
export NODE_OPTIONS='--max-old-space-size=1536'
export NEXT_TELEMETRY_DISABLED=1

echo "NEXT_DIST_DIR=$NEXT_DIST_DIR"
echo "NODE_OPTIONS=$NODE_OPTIONS"

# Run build
npm run build
BUILD_STATUS=$?

echo "Build complete. Exit status: $BUILD_STATUS"
exit $BUILD_STATUS
