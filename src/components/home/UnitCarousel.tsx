"use client";

interface UnitCarouselProps {
  units: (number | "all")[];
  selected: number | "all" | null;
  onChange: (u: number | "all") => void;
}

export function UnitCarousel({ units, selected, onChange }: UnitCarouselProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Unidades</p>
        <p className="text-xs text-white/60">Desliza →</p>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {units.map((u) => {
          const active = selected === u;
          const label = u === "all" ? "Todas" : `Unidad ${u}`;

          return (
            <button
              key={String(u)}
              type="button"
              onClick={() => onChange(u)}
              className={
                "whitespace-nowrap rounded-full px-3 py-1 text-sm transition " +
                (active
                  ? "bg-white text-slate-950"
                  : "border border-white/15 bg-white/5 text-white hover:bg-white/10")
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
