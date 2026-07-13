"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

interface Project {
  title: string;
  video: string;
  link: string;
}

const projects: Project[] = [
  { title: "PROJECT NAME 1", video: "/projects/video-1..mp4", link: "https://neonix-vr.netlify.app/" },
  { title: "PROJECT NAME 2", video: "/projects/video-2.mp4", link: "https://spiderman-flax.vercel.app/" },
  { title: "PROJECT NAME 3", video: "/projects/video-3.mp4", link: "https://restaurant-phi-roan-34.vercel.app/" },
  { title: "PROJECT NAME 4", video: "/projects/video-4.mp4", link: "https://cloud-kitchen-sage.vercel.app/" },
];

function ProjectCard({ project }: { project: Project }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col h-full bg-[#141414] border border-white/10 rounded-xl p-4"
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-video overflow-hidden rounded-lg bg-zinc-900 cursor-pointer"
      >
        {shouldLoad && (
          <video
            ref={videoRef}
            src={project.video}
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col flex-1 items-center justify-center mt-5">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${project.title} website`}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-red-600 hover:text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
        >
          Visit Site
          <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}

export function OurWork() {
  return (
    <section className="w-full bg-[#0a0a0a] py-24 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center uppercase tracking-wide text-red-500/80 text-sm md:text-base font-bold mb-16">
          Selected projects we&apos;re proud to have shipped
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.video} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
