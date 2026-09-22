#!/bin/sh
set -eu

cd "$(dirname "$0")/../.." || exit 2

echo '::group::Whitespace and conflict markers'
if [ -n "${CI_BASE_REF:-}" ]; then
  git diff --check "origin/${CI_BASE_REF}...HEAD"
elif [ -n "${CI_BASE_SHA:-}" ] &&
  [ "${CI_BASE_SHA}" != '0000000000000000000000000000000000000000' ] &&
  git cat-file -e "${CI_BASE_SHA}^{commit}" 2>/dev/null; then
  git diff --check "${CI_BASE_SHA}...HEAD"
else
  git show --check --format=fuller --no-renames HEAD >/dev/null
fi

if git grep -n -E '^(<<<<<<<|=======|>>>>>>>)' -- '*.html' '*.css' '*.js' '*.json' '*.xml' '*.sh'; then
  echo 'Unresolved merge-conflict markers found.' >&2
  exit 1
fi
echo '✓ whitespace and conflict-marker checks passed'
echo '::endgroup::'

echo '::group::Load-bearing regression checks'
sh scripts/check-invariants.sh
echo '::endgroup::'

echo '::group::Release and cache-version contract'
node scripts/ci/check-version.mjs
echo '::endgroup::'

echo '::group::HTML, CSS, JavaScript, and local links'
node scripts/ci/check-site.mjs
echo '::endgroup::'

echo '::group::Local-server integration smoke test'
node scripts/ci/smoke-site.mjs
echo '::endgroup::'

echo '✓ all CI checks passed'
