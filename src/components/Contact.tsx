"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Status = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(""); // Honeypot
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 500);

    const ctx = gsap.context(() => {
      gsap.from(".form-field", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => {
      clearTimeout(focusTimer);
      ctx.revert();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() || undefined,
          message,
          website_url: websiteUrl,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setStatus("error");
    }
  };

  const inputClasses =
    "form-field w-full bg-transparent border-b border-white/20 focus:border-white text-white placeholder:text-white/40 py-3 outline-none transition-colors font-system tracking-normal";

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="w-full min-h-screen bg-[#080808] flex items-center justify-center px-6 py-32"
    >
      <div className="w-full max-w-xl">
        <h1 className="form-field text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-3 font-[family-name:var(--font-syne)]">
          Get In Touch
        </h1>
        <p className="form-field text-lg text-zinc-500 mb-12">Tell us what you&apos;re building.</p>

        {status === "success" ? (
          <p className="form-field text-white text-lg">
            Message sent — we&apos;ll get back to you soon.
          </p>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-8">
            <input
              type="text"
              name="website_url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <input
              ref={nameInputRef}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={status === "submitting"}
              className={inputClasses}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "submitting"}
              className={inputClasses}
            />

            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={status === "submitting"}
              className={inputClasses}
            />

            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              disabled={status === "submitting"}
              className={inputClasses}
            />

            {status === "error" && (
              <p className="form-field text-red-500 text-sm">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="form-field mt-2 bg-white text-black uppercase font-bold tracking-wide py-4 px-8 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
