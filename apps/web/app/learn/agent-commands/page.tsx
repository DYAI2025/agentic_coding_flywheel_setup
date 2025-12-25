"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Copy,
  Home,
  Search,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CommandCard, CodeBlock } from "@/components/command-card";
import { motion, springs, staggerContainer, fadeUp } from "@/components/motion";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

type AgentType = "claude" | "codex" | "gemini";

interface AgentInfo {
  id: AgentType;
  name: string;
  command: string;
  aliases: string[];
  description: string;
  model: string;
  color: string;
  icon: string;
  examples: Array<{
    command: string;
    description: string;
  }>;
  tips: string[];
}

const agents: AgentInfo[] = [
  {
    id: "claude",
    name: "Claude Code",
    command: "claude",
    aliases: ["cc"],
    description:
      "Anthropic's powerful coding agent. Uses Claude Opus 4.5 with deep reasoning capabilities. Best for complex architecture decisions and nuanced code understanding.",
    model: "Claude Opus 4.5",
    color: "from-orange-400 to-amber-500",
    icon: "C",
    examples: [
      {
        command: "cc",
        description: "Start interactive REPL session",
      },
      {
        command: 'cc "fix the authentication bug in auth.ts"',
        description: "Direct prompt with task",
      },
      {
        command: "cc --continue",
        description: "Resume last session",
      },
      {
        command: "/compact",
        description: "Compress context (type inside cc session)",
      },
      {
        command: 'cc "review this PR" --print',
        description: "Output-only mode (no REPL)",
      },
    ],
    tips: [
      "Use /compact when context gets full",
      "Start with cc for quick sessions",
      "Combine with ultrathink prompts for complex reasoning",
      "Use --continue to resume where you left off",
    ],
  },
  {
    id: "codex",
    name: "Codex CLI",
    command: "codex",
    aliases: ["cod"],
    description:
      "OpenAI's coding agent. Uses GPT-5.2-Codex with high or extra high effort settings. Excellent for code generation, refactoring, and following structured instructions.",
    model: "GPT-5.2-Codex",
    color: "from-emerald-400 to-teal-500",
    icon: "O",
    examples: [
      {
        command: "cod",
        description: "Start interactive session",
      },
      {
        command: 'cod "add unit tests for utils.ts"',
        description: "Direct prompt with task",
      },
      {
        command: 'cod "explain this code" --effort extra-high',
        description: "Use extra high effort for complex reasoning",
      },
      {
        command: "cod --help",
        description: "Show all options",
      },
    ],
    tips: [
      "Good for structured, step-by-step tasks",
      "Use --effort high or extra-high for complex reasoning",
      "Works well with clear, specific prompts",
    ],
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    command: "gemini",
    aliases: ["gmi"],
    description:
      "Google's coding agent. Uses Gemini 3 with large context windows. Great for analyzing large codebases and multi-file understanding.",
    model: "Gemini 3",
    color: "from-blue-400 to-indigo-500",
    icon: "G",
    examples: [
      {
        command: "gmi",
        description: "Start interactive session",
      },
      {
        command: 'gmi "analyze the project structure"',
        description: "Direct prompt with task",
      },
      {
        command: "gmi --yolo",
        description: "Explicit YOLO mode (already default in vibe alias)",
      },
      {
        command: "gmi --help",
        description: "Show all options",
      },
    ],
    tips: [
      "Leverage the large context window for big codebases",
      "Good for exploration and understanding",
      "Use sandbox mode for safer experimentation",
    ],
  },
];

function AgentCard({ agent }: { agent: AgentInfo }) {
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAlias(text);
      setTimeout(() => setCopiedAlias(null), 2000);
    } catch {
      // Fallback for older browsers or non-HTTPS contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedAlias(text);
      setTimeout(() => setCopiedAlias(null), 2000);
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div
        className={`flex items-center gap-4 bg-gradient-to-r p-5 ${agent.color}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
          {agent.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{agent.name}</h3>
          <p className="text-sm text-white/80">Model: {agent.model}</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <code className="rounded-lg bg-white/20 px-3 py-1.5 font-mono text-sm text-white backdrop-blur-sm">
            {agent.aliases[0] || agent.command}
          </code>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-5">
        {/* Description */}
        <p className="text-muted-foreground">{agent.description}</p>

        {/* Aliases */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Aliases
          </h4>
          <div className="flex flex-wrap gap-2">
            {[agent.command, ...agent.aliases].map((alias) => (
              <button
                key={alias}
                onClick={() => handleCopy(alias)}
                className={`group flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors ${
                  copiedAlias === alias
                    ? "border-[oklch(0.72_0.19_145)] bg-[oklch(0.72_0.19_145/0.1)] text-[oklch(0.72_0.19_145)]"
                    : "border-border/50 bg-muted/50 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <Terminal className="h-3 w-3 text-muted-foreground" />
                {alias}
                {copiedAlias === alias ? (
                  <span className="text-xs">copied!</span>
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Common Commands
          </h4>
          <div className="space-y-2">
            {agent.examples.map((example, i) => (
              <div key={i} className="group">
                <CommandCard
                  command={example.command}
                  description={example.description}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Tips</h4>
          <ul className="space-y-1.5">
            {agent.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default function AgentCommandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { ref: heroRef, isInView: heroInView } = useScrollReveal({ threshold: 0.1 });
  const { ref: contentRef, isInView: contentInView } = useScrollReveal({ threshold: 0.05 });

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.aliases.some((a) =>
        a.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-cosmic opacity-50" />
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-20" />
      {/* Floating orbs - hidden on mobile for performance */}
      <div className="pointer-events-none fixed -left-40 top-1/4 hidden h-80 w-80 rounded-full bg-[oklch(0.75_0.18_195/0.08)] blur-[100px] sm:block" />
      <div className="pointer-events-none fixed -right-40 bottom-1/3 hidden h-80 w-80 rounded-full bg-[oklch(0.7_0.2_330/0.08)] blur-[100px] sm:block" />

      <div className="relative mx-auto max-w-4xl px-6 py-8 md:px-12 md:py-12">
        {/* Header - 48px touch targets */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/learn"
            className="flex min-h-[48px] items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Learning Hub</span>
          </Link>
          <Link
            href="/"
            className="flex min-h-[48px] items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
        </div>

        {/* Hero with animation */}
        <motion.div
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={springs.smooth}
        >
          <motion.div
            className="mb-4 flex justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={springs.snappy}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/20">
              <Terminal className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Agent Commands
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Quick reference for Claude Code, Codex CLI, and Gemini CLI. Copy
            commands and learn best practices for each agent.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents, commands, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search agents, commands, or features"
            className="w-full rounded-xl border border-border/50 bg-card/50 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Quick start */}
        <Card className="mb-10 border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="mb-1 font-semibold">Quick Start</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                All three agents are pre-installed and ready to use. Just type
                the alias to start:
              </p>
              <div className="flex flex-wrap gap-2">
                <code className="rounded-lg bg-muted/80 px-3 py-1.5 font-mono text-sm">
                  cc
                </code>
                <span className="text-muted-foreground">&rarr; Claude Code</span>
                <code className="rounded-lg bg-muted/80 px-3 py-1.5 font-mono text-sm">
                  cod
                </code>
                <span className="text-muted-foreground">&rarr; Codex CLI</span>
                <code className="rounded-lg bg-muted/80 px-3 py-1.5 font-mono text-sm">
                  gmi
                </code>
                <span className="text-muted-foreground">&rarr; Gemini CLI</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Agent cards with stagger animation */}
        <motion.div
          ref={contentRef as React.RefObject<HTMLDivElement>}
          className="space-y-8"
          initial="hidden"
          animate={contentInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <motion.div
                key={agent.id}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -15px oklch(0.75 0.18 195 / 0.15)" }}
                transition={springs.snappy}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="py-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springs.smooth}
            >
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No agents match your search.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Multi-agent workflow */}
        <Card className="mt-10 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            Multi-Agent Workflow with NTM
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Use NTM (Named Tmux Manager) to run multiple agents in parallel:
          </p>
          <CodeBlock
            code={`# Spawn 2 Claude, 1 Codex, 1 Gemini in parallel
ntm spawn myproject --cc=2 --cod=1 --gmi=1

# Send prompt to all Claude agents
ntm send myproject --cc "implement the new feature"

# Send prompt to all agents
ntm send myproject "review and test your changes"`}
            language="bash"
          />
          <div className="mt-4">
            <Link
              href="/learn/ntm-palette"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Learn more about NTM commands
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Back to{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Learning Hub &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
