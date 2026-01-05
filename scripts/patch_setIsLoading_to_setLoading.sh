#!/usr/bin/env bash
set -euo pipefail

FILE="src/app/vision/VisionWorkspace.tsx"

if ! grep -q "setIsLoading" "$FILE"; then
  echo "No setIsLoading found, nothing to patch."
  exit 0
fi

# Replace setIsLoading( with setLoading(
perl -0777 -i -pe 's/\bsetIsLoading\s*\(/setLoading(/g' "$FILE"

echo "Patched, replaced setIsLoading( with setLoading( in $FILE"
