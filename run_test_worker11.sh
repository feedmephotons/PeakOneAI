#!/bin/bash
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

export PORT=3003
export NEXT_DIST_DIR=".next_worker11"
export NEXT_DISABLE_SENTRY=1
export SENTRY_DISABLE=1
export NODE_OPTIONS='--max-old-space-size=1536'
export NEXT_TELEMETRY_DISABLED=1
export PUPPETEER_EXECUTABLE_PATH='/usr/bin/google-chrome'

echo "=== Running messages-challenger.ts ==="
npx tsx tests/messages-challenger.ts > messages_challenger_test.log 2>&1
CHALLENGER_STATUS=$?
echo "messages-challenger.ts finished with exit code $CHALLENGER_STATUS"

echo "=== Running run-all.ts ==="
npx tsx tests/run-all.ts > run_all_test.log 2>&1
RUN_ALL_STATUS=$?
echo "run-all.ts finished with exit code $RUN_ALL_STATUS"

# Print outputs of log files to stdout
echo "=== MESSAGES CHALLENGER LOGS ==="
cat messages_challenger_test.log

echo "=== RUN ALL LOGS ==="
cat run_all_test.log

# Propagate exit codes
if [ $CHALLENGER_STATUS -ne 0 ] || [ $RUN_ALL_STATUS -ne 0 ]; then
  exit 1
else
  exit 0
fi
