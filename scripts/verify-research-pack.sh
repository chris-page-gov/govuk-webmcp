#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd -- "${SCRIPT_DIRECTORY}/.." && pwd)"
REQUIREMENTS_FILE="${REPOSITORY_ROOT}/requirements-dev.txt"
VERIFIER="${REPOSITORY_ROOT}/research/2026-08-29/competition-pack/scripts/verify_pack.py"

expected_jsonschema=""
while IFS= read -r requirement; do
  case "${requirement}" in
    jsonschema==*) expected_jsonschema="${requirement#jsonschema==}" ;;
  esac
done < "${REQUIREMENTS_FILE}"

if [[ -z "${expected_jsonschema}" ]]; then
  echo "ERROR: requirements-dev.txt must pin jsonschema with ==." >&2
  exit 1
fi

if [[ -x "${REPOSITORY_ROOT}/.venv/bin/python" ]]; then
  python_command="${REPOSITORY_ROOT}/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  python_command="$(command -v python3)"
else
  echo "ERROR: Python 3 is required. Run npm run python:setup." >&2
  exit 1
fi

if ! observed_jsonschema="$(
  "${python_command}" -c \
    'from importlib.metadata import version; import jsonschema; print(version("jsonschema"))' \
    2>/dev/null
)"; then
  echo "ERROR: jsonschema ${expected_jsonschema} is required but is not installed for ${python_command}." >&2
  echo "Run npm run python:setup." >&2
  exit 1
fi

if [[ "${observed_jsonschema}" != "${expected_jsonschema}" ]]; then
  echo "ERROR: jsonschema ${observed_jsonschema} is installed; ${expected_jsonschema} is required." >&2
  echo "Run npm run python:setup." >&2
  exit 1
fi

exec "${python_command}" "${VERIFIER}"
