import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1080px] space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
          <Settings className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajusta el comportamiento general del sistema
          </p>
        </div>
      </div>
    </div>
  );
}
