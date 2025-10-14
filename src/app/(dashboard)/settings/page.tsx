import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-background px-8 py-10 text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Personaliza las preferencias de tu espacio de trabajo y configura integraciones.
        </p>
      </header>
      <section className="max-w-xl rounded-lg border border-border bg-card/60 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-medium">Apariencia</h2>
            <p className="text-sm text-muted-foreground">
              Cambia entre los temas claro, oscuro o el modo del sistema.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>
    </main>
  );
}
