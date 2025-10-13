import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-background px-8 py-10 text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your workspace preferences and configure integrations.
        </p>
      </header>
      <section className="max-w-xl rounded-lg border border-border bg-card/60 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-medium">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Toggle between light, dark, or system themes.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>
    </main>
  );
}
