#!/bin/bash
echo "=== Stealth Build Script ==="
cd "/home/wfowlkes/Claude Main Projects/SaasX/saasx-platform"
rm -rf .next_gen6
export NEXT_DIST_DIR=.next_gen6
export NODE_OPTIONS='--max-old-space-size=2048'
/home/wfowlkes/apples /home/wfowlkes/pears build
echo "Build exited with code $?"
