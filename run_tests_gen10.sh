#!/bin/bash
echo "=== Gen10 E2E Test Suite ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

# Clean up port 3002 just in case
fuser -k 3002/tcp || true

# Export environment variables for the tests
export PORT=3002
export NEXT_DIST_DIR=".next_gen10"
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
export SENTRY_DISABLE=1
export NEXT_DISABLE_SENTRY=1
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

echo "Starting E2E tests on port 3002 using NEXT_DIST_DIR=$NEXT_DIST_DIR..."
npx tsx tests/run-all.ts
TEST_STATUS=$?

echo "Tests exited with code $TEST_STATUS"
exit $TEST_STATUS
