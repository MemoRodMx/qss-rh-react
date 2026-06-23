interface SectionTitleProps {
  children: React.ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}
