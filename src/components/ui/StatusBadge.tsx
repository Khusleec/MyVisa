"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTransition, springGentle } from "../../lib/motion";

interface StatusBadgeProps {
  text: string;
  className?: string;
}

export default function StatusBadge({ text, className = "" }: StatusBadgeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={motionTransition(reduceMotion, springGentle)}
      className={`status-badge ${className}`}
    >
      {text}
    </motion.span>
  );
}
