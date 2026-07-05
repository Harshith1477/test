"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
}

export function ServiceCard({ number, title, description }: ServiceCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-[2rem] group",
        "bg-[#f5f5f5] dark:bg-[#141414]",
        "border border-[#e0e0e0] dark:border-[#222] border-l-[4px] border-l-transparent",
        "transition-all duration-300 ease-out",
        "hover:border-[rgba(0,0,0,0.15)] dark:hover:border-[rgba(255,255,255,0.15)]",
        "hover:border-l-[#0a0a0a] dark:hover:border-l-[#fff]",
        "hover:shadow-[0_0_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.04)]",
        "hover:-translate-y-[2px]"
      )}
    >
      <div className="text-[#999] dark:text-[#666] text-[11px] tracking-[0.15em] font-mono mb-6">
        {number}
      </div>

      <h3 className="text-[#0a0a0a] dark:text-white text-xl md:text-2xl font-bold font-[family-name:var(--font-syne)] mb-2">
        {title}
      </h3>
      <p className="text-[#555] dark:text-[#888] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
