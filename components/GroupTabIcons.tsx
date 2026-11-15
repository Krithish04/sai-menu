import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Custom line-drawn 1.5px stroke culinary icons for Shree Sai group tabs.
 * Ink-coloured, responsive to currentColor, 100% original geometry.
 */

// 1. South Indian: Rolled Dosa
export function DosaIcon({ className = "w-4 h-4", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Rolled cylinder body */}
      <path d="M 3.5 14.5 L 14.5 5.5" />
      <path d="M 5.5 16.5 L 16.5 7.5" />
      {/* Curved ends */}
      <ellipse cx="4.5" cy="15.5" rx="1.5" ry="1.5" transform="rotate(-45 4.5 15.5)" />
      <path d="M 14.5 5.5 C 15.5 4.5 17.5 6.5 16.5 7.5" />
      {/* Golden roast mark lines */}
      <path d="M 8.5 11.5 L 10 10" />
      <path d="M 11.5 8.5 L 13 7" />
    </svg>
  );
}

// 2. Pav Bhaji & Pulav: Pav Buns (pair of soft baked buns)
export function PavIcon({ className = "w-4 h-4", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Flat bottom base */}
      <path d="M 3 15 L 17 15" />
      {/* Left bun dome */}
      <path d="M 3 15 V 10 C 3 7 7 6.5 10 7 V 15" />
      {/* Right bun dome */}
      <path d="M 10 7 C 13 6.5 17 7 17 10 V 15" />
      {/* Split seam in middle */}
      <path d="M 10 8 V 14" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

// 3. Sandwich & Grill: Triangular Toast with Grill Marks
export function SandwichIcon({ className = "w-4 h-4", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Triangle sandwich wedge */}
      <polygon points="3.5,16 16.5,16 10,4" />
      {/* Diagonal grill lines */}
      <line x1="7" y1="12" x2="11" y2="16" />
      <line x1="9" y1="8" x2="14" y2="13" />
    </svg>
  );
}

// 4. Pizza & Burger: Pizza Slice
export function PizzaSliceIcon({ className = "w-4 h-4", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Crust curve at top */}
      <path d="M 4 5.5 Q 10 3.5 16 5.5" />
      {/* V wedge to tip */}
      <path d="M 4 5.5 L 10 17 L 16 5.5" />
      {/* Small circle toppings */}
      <circle cx="8.5" cy="8.5" r="1" />
      <circle cx="12" cy="10" r="1" />
      <circle cx="10" cy="13" r="0.8" />
    </svg>
  );
}

// 5. Chinese Fast Food: Noodle Bowl with Chopsticks
export function NoodleBowlIcon({ className = "w-4 h-4", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Bowl rim and body */}
      <path d="M 3 10 C 3 15.5 6 16.5 10 16.5 C 14 16.5 17 15.5 17 10 Z" />
      {/* Bowl foot */}
      <path d="M 7.5 16.5 L 12.5 16.5" />
      {/* Wavy noodles rising */}
      <path d="M 6 8 Q 8 6 10 8 Q 12 10 14 8" />
      {/* Chopsticks angled across */}
      <line x1="4" y1="5.5" x2="16.5" y2="9.5" />
    </svg>
  );
}

// 6. Cold Drinks: Beverage Glass with Straw
export function GlassIcon({ className = "w-4 h-4", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Tumbler glass walls */}
      <path d="M 5.5 4.5 L 7 16.5 H 13 L 14.5 4.5 Z" />
      {/* Liquid level */}
      <line x1="6.3" y1="8.5" x2="13.7" y2="8.5" strokeDasharray="1 1.5" />
      {/* Diagonal straw sticking out */}
      <line x1="11" y1="12" x2="14.5" y2="2" />
      <line x1="14.5" y1="2" x2="16.5" y2="3" />
    </svg>
  );
}

export function getGroupTabIcon(groupId: string, className = "w-4 h-4") {
  const id = groupId.toLowerCase();
  if (id.includes("south-indian") || id.includes("dosa")) {
    return <DosaIcon className={className} />;
  }
  if (id.includes("pav") || id.includes("bhaji") || id.includes("pulav")) {
    return <PavIcon className={className} />;
  }
  if (id.includes("sandwich") || id.includes("grill")) {
    return <SandwichIcon className={className} />;
  }
  if (id.includes("pizza") || id.includes("burger")) {
    return <PizzaSliceIcon className={className} />;
  }
  if (id.includes("chinese")) {
    return <NoodleBowlIcon className={className} />;
  }
  if (id.includes("drink") || id.includes("cold")) {
    return <GlassIcon className={className} />;
  }
  return <DosaIcon className={className} />;
}
