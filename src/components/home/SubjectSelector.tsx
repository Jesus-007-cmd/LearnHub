// src/components/home/SubjectSelector.tsx
interface SubjectSelectorProps {
    subjects: string[];
    selected: string;
    onChange: (subject: string) => void;
  }
  
  export function SubjectSelector({
    subjects,
    selected,
    onChange,
  }: SubjectSelectorProps) {
    if (subjects.length === 0) return null;
  
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs md:text-sm text-white/60">
          Materia / Subject:
        </span>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`rounded-full px-3 py-1 text-xs md:text-sm border transition ${
                s === selected
                  ? "bg-indigo-500 border-indigo-300 text-white"
                  : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }
  