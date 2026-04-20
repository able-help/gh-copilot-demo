#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${DOTNET_INSTALL_DIR:-$HOME/.dotnet}"
CHANNEL="${DOTNET_CHANNEL:-8.0}"
VERSION="${DOTNET_VERSION:-latest}"
FORCE_INSTALL="${DOTNET_FORCE_INSTALL:-false}"

if [[ "${FORCE_INSTALL}" != "true" ]] && command -v dotnet >/dev/null 2>&1; then
  if dotnet --list-sdks | grep -q '^8\.'; then
    echo ".NET SDK 8 is already available on this machine."
    dotnet --version
    exit 0
  fi
fi

mkdir -p "${INSTALL_DIR}"
TMP_SCRIPT="$(mktemp)"
trap 'rm -f "${TMP_SCRIPT}"' EXIT

curl -fsSL https://dot.net/v1/dotnet-install.sh -o "${TMP_SCRIPT}"
bash "${TMP_SCRIPT}" --channel "${CHANNEL}" --version "${VERSION}" --install-dir "${INSTALL_DIR}" --no-path

export DOTNET_ROOT="${INSTALL_DIR}"
export PATH="${INSTALL_DIR}:${INSTALL_DIR}/tools:${PATH}"

echo "Installed .NET SDK in ${INSTALL_DIR}"
dotnet --version

echo
echo "Add these lines to your shell profile (~/.bashrc or ~/.zshrc):"
echo "export DOTNET_ROOT=\"${INSTALL_DIR}\""
echo "export PATH=\"${INSTALL_DIR}:${INSTALL_DIR}/tools:\$PATH\""
