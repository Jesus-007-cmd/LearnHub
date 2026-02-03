// src/components/home/UnitNavigator.tsx
interface UnitNavigatorProps {
    units: number[];
    selected: number | null;
    onChange: (unit: number) => void;
  }
  
  export function UnitNavigator({
    units,
    selected,
    onChange,
  }: {
    units: (number | "all")[];
    selected: number | "all" | null;
    onChange: (unit: number | "all") => void;
  }) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs md:text-sm text-white/60">
          Unidades:
        </span>
  
        <div className="flex flex-wrap gap-2">
          {units.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onChange(u)}
              className={`rounded-full px-3 py-1 text-xs md:text-sm border transition ${
                u === selected
                  ? "bg-cyan-500 border-cyan-300 text-slate-950 font-semibold"
                  : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
              }`}
            >
              {u === "all" ? "Todas" : `Unidad ${u}`}
            </button>
          ))}
        </div>
      </div>
    );
  }
  