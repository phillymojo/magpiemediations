#!/usr/bin/env bash
#
# Renders docs/project-plan.html into docs/project-plan.pdf via headless
# Chrome. Run after editing the styled HTML template.
#
# Source of truth for content is docs/project-plan.md. The HTML file
# mirrors that markdown with the styling needed for the PDF render.
#
# Usage: ./scripts/render-project-plan.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HTML="$REPO_ROOT/docs/project-plan.html"
PDF="$REPO_ROOT/docs/project-plan.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -f "$HTML" ]]; then
  echo "error: HTML template not found at $HTML" >&2
  exit 1
fi

if [[ ! -x "$CHROME" ]]; then
  echo "error: Google Chrome not found at $CHROME" >&2
  echo "       This script targets macOS Chrome. Adjust the CHROME variable" >&2
  echo "       at the top of this script if Chrome lives elsewhere." >&2
  exit 1
fi

"$CHROME" \
  --headless \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$PDF" \
  "file://$HTML" \
  >/dev/null 2>&1

echo "wrote $PDF"
