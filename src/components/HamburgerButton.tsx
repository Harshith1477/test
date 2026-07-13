"use client";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  /** Force the closed-state icon to white, for pages with a fixed dark background that isn't theme-reactive. */
  alwaysLightIcon?: boolean;
}

export function HamburgerButton({ isOpen, onClick, alwaysLightIcon = false }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="nav-overlay"
      className={cn(
        "fixed top-6 right-6 z-[60] p-2 rounded-lg transition-colors duration-300 will-change-transform",
        isOpen
          ? "text-white dark:text-black"
          : alwaysLightIcon
            ? "text-white"
            : "text-black dark:text-white"
      )}
    >
      {isOpen ? <X size={28} /> : <Menu size={28} />}
    </button>
  );
}
