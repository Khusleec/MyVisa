"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { scaleIn, motionTransition, springGentle } from "../../lib/motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={scaleIn}
      transition={motionTransition(reduceMotion, springGentle)}
      className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-line bg-elevated/40"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={motionTransition(reduceMotion, { ...springGentle, delay: 0.08 })}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 flex items-center justify-center mb-5 shadow-sm"
      >
        <Icon className="w-7 h-7 text-accent" aria-hidden />
      </motion.div>
      <motion.h4
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition(reduceMotion, { duration: 0.25, delay: 0.12 })}
        className="text-base font-bold text-foreground mb-2"
      >
        {title}
      </motion.h4>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition(reduceMotion, { duration: 0.25, delay: 0.16 })}
        className="text-sm text-muted max-w-md leading-relaxed mb-5"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition(reduceMotion, { duration: 0.25, delay: 0.2 })}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
