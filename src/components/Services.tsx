"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, Sparkles, Wand2, Layers, PenTool, Film, Plus, type LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Sourced as-is from the existing services list in src/app/page.tsx — do not invent new services here.
interface Service {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const services: Service[] = [
  {
    number: "01",
    title: "SaaS Development",
    description: "Full-stack products engineered to scale. From idea to deployed in weeks, not months.",
    icon: Code2,
  },
  {
    number: "02",
    title: "AI Integrations",
    description: "Intelligent systems wired directly into your product. Not a chatbot. Actual intelligence.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Motion Design",
    description: "Scroll animations and micro-interactions that make people stop and say what is that.",
    icon: Wand2,
  },
  {
    number: "04",
    title: "Full Stack",
    description: "End to end. Frontend, backend, database, deployment. We handle the whole thing.",
    icon: Layers,
  },
  {
    number: "05",
    title: "Graphic Designing",
    description: "Brand identity, UI visuals, and marketing assets that actually look like they cost more than they did.",
    icon: PenTool,
  },
  {
    number: "06",
    title: "Video Editing",
    description: "Cinematic cuts, motion graphics, and reels that stop the scroll. Not just edited — produced.",
    icon: Film,
  },
];

function ServiceItem({ service }: { service: Service }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = service.icon;

  return (
    <div className="service-item border-b border-white/10">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-8 md:gap-10 py-8 md:py-10 text-left group"
      >
        <div className="flex flex-1 items-baseline gap-4 md:gap-8 min-w-0">
          <span className="shrink-0 text-sm font-mono text-white/40">{service.number}</span>
          <span
            className="font-extrabold uppercase text-white font-[family-name:var(--font-syne)] tracking-tight leading-none group-hover:text-red-500 transition-colors duration-300"
            style={{ fontSize: "clamp(1.25rem, 3vw, 3rem)" }}
          >
            {service.title}
          </span>
        </div>
        <Plus
          className={`shrink-0 w-6 h-6 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>

      <div className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="pb-8 md:pb-10 md:pl-[3.75rem] flex items-start gap-4 md:gap-6">
            <Icon className="shrink-0 w-6 h-6 md:w-7 md:h-7 text-red-500/70 mt-1" />
            <p className="max-w-2xl text-white/50 text-base md:text-lg leading-relaxed">{service.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".service-item", {
        opacity: 0,
        y: 60,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: listRef.current,
          start: "top 85%",
        },
      });
    }, listRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" className="w-full bg-[#080808] py-24 md:py-32 px-6 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-3 font-[family-name:var(--font-syne)]">
          Services
        </h1>
        <p className="text-lg text-zinc-500 mb-16">What we build, end to end.</p>

        <div ref={listRef} className="border-t border-white/10">
          {services.map((service) => (
            <ServiceItem key={service.number} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
