// src/components/home/Pagination.tsx
interface PaginationProps {
    current: number;
    total: number;
    onChange: (page: number) => void;
  }
  
  export function Pagination({ current, total, onChange }: PaginationProps) {
    if (total <= 1) return null;
  
    const pages = Array.from({ length: total }, (_, i) => i + 1);
  
    const goTo = (p: number) => {
      if (p < 1 || p > total) return;
      onChange(p);
    };
  
    return (
      <div className="mt-8 flex items-center justify-center gap-2 text-xs md:text-sm">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          className="px-2 py-1 rounded-lg border border-white/15 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
        >
          ← Anterior
        </button>
  
        <div className="flex gap-1">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              className={`w-7 h-7 rounded-lg text-xs border transition ${
                p === current
                  ? "bg-indigo-500 border-indigo-300 text-white font-semibold"
                  : "bg-white/5 border-white/15 text-white/75 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
  
        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current === total}
          className="px-2 py-1 rounded-lg border border-white/15 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
        >
          Siguiente →
        </button>
      </div>
    );
  }
  