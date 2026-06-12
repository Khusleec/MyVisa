"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTransition, springGentle } from "../../lib/motion";

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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTransition(reduceMotion, { ...springGentle, delay: 0.05 })}
      className="premium-card p-3 sm:p-4 md:p-5 bg-elevated/50 border border-line rounded-2xl overflow-x-auto -mx-0 sm:mx-0"
    >
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
                <motion.button
                  type="button"
                  disabled={!isAccessible || !onStepClick}
                  onClick={() => isAccessible && onStepClick?.(s.step)}
                  animate={{
                    scale: isActive ? 1.08 : 1,
                  }}
                  whileTap={isAccessible && onStepClick && !reduceMotion ? { scale: 0.95 } : undefined}
                  transition={motionTransition(reduceMotion, springGentle)}
                  className={`stepper-dot w-8 h-8 sm:w-10 sm:h-10 text-[10px] sm:text-xs ${
                    isActive
                      ? "stepper-dot--current"
                      : isCompleted
                        ? "stepper-dot--complete"
                        : ""
                  } ${isAccessible && onStepClick ? "cursor-pointer" : "cursor-default opacity-60"}`}
                  aria-current={isActive ? "step" : undefined}
                  title={s.full}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> : s.step}
                </motion.button>
                <motion.span
                  animate={{
                    color: isActive ? "var(--color-text-main)" : "var(--color-text-muted)",
                    fontWeight: isActive ? 700 : 600,
                  }}
                  transition={motionTransition(reduceMotion, { duration: 0.2 })}
                  className="text-[10px] sm:text-[11px] mt-1.5 sm:mt-2 font-semibold text-center leading-tight px-0.5"
                >
                  <span className="sm:hidden">{s.label}</span>
                  <span className="hidden sm:inline">{s.full}</span>
                </motion.span>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={false}
                  animate={{
                    scaleX: isCompleted ? 1 : 0.3,
                    opacity: isCompleted ? 1 : 0.4,
                  }}
                  transition={motionTransition(reduceMotion, { duration: 0.35 })}
                  className={`h-0.5 flex-1 min-w-[6px] sm:min-w-[12px] mb-5 sm:mb-6 rounded-full origin-left ${
                    isCompleted ? "stepper-line--complete bg-positive/60" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}
