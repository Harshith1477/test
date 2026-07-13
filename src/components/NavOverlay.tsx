"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  number: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { number: "01", label: "Home", href: "/" },
  { number: "02", label: "Our Work", href: "/work" },
  { number: "03", label: "Services", href: "/services" },
  { number: "04", label: "About", href: "/about" },
  { number: "05", label: "Contact", href: "/contact" },
];

const EASE = [0.76, 0, 0.24, 1] as const;

const curtainVariants: Variants = {
  hidden: {
    scaleY: 0,
    transition: { duration: 0.8, ease: EASE, when: "afterChildren" },
  },
  visible: {
    scaleY: 1,
    transition: { duration: 0.8, ease: EASE, when: "beforeChildren" },
  },
};

const navListVariants: Variants = {
  hidden: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const linkItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, transition: { duration: 0.15, ease: "easeIn" } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

const giantLetterVariants: Variants = {
  hidden: { opacity: 0, x: -80, scale: 0.85, transition: { duration: 0.2, ease: "easeIn" } },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 1.1, ease: EASE } },
};

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SCRAMBLE_FINAL_CHAR = "R";
const SCRAMBLE_TICKS = 10;
const SCRAMBLE_INTERVAL_MS = 60;

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
    </svg>
  );
}

export function NavOverlay({ isOpen, onClose }: NavOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [scrambledLetter, setScrambledLetter] = useState(SCRAMBLE_FINAL_CHAR);
  const scrambleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    };
  }, []);

  const startLetterScramble = () => {
    if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    let tick = 0;
    scrambleIntervalRef.current = setInterval(() => {
      tick += 1;
      if (tick >= SCRAMBLE_TICKS) {
        setScrambledLetter(SCRAMBLE_FINAL_CHAR);
        if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
        return;
      }
      setScrambledLetter(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
    }, SCRAMBLE_INTERVAL_MS);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      triggerRef.current = document.activeElement as HTMLElement;
      containerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;

      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        triggerRef.current?.focus();
      }}
    >
      {isOpen && (
        <motion.div
          key="nav-overlay"
          id="nav-overlay"
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          tabIndex={-1}
          variants={curtainVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[55] bg-black dark:bg-white origin-top will-change-transform overflow-hidden outline-none"
        >
          <div className="relative w-full h-full max-w-7xl mx-auto px-6 md:px-12 py-24 flex flex-col justify-between">
            <div className="flex-1 flex items-center">
              <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 items-center">
                <div className="hidden md:block relative h-full overflow-hidden pointer-events-none select-none">
                  <span className="absolute -left-16 top-1/2 -translate-y-1/2 block">
                    <motion.span
                      variants={giantLetterVariants}
                      onAnimationStart={(definition) => {
                        if (definition === "visible") startLetterScramble();
                      }}
                      className="font-vintage block text-[32rem] leading-none text-white/10 dark:text-black/10 will-change-transform"
                    >
                      {scrambledLetter}
                    </motion.span>
                  </span>
                </div>

                <motion.ul variants={navListVariants} className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <motion.li key={item.href} variants={linkItemVariants} className="group">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-baseline gap-4 text-white dark:text-black"
                      >
                        <span className="text-sm font-mono text-white/40 dark:text-black/40">
                          {item.number}
                        </span>
                        <span className="relative text-4xl md:text-7xl font-extrabold font-[family-name:var(--font-syne)] tracking-tight">
                          {item.label}
                          <span className="absolute left-0 -bottom-1 h-[3px] w-full bg-current scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-8 border-t border-white/10 dark:border-black/10 text-white/60 dark:text-black/60">
              <a
                href="https://www.instagram.com/recolt_agency?igsh=MTVnd3Y4N3hxMDF5ZA=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-white dark:hover:text-black transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/recolt-agency/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-white dark:hover:text-black transition-colors"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
