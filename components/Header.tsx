import React from "react";
import { HandDrawnDivider } from "./GroupMotifs";

function ChefMascotEmblem({ size = 52 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto select-none drop-shadow-xs"
      aria-hidden="true"
    >
      {/* Outer warm medallion with double ring */}
      <circle cx="100" cy="100" r="95" fill="#FBF6EA" stroke="#1F2A6B" strokeWidth="4" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#B3202A" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Decorative rays inside background */}
      <circle cx="100" cy="100" r="82" fill="#F6EFE0" />

      {/* Chef Mascot Character */}
      {/* 1. Neckerchief Ribbon (Tied Red Scarf) */}
      <path
        d="M 85 130 Q 100 138 115 130 L 120 148 L 100 142 L 80 148 Z"
        fill="#B3202A"
        stroke="#1F2A6B"
        strokeWidth="1.5"
      />
      <circle cx="100" cy="135" r="3" fill="#D9A441" />

      {/* 2. Round Smiling Face */}
      <ellipse cx="100" cy="98" rx="28" ry="26" fill="#FCE7D2" stroke="#1F2A6B" strokeWidth="2.5" />

      {/* 3. Cheerful Eyes */}
      <path d="M 86 92 Q 91 87 96 92" stroke="#1F2A6B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 104 92 Q 109 87 114 92" stroke="#1F2A6B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* 4. Rosy Cheeks */}
      <circle cx="82" cy="102" r="3.5" fill="#E88B8B" opacity="0.6" />
      <circle cx="118" cy="102" r="3.5" fill="#E88B8B" opacity="0.6" />

      {/* 5. Classic Indian Chef Mustache */}
      <path
        d="M 100 106 C 94 102 82 103 78 110 C 86 113 96 110 100 112 C 104 110 114 113 122 110 C 118 103 106 102 100 106 Z"
        fill="#1F2A6B"
      />

      {/* 6. Smiling Open Mouth */}
      <path d="M 93 114 Q 100 122 107 114" stroke="#B3202A" strokeWidth="2" strokeLinecap="round" fill="#B3202A" />

      {/* 7. Tall Pleated Chef Toque Hat */}
      <path
        d="M 72 78 L 128 78 L 124 66 C 136 64 142 48 132 36 C 122 24 108 26 100 24 C 92 26 78 24 68 36 C 58 48 64 64 76 66 Z"
        fill="#FFFFFF"
        stroke="#1F2A6B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M 86 64 L 88 38" stroke="#1F2A6B" strokeWidth="1.2" opacity="0.3" />
      <path d="M 100 62 L 100 32" stroke="#1F2A6B" strokeWidth="1.2" opacity="0.3" />
      <path d="M 114 64 L 112 38" stroke="#1F2A6B" strokeWidth="1.2" opacity="0.3" />
      {/* Hat band with red accent */}
      <rect x="74" y="68" width="52" height="10" rx="2" fill="#B3202A" stroke="#1F2A6B" strokeWidth="1.5" />
      <rect x="76" y="71" width="48" height="4" fill="#D9A441" />

      {/* Ribbon Banner */}
      <g transform="translate(0, 15)">
        <path
          d="M 28 152 L 40 144 L 28 136 L 46 136 L 154 136 L 172 136 L 160 144 L 172 152 L 154 152 L 46 152 Z"
          fill="#B3202A"
          stroke="#1F2A6B"
          strokeWidth="1.5"
        />
        <text
          x="100"
          y="146"
          fontFamily="serif"
          fontWeight="900"
          fontSize="11"
          letterSpacing="2"
          fill="#FFFFFF"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          SHREE SAI
        </text>
      </g>
    </svg>
  );
}

interface HeaderProps {
  tableNumber?: string | null;
  lang: "en" | "gu";
  restaurant: {
    name: string;
    guName: string;
    tagline: string;
    guTagline: string;
    since: number;
    address: string;
    guAddress: string;
    city: string;
    guCity: string;
  };
}

export function Header({ tableNumber, lang, restaurant }: HeaderProps) {
  const isGu = lang === "gu";

  return (
    <header className="relative w-full pt-3 pb-2.5 px-4 text-center border-b border-cream-300 bg-cream-50/80">
      {/* Optional Table Number Badge */}
      {tableNumber && (
        <div className="mb-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-cream-200 text-indigo border border-cream-300">
          <span className="w-1.5 h-1.5 rounded-full bg-ribbon animate-pulse"></span>
          <span>{isGu ? `ટેબલ ${tableNumber}` : `Table ${tableNumber}`}</span>
        </div>
      )}

      {/* Menu Cover Layout: Chef mascot, Wordmark on ribbon, Subtitle, Divider */}
      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
        <ChefMascotEmblem size={52} />

        {/* Wordmark Title on Red Ribbon */}
        <div className="my-1">
          <span className="ribbon-tag font-serif text-lg sm:text-xl font-bold tracking-wide uppercase shadow-2xs">
            {isGu ? restaurant.guName : restaurant.name}
          </span>
        </div>

        {/* Since 1989 · Salabatpura, Surat in small caps */}
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-indigo-muted mt-0.5">
          {isGu
            ? `૧૯૮૯ થી · ${restaurant.guAddress}, ${restaurant.guCity}`
            : `Since ${restaurant.since} · ${restaurant.address}, ${restaurant.city}`}
        </p>

        {/* Hand-Drawn Divider */}
        <div className="w-36 my-1">
          <HandDrawnDivider className="text-cream-400" />
        </div>
      </div>
    </header>
  );
}
