"use client";

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <p className="text-lg font-semibold text-white">No hay resultados</p>
      <p className="mt-2 text-sm text-white/70">
        Prueba quitando tags, usando <b>Todas</b> las unidades o borrando la búsqueda.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
