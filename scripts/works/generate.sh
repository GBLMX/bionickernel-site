#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
VERSOR_JAVA="${VERSOR_JAVA:-$HOME/Documents/代码库/versor-java/lib/versor-java}"
OUT="${1:-public/assets/works}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/classes" "$TMP/gen"
javac -encoding UTF-8 --release 17 -d "$TMP/classes" \
  $(find "$VERSOR_JAVA/src/main/java" -name '*.java')
javac -encoding UTF-8 --release 17 -cp "$TMP/classes" -d "$TMP/gen" scripts/works/GenWorks.java
java -cp "$TMP/classes:$TMP/gen" GenWorks "$OUT"
