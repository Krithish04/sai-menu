import React from "react";

interface RibbonProps {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "div";
}

export function Ribbon({ children, className = "", as = "h2" }: RibbonProps) {
  const Component = as;

  return (
    <Component
      className={`relative inline-flex items-center px-4 py-1.5 text-white bg-ribbon font-serif font-bold text-base sm:text-lg tracking-wide uppercase shadow-sm select-none ${className}`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 6px 50%)",
      }}
    >
      <span className="pl-1 pr-2">{children}</span>
    </Component>
  );
}
