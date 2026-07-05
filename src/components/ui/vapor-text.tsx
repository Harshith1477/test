"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VaporTextProps {
  text: string;
  tag?: React.ElementType;
  className?: string;
}

export function VaporText({ text, tag: Tag = "h2", className }: VaporTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  let charCount = 0;

  return (
    <Tag ref={containerRef} className={cn("inline-block", className)}>
      <style>{`
        @keyframes vapor-reveal {
          0% {
            opacity: 0;
            filter: blur(12px);
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0);
          }
        }
      `}</style>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="flex flex-wrap">
        {text.split(" ").map((word, wordIndex) => {
          const wordChars = word.split("");
          const renderedWord = (
            <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
              {wordChars.map((char, charIndex) => {
                const delay = charCount * 30;
                charCount++;
                return (
                  <span
                    key={charIndex}
                    className="inline-block opacity-0"
                    style={{
                      animation: isVisible 
                        ? `vapor-reveal 600ms cubic-bezier(0.25, 1, 0.5, 1) forwards` 
                        : "none",
                      animationDelay: `${delay}ms`
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
          charCount++; // Increment extra for the space
          return renderedWord;
        })}
      </span>
    </Tag>
  );
}
