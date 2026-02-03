// src/components/home/SearchBar.tsx
interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
  }
  
  export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
      <div className="w-full md:max-w-xs">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por tema, clase o hashtag..."
          className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
        />
      </div>
    );
  }
  