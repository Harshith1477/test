"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function SplitWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word inline-block">{word}</span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

const col1Body =
  "We're a crew of obsessed engineers and designers who've shipped live SaaS products, built scroll-animated cinematic sites, and integrated AI into real production apps — not just prototypes. Our work runs in production. Our clients see results.";

const col2Body =
  "Most agencies give you a template with your logo on it. We build from zero — custom animations, silky 60fps scroll experiences, cinematic transitions, and backends that actually scale. Every pixel is intentional. Every interaction is engineered.";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const tagRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tagWords = tagRef.current?.querySelectorAll(".word") ?? [];
      const headlineWords = headlineRef.current?.querySelectorAll(".word") ?? [];

      gsap.set([tagWords, headlineWords, col1Ref.current, col2Ref.current], {
        opacity: 0,
        filter: "blur(12px)",
        y: 20,
      });

      gsap
        .timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } })
        .to(tagWords, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" })
        .to(
          headlineWords,
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.8, stagger: 0.04, ease: "power2.out" },
          "-=0.3"
        )
        .to(col1Ref.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.8, ease: "power2.out" }, "-=0.2")
        .to(col2Ref.current, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.8, ease: "power2.out" }, "-=0.55");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen overflow-hidden bg-[#080808] px-6 md:px-16 py-24 md:py-32 flex flex-col justify-center"
    >
      <span
        aria-hidden="true"
        className="absolute -left-10 md:-left-24 top-1/2 -translate-y-1/2 font-vintage text-white/15 text-[18rem] md:text-[32rem] leading-none pointer-events-none select-none"
      >
        R
      </span>

      <div className="relative max-w-6xl mx-auto w-full">
        <p
          ref={tagRef}
          className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/40 font-mono mb-6 md:mb-8"
        >
          <SplitWords text="// ABOUT RECOLT" />
        </p>

        <h1
          ref={headlineRef}
          className="font-bold italic text-white font-[family-name:var(--font-syne)] leading-[1.05] mb-16 md:mb-20 max-w-4xl"
          style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}
        >
          <SplitWords text="We don't design websites. We engineer digital experiences that people remember." />
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div ref={col1Ref}>
            <h2 className="text-white font-bold font-[family-name:var(--font-syne)] text-xl md:text-2xl mb-4">
              Who We Are
            </h2>
            <p className="text-white/70 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)" }}>
              {col1Body}
            </p>
          </div>

          <div ref={col2Ref}>
            <h2 className="text-white font-bold font-[family-name:var(--font-syne)] text-xl md:text-2xl mb-4">
              What We Do Different
            </h2>
            <p className="text-white/70 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)" }}>
              {col2Body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
