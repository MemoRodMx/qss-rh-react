import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: StatCardProps) {
  return (
    <Card
      hoverable
      className="group border-border/50 bg-card shadow-[var(--shadow-1)]"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-emerald-600" : "text-destructive",
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 backdrop-blur-sm text-accent transition-all duration-200 group-hover:scale-110 group-hover:bg-accent/15">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
