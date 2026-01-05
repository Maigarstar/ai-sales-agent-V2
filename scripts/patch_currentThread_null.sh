#!/usr/bin/env bash
set -euo pipefail

FILE="src/app/vision/VisionWorkspace.tsx"

python3 - <<'PY'
import re
from pathlib import Path
import sys

path = Path("src/app/vision/VisionWorkspace.tsx")
text = path.read_text(encoding="utf8")

pattern = re.compile(
r"""
(?P<indent>[ \t]*)
const\s*\{\s*data:\s*convData(?P<rest>[^}]*?)\}\s*=\s*await\s*supabase\s*
\.\s*from\(\s*["']conversations["']\s*\)\s*
\.\s*select\(\s*["']takeover_status["']\s*\)\s*
\.\s*eq\(\s*["']id["']\s*,\s*currentThread\.id\s*\)\s*
\.\s*single\(\s*\)\s*;
""",
re.VERBOSE
)

m = pattern.search(text)
if not m:
    print('Patch not applied, pattern not found. Search for .eq("id", currentThread.id) and add a null guard above it.', file=sys.stderr)
    sys.exit(1)

indent = m.group("indent")
rest = m.group("rest")

replacement = (
f"{indent}const thread = currentThread;\n"
f"{indent}if (!thread) return;\n\n"
f"{indent}const {{ data: convData{rest} }} = await supabase\n"
f"{indent}  .from(\"conversations\")\n"
f"{indent}  .select(\"takeover_status\")\n"
f"{indent}  .eq(\"id\", thread.id)\n"
f"{indent}  .single();\n"
)

text2 = text[:m.start()] + replacement + text[m.end():]
path.write_text(text2, encoding="utf8")

print("Patched, added currentThread null guard for takeover query.")
PY
