import type { ReactNode } from "react";

type BoardCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function BoardCard({
  title,
  subtitle,
  children,
}: BoardCardProps) {
  return (
    <article className="cursor-grab rounded-2xl border border-plot-border bg-plot-surface p-4 text-plot-text shadow active:cursor-grabbing">
      <header>
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs text-plot-text-muted">{subtitle}</p>
        )}
      </header>
      <div className="mt-3">{children}</div>
    </article>
  );
}
