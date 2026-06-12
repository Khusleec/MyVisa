import React from "react";

interface StatusBadgeProps {
  text: string;
  className?: string;
}

export default function StatusBadge({ text, className = "" }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${className}`}>
      {text}
    </span>
  );
}
