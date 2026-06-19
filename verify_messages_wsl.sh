#!/bin/bash
 
LOG_FILE="/home/wfowlkes/Claude Main Projects/SaasX/.agents/worker_messages_10/verification_output.log"
echo "=== Starting E2E Verification Script ===" > "$LOG_FILE"
date -u | tee -a "$LOG_FILE"
 
# Isolate build directory and clean up both build directories
export NEXT_DIST_DIR=".next_worker10_v2"
echo "Cleaning up build directories..." | tee -a "$LOG_FILE"
rm -rf .next
rm -rf "$NEXT_DIST_DIR"
rm -f tsconfig.tsbuildinfo

 
# Set Sentry, Node, and telemetry options to prevent issues
export NEXT_DISABLE_SENTRY=1
export SENTRY_DISABLE=1
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS='--max-old-space-size=1536'
 
echo "" | tee -a "$LOG_FILE"
echo "1. Running prisma db push --accept-data-loss..." | tee -a "$LOG_FILE"
npx prisma db push --accept-data-loss 2>&1 | tee -a "$LOG_FILE"
DB_PUSH_STATUS=${PIPESTATUS[0]}
echo "Prisma db push exited with code $DB_PUSH_STATUS" | tee -a "$LOG_FILE"
 
echo "" | tee -a "$LOG_FILE"
echo "2. Running prisma generate..." | tee -a "$LOG_FILE"
npx prisma generate 2>&1 | tee -a "$LOG_FILE"
GENERATE_STATUS=${PIPESTATUS[0]}
echo "Prisma generate exited with code $GENERATE_STATUS" | tee -a "$LOG_FILE"
 
echo "" | tee -a "$LOG_FILE"
echo "3. Running Next.js production build..." | tee -a "$LOG_FILE"
npm run build 2>&1 | tee -a "$LOG_FILE"
BUILD_STATUS=${PIPESTATUS[0]}
echo "Next.js build exited with code $BUILD_STATUS" | tee -a "$LOG_FILE"
 
# Clean up any lingering dev servers on ports 3001/3002/3003
echo "Cleaning up lingering dev servers..." | tee -a "$LOG_FILE"
# fuser -k 3001/tcp 2>&1 | tee -a "$LOG_FILE" || true
# fuser -k 3002/tcp 2>&1 | tee -a "$LOG_FILE" || true
# fuser -k 3003/tcp 2>&1 | tee -a "$LOG_FILE" || true

sleep 2
 
echo "" | tee -a "$LOG_FILE"
echo "4. Running E2E messages-challenger.ts tests on PORT 3003..." | tee -a "$LOG_FILE"
export PORT=3003
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
npx tsx tests/messages-challenger.ts 2>&1 | tee -a "$LOG_FILE"
CHALLENGER_STATUS=${PIPESTATUS[0]}
echo "messages-challenger.ts exited with code $CHALLENGER_STATUS" | tee -a "$LOG_FILE"
 
echo "" | tee -a "$LOG_FILE"
echo "5. Running E2E run-all.ts tests on PORT 3003..." | tee -a "$LOG_FILE"
export PORT=3003
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
npx tsx tests/run-all.ts 2>&1 | tee -a "$LOG_FILE"
RUN_ALL_STATUS=${PIPESTATUS[0]}
echo "run-all.ts exited with code $RUN_ALL_STATUS" | tee -a "$LOG_FILE"
 
echo "" | tee -a "$LOG_FILE"
echo "=== Verification Script Finished ===" | tee -a "$LOG_FILE"
date -u | tee -a "$LOG_FILE"
 
# Output status summary
echo "Summary:"
echo "Prisma db push: $DB_PUSH_STATUS"
echo "Prisma generate: $GENERATE_STATUS"
echo "Next.js build: $BUILD_STATUS"
echo "Challenger tests: $CHALLENGER_STATUS"
echo "Run-all tests: $RUN_ALL_STATUS"
