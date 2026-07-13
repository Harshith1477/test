"use client";

import React, { useState, useEffect } from "react";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import { ThemeToggle } from "@/components/theme-toggle";
import { ContactModal } from "@/components/ui/contact-modal";
import { ParticleText } from "@/components/ui/particle-text";
import { ServiceCard } from "@/components/ui/service-card";
import { HamburgerButton } from "@/components/HamburgerButton";
import { NavOverlay } from "@/components/NavOverlay";

import { cn } from "@/lib/utils";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-8");
          entry.target.classList.add("opacity-100", "translate-y-0");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-row").forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      
      {/* NAVBAR */}
      <header
        aria-hidden={isNavOpen}
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-background/60 backdrop-blur-md border-b border-foreground/10"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight font-vintage">Recolt</div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium border border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 px-4 py-2 rounded-lg transition-colors bg-transparent"
            >
              Get in touch
            </button>
          </div>
        </div>
      </header>

      <main aria-hidden={isNavOpen} className="flex-1 flex flex-col">
        {/* HERO */}
        <PixelHero word1="" word2="Recolt" />

        {/* WHAT WE DO SECTION */}
        <section className="w-full py-32 px-6 bg-background">
          <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-32">
            
            {/* Row 1 */}
            <div className="reveal-row flex flex-col md:flex-row min-h-[40vh] items-center border-t border-foreground/10 pt-16 gap-8 md:gap-16 opacity-0 translate-y-8 transition-all duration-700">
              <div className="flex-1">
                <ParticleText text="Motion that means something." fontSize={64} className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-none max-w-sm" />
              </div>
              <div className="flex-1 flex md:justify-end">
                <p className="text-foreground/50 text-base md:text-lg leading-relaxed max-w-md">Scroll animations, reveal effects, micro-interactions, text animations, particle systems, physics simulations — every movement is intentional, every transition earns its place.</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="reveal-row flex flex-col md:flex-row-reverse min-h-[40vh] items-center border-t border-foreground/10 pt-16 gap-8 md:gap-16 opacity-0 translate-y-8 transition-all duration-700">
              <div className="flex-1">
                <ParticleText text="Frontend that feels alive." fontSize={64} className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-none max-w-sm" />
              </div>
              <div className="flex-1 flex md:justify-end md:text-right">
                <p className="text-foreground/50 text-base md:text-lg leading-relaxed max-w-md">WebGL backgrounds, GSAP animations, Three.js accents, shader effects — immersive web experiences that make your brand impossible to ignore.</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="reveal-row flex flex-col md:flex-row min-h-[40vh] items-center border-t border-foreground/10 pt-16 gap-8 md:gap-16 opacity-0 translate-y-8 transition-all duration-700">
              <div className="flex-1">
                <ParticleText text="Built secure from day one." fontSize={64} className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-none max-w-sm" />
              </div>
              <div className="flex-1 flex md:justify-end">
                <p className="text-foreground/50 text-base md:text-lg leading-relaxed max-w-md">Hardened landing pages, full-stack SaaS products, AI integrations, web security audits — production-grade architecture that scales without breaking.</p>
              </div>
            </div>

          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-3 text-foreground">What we build</h2>
            <p className="text-lg mb-16 text-foreground/40">We don't do average.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ServiceCard 
                number="01" 
                title="SaaS Development" 
                description="Full-stack products engineered to scale. From idea to deployed in weeks, not months." 
              />
              <ServiceCard 
                number="02" 
                title="AI Integrations" 
                description="Intelligent systems wired directly into your product. Not a chatbot. Actual intelligence." 
              />
              <ServiceCard 
                number="03" 
                title="Motion Design" 
                description="Scroll animations and micro-interactions that make people stop and say what is that." 
              />
              <ServiceCard 
                number="04" 
                title="Full Stack" 
                description="End to end. Frontend, backend, database, deployment. We handle the whole thing." 
              />
              <ServiceCard 
                number="05" 
                title="Graphic Designing" 
                description="Brand identity, UI visuals, and marketing assets that actually look like they cost more than they did." 
              />
              <ServiceCard 
                number="06" 
                title="Video Editing" 
                description="Cinematic cuts, motion graphics, and reels that stop the scroll. Not just edited — produced." 
              />
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section className="py-32 px-6 border-t border-foreground/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-16">How we work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-foreground/10">
              <div className="pb-12 md:pb-0 md:pr-12">
                <span className="text-xs tracking-widest text-foreground/30 font-mono">01</span>
                <h3 className="text-3xl font-bold mt-6 mb-3">Understand</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">We learn your problem before a single line of code is written.</p>
              </div>
              <div className="py-12 md:py-0 md:px-12">
                <span className="text-xs tracking-widest text-foreground/30 font-mono">02</span>
                <h3 className="text-3xl font-bold mt-6 mb-3">Build</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">Fast, clean, production-grade. No shortcuts, no excuses.</p>
              </div>
              <div className="pt-12 md:pt-0 md:pl-12">
                <span className="text-xs tracking-widest text-foreground/30 font-mono">03</span>
                <h3 className="text-3xl font-bold mt-6 mb-3">Ship</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">Deployed, secured, documented, and handed over properly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer aria-hidden={isNavOpen} className="py-8 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-center md:text-left">
          <span className="font-bold text-foreground font-vintage">Recolt</span>
          <span className="text-foreground/40 text-sm">For founders who refuse to compromise.</span>
          <a href="mailto:recoltagency@gmail.com" className="text-foreground/60 hover:text-foreground text-sm transition-colors font-system">
            recoltagency@gmail.com
          </a>
          <span className="text-foreground/40 text-sm">© 2026 Recolt</span>
        </div>
      </footer>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />


      <NavOverlay isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <HamburgerButton isOpen={isNavOpen} onClick={() => setIsNavOpen((v) => !v)} />
    </div>
  );
}
