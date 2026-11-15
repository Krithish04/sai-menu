"use client";

import React, { useState, useEffect } from "react";

interface PriceInputProps {
  value: number | undefined;
  onChange: (newValue: number | undefined) => void;
  label?: string;
  disabled?: boolean;
}

export function PriceInput({
  value,
  onChange,
  label,
  disabled = false,
}: PriceInputProps) {
  const [internalVal, setInternalVal] = useState<string>(
    value !== undefined ? String(value) : ""
  );

  useEffect(() => {
    setInternalVal(value !== undefined ? String(value) : "");
  }, [value]);

  const handleBlur = () => {
    const trimmed = internalVal.trim();
    if (trimmed === "" || trimmed === "-") {
      if (value !== undefined) onChange(undefined);
      return;
    }

    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 0 && num <= 10000) {
      if (num !== value) onChange(num);
    } else {
      // Revert to original
      setInternalVal(value !== undefined ? String(value) : "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[10px] font-bold text-indigo-muted uppercase tracking-wider mb-0.5">
          {label}
        </span>
      )}
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={0}
        max={10000}
        value={internalVal}
        onChange={(e) => setInternalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="—"
        disabled={disabled}
        className="w-14 sm:w-16 min-h-[38px] px-1 text-center font-mono font-semibold text-sm bg-cream-50 border border-cream-300 rounded text-indigo-deep focus:outline-none focus:ring-2 focus:ring-ribbon focus:border-ribbon disabled:opacity-40"
      />
    </div>
  );
}
