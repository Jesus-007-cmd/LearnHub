// src/components/brand/BrandMark.tsx
"use client";

interface BrandMarkProps {
  className?: string;
  label?: string;
}

export function BrandMark({
  className = "h-10 w-10",
  label = "UVA Learning",
}: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label}</title>

      {/* círculo suave */}
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.14" />

      {/* “U” minimal */}
      <path
        d="M18 18v18c0 9 6.5 16 14 16s14-7 14-16V18h-6v18c0 6-3.7 10-8 10s-8-4-8-10V18h-6z"
        fill="currentColor"
      />
      {/* chispa */}
      <path
        d="M49 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z"
        fill="currentColor"
      />
    </svg>
  );
}
