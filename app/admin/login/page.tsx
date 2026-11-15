"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect password. Please try again.");
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-lg border-2 border-cream-300 bg-cream-50 p-6 sm:p-8 shadow-paper-lift text-indigo">
      {/* Header with Ribbon */}
      <div className="text-center mb-6">
        <div className="ribbon-tag px-4 py-1 mb-3 text-sm font-bold shadow-sm">
          <span>Owner Access</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-indigo-deep">
          Shree Sai Restaurant
        </h1>
        <p className="font-sans text-xs text-indigo-muted mt-1">
          Menu Management & Price Control
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded bg-ribbon/10 border border-ribbon/30 text-ribbon-dark text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-indigo-muted mb-1.5"
          >
            Admin Password
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              required
              autoFocus
              className="w-full min-h-[46px] pl-3 pr-10 py-2 rounded border border-cream-300 bg-cream-100/60 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ribbon/40 focus:border-ribbon text-indigo-deep shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 p-1 text-indigo-muted hover:text-indigo transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded bg-indigo hover:bg-indigo-deep text-white font-semibold text-sm transition-colors shadow-paper disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>{loading ? "Checking..." : "Unlock Menu"}</span>
        </button>
      </form>

      {/* Back Link */}
      <div className="mt-6 pt-4 border-t border-cream-200 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-muted hover:text-indigo hover:underline min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Menu</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-100">
      <Suspense
        fallback={
          <div className="text-center font-serif text-indigo-muted">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
