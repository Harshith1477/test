"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticleTextProps {
  text: string;
  fontSize?: number;
  className?: string;
  tag?: React.ElementType;
}

export function ParticleText({ text, fontSize = 72, className, tag: Tag = "h2" }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [phase, setPhase] = useState<"idle" | "animating" | "complete">("idle");
  const animationFrameRef = useRef<number | undefined>(undefined);
  const hasStartedRef = useRef(false);
  const [themeKey, setThemeKey] = useState(0);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    document.fonts.ready.then(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
    });

    return () => observer?.disconnect();
  }, []);

  // Watch for theme changes on the html/documentElement
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Re-trigger animation on theme change
          setThemeKey((k) => k + 1);
          setPhase("idle");
          hasStartedRef.current = false;
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting || hasStartedRef.current || !canvasRef.current || !containerRef.current) return;

    hasStartedRef.current = true;
    setPhase("animating");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Detect theme color
    const isDark = document.documentElement.classList.contains("dark");
    const particleColor = isDark ? "#ffffff" : "#000000";

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const clampedFontSize = Math.max(48, Math.min(96, containerWidth * 0.12));

    const width = containerWidth;
    const height = Math.max(containerHeight, clampedFontSize * 1.5);
    
    canvas.width = width;
    canvas.height = height;

    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.fillStyle = particleColor;
    offCtx.font = `800 ${clampedFontSize}px Syne, sans-serif`;
    offCtx.textBaseline = "top";
    
    const words = text.split(" ");
    let line = "";
    const lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = offCtx.measureText(testLine);
      if (metrics.width > width && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const lineHeight = clampedFontSize * 1.1;
    lines.forEach((l, i) => {
      offCtx.fillText(l, 0, i * lineHeight + 5);
    });

    const imgData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imgData.data;

    const N = 4;
    const targets = [];
    
    for (let py = 0; py < offscreen.height; py += N) {
      for (let px = 0; px < offscreen.width; px += N) {
        const index = (py * offscreen.width + px) * 4;
        // Sample alpha channel
        if (data[index + 3] > 128) {
          targets.push({ x: px, y: py });
        }
      }
    }

    if (targets.length > 6000) {
      targets.sort(() => Math.random() - 0.5);
      targets.length = 6000;
    }

    const startTime = performance.now();
    const particles = targets.map((t) => ({
      x: width + 50 + Math.random() * 200, 
      y: Math.random() * height,
      tx: t.x,
      ty: t.y,
      delayTime: startTime + Math.random() * 300,
    }));

    const timeoutId = setTimeout(() => {
      setPhase("complete");
    }, 2000);

    const render = (time: number) => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = particleColor;
      
      let allDone = true;

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (time < p.delayTime) {
           allDone = false;
           continue;
        }

        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 1) { 
          p.x += dx * 0.15; 
          p.y += dy * 0.15;
          allDone = false;
        } else {
          p.x = p.tx;
          p.y = p.ty;
        }

        ctx.moveTo(p.x + 1.2, p.y);
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      }
      ctx.fill();

      if (!allDone) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        setPhase("complete");
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(timeoutId);
    };
  }, [isIntersecting, text, fontSize, themeKey]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }} className={cn("w-full", className)}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          transition: 'opacity 0.3s',
          opacity: phase === "complete" ? 0 : 1,
          pointerEvents: 'none'
        }}
        className="w-full h-full"
      />
      <Tag 
        className={className}
        style={{ 
          opacity: phase === "complete" ? 1 : 0, 
          transition: 'opacity 0.3s', 
          visibility: phase === "complete" ? 'visible' : 'hidden' 
        }} 
      >
        {text}
      </Tag>
    </div>
  );
}
