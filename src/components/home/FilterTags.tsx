// src/components/home/FilterTags.tsx
interface FilterTagsProps {
    tags: string[];
    selected: string[];
    onChange: (tags: string[]) => void;
  }
  
  export function FilterTags({ tags, selected, onChange }: FilterTagsProps) {
    if (tags.length === 0) return null;
  
    const toggle = (tag: string) => {
      if (selected.includes(tag)) {
        onChange(selected.filter((t) => t !== tag));
      } else {
        onChange([...selected, tag]);
      }
    };
  
    return (
      <div className="flex flex-col md:items-end gap-1 md:gap-2 flex-1">
        <span className="text-xs md:text-sm text-white/60">
          Filtrar por tags / Filter tags:
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {tags.map((tag) => {
            const isActive = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] border transition ${
                  isActive
                    ? "bg-emerald-500 border-emerald-300 text-slate-950"
                    : "bg-white/5 border-white/20 text-white/75 hover:bg-white/10"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  