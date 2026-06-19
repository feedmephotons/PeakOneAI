#!/bin/bash
echo "=== Simple Clean Build Script ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

# 1. Kill existing processes once (disabled to prevent concurrent agent conflicts)
echo "Killing competing processes (disabled)..."
# pkill -9 -f "next build" || true
# pkill -9 -f "processChild.js" || true
# pkill -9 -f "tsx tests" || true
# pkill -9 -f "node server.js" || true
# pkill -9 -f "build_cleanly.sh" || true
# pkill -9 -f "build_exclusive.sh" || true
# pkill -9 -f "verify_messages_wsl.sh" || true


# 2. Clean port 3003
fuser -k 3003/tcp || true

# 3. Clean .next directory
echo "Cleaning .next directory..."
rm -rf .next

# 4. Run Next.js production build
echo "Running Next.js production build..."
export NEXT_DISABLE_SENTRY=1
export SENTRY_DISABLE=1
export NODE_OPTIONS='--max-old-space-size=2048'
npm run build
BUILD_STATUS=$?

echo "Next.js build finished with code $BUILD_STATUS"
exit $BUILD_STATUS
