#!/usr/bin/env bash
# ============================================================
# ACFS Installer - Logging Library
# Provides consistent, colored output for the installer
# ============================================================

# Prevent multiple sourcing
if [[ -n "${_ACFS_LOGGING_SH_LOADED:-}" ]]; then
    return 0
fi
_ACFS_LOGGING_SH_LOADED=1

# Colors
export ACFS_RED='\033[0;31m'
export ACFS_GREEN='\033[0;32m'
export ACFS_YELLOW='\033[0;33m'
export ACFS_BLUE='\033[0;34m'
export ACFS_GRAY='\033[0;90m'
export ACFS_NC='\033[0m' # No Color

# Log a major step (blue)
# Usage: log_step "1/8" "Installing packages..."
if ! declare -f log_step >/dev/null; then
    log_step() {
        if [[ $# -ge 2 ]]; then
            local step="$1"
            local message="$2"
            echo -e "${ACFS_BLUE}[$step]${ACFS_NC} $message" >&2
            return 0
        fi

        local message="${1:-}"
        echo -e "${ACFS_BLUE}[•]${ACFS_NC} $message" >&2
    }
fi

# Log a section header (blue)
# Usage: log_section "Phase: Shell setup"
if ! declare -f log_section >/dev/null; then
    log_section() {
        local title="$1"
        echo "" >&2
        echo -e "${ACFS_BLUE}$title${ACFS_NC}" >&2
    }
fi

# Log detail information (gray, indented)
# Usage: log_detail "Installing zsh..."
if ! declare -f log_detail >/dev/null; then
    log_detail() {
        echo -e "${ACFS_GRAY}    $1${ACFS_NC}" >&2
    }
fi

# Log informational message (alias for log_detail)
# Usage: log_info "Downloading..."
if ! declare -f log_info >/dev/null; then
    log_info() {
        log_detail "$1"
    }
fi

# Log success message (green with checkmark)
# Usage: log_success "Installation complete"
if ! declare -f log_success >/dev/null; then
    log_success() {
        echo -e "${ACFS_GREEN}$1${ACFS_NC}" >&2
    }
fi

# Log warning message (yellow with warning symbol)
# Usage: log_warn "This may take a while"
if ! declare -f log_warn >/dev/null; then
    log_warn() {
        echo -e "${ACFS_YELLOW}$1${ACFS_NC}" >&2
    }
fi

# Log error message (red with X)
# Usage: log_error "Failed to install package"
if ! declare -f log_error >/dev/null; then
    log_error() {
        echo -e "${ACFS_RED}$1${ACFS_NC}" >&2
    }
fi

# Log fatal error and exit
# Usage: log_fatal "Cannot continue without root"
if ! declare -f log_fatal >/dev/null; then
    log_fatal() {
        log_error "$1"
        exit 1
    }
fi

# Log to file (for persistent logging)
# Usage: log_to_file "message" "/path/to/log"
if ! declare -f log_to_file >/dev/null; then
    log_to_file() {
        local message="$1"
        local logfile="${2:-/var/log/acfs/install.log}"

        # Ensure log directory exists
        mkdir -p "$(dirname "$logfile")" 2>/dev/null || true

        # Write timestamped message
        echo "[$(date -Iseconds)] $message" >> "$logfile" 2>/dev/null || true
    }
fi

# Associative array for timer tracking (avoids eval)
declare -gA ACFS_TIMERS=()

# Start a timed operation (for performance tracking)
# Usage: timer_start "operation_name"
if ! declare -f timer_start >/dev/null; then
    timer_start() {
        local name="$1"
        ACFS_TIMERS["$name"]=$(date +%s)
    }
fi

# End a timed operation and log duration
# Usage: timer_end "operation_name"
if ! declare -f timer_end >/dev/null; then
    timer_end() {
        local name="$1"
        local start="${ACFS_TIMERS[$name]:-$(date +%s)}"
        local end
        end=$(date +%s)
        local duration=$((end - start))

        log_detail "Completed in ${duration}s"
    }
fi
