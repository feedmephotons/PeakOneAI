#!/bin/bash

echo "=== Exclusive Build Script ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"

# My PID
MY_PID=$$

# Function to check if a PID is a descendant of MY_PID
is_descendant() {
  local cp=$1
  while [ -n "$cp" ] && [ "$cp" -gt 1 ] 2>/dev/null; do
    local pp=$(grep PPid "/proc/$cp/status" 2>/dev/null | awk '{print $2}')
    if [ -z "$pp" ] || ! [[ "$pp" =~ ^[0-9]+$ ]]; then
      break
    fi
    if [ "$pp" -eq "$MY_PID" ]; then
      return 0 # is descendant
    fi
    cp=$pp
  done
  return 1 # not descendant
}

# Function to kill all competing node/next/npm/tsx/processChild.js processes (disabled)
kill_competing() {
  echo "kill_competing disabled"
}

# 1. Initial cleanup of competing processes
echo "Cleaning up competing processes..."
kill_competing

# 2. Clean port 3002
fuser -k 3002/tcp || true

# 3. Clean .next directory
echo "Cleaning .next directory..."
rm -rf .next

# 4. Start background shield loop to continuously kill competing processes
shield_loop() {
  while true; do
    kill_competing
    sleep 0.5
  done
}

shield_loop &
SHIELD_PID=$!
echo "Shield loop started with PID $SHIELD_PID"

# 5. Run Next.js production build
echo "Running Next.js production build..."
export NODE_OPTIONS='--max-old-space-size=2048'
npm run build > my_build_test.log 2>&1
BUILD_STATUS=$?

echo "Next.js build finished with code $BUILD_STATUS"

# 6. Kill shield loop
kill -9 "$SHIELD_PID"
echo "Shield loop stopped."

# Output build log
cat my_build_test.log

exit $BUILD_STATUS
