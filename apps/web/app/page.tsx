import Link from "next/link";
import { ArrowRight, Terminal, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <Terminal className="h-4 w-4" />
            <span>Beginner-friendly wizard</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Agentic Coding Flywheel Setup
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Go from a fresh Ubuntu VPS to a fully configured agentic coding
            environment (Claude/Codex/Gemini + modern tooling) in about 30
            minutes.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/wizard/os-selection">
                Start the wizard
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">One-liner install</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A single command installs tools, configs, and agents on your VPS.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Checkpointed + re-runnable</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              The installer is designed to be safe to re-run and resume on
              failure.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Learn by doing</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Launch <code className="rounded bg-muted px-1">onboard</code> for
              an interactive tutorial after setup.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
