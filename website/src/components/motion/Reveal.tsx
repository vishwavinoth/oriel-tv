"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fades content up as it scrolls into view. MotionConfig turns the movement off for reduced motion. */
export function Reveal({ delay = 0, children, ...props }: { delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0, 0, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
