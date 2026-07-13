"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronDown } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRIES = [
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇺🇸", code: "+1", name: "USA" },
  { flag: "🇬🇧", code: "+44", name: "UK" },
  { flag: "🇦🇪", code: "+971", name: "UAE" },
  { flag: "🇦🇺", code: "+61", name: "Australia" },
  { flag: "🇨🇦", code: "+1", name: "Canada" },
  { flag: "🇸🇬", code: "+65", name: "Singapore" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇫🇷", code: "+33", name: "France" },
  { flag: "🇯🇵", code: "+81", name: "Japan" },
  { flag: "🇧🇷", code: "+55", name: "Brazil" },
  { flag: "🇳🇬", code: "+234", name: "Nigeria" },
  { flag: "🇿🇦", code: "+27", name: "South Africa" },
  { flag: "🇸🇦", code: "+966", name: "Saudi Arabia" },
  { flag: "🇲🇾", code: "+60", name: "Malaysia" },
];

const budgetOptionsMap: Record<string, string[]> = {
  "₹ INR": [
    "Under ₹10,000",
    "₹10,000 - ₹50,000",
    "₹50,000 - ₹1,00,000",
    "₹1,00,000 - ₹5,00,000",
    "₹5,00,000+"
  ],
  "$ USD": [
    "Under $500",
    "$500 - $2,000",
    "$2,000 - $10,000",
    "$10,000+"
  ],
  "€ EUR": [
    "Under €500",
    "€500 - €2,000",
    "€2,000 - €10,000",
    "€10,000+"
  ],
  "£ GBP": [
    "Under £500",
    "£500 - £2,000",
    "£2,000 - £10,000",
    "£10,000+"
  ],
  "AED AED": [
    "Under AED 2,000",
    "AED 2,000 - AED 10,000",
    "AED 10,000+"
  ]
};

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
<<<<<<< HEAD
=======
  const [cooldown, setCooldown] = useState(0);
>>>>>>> 4f42d50 (Added Clarity)
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [service, setService] = useState("");
  const [currency, setCurrency] = useState("₹ INR");
  const [budgetRange, setBudgetRange] = useState("");
  const [message, setMessage] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(""); // Honeypot

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Country dropdown state
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setStatus("idle");
      setName("");
      setEmail("");
      setPhone("");
      setCountryCode("+91");
      setService("");
      setCurrency("₹ INR");
      setBudgetRange("");
      setMessage("");
      setTouched({});
      setIsCountryDropdownOpen(false);
      setCountrySearch("");
    }
  }, [isOpen]);

<<<<<<< HEAD
=======
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

>>>>>>> 4f42d50 (Added Clarity)
  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "This field is required";
    
    if (!email.trim()) {
      newErrors.email = "This field is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!phone.trim()) {
      newErrors.phone = "This field is required";
    } else if (!/^\d{7,12}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number (7-12 digits)";
    }
    
    if (!service) newErrors.service = "This field is required";
    if (!budgetRange) newErrors.budget = "This field is required";
    if (!message.trim()) newErrors.message = "This field is required";
    
    return newErrors;
  };

  const errors = validate();
  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    setBudgetRange("");
    handleBlur("budget");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setTouched({
      name: true,
      email: true,
      phone: true,
      service: true,
      budget: true,
      message: true
    });

    if (!isFormValid) return;
    
    setStatus("submitting");

    const currencyCode = currency.split(" ")[1];
    const data = {
      name,
      email,
      phone: `${countryCode} ${phone}`,
      service,
      budget: `${budgetRange} ${currencyCode}`,
      message,
      website_url: websiteUrl, // Honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
<<<<<<< HEAD
=======
        setCooldown(60);
>>>>>>> 4f42d50 (Added Clarity)
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error("Submission failed");
        alert("Failed to send message. Please try again later.");
        setStatus("idle");
      }
    } catch (error) {
      console.error("Submission error", error);
      setStatus("idle");
    }
  };

<<<<<<< HEAD
  const inputClasses = "w-full px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/5 focus:outline-none focus:border-foreground/30 text-sm text-foreground transition-colors placeholder:text-foreground/30 font-[family-name:var(--font-geist-sans)]";
  const errorInputClasses = "w-full px-4 py-3 rounded-xl border border-red-500/50 bg-red-500/5 focus:outline-none focus:border-red-500 text-sm text-foreground transition-colors placeholder:text-foreground/30 font-[family-name:var(--font-geist-sans)]";
=======
  const inputClasses = "w-full px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/5 focus:outline-none focus:border-foreground/30 text-sm text-foreground transition-colors placeholder:text-foreground/30 font-system tracking-normal";
  const errorInputClasses = "w-full px-4 py-3 rounded-xl border border-red-500/50 bg-red-500/5 focus:outline-none focus:border-red-500 text-sm text-foreground transition-colors placeholder:text-foreground/30 font-system tracking-normal";
>>>>>>> 4f42d50 (Added Clarity)
  
  const selectWrapperClasses = "relative w-full";
  const selectIconClasses = "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none";

  const renderError = (field: string) => {
    if (touched[field] && errors[field]) {
      return <p className="text-red-500 text-xs mt-1 ml-1">{errors[field]}</p>;
    }
    return null;
  };

  const getInputClass = (field: string) => {
    return touched[field] && errors[field] ? errorInputClasses : inputClasses;
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto py-10">
      <div className="w-full max-w-lg rounded-2xl bg-background border border-foreground/10 p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle2 className="w-16 h-16 text-[#00C9A7] mb-4" />
            <h2 className="text-2xl font-bold mb-2">Message sent!</h2>
            <p className="text-foreground/50 text-sm">We'll get back to you soon.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Let's talk.</h2>
            <p className="text-foreground/40 text-sm mb-6 mt-1">Tell us what you're building.</p>

<<<<<<< HEAD
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-[family-name:var(--font-geist-sans)]">
=======
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
>>>>>>> 4f42d50 (Added Clarity)
              <input 
                type="text" 
                name="website_url" 
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />
              <div>
                <input 
                  type="text" 
                  name="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Your Name" 
                  className={getInputClass("name")}
                  disabled={status === "submitting"}
                />
                {renderError("name")}
              </div>
              
              <div>
                <input 
                  type="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="Your Email" 
                  className={getInputClass("email")}
                  disabled={status === "submitting"}
                />
                {renderError("email")}
              </div>

              <div>
                <div className="flex gap-2">
                  <div className="relative w-[120px] shrink-0">
                    <div 
                      onClick={() => !status.includes("submitting") && setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={`${inputClasses} flex items-center justify-between cursor-pointer px-3 ${status === "submitting" ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-base leading-none">{selectedCountry.flag}</span> 
                        <span className="text-sm font-medium">{selectedCountry.code}</span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-foreground/50" />
                    </div>
                    
                    {isCountryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-[220px] bg-background border border-foreground/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-2 border-b border-foreground/5">
                            <input 
                              type="text" 
                              placeholder="Search country..." 
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
<<<<<<< HEAD
                              className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#00C9A7]/50 text-foreground transition-colors placeholder:text-foreground/30"
=======
                              className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#00C9A7]/50 text-foreground transition-colors placeholder:text-foreground/30 font-system tracking-normal"
>>>>>>> 4f42d50 (Added Clarity)
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                            {filteredCountries.length > 0 ? filteredCountries.map(c => (
                              <div 
                                key={c.name} 
                                onClick={() => { setCountryCode(c.code); setIsCountryDropdownOpen(false); setCountrySearch(""); handleBlur("phone"); }}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-foreground/5 rounded-lg cursor-pointer transition-colors"
                              >
                                <span className="text-base leading-none">{c.flag}</span>
                                <span className="text-foreground/50 w-10 font-medium">{c.code}</span>
<<<<<<< HEAD
                                <span className="truncate">{c.name}</span>
=======
                                <span className="truncate font-system">{c.name}</span>
>>>>>>> 4f42d50 (Added Clarity)
                              </div>
                            )) : (
                              <div className="p-3 text-center text-xs text-foreground/40">No countries found</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="relative flex-1 min-w-0">
                    <input 
                      type="tel" 
                      name="phone" 
                      value={phone}
                      maxLength={12}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Restrict to digits only on input
                      onBlur={() => handleBlur("phone")}
                      placeholder="Phone Number" 
                      className={getInputClass("phone")}
                      disabled={status === "submitting"}
                    />
                  </div>
                </div>
                {renderError("phone")}
              </div>

              <div>
                <div className={selectWrapperClasses}>
                  <select 
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    onBlur={() => handleBlur("service")}
                    className={`${getInputClass("service")} appearance-none cursor-pointer ${!service ? "text-foreground/30" : ""}`}
                    disabled={status === "submitting"}
                  >
                    <option value="" disabled hidden>Select Service</option>
                    <option value="SaaS Development" className="text-foreground bg-background">SaaS Development</option>
                    <option value="AI Integrations" className="text-foreground bg-background">AI Integrations</option>
                    <option value="Motion Design" className="text-foreground bg-background">Motion Design</option>
                    <option value="Full Stack" className="text-foreground bg-background">Full Stack</option>
                    <option value="Graphic Designing" className="text-foreground bg-background">Graphic Designing</option>
                    <option value="Video Editing" className="text-foreground bg-background">Video Editing</option>
                  </select>
                  <ChevronDown className={selectIconClasses} />
                </div>
                {renderError("service")}
              </div>

              <div>
                <div className="flex gap-2">
                  <div className="relative w-[110px] shrink-0">
                    <select 
                      value={currency}
                      onChange={handleCurrencyChange}
                      className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                      disabled={status === "submitting"}
                    >
                      {Object.keys(budgetOptionsMap).map((curr) => (
                        <option key={curr} value={curr} className="text-foreground bg-background">{curr}</option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClasses} />
                  </div>
                  
                  <div className="relative flex-1 min-w-0">
                    <select 
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      onBlur={() => handleBlur("budget")}
                      className={`${getInputClass("budget")} appearance-none cursor-pointer ${!budgetRange ? "text-foreground/30" : ""}`}
                      disabled={status === "submitting"}
                    >
                      <option value="" disabled hidden>Select Budget</option>
                      {budgetOptionsMap[currency].map((range) => (
                        <option key={range} value={range} className="text-foreground bg-background">{range}</option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClasses} />
                  </div>
                </div>
                {renderError("budget")}
              </div>

              <div>
                <textarea 
                  name="message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => handleBlur("message")}
                  rows={4} 
                  placeholder="Tell us about your project..."
                  className={getInputClass("message")}
                  disabled={status === "submitting"}
                ></textarea>
                {renderError("message")}
              </div>

              <button 
                type="submit" 
<<<<<<< HEAD
                disabled={status === "submitting" || !isFormValid}
                className="w-full mt-2 bg-[#00C9A7] text-[#000000] font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 hover:enabled:opacity-90 disabled:cursor-not-allowed"
=======
                disabled={status === "submitting" || !isFormValid || cooldown > 0}
                className="w-full mt-2 bg-[#00C9A7] text-[#000000] font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 hover:enabled:opacity-90 disabled:cursor-not-allowed font-system tracking-normal"
>>>>>>> 4f42d50 (Added Clarity)
              >
                {status === "submitting" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    Sending...
                  </>
<<<<<<< HEAD
=======
                ) : cooldown > 0 ? (
                  `Please wait ${cooldown}s before submitting again`
>>>>>>> 4f42d50 (Added Clarity)
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
