"use client";

import Link from "next/link";
import { motion } from "motion/react";

/** CTA con feedback de tap <150ms (baseline de motion; MotionConfig en layout.tsx respeta reduced-motion). */
export function TapLink({
  href,
  className,
  fullWidth = false,
  children,
}: {
  href: string;
  className?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} className={fullWidth ? "block w-full" : "inline-block"}>
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
