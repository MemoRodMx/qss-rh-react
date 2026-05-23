interface JsonDiffViewerProps {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

function prettyJson(val: Record<string, unknown> | null): string {
  if (!val) return "—";
  return JSON.stringify(val, null, 2);
}

export function JsonDiffViewer({ before, after }: JsonDiffViewerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          ANTES
        </p>
        <pre
          className="text-xs leading-relaxed whitespace-pre-wrap break-all max-h-80 overflow-y-auto rounded-lg border p-3 m-0"
          style={{
            borderLeft: "3px solid #f97316",
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          {prettyJson(before)}
        </pre>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          DESPUÉS
        </p>
        <pre
          className="text-xs leading-relaxed whitespace-pre-wrap break-all max-h-80 overflow-y-auto rounded-lg border p-3 m-0"
          style={{
            borderLeft: "3px solid #22c55e",
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          {prettyJson(after)}
        </pre>
      </div>
    </div>
  );
}
