"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "./actions";

const initialState = {
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-4 bg-[#00C9A7] text-[#000000] font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Authenticating..." : "Sign In"}
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-[#0a0a0a] dark:text-white flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300 relative">
      
      {/* Subtle Background Pattern matching Admin Dashboard */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-0" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute inset-0 z-0 opacity-0 dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/10 p-8 shadow-xl dark:shadow-2xl z-10 relative overflow-hidden">
        <div className="flex justify-center mb-8">
          <span className="font-vintage text-3xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
            Recolt<span className="text-[#00C9A7]">.</span>
          </span>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:outline-none focus:border-[#00C9A7]/50 text-sm text-[#0a0a0a] dark:text-white transition-colors placeholder:text-black/30 dark:placeholder:text-white/30 font-system"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:outline-none focus:border-[#00C9A7]/50 text-sm text-[#0a0a0a] dark:text-white transition-colors placeholder:text-black/30 dark:placeholder:text-white/30 font-system"
            />
          </div>
          
          {state?.error && (
            <p className="text-red-500 text-sm text-center font-medium animate-in fade-in">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
