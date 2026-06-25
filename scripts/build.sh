#!/usr/bin/env bash
# =============================================================================
# scripts/build.sh
# Builds all presentations found under presentations/*/slides.md
# Output: dist/<presentation-name>/index.html
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRESENTATIONS_DIR="$REPO_ROOT/presentations"
THEMES_DIR="$REPO_ROOT/themes"
DIST_DIR="$REPO_ROOT/dist"
MARP="$REPO_ROOT/node_modules/.bin/marp"

echo "=== Marp Presentation Builder ==="
echo "Presentations: $PRESENTATIONS_DIR"
echo "Themes:        $THEMES_DIR"
echo "Output:        $DIST_DIR"
echo ""

# Ensure Marp CLI is available
if [[ ! -x "$MARP" ]]; then
  echo "ERROR: Marp CLI not found. Run 'npm ci' first." >&2
  exit 1
fi

# Collect all slides.md files
mapfile -t SLIDES < <(find "$PRESENTATIONS_DIR" -name "slides.md" | sort)

if [[ ${#SLIDES[@]} -eq 0 ]]; then
  echo "No presentations found under $PRESENTATIONS_DIR"
  exit 0
fi

echo "Found ${#SLIDES[@]} presentation(s):"
for slide in "${SLIDES[@]}"; do
  echo "  - $slide"
done
echo ""

# Build each presentation
BUILD_COUNT=0
FAIL_COUNT=0

for SLIDE_PATH in "${SLIDES[@]}"; do
  PRES_DIR="$(dirname "$SLIDE_PATH")"
  PRES_NAME="$(basename "$PRES_DIR")"
  OUT_DIR="$DIST_DIR/$PRES_NAME"

  echo "--- Building: $PRES_NAME ---"

  mkdir -p "$OUT_DIR"

  # Run Marp CLI
  if "$MARP" \
      --html \
      --theme-set "$THEMES_DIR" \
      --output "$OUT_DIR/index.html" \
      "$SLIDE_PATH"; then
    echo "    OK: $OUT_DIR/index.html"
    BUILD_COUNT=$((BUILD_COUNT + 1))
  else
    echo "    FAILED: $PRES_NAME" >&2
    FAIL_COUNT=$((FAIL_COUNT + 1))
    continue
  fi

  # Copy assets directory if it exists
  ASSETS_SRC="$PRES_DIR/assets"
  if [[ -d "$ASSETS_SRC" ]]; then
    ASSETS_DEST="$OUT_DIR/assets"
    cp -r "$ASSETS_SRC" "$ASSETS_DEST"
    echo "    Copied: assets/ -> $ASSETS_DEST"
  fi

  echo ""
done

echo "=== Build Summary ==="
echo "Success: $BUILD_COUNT"
echo "Failed:  $FAIL_COUNT"

if [[ $FAIL_COUNT -gt 0 ]]; then
  exit 1
fi
