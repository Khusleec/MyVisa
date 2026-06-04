import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-[#8f95b2] leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
