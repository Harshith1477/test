"use client";

import { useState } from "react";
import { HamburgerButton } from "@/components/HamburgerButton";
import { NavOverlay } from "@/components/NavOverlay";
import { OurWork } from "@/components/OurWork";

export default function WorkPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-black">
      <OurWork />
      <HamburgerButton isOpen={isNavOpen} onClick={() => setIsNavOpen((v) => !v)} alwaysLightIcon />
      <NavOverlay isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
    </div>
  );
}
