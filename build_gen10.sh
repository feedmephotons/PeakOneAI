#!/bin/bash
echo "=== Gen10 Isolated Production Build ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

# Remove old custom build directory
rm -rf .next_gen10

# Export env vars to limit memory, disable telemetry, and disable Sentry static page generation conflicts
export NEXT_DIST_DIR=".next_gen10"
export NEXT_DISABLE_SENTRY=1
export SENTRY_DISABLE=1
export NODE_OPTIONS='--max-old-space-size=1536'
export NEXT_TELEMETRY_DISABLED=1

echo "NEXT_DIST_DIR=$NEXT_DIST_DIR"
echo "NODE_OPTIONS=$NODE_OPTIONS"

npm run build
BUILD_STATUS=$?

echo "Build exited with code $BUILD_STATUS"
exit $BUILD_STATUS
