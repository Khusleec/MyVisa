import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}

export default function PageHeader({ title, description, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 pb-1">
      <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        )}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div className="w-1 h-6 sm:h-8 rounded-full bg-gradient-to-b from-accent to-accent/30 shrink-0 mt-1 sm:mt-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight leading-snug break-words">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl mt-1 break-words">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto [&_.btn-primary]:w-full sm:[&_.btn-primary]:w-auto">{action}</div>}
    </div>
  );
}
