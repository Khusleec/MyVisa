"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTransition, springGentle } from "../../lib/motion";

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
  const reduceMotion = useReducedMotion();

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
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={motionTransition(reduceMotion, { ...springGentle, delay: idx * 0.05 })}
              className="stepper-item min-w-[4.5rem]"
              role="listitem"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                <motion.div
                  animate={{
                    scale: isCurrent ? [1, 1.08, 1] : 1,
                  }}
                  transition={
                    isCurrent && !reduceMotion
                      ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                  className={`stepper-dot shrink-0 ${
                    isComplete ? "stepper-dot--complete" : isCurrent ? "stepper-dot--current" : ""
                  }`}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden />
                  ) : (
                    <span className="text-[9px] font-bold">{idx + 1}</span>
                  )}
                </motion.div>
                {idx < steps.length - 1 && (
                  <motion.div
                    initial={false}
                    animate={{ scaleX: isComplete ? 1 : 0.35 }}
                    transition={motionTransition(reduceMotion, { duration: 0.3 })}
                    className={`stepper-line flex-1 min-w-[0.5rem] origin-left ${
                      isComplete ? "stepper-line--complete" : ""
                    }`}
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
