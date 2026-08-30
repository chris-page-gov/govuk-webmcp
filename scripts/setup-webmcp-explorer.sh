#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPOSITORY_ROOT="$(cd -- "${SCRIPT_DIRECTORY}/.." && pwd -P)"
TOOLS_DIRECTORY="${REPOSITORY_ROOT}/.tools"
SOURCE_DIRECTORY="${TOOLS_DIRECTORY}/webmcp-labs"
BUILD_DIRECTORY="${TOOLS_DIRECTORY}/webmcp-explorer-build"
BUILD_MARKER="${BUILD_DIRECTORY}/.govuk-webmcp-generated-tool"
UPSTREAM_URL="https://github.com/MicrosoftEdge/webmcp-labs.git"
PINNED_COMMIT="f7091c12420e713b11361630dc1649d5678f62ab"

for path in "${TOOLS_DIRECTORY}" "${SOURCE_DIRECTORY}" "${BUILD_DIRECTORY}"; do
  if [[ -L "${path}" ]]; then
    echo "ERROR: ${path} must not be a symbolic link." >&2
    exit 1
  fi
done

mkdir -p "${TOOLS_DIRECTORY}"

observed_tools_directory="$(cd -- "${TOOLS_DIRECTORY}" && pwd -P)"
if [[ "${observed_tools_directory}" != "${TOOLS_DIRECTORY}" ]]; then
  echo "ERROR: The tool directory resolves outside the repository boundary." >&2
  exit 1
fi

if [[ -e "${SOURCE_DIRECTORY}" && ! -d "${SOURCE_DIRECTORY}/.git" ]]; then
  echo "ERROR: ${SOURCE_DIRECTORY} exists but is not the expected Git checkout." >&2
  exit 1
fi

if [[ ! -d "${SOURCE_DIRECTORY}/.git" ]]; then
  git clone --filter=blob:none --no-checkout "${UPSTREAM_URL}" "${SOURCE_DIRECTORY}"
fi

observed_source_directory="$(cd -- "${SOURCE_DIRECTORY}" && pwd -P)"
if [[ "${observed_source_directory}" != "${SOURCE_DIRECTORY}" ]]; then
  echo "ERROR: The Explorer source checkout resolves outside the tool directory." >&2
  exit 1
fi

observed_origin="$(git -C "${SOURCE_DIRECTORY}" remote get-url origin)"
if [[ "${observed_origin}" != "${UPSTREAM_URL}" ]]; then
  echo "ERROR: Explorer origin is ${observed_origin}; expected ${UPSTREAM_URL}." >&2
  exit 1
fi

if [[ -n "$(git -C "${SOURCE_DIRECTORY}" status --porcelain --untracked-files=all)" ]]; then
  echo "ERROR: Explorer source files are not clean; refusing to replace or build them." >&2
  exit 1
fi

if ! git -C "${SOURCE_DIRECTORY}" cat-file -e "${PINNED_COMMIT}^{commit}" 2>/dev/null; then
  git -C "${SOURCE_DIRECTORY}" fetch --depth=1 origin "${PINNED_COMMIT}"
fi

git -C "${SOURCE_DIRECTORY}" -c advice.detachedHead=false checkout --detach "${PINNED_COMMIT}"

observed_commit="$(git -C "${SOURCE_DIRECTORY}" rev-parse HEAD)"
if [[ "${observed_commit}" != "${PINNED_COMMIT}" ]]; then
  echo "ERROR: Explorer checkout is ${observed_commit}; expected ${PINNED_COMMIT}." >&2
  exit 1
fi

if [[ -n "$(git -C "${SOURCE_DIRECTORY}" status --porcelain --untracked-files=all)" ]]; then
  echo "ERROR: Explorer source files are not clean at the pinned commit." >&2
  exit 1
fi

source_tree_digest() {
  local directory="$1"
  {
    cd -- "${directory}"
    find . -type f \
      ! -name '.DS_Store' \
      ! -path './dist/*' \
      ! -path './node_modules/*' \
      ! -path './.govuk-webmcp-generated-tool' \
      -print | LC_ALL=C sort | while IFS= read -r file; do
        shasum -a 256 "${file}"
      done
  } | shasum -a 256 | awk '{print $1}'
}

reject_source_symlinks() {
  local directory="$1"
  local link
  link="$(find "${directory}" \
    \( -path "${directory}/dist" -o -path "${directory}/node_modules" \) -prune \
    -o -type l -print -quit)"
  if [[ -n "${link}" ]]; then
    echo "ERROR: Explorer build input contains an unexpected symbolic link: ${link}." >&2
    exit 1
  fi
}

reject_source_symlinks "${SOURCE_DIRECTORY}/webmcp-explorer"
expected_source_digest="$(source_tree_digest "${SOURCE_DIRECTORY}/webmcp-explorer")"
if [[ -e "${BUILD_DIRECTORY}" ]]; then
  if [[ ! -f "${BUILD_MARKER}" ]]; then
    echo "ERROR: ${BUILD_DIRECTORY} is not a recognised generated build." >&2
    exit 1
  fi
  reject_source_symlinks "${BUILD_DIRECTORY}"
  observed_source_digest="$(source_tree_digest "${BUILD_DIRECTORY}")"
  if [[ "${observed_source_digest}" != "${expected_source_digest}" ]]; then
    echo "ERROR: Generated Explorer source differs from the pinned upstream tree." >&2
    exit 1
  fi
else
  mkdir -p "${BUILD_DIRECTORY}"
  git -C "${SOURCE_DIRECTORY}" archive "${PINNED_COMMIT}:webmcp-explorer" \
    | tar -xf - -C "${BUILD_DIRECTORY}"
fi
printf '%s\n' "${PINNED_COMMIT}" > "${BUILD_MARKER}"

node -e '
  const value = require(process.argv[1]);
  if (value.name !== "webmcp-explorer" || value.version !== "0.1.0") {
    throw new Error(`Unexpected Explorer package ${value.name}@${value.version}`);
  }
' "${BUILD_DIRECTORY}/package.json"

rm -rf -- "${BUILD_DIRECTORY}/dist"
npm --prefix "${BUILD_DIRECTORY}" ci --ignore-scripts --no-audit
npm --prefix "${BUILD_DIRECTORY}" run build

reject_source_symlinks "${BUILD_DIRECTORY}"
observed_source_digest="$(source_tree_digest "${BUILD_DIRECTORY}")"
if [[ "${observed_source_digest}" != "${expected_source_digest}" ]]; then
  echo "ERROR: The isolated build changed its pinned source inputs." >&2
  exit 1
fi

if [[ -n "$(git -C "${SOURCE_DIRECTORY}" status --porcelain --untracked-files=all)" ]]; then
  echo "ERROR: Explorer source files changed while producing the isolated build." >&2
  exit 1
fi

expected_dist_files="assets/sidepanel.css
content-script.js
manifest.json
service-worker.js
sidepanel.js
sidepanel/index.html"
expected_dist_directories="assets
sidepanel"
unexpected_dist_entry="$(find "${BUILD_DIRECTORY}/dist" ! -type d ! -type f -print -quit)"
if [[ -n "${unexpected_dist_entry}" ]]; then
  echo "ERROR: Explorer emitted a non-regular unpacked-extension entry: ${unexpected_dist_entry}." >&2
  exit 1
fi
observed_dist_directories="$({
  cd -- "${BUILD_DIRECTORY}"
  find dist -mindepth 1 -type d -print | sed 's#^dist/##' | LC_ALL=C sort
})"
if [[ "${observed_dist_directories}" != "${expected_dist_directories}" ]]; then
  echo "ERROR: Explorer emitted an unexpected unpacked-extension directory set." >&2
  exit 1
fi
observed_dist_files="$({
  cd -- "${BUILD_DIRECTORY}"
  find dist -type f -print | sed 's#^dist/##' | LC_ALL=C sort
})"
if [[ "${observed_dist_files}" != "${expected_dist_files}" ]]; then
  echo "ERROR: Explorer emitted an unexpected unpacked-extension file set." >&2
  exit 1
fi

lock_digest="$(shasum -a 256 "${BUILD_DIRECTORY}/package-lock.json" | awk '{print $1}')"
dist_digest="$({
  cd -- "${BUILD_DIRECTORY}"
  find dist -type f -print | LC_ALL=C sort | while IFS= read -r file; do
    shasum -a 256 "${file}"
  done
} | shasum -a 256 | awk '{print $1}')"

echo "Microsoft WebMCP Explorer 0.1.0 built from ${PINNED_COMMIT}."
echo "Pinned source tree SHA-256: ${expected_source_digest}"
echo "Package lock SHA-256: ${lock_digest}"
echo "Unpacked extension: ${BUILD_DIRECTORY}/dist"
echo "Unpacked-extension file-manifest SHA-256: ${dist_digest}"
echo "The script did not load the extension, change browser flags or configure a model provider."
