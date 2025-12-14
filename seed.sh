#!/bin/sh
set -e

WAIT=${WAIT_FOR_DB:-5}
echo "Waiting ${WAIT}s before seeding to allow DB startup..."
sleep "$WAIT"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/backend"

echo "Running seed (if needed) from $(pwd)..."
exec go run ./cmd/seed
