# AGENTS.md — Agentic Coding Flywheel Setup (ACFS)

## RULE 1 – ABSOLUTE (DO NOT EVER VIOLATE THIS)

You may NOT delete any file or directory unless I explicitly give the exact command **in this session**.

- This includes files you just created (tests, tmp files, scripts, etc.).
- You do not get to decide that something is "safe" to remove.
- If you think something should be removed, stop and ask. You must receive clear written approval **before** any deletion command is even proposed.

Treat "never delete files without permission" as a hard invariant.

---

## IRREVERSIBLE GIT & FILESYSTEM ACTIONS

Absolutely forbidden unless I give the **exact command and explicit approval** in the same message:

- `git reset --hard`
- `git clean -fd`
- `rm -rf`
- Any command that can delete or overwrite code/data

Rules:

1. If you are not 100% sure what a command will delete, do not propose or run it. Ask first.
2. Prefer safe tools: `git status`, `git diff`, `git stash`, copying to backups, etc.
3. After approval, restate the command verbatim, list what it will affect, and wait for confirmation.
4. When a destructive command is run, record in your response:
   - The exact user text authorizing it
   - The command run
   - When you ran it

If that audit trail is missing, then you must act as if the operation never happened.

---

## Node / JS Toolchain

- Use **bun** for everything JS/TS.
- ❌ Never use `npm`, `yarn`, or `pnpm`.
- Lockfiles: only `bun.lock`. Do not introduce any other lockfile.
- Target **latest Node.js**. No need to support old Node versions.

---

## Project Architecture

ACFS is a **multi-component project** consisting of:

### A) Website Wizard (`apps/web/`)
- **Framework:** Next.js 16 App Router
- **Runtime:** Bun
- **Hosting:** Vercel + Cloudflare for cost optimization
- **Purpose:** Step-by-step wizard guiding beginners from "I have a laptop" to "fully configured VPS"
- **No backend required:** All state via URL params + localStorage

### B) Installer (`install.sh` + `scripts/`)
- **Language:** Bash (POSIX-compatible where possible)
- **Target:** Ubuntu 25.x (gracefully supports 24.04 LTS+)
- **One-liner:** `curl -fsSL ... | bash -s -- --yes --mode vibe`
- **Idempotent:** Safe to re-run
- **Checkpointed:** Phases resume on failure

### C) Onboarding TUI (`packages/onboard/`)
- **Command:** `onboard`
- **Purpose:** Interactive tutorial teaching Linux basics + agent workflow
- **Tech:** Shell script or simple Rust/Go binary (TBD)

### D) Module Manifest (`acfs.manifest.yaml`)
- **Purpose:** Single source of truth for all tools installed
- **Contains:** Tool definitions, install commands, verify commands
- **Generates:** Website content, installer modules, doctor checks

### E) ACFS Configs (`acfs/`)
- **Shell config:** `acfs/zsh/acfs.zshrc`
- **Tmux config:** `acfs/tmux/tmux.conf`
- **Onboard lessons:** `acfs/onboard/lessons/`
- **Installed to:** `~/.acfs/` on target VPS

---

## Repo Layout

```
agentic_coding_flywheel_setup/
├── README.md
├── install.sh                    # One-liner entrypoint
├── VERSION
├── acfs.manifest.yaml            # Canonical tool manifest
│
├── apps/
│   └── web/                      # Next.js 16 wizard website
│       ├── app/                  # App Router pages
│       ├── components/           # Shared UI components
│       ├── lib/                  # Utilities + manifest types
│       └── package.json
│
├── packages/
│   ├── manifest/                 # Manifest YAML parser + generators
│   ├── installer/                # Installer helper scripts
│   └── onboard/                  # Onboard TUI source
│
├── acfs/                         # Files copied to ~/.acfs on VPS
│   ├── zsh/
│   │   └── acfs.zshrc
│   ├── tmux/
│   │   └── tmux.conf
│   └── onboard/
│       └── lessons/
│
├── scripts/
│   ├── lib/                      # Installer library functions
│   │   ├── logging.sh
│   │   ├── os_detect.sh
│   │   ├── apt.sh
│   │   ├── user.sh
│   │   ├── zsh.sh
│   │   ├── tmux.sh
│   │   ├── node_bun.sh
│   │   ├── python_uv.sh
│   │   ├── rust_go.sh
│   │   ├── tools_install.sh
│   │   └── doctor.sh
│   ├── providers/                # VPS provider guides
│   │   ├── ovh.md
│   │   ├── contabo.md
│   │   └── hetzner.md
│   └── sync/
│       ├── sync_ntm_palette.sh   # Vendors NTM command palette
│       └── sync_versions.sh
│
└── tests/
    └── vm/
        └── test_install_ubuntu.sh
```

---

## Code Editing Discipline

- Do **not** run scripts that bulk-modify code (codemods, invented one-off scripts, giant `sed`/regex refactors).
- Large mechanical changes: break into smaller, explicit edits and review diffs.
- Subtle/complex changes: edit by hand, file-by-file, with careful reasoning.

---

## Backwards Compatibility & File Sprawl

We optimize for a clean architecture now, not backwards compatibility.

- No "compat shims" or "v2" file clones.
- When changing behavior, migrate callers and remove old code.
- New files are only for genuinely new domains that don't fit existing modules.
- The bar for adding files is very high.

---

## Console Output (for installer scripts)

The installer uses colored output for progress visibility:

```bash
echo -e "\033[34m[1/8] Step description\033[0m"     # Blue progress steps
echo -e "\033[90m    Details...\033[0m"             # Gray indented details
echo -e "\033[33m⚠️  Warning message\033[0m"        # Yellow warnings
echo -e "\033[31m✖ Error message\033[0m"            # Red errors
echo -e "\033[32m✔ Success message\033[0m"          # Green success
```

Rules:
- Progress/status goes to `stderr` (so stdout remains clean for piping)
- `--quiet` flag suppresses progress but not errors
- All output functions should use the logging library (`scripts/lib/logging.sh`)

---

## Third-Party Tools Installed by ACFS

These are installed on target VPS (not development machine):

### Shell & Terminal UX
- **zsh** + **oh-my-zsh** + **powerlevel10k**
- **lsd** (or eza fallback) — Modern ls
- **atuin** — Shell history with Ctrl-R
- **fzf** — Fuzzy finder
- **zoxide** — Better cd
- **direnv** — Directory-specific env vars

### Languages & Package Managers
- **bun** — JS/TS runtime + package manager
- **uv** — Fast Python tooling
- **rust/cargo** — Rust toolchain
- **go** — Go toolchain

### Dev Tools
- **tmux** — Terminal multiplexer
- **ripgrep** (`rg`) — Fast search
- **ast-grep** (`sg`) — Structural search/replace
- **lazygit** — Git TUI
- **bat** — Better cat

### Coding Agents
- **Claude Code** — Anthropic's coding agent
- **Codex CLI** — OpenAI's coding agent
- **Gemini CLI** — Google's coding agent

### Cloud & Database
- **PostgreSQL 18** — Database
- **HashiCorp Vault** — Secrets management
- **Wrangler** — Cloudflare CLI
- **Supabase CLI** — Supabase management
- **Vercel CLI** — Vercel deployment

### Dicklesworthstone Stack (all 8 tools)
1. **ntm** — Named Tmux Manager (agent cockpit)
2. **mcp_agent_mail** — Agent coordination via mail-like messaging
3. **ultimate_bug_scanner** (`ubs`) — Bug scanning with guardrails
4. **beads_viewer** (`bv`) — Task management TUI
5. **coding_agent_session_search** (`cass`) — Unified agent history search
6. **cass_memory_system** (`cm`) — Procedural memory for agents
7. **coding_agent_account_manager** (`caam`) — Agent auth switching
8. **simultaneous_launch_button** (`slb`) — Two-person rule for dangerous commands

---

## MCP Agent Mail — Multi-Agent Coordination

Agent Mail is available as an MCP server for coordinating work across agents.

What Agent Mail gives:
- Identities, inbox/outbox, searchable threads.
- Advisory file reservations (leases) to avoid agents clobbering each other.
- Persistent artifacts in git (human-auditable).

Core patterns:

1. **Same repo**
   - Register identity:
     - `ensure_project` then `register_agent` with the repo's absolute path as `project_key`.
   - Reserve files before editing:
     - `file_reservation_paths(project_key, agent_name, ["src/**"], ttl_seconds=3600, exclusive=true)`.
   - Communicate:
     - `send_message(..., thread_id="FEAT-123")`.
     - `fetch_inbox`, then `acknowledge_message`.
   - Fast reads:
     - `resource://inbox/{Agent}?project=<abs-path>&limit=20`.
     - `resource://thread/{id}?project=<abs-path>&include_bodies=true`.

2. **Macros vs granular:**
   - Prefer macros when speed is more important than fine-grained control:
     - `macro_start_session`, `macro_prepare_thread`, `macro_file_reservation_cycle`, `macro_contact_handshake`.
   - Use granular tools when you need explicit behavior.

Common pitfalls:
- "from_agent not registered" → call `register_agent` with correct `project_key`.
- `FILE_RESERVATION_CONFLICT` → adjust patterns, wait for expiry, or use non-exclusive reservation.

---

## Website Development (apps/web)

```bash
cd apps/web
bun install           # Install dependencies
bun run dev           # Dev server
bun run build         # Production build
bun run lint          # Lint check
bun run type-check    # TypeScript check
```

Key patterns:
- App Router: all pages in `app/` directory
- UI components: shadcn/ui + Tailwind CSS
- State: URL query params + localStorage (no backend)
- Wizard step content: defined in `lib/wizardSteps.ts` or MDX

---

## Installer Testing

```bash
# Local lint
shellcheck install.sh scripts/lib/*.sh

# Full VM test (requires Vagrant or cloud VM)
./tests/vm/test_install_ubuntu.sh
```

---

## Contribution Policy

Remove any mention of contributing/contributors from README and don't reinsert it.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
