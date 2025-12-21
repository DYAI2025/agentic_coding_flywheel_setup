#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034
# ============================================================
# Test script for install_helpers.sh selection logic
# Run: bash scripts/lib/test_install_helpers.sh
#
# Tests the acfs_resolve_selection function from install_helpers.sh
# which is the version actually used by install.sh.
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source required files
source "$SCRIPT_DIR/logging.sh"
source "$PROJECT_ROOT/scripts/generated/manifest_index.sh"
source "$SCRIPT_DIR/install_helpers.sh"

TESTS_PASSED=0
TESTS_FAILED=0

test_pass() {
    local name="$1"
    echo -e "\033[32m[PASS]\033[0m $name"
    ((++TESTS_PASSED))
}

test_fail() {
    local name="$1"
    local reason="${2:-}"
    echo -e "\033[31m[FAIL]\033[0m $name"
    [[ -n "$reason" ]] && echo "       Reason: $reason"
    ((++TESTS_FAILED))
}

# Reset selection state for each test
reset_selection() {
    ONLY_MODULES=()
    ONLY_PHASES=()
    SKIP_MODULES=()
    SKIP_TAGS=()
    SKIP_CATEGORIES=()
    NO_DEPS=false
    PRINT_PLAN=false

    # Clear effective arrays
    ACFS_EFFECTIVE_PLAN=()
    declare -gA ACFS_EFFECTIVE_RUN=()
    declare -gA ACFS_PLAN_REASON=()
    declare -gA ACFS_PLAN_EXCLUDE_REASON=()
}

# ============================================================
# Test Cases: Default Selection
# ============================================================

test_default_includes_enabled_modules() {
    local name="Default selection includes enabled_by_default modules"
    reset_selection

    if acfs_resolve_selection 2>/dev/null; then
        # Check that common default modules are included
        if should_run_module "lang.bun" && should_run_module "base.system"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_default_excludes_disabled_modules() {
    local name="Default selection excludes disabled modules"
    reset_selection

    if acfs_resolve_selection 2>/dev/null; then
        # db.postgres18 and tools.vault are disabled by default
        if ! should_run_module "db.postgres18" && ! should_run_module "tools.vault"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

# ============================================================
# Test Cases: --only Module Selection
# ============================================================

test_only_single_module() {
    local name="--only selects single module"
    reset_selection
    ONLY_MODULES=("agents.claude")

    if acfs_resolve_selection 2>/dev/null; then
        if should_run_module "agents.claude"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_only_module_includes_deps() {
    local name="--only includes module dependencies"
    reset_selection
    ONLY_MODULES=("agents.claude")

    if acfs_resolve_selection 2>/dev/null; then
        # agents.claude depends on lang.bun which depends on base.system
        if should_run_module "lang.bun" && should_run_module "base.system"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_only_excludes_unrelated() {
    local name="--only excludes unrelated modules"
    reset_selection
    ONLY_MODULES=("agents.claude")

    if acfs_resolve_selection 2>/dev/null; then
        # lang.rust and tools.atuin should not be included
        if ! should_run_module "lang.rust" && ! should_run_module "tools.atuin"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_only_unknown_module_fails() {
    local name="--only with unknown module fails"
    reset_selection
    ONLY_MODULES=("nonexistent.module")

    if ! acfs_resolve_selection 2>/dev/null; then
        test_pass "$name"
    else
        test_fail "$name" "Should fail for unknown module"
    fi
}

# ============================================================
# Test Cases: --only-phase Selection
# ============================================================

test_only_phase_selects_modules() {
    local name="--only-phase selects all modules in phase"
    reset_selection
    ONLY_PHASES=("6")  # Phase 6 has lang.* modules

    if acfs_resolve_selection 2>/dev/null; then
        if should_run_module "lang.bun" && should_run_module "lang.rust"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_only_phase_includes_deps() {
    local name="--only-phase includes dependencies from other phases"
    reset_selection
    ONLY_PHASES=("6")  # Phase 6 modules depend on phase 1 (base.system)

    if acfs_resolve_selection 2>/dev/null; then
        if should_run_module "base.system"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_only_phase_unknown_fails() {
    local name="--only-phase with unknown phase fails"
    reset_selection
    ONLY_PHASES=("99")

    if ! acfs_resolve_selection 2>/dev/null; then
        test_pass "$name"
    else
        test_fail "$name" "Should fail for unknown phase"
    fi
}

# ============================================================
# Test Cases: --skip Module Exclusion
# ============================================================

test_skip_removes_module() {
    local name="--skip removes modules from plan"
    reset_selection
    SKIP_MODULES=("tools.atuin")

    if acfs_resolve_selection 2>/dev/null; then
        if ! should_run_module "tools.atuin"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_skip_leaves_others() {
    local name="--skip leaves other modules"
    reset_selection
    SKIP_MODULES=("tools.atuin")

    if acfs_resolve_selection 2>/dev/null; then
        if should_run_module "lang.bun"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_skip_dependency_fails() {
    local name="--skip on required dependency fails"
    reset_selection
    ONLY_MODULES=("agents.claude")
    SKIP_MODULES=("lang.bun")  # agents.claude requires lang.bun

    if ! acfs_resolve_selection 2>/dev/null; then
        test_pass "$name"
    else
        test_fail "$name" "Should fail when skipping a required dependency"
    fi
}

test_skip_unknown_module_fails() {
    local name="--skip with unknown module fails"
    reset_selection
    SKIP_MODULES=("nonexistent.module")

    if ! acfs_resolve_selection 2>/dev/null; then
        test_pass "$name"
    else
        test_fail "$name" "Should fail for unknown module"
    fi
}

# ============================================================
# Test Cases: --no-deps Flag
# ============================================================

test_no_deps_excludes_dependencies() {
    local name="--no-deps excludes dependencies"
    reset_selection
    ONLY_MODULES=("agents.claude")
    NO_DEPS=true

    if acfs_resolve_selection 2>/dev/null; then
        # With no-deps, should only have agents.claude, not its deps
        if should_run_module "agents.claude" && ! should_run_module "lang.bun"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

# ============================================================
# Test Cases: Effective Plan Arrays
# ============================================================

test_effective_plan_populated() {
    local name="ACFS_EFFECTIVE_PLAN is populated"
    reset_selection
    ONLY_MODULES=("lang.bun")

    if acfs_resolve_selection 2>/dev/null; then
        if [[ ${#ACFS_EFFECTIVE_PLAN[@]} -gt 0 ]]; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_effective_run_membership() {
    local name="ACFS_EFFECTIVE_RUN provides O(1) membership check"
    reset_selection
    ONLY_MODULES=("lang.bun")

    if acfs_resolve_selection 2>/dev/null; then
        # Direct associative array access
        if [[ -n "${ACFS_EFFECTIVE_RUN[lang.bun]:-}" ]]; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_plan_reason_tracked() {
    local name="ACFS_PLAN_REASON tracks inclusion reasons"
    reset_selection
    ONLY_MODULES=("agents.claude")

    if acfs_resolve_selection 2>/dev/null; then
        local reason="${ACFS_PLAN_REASON[agents.claude]:-}"
        if [[ "$reason" == *"explicitly requested"* ]]; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name" "Expected 'explicitly requested' in reason"
}

test_exclude_reason_tracked() {
    local name="ACFS_PLAN_EXCLUDE_REASON tracks exclusion reasons"
    reset_selection
    ONLY_MODULES=("lang.bun")  # Only select lang.bun

    if acfs_resolve_selection 2>/dev/null; then
        # lang.rust should be excluded as "not selected"
        local reason="${ACFS_PLAN_EXCLUDE_REASON[lang.rust]:-}"
        if [[ -n "$reason" ]]; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

# ============================================================
# Test Cases: Plan Order
# ============================================================

test_plan_respects_dependency_order() {
    local name="Plan respects dependency order"
    reset_selection
    ONLY_MODULES=("stack.ultimate_bug_scanner")

    if acfs_resolve_selection 2>/dev/null; then
        # Find positions in plan
        local base_pos=-1 bun_pos=-1 ubs_pos=-1
        local i=0
        for module_id in "${ACFS_EFFECTIVE_PLAN[@]}"; do
            case "$module_id" in
                "base.system") base_pos=$i ;;
                "lang.bun") bun_pos=$i ;;
                "stack.ultimate_bug_scanner") ubs_pos=$i ;;
            esac
            ((++i))
        done

        # base < bun < ubs (dependencies before dependents)
        if [[ $base_pos -lt $bun_pos && $bun_pos -lt $ubs_pos ]]; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

# ============================================================
# Test Cases: should_run_module Helper
# ============================================================

test_should_run_module_true() {
    local name="should_run_module returns true for included modules"
    reset_selection

    if acfs_resolve_selection 2>/dev/null; then
        if should_run_module "lang.bun"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

test_should_run_module_false() {
    local name="should_run_module returns false for excluded modules"
    reset_selection

    if acfs_resolve_selection 2>/dev/null; then
        if ! should_run_module "db.postgres18"; then
            test_pass "$name"
            return
        fi
    fi
    test_fail "$name"
}

# ============================================================
# Run Tests
# ============================================================

echo ""
echo "ACFS Install Helpers Selection Tests"
echo "====================================="
echo ""

# Default selection tests
test_default_includes_enabled_modules
test_default_excludes_disabled_modules

# --only module tests
test_only_single_module
test_only_module_includes_deps
test_only_excludes_unrelated
test_only_unknown_module_fails

# --only-phase tests
test_only_phase_selects_modules
test_only_phase_includes_deps
test_only_phase_unknown_fails

# --skip tests
test_skip_removes_module
test_skip_leaves_others
test_skip_dependency_fails
test_skip_unknown_module_fails

# --no-deps tests
test_no_deps_excludes_dependencies

# Effective plan tests
test_effective_plan_populated
test_effective_run_membership
test_plan_reason_tracked
test_exclude_reason_tracked

# Plan order tests
test_plan_respects_dependency_order

# should_run_module tests
test_should_run_module_true
test_should_run_module_false

echo ""
echo "====================================="
echo "Passed: $TESTS_PASSED, Failed: $TESTS_FAILED"
echo ""

[[ $TESTS_FAILED -eq 0 ]]
