"use client";

import { useState } from "react";
import { Copy, Check, Terminal, Sparkles, Code2 } from "lucide-react";
import { motion, AnimatePresence, springs } from "@/components/motion";
import { CommandCard } from "@/components/command-card";
import { cn } from "@/lib/utils";
import type { AgentInfo } from "./AgentHeroCard";
import { agentPersonalities } from "./AgentHeroCard";

type TabId = "examples" | "tips" | "aliases";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "examples", label: "Commands", icon: <Code2 className="h-4 w-4" /> },
  { id: "tips", label: "Tips", icon: <Sparkles className="h-4 w-4" /> },
  { id: "aliases", label: "Aliases", icon: <Terminal className="h-4 w-4" /> },
];

interface AgentCardContentProps {
  agent: AgentInfo;
  isExpanded: boolean;
}

export function AgentCardContent({ agent, isExpanded }: AgentCardContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("examples");
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);
  const personality = agentPersonalities[agent.id];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAlias(text);
      setTimeout(() => setCopiedAlias(null), 2000);
    } catch {
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
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={springs.smooth}
          className="overflow-hidden"
        >
          <div className="border-t border-border/30">
            {/* Tab navigation */}
            <div className="flex border-b border-border/30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(tab.id);
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 px-4 py-3",
                    "text-sm font-medium transition-colors",
                    "min-h-[48px]", // Touch target
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                {activeTab === "examples" && (
                  <motion.div
                    key="examples"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={springs.snappy}
                    className="space-y-3"
                  >
                    {agent.examples.map((example, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springs.smooth, delay: i * 0.05 }}
                      >
                        <CommandCard
                          command={example.command}
                          description={example.description}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "tips" && (
                  <motion.div
                    key="tips"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={springs.snappy}
                  >
                    <ul className="space-y-3">
                      {agent.tips.map((tip, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 rounded-lg bg-muted/30 p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...springs.smooth, delay: i * 0.05 }}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                              personality.bgGlow
                            )}
                          >
                            <Sparkles className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tip}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {activeTab === "aliases" && (
                  <motion.div
                    key="aliases"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={springs.snappy}
                  >
                    <p className="mb-4 text-sm text-muted-foreground">
                      All these commands launch {agent.name}. Copy and paste into
                      your terminal.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[agent.command, ...agent.aliases].map((alias, i) => (
                        <motion.button
                          key={alias}
                          type="button"
                          onClick={() => handleCopy(alias)}
                          className={cn(
                            "group flex items-center justify-between gap-3 rounded-xl border p-4",
                            "min-h-[56px] transition-all",
                            copiedAlias === alias
                              ? "border-[oklch(0.72_0.19_145)] bg-[oklch(0.72_0.19_145/0.1)]"
                              : "border-border/50 bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...springs.smooth, delay: i * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <Terminal className="h-4 w-4 text-muted-foreground" />
                            <code className="font-mono text-base">{alias}</code>
                          </div>
                          <AnimatePresence mode="wait">
                            {copiedAlias === alias ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center gap-1 text-[oklch(0.72_0.19_145)]"
                              >
                                <Check className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  Copied!
                                </span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center gap-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <Copy className="h-4 w-4" />
                                <span className="hidden text-xs sm:inline">
                                  Copy
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
