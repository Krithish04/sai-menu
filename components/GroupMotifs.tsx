import React from "react";

interface MotifProps {
  className?: string;
  size?: number;
}

/**
 * Hand-drawn authentic culinary motifs for Shree Sai Restaurant groups
 * Zero AI stock icons; custom inline SVG geometry styled in brand palette.
 */

// 1. South Indian: Rolled golden dosa with chutney cup
function DosaMotif({ className = "", size = 28 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Banana leaf base */}
      <path
        d="M 3 24 C 8 20 20 20 29 25 C 20 28 8 27 3 24 Z"
        fill="#4A6B3D"
        opacity="0.3"
      />
      {/* Rolled Dosa body */}
      <path
        d="M 4 20 L 26 12 C 28 11 29 13 28 15 L 6 23 C 4 24 3 22 4 20 Z"
        fill="#D49B42"
        stroke="#141B42"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Golden roast shade lines */}
      <path d="M 9 19 L 23 14" stroke="#B87322" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M 11 21 L 21 17" stroke="#B87322" strokeWidth="0.8" />
      {/* Chutney katori */}
      <circle cx="25" cy="22" r="3.5" fill="#F7EFE1" stroke="#141B42" strokeWidth="1" />
      <circle cx="25" cy="22" r="2" fill="#B8222B" opacity="0.8" />
    </svg>
  );
}

// 2. Pav Bhaji: Bhaji pan with butter dollop and fluffy pav buns
function PavMotif({ className = "", size = 28 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tawa / plate rim */}
      <ellipse cx="16" cy="23" rx="13" ry="5.5" fill="#E2D2B8" stroke="#141B42" strokeWidth="1.2" />
      {/* Rich red bhaji gravy */}
      <ellipse cx="12" cy="23" rx="6.5" ry="3.5" fill="#B8222B" />
      {/* Butter dollop */}
      <rect x="10.5" y="21" width="3" height="2" rx="0.5" fill="#FFDC69" stroke="#B87322" strokeWidth="0.5" />
      {/* Soft pav buns (pair) */}
      <path
        d="M 18 19 C 18 15.5 21 15 22.5 15 C 24 15 27 15.5 27 19 L 18 19 Z"
        fill="#E8B872"
        stroke="#141B42"
        strokeWidth="1"
      />
      <path
        d="M 21.5 19 C 21.5 16 24 15.5 25.5 15.5 C 27 15.5 29.5 16 29.5 19 L 21.5 19 Z"
        fill="#DCA357"
        stroke="#141B42"
        strokeWidth="1"
      />
      {/* Steam whisps */}
      <path d="M 11 17 C 10 14 13 13 12 10" stroke="#141B42" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// 3. Sandwich & Grill: Triangular toasted sandwich with grill marks
function SandwichMotif({ className = "", size = 28 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Toast triangle bottom slice */}
      <path
        d="M 4 25 L 28 25 L 16 7 Z"
        fill="#EDC58A"
        stroke="#141B42"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Veggie & cheese filling layer */}
      <path d="M 7 24 L 25 24" stroke="#4A6B3D" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 10 22.5 L 22 22.5" stroke="#B8222B" strokeWidth="1.5" />
      <path d="M 12 21.5 L 20 21.5" stroke="#FFDC69" strokeWidth="1" />
      {/* Grill marks across the bread */}
      <line x1="10" y1="13" x2="18" y2="21" stroke="#8C4E15" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="11" x2="21" y2="18" stroke="#8C4E15" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="#8C4E15" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 4. Pizza & Burger: Crisp pizza slice with cheese pull
function PizzaMotif({ className = "", size = 28 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pizza crust back arc */}
      <path
        d="M 5 10 C 12 7 20 7 27 10"
        stroke="#9E5D20"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Triangular slice body */}
      <path
        d="M 6 11 L 16 27 L 26 11 C 20 8.5 12 8.5 6 11 Z"
        fill="#FFCE54"
        stroke="#141B42"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Tomato sauce & veggie toppings */}
      <circle cx="13" cy="15" r="1.8" fill="#B8222B" />
      <circle cx="18" cy="18" r="1.5" fill="#4A6B3D" />
      <circle cx="15" cy="22" r="1.2" fill="#B8222B" />
      <rect x="18" y="12" width="2" height="2" rx="0.5" fill="#141B42" opacity="0.6" />
    </svg>
  );
}

// 5. Chinese: Steaming noodle bowl with chopsticks
function ChineseMotif({ className = "", size = 28 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bowl base */}
      <path
        d="M 6 16 C 6 24 11 26 16 26 C 21 26 26 24 26 16 Z"
        fill="#B8222B"
        stroke="#141B42"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Bowl rim foot */}
      <rect x="13" y="26" width="6" height="1.5" rx="0.5" fill="#141B42" />
      {/* Noodles heap */}
      <ellipse cx="16" cy="16" rx="9.5" ry="3.5" fill="#FFDC69" stroke="#141B42" strokeWidth="1" />
      {/* Chopsticks crossing diagonally */}
      <line x1="3" y1="9" x2="25" y2="18" stroke="#141B42" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="4" y1="6" x2="24" y2="16" stroke="#141B42" strokeWidth="1.2" strokeLinecap="round" />
      {/* Steam lines */}
      <path d="M 13 12 C 12 9 15 8 14 5" stroke="#141B42" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M 18 12 C 17 9 20 8 19 5" stroke="#141B42" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// 6. Drinks: Cold refreshing bottle / glass tumbler with straw
function DrinkMotif({ className = "", size = 28 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tumbler glass cup */}
      <path
        d="M 9 9 L 11 26 C 11 27 12 28 13 28 L 19 28 C 20 28 21 27 21 26 L 23 9 Z"
        fill="#F7EFE1"
        stroke="#141B42"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Liquid level */}
      <path
        d="M 10.5 14 L 11.5 25 C 11.5 25.5 12 26 12.5 26 L 19.5 26 C 20 26 20.5 25.5 20.5 25 L 21.5 14 Z"
        fill="#CE353E"
        opacity="0.75"
      />
      {/* Lemon wedge on glass rim */}
      <circle cx="9" cy="9" r="3.5" fill="#FFDC69" stroke="#141B42" strokeWidth="0.8" />
      {/* Slanted straw */}
      <line x1="17" y1="4" x2="14" y2="24" stroke="#141B42" strokeWidth="1.2" strokeLinecap="round" />
      {/* Ice cubes in liquid */}
      <rect x="13" y="17" width="3" height="3" rx="0.5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

// Hand-drawn ornamental divider flourish
export function HandDrawnDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-xs mx-auto my-2 text-cream-400 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M 10 8 Q 75 4 140 8 T 290 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Center diamond flourish */}
      <polygon points="150,3 155,8 150,13 145,8" fill="var(--ribbon-red)" />
      <circle cx="138" cy="8" r="1.5" fill="var(--indigo-primary)" />
      <circle cx="162" cy="8" r="1.5" fill="var(--indigo-primary)" />
    </svg>
  );
}

/**
 * Returns the appropriate culinary motif component for a group ID
 */
export function getGroupMotif(groupId: string, size = 26) {
  switch (groupId) {
    case "south-indian":
      return <DosaMotif size={size} />;
    case "pav-bhaji-pulav":
      return <PavMotif size={size} />;
    case "sandwich-grill":
      return <SandwichMotif size={size} />;
    case "pizza-burger":
      return <PizzaMotif size={size} />;
    case "chinese":
      return <ChineseMotif size={size} />;
    case "drinks":
      return <DrinkMotif size={size} />;
    default:
      return <DosaMotif size={size} />;
  }
}
