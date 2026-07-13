"use client";

import React, { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { submitOnboardingForm, verifyOnboardingToken } from "../../actions";

export default function OnboardingFormPage(props: { params: Promise<{ token: string; "form-type": string }> }) {
  const params = use(props.params);
  const token = params.token;
  const formType = params["form-type"];

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [clientInfo, setClientInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function verify() {
      const res = await verifyOnboardingToken(token);
      if (!res.success) {
        setError("Invalid or expired token.");
      } else {
        setClientInfo(res.client ? { name: res.client.name, email: res.client.email } : null);
      }
      setVerifying(false);
    }
    verify();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitOnboardingForm(token, formType, formData);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Failed to submit form.");
    }
    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C9A7]" />
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#121212] border border-red-500/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">!</div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-white/60 mb-8">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 selection:bg-[#00C9A7]/30 selection:text-white">
        <div className="max-w-md w-full bg-[#121212] border border-white/5 rounded-2xl p-10 text-center animate-in fade-in zoom-in duration-500 shadow-[0_0_50px_rgba(0,201,167,0.05)]">
          <CheckCircle2 className="w-20 h-20 text-[#00C9A7] mx-auto mb-6" />
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-4 tracking-tight">Received.</h1>
          <p className="text-white/60 mb-2">Thank you, {clientInfo?.name || "there"}. We've securely saved your responses.</p>
          <p className="text-white/40 text-sm">You can close this window now. We'll be in touch with the next steps soon.</p>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C9A7]/50 transition-colors placeholder:text-white/20";
  const labelClasses = "block text-sm font-medium text-white/60 mb-2 uppercase tracking-wider text-[11px]";

  const renderFormFields = () => {
    switch (formType) {
      case "welcome":
        return (
          <>
            <div>
              <label className={labelClasses}>Full Name</label>
              <input type="text" name="name" required onChange={handleChange} className={inputClasses} placeholder="John Doe" defaultValue={clientInfo?.name || ""} />
            </div>
            <div>
              <label className={labelClasses}>Company / Organization</label>
              <input type="text" name="company" required onChange={handleChange} className={inputClasses} placeholder="Acme Corp" />
            </div>
            <div>
              <label className={labelClasses}>Phone Number</label>
              <input type="tel" name="phone" required onChange={handleChange} className={inputClasses} placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className={labelClasses}>Social Links / Website</label>
              <input type="url" name="social_links" onChange={handleChange} className={inputClasses} placeholder="https://..." />
            </div>
          </>
        );
      case "project-brief":
        return (
          <>
            <div>
              <label className={labelClasses}>Project Type</label>
              <select name="project_type" required onChange={handleChange} className={`${inputClasses} appearance-none`}>
                <option value="" disabled selected>Select type...</option>
                <option value="SaaS Development">SaaS Development</option>
                <option value="AI Integrations">AI Integrations</option>
                <option value="Motion Design">Motion Design</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Graphic Designing">Graphic Designing</option>
                <option value="Video Editing">Video Editing</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Primary Goals</label>
              <textarea name="goals" required onChange={handleChange} className={inputClasses} rows={3} placeholder="What does success look like?"></textarea>
            </div>
            <div>
              <label className={labelClasses}>Key Features & Pages</label>
              <textarea name="features" required onChange={handleChange} className={inputClasses} rows={3} placeholder="List out the main functionality..."></textarea>
            </div>
            <div>
              <label className={labelClasses}>Target Audience</label>
              <input type="text" name="target_audience" required onChange={handleChange} className={inputClasses} placeholder="Who are we building for?" />
            </div>
            <div>
              <label className={labelClasses}>Design References</label>
              <textarea name="references" onChange={handleChange} className={inputClasses} rows={2} placeholder="Links to sites you like..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Budget Range</label>
                <input type="text" name="budget" required onChange={handleChange} className={inputClasses} placeholder="e.g. $5k - $10k" />
              </div>
              <div>
                <label className={labelClasses}>Target Deadline</label>
                <input type="date" name="deadline" required onChange={handleChange} className={inputClasses} />
              </div>
            </div>
          </>
        );
      case "brand-assets":
        return (
          <>
            <div>
              <label className={labelClasses}>Existing Website URL</label>
              <input type="url" name="existing_url" onChange={handleChange} className={inputClasses} placeholder="https://..." />
            </div>
            <div>
              <label className={labelClasses}>Logo URL / Drive Link</label>
              <input type="url" name="logo_url" required onChange={handleChange} className={inputClasses} placeholder="Google Drive, Dropbox, etc." />
            </div>
            <div>
              <label className={labelClasses}>Brand Colors (Hex Codes)</label>
              <input type="text" name="colors" required onChange={handleChange} className={inputClasses} placeholder="#00C9A7, #121212..." />
            </div>
            <div>
              <label className={labelClasses}>Brand Typography / Fonts</label>
              <input type="text" name="fonts" required onChange={handleChange} className={inputClasses} placeholder="Inter, Syne..." />
            </div>
          </>
        );
      case "terms":
        return (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-64 overflow-y-auto mb-6 text-sm text-white/70 space-y-4 custom-scrollbar">
              <h3 className="text-white font-bold mb-2">Terms & Conditions</h3>
              <p>1. <strong>Scope of Work</strong>: Recolt will provide design and development services as outlined in the accepted proposal.</p>
              <p>2. <strong>Payment Terms</strong>: A 50% non-refundable deposit is required to commence work. The remaining 50% is due upon completion, prior to final deployment.</p>
              <p>3. <strong>Revisions</strong>: Projects include 2 rounds of major revisions. Additional revisions will be billed at our hourly rate.</p>
              <p>4. <strong>Intellectual Property</strong>: Upon final payment, the client owns the final deployed code and design assets. Recolt retains the right to display the work in our portfolio.</p>
              <p>5. <strong>Confidentiality</strong>: Both parties agree to keep sensitive business information strictly confidential.</p>
            </div>
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input type="checkbox" name="accepted_terms" required onChange={handleChange} className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-[#00C9A7] checked:border-[#00C9A7] transition-all cursor-pointer" />
                <CheckCircle2 className="w-3 h-3 text-black absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                I have read and agree to the Terms & Conditions outlined above. I understand that by checking this box, I am entering into a legally binding agreement.
              </span>
            </label>
          </>
        );
      case "feedback":
        return (
          <>
            <div>
              <label className={labelClasses}>Rate your experience (1-5)</label>
              <select name="rating" required onChange={handleChange} className={`${inputClasses} appearance-none`}>
                <option value="" disabled selected>Select rating...</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Below Average</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Testimonial</label>
              <textarea name="testimonial" required onChange={handleChange} className={inputClasses} rows={4} placeholder="A few words about working with us..."></textarea>
            </div>
            <div>
              <label className={labelClasses}>Areas for Improvement</label>
              <textarea name="improvements" onChange={handleChange} className={inputClasses} rows={3} placeholder="How can we do better next time?"></textarea>
            </div>
          </>
        );
      default:
        return <div className="text-red-500">Unknown form type.</div>;
    }
  };

  const formTitles: Record<string, string> = {
    "welcome": "Welcome to Recolt.",
    "project-brief": "Project Brief.",
    "brand-assets": "Brand Assets.",
    "terms": "Sign Off.",
    "feedback": "Feedback.",
  };

  const formDescriptions: Record<string, string> = {
    "welcome": "Let's start with the basics. Tell us a bit about yourself.",
    "project-brief": "Help us understand exactly what we're building.",
    "brand-assets": "Provide the visual building blocks for your brand.",
    "terms": "Please review and accept our standard operating terms.",
    "feedback": "Your thoughts help us refine our cinematic process.",
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative selection:bg-[#00C9A7]/30 selection:text-white">
      {/* Background aesthetics */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#00C9A7]/5 via-transparent to-transparent pointer-events-none z-0"></div>

      <div className="w-full max-w-xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 text-center">
          <span className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-widest uppercase text-white/50 mb-4 block">
            Recolt Onboarding
          </span>
          <h1 className="font-[family-name:var(--font-syne)] text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {formTitles[formType] || "Onboarding Form."}
          </h1>
          <p className="text-white/50 text-lg">
            {formDescriptions[formType]}
          </p>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00C9A7]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormFields()}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 bg-white hover:bg-[#00C9A7] text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Submit Step
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
