import React from "react";
import { ThemeToggle } from "./ThemeToggle";

function PhoneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

interface FooterProps {
  lang: "en" | "gu";
  restaurant: {
    name: string;
    guName: string;
    since: number;
    address: string;
    guAddress: string;
    city: string;
    guCity: string;
    phones: string[];
    mapsUrl: string;
  };
}

export function Footer({ lang, restaurant }: FooterProps) {
  const isGu = lang === "gu";

  return (
    <footer className="w-full mt-12 pt-8 pb-12 px-4 border-t-2 border-cream-300 bg-cream-50/70 text-indigo text-center">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Decorative divider ornament */}
        <div className="flex items-center justify-center gap-2 mb-4 text-cream-400">
          <div className="w-12 h-px bg-cream-300"></div>
          <span className="text-ribbon text-sm font-serif">❦</span>
          <div className="w-12 h-px bg-cream-300"></div>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-indigo-deep">
          {isGu ? restaurant.guName : restaurant.name}
        </h2>

        <p className="font-serif italic text-xs sm:text-sm text-indigo-muted mt-0.5">
          {isGu
            ? `સ્વાદ અને ગુણવત્તાની પરંપરા - ૧૯૮૯ થી`
            : `A tradition of pure taste since ${restaurant.since}`}
        </p>

        <p className="text-xs text-indigo-muted/90 mt-2 font-medium">
          {isGu
            ? `${restaurant.guAddress}, ${restaurant.guCity} (ગુજરાત)`
            : `${restaurant.address}, ${restaurant.city} (Gujarat)`}
        </p>

        {/* Tap to Call Buttons */}
        <div className="mt-5 w-full flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {restaurant.phones.map((phone, idx) => {
            const formatted = phone.replace(/(\d{5})(\d{5})/, "$1 $2");
            return (
              <a
                key={idx}
                href={`tel:${phone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-md bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo transition-colors shadow-paper"
              >
                <PhoneIcon className="w-3.5 h-3.5 text-ribbon" />
                <span>{formatted}</span>
              </a>
            );
          })}
        </div>

        {/* Directions Link */}
        <div className="mt-3 w-full">
          <a
            href={restaurant.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 text-xs sm:text-sm font-semibold rounded-md bg-indigo text-cream-50 hover:bg-indigo-deep transition-colors shadow-paper"
          >
            <MapPinIcon className="w-3.5 h-3.5 text-cream-200" />
            <span>{isGu ? "દિશા-નિર્દેશ મેળવો (Google Maps)" : "Get Directions"}</span>
            <ExternalLinkIcon className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Theme mode toggle */}
        <div className="mt-6 flex items-center justify-center">
          <ThemeToggle />
        </div>

        {/* Copyright notice */}
        <div className="mt-6 pt-4 border-t border-cream-300/60 text-xs text-indigo-muted font-medium">
          <p>© {new Date().getFullYear()} {restaurant.name} · All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
