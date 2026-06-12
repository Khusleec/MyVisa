import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-line bg-elevated/40">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 flex items-center justify-center mb-5 shadow-sm">
        <Icon className="w-7 h-7 text-accent" aria-hidden />
      </div>
      <h4 className="text-base font-bold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted max-w-md leading-relaxed mb-5">{description}</p>
      {action}
    </div>
  );
}
