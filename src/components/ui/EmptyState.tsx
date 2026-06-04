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
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border border-dashed border-[#1e2030] bg-[#0e0f15]/50">
      <div className="w-12 h-12 rounded-xl bg-[#12131a] border border-[#1e2030] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#8f95b2]" aria-hidden />
      </div>
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-[#8f95b2] max-w-sm leading-relaxed mb-4">{description}</p>
      {action}
    </div>
  );
}
