import React from "react";
import { Check } from "lucide-react";

export interface ProgressStep {
  title: string;
  active?: boolean;
  pulse?: boolean;
  complete?: boolean;
}

interface ProgressStepperProps {
  steps: ProgressStep[];
  className?: string;
}

export default function ProgressStepper({ steps, className = "" }: ProgressStepperProps) {
  return (
    <div className={`progress-stepper-scroll ${className}`}>
      <div
        className="progress-stepper-track grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(4.5rem, 1fr))` }}
        role="list"
        aria-label="Явцын алхмууд"
      >
        {steps.map((step, idx) => {
          const isComplete = step.complete ?? step.active;
          const isCurrent = step.pulse;

          return (
            <div key={idx} className="stepper-item min-w-[4.5rem]" role="listitem">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                <div
                  className={`stepper-dot shrink-0 ${
                    isComplete ? "stepper-dot--complete" : isCurrent ? "stepper-dot--current" : ""
                  }`}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden />
                  ) : (
                    <span className="text-[9px] font-bold">{idx + 1}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`stepper-line flex-1 min-w-[0.5rem] ${isComplete ? "stepper-line--complete" : ""}`}
                    aria-hidden
                  />
                )}
              </div>
              <p
                className={`text-[10px] sm:text-[11px] font-semibold leading-tight break-words ${
                  isComplete || isCurrent ? "text-foreground" : "text-muted"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
