// src/components/VideoLogo.tsx
"use client";
export default function VideoLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <video
      className={className}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      poster="/videologo-poster.jpg" // opcional
      aria-label="Logo animado UVA"
    >
      <source src="/videologo.webm" type="video/webm" />
      <source src="/videologo.mp4"  type="video/mp4" />
    </video>
  );
}
