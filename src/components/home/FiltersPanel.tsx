// src/components/home/FiltersPanel.tsx
"use client";

import type { ReactNode } from "react";

interface FiltersPanelProps {
  open: boolean;
  title?: string;
  activeCount: number;
  onClose: () => void;
  onClear: () => void;
  onApply?: () => void;
  children: ReactNode;
}

export function FiltersPanel({
  open,
  title = "Filtros",
  activeCount,
  onClose,
  onClear,
  onApply,
  children,
}: FiltersPanelProps) {
  return (
    <section
      className={[
        "mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
        // Animación accesible
        "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
        "motion-reduce:transition-none",
        open ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0",
      ].join(" ")}
      aria-label="Panel de filtros"
      aria-hidden={!open}
    >
      {/* Contenido “interior” con slide suave */}
      <div
        className={[
          "p-4",
          "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
          "motion-reduce:transition-none",
          open ? "translate-y-0" : "-translate-y-2",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">{title}</h2>

            {activeCount > 0 && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                {activeCount} activo{activeCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white hover:bg-white/10 motion-safe:transition motion-safe:duration-200"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 space-y-4">{children}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 motion-safe:transition motion-safe:duration-200"
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={() => (onApply ? onApply() : onClose())}
            className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:opacity-90 motion-safe:transition motion-safe:duration-200"
          >
            Aplicar
          </button>
        </div>
      </div>
    </section>
  );
}
