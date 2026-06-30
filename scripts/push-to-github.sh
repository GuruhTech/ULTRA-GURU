#!/bin/bash
# Push specific files to GitHub via the Contents API (handles large files).
# Usage:  bash scripts/push-to-github.sh "commit message" file1 file2 ...
# Example: bash scripts/push-to-github.sh "feat: new command" guruh/converter.js

set -e

REPO="GuruhTech/ULTRA-GURU"
BRANCH="main"
API="https://api.github.com/repos/${REPO}/contents"

if [ -z "${GITHUB_PERSONAL_ACCESS_TOKEN}" ]; then
  echo "❌ GITHUB_PERSONAL_ACCESS_TOKEN is not set"
  exit 1
fi

MESSAGE="${1}"
shift
FILES=("$@")

if [ -z "${MESSAGE}" ] || [ ${#FILES[@]} -eq 0 ]; then
  echo "Usage: bash scripts/push-to-github.sh \"commit message\" file1 file2 ..."
  exit 1
fi

WORKSPACE="/home/runner/workspace"
TMPB64="/tmp/_push_b64.txt"
TMPPAYLOAD="/tmp/_push_payload.json"

for FILE in "${FILES[@]}"; do
  LOCAL="${WORKSPACE}/${FILE}"

  if [ ! -f "${LOCAL}" ]; then
    echo "⚠️  Skipping ${FILE} — not found locally"
    continue
  fi

  # Get current SHA from GitHub (required for updates)
  SHA=$(curl -s -H "Authorization: token ${GITHUB_PERSONAL_ACCESS_TOKEN}" \
    "${API}/${FILE}?ref=${BRANCH}" | jq -r '.sha // empty')

  # Write base64 to temp file to avoid "argument list too long" on large files
  base64 -w 0 "${LOCAL}" > "${TMPB64}"

  # Build JSON payload via Node so large content is never a shell argument
  node -e "
    const fs = require('fs');
    const b64 = fs.readFileSync('${TMPB64}', 'utf8').trim();
    fs.writeFileSync('${TMPPAYLOAD}', JSON.stringify({
      message: $(node -e "process.stdout.write(JSON.stringify('${MESSAGE}'))"),
      content: b64,
      sha: '${SHA}',
      branch: '${BRANCH}'
    }));
  "

  RESULT=$(curl -s -X PUT \
    -H "Authorization: token ${GITHUB_PERSONAL_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    "${API}/${FILE}" \
    --data-binary @"${TMPPAYLOAD}")

  COMMIT=$(echo "${RESULT}" | jq -r '.commit.sha // empty')

  if [ -n "${COMMIT}" ]; then
    echo "✅ ${FILE} → ${COMMIT:0:7}"
  else
    ERR=$(echo "${RESULT}" | jq -r '.message // "unknown error"')
    echo "❌ ${FILE} → ${ERR}"
    rm -f "${TMPB64}" "${TMPPAYLOAD}"
    exit 1
  fi
done

rm -f "${TMPB64}" "${TMPPAYLOAD}"
echo ""
echo "🚀 All files pushed to github.com/${REPO} (${BRANCH})"
