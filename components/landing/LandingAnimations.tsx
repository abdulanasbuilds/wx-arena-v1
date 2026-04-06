"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation, type Variants } from "framer-motion";

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// ─── Reusable animated wrappers ───────────────────────────────────────────────

/**
 * Wraps any section and triggers a fade-up when it enters the viewport.
 */
export function AnimateFadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      void controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      animate={controls}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger-animates direct children as cards when the container enters the viewport.
 */
export function AnimateStaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      void controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual card inside an AnimateStaggerGrid.
 */
export function AnimateCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={cardVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Scale-in reveal — good for hero visuals / screenshots.
 */
export function AnimateScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      void controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={scaleInVariants}
      initial="hidden"
      animate={controls}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating particles overlay ───────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.4 + 0.1,
  }));
}

function FloatingParticles() {
  // Stable particle list — generated once on the client
  const particles = useRef<Particle[]>(generateParticles(24));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#a855f7]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Stats counter animation ──────────────────────────────────────────────────

/**
 * Animates a number counting up from 0 to `target` when it enters the viewport.
 * `suffix` is the non-numeric portion, e.g. "K+" or "/7".
 */
export function AnimatedCounter({
  target,
  suffix = "",
  className,
}: {
  target: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      {inView ? (
        <CountUpInner target={target} suffix={suffix} />
      ) : (
        `0${suffix}`
      )}
    </motion.span>
  );
}

function CountUpInner({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const start = performance.now();
    const duration = 1400; // ms

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      node.textContent = `${value}${suffix}`;
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, suffix]);

  return <span ref={nodeRef}>{`0${suffix}`}</span>;
}

// ─── Pulsing "LIVE" dot ───────────────────────────────────────────────────────

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={`relative inline-flex ${className ?? ""}`}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-[#a855f7] opacity-60"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#a855f7]" />
    </span>
  );
}

// ─── Gradient border card ─────────────────────────────────────────────────────

export function GlowBorderCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative rounded-2xl p-[1px] ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(135deg, #a855f740 0%, #7c3aed20 50%, #a855f740 100%)",
      }}
      whileHover={{
        boxShadow: "0 0 32px 4px #a855f740",
        transition: { duration: 0.2 },
      }}
    >
      <div className="relative z-10 rounded-2xl bg-[#1a1a2e] w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Root export — mounts the ambient particles layer ─────────────────────────

/**
 * Drop this anywhere in the landing page tree.
 * It renders the floating particle field that sits behind all content.
 */
export function LandingAnimations() {
  return <FloatingParticles />;
}
