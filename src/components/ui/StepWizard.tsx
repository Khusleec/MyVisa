import React from "react";
import { Check } from "lucide-react";

export interface WizardStep {
  step: number;
  label: string;
  full: string;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepWizard({ steps, currentStep, onStepClick }: StepWizardProps) {
  return (
    <div className="premium-card p-3 sm:p-4 md:p-5 bg-elevated/50 border border-line rounded-2xl overflow-x-auto -mx-0 sm:mx-0">
      <div
        className="flex items-center w-full min-w-[16rem] max-w-2xl mx-auto gap-0"
        role="list"
        aria-label="Мэдүүлгийн алхмууд"
      >
        {steps.map((s, i) => {
          const isCompleted = currentStep > s.step;
          const isActive = currentStep === s.step;
          const isAccessible = s.step <= currentStep;

          return (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center flex-1 min-w-[3.25rem] sm:min-w-[4.5rem]" role="listitem">
                <button
                  type="button"
                  disabled={!isAccessible || !onStepClick}
                  onClick={() => isAccessible && onStepClick?.(s.step)}
                  className={`stepper-dot w-8 h-8 sm:w-10 sm:h-10 text-[10px] sm:text-xs ${
                    isActive
                      ? "stepper-dot--current"
                      : isCompleted
                        ? "stepper-dot--complete"
                        : ""
                  } ${isAccessible && onStepClick ? "cursor-pointer hover:scale-105" : "cursor-default opacity-60"}`}
                  aria-current={isActive ? "step" : undefined}
                  title={s.full}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> : s.step}
                </button>
                <span
                  className={`text-[10px] sm:text-[11px] mt-1.5 sm:mt-2 font-semibold text-center leading-tight px-0.5 ${
                    isActive ? "text-foreground" : "text-muted"
                  }`}
                >
                  <span className="sm:hidden">{s.label}</span>
                  <span className="hidden sm:inline">{s.full}</span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[6px] sm:min-w-[12px] mb-5 sm:mb-6 rounded-full ${
                    isCompleted ? "stepper-line--complete bg-positive/60" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
