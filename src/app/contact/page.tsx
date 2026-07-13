"use client";

import { useState } from "react";
import { HamburgerButton } from "@/components/HamburgerButton";
import { NavOverlay } from "@/components/NavOverlay";
import { Contact } from "@/components/Contact";

export default function ContactPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#080808]">
      <Contact />
      <HamburgerButton isOpen={isNavOpen} onClick={() => setIsNavOpen((v) => !v)} alwaysLightIcon />
      <NavOverlay isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
    </div>
  );
}
