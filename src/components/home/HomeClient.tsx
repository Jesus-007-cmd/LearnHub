"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { QuizMeta } from "@/data/quizzes/registry";
import { SubjectSelector } from "./SubjectSelector";
import { UnitNavigator } from "./UnitNavigator";
import { SearchBar } from "./SearchBar";
import { FilterTags } from "./FilterTags";
import { ClassGrid } from "./ClassGrid";
import { Pagination } from "./Pagination";

import { FiltersPanel } from "./FiltersPanel";
import { UnitCarousel } from "./UnitCarousel";
import { EmptyState } from "./EmptyState";
import { useRecentQuizzes } from "./useRecentQuizzes";

const ITEMS_PER_PAGE = 9;

interface HomeClientProps {
  metaList: QuizMeta[];
}

export default function HomeClient({ metaList }: HomeClientProps) {
  const router = useRouter();

  const subjects = useMemo(
    () => Array.from(new Set(metaList.map((m) => m.subject))),
    [metaList]
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0] ?? "");

  const unitsForSubject = useMemo<(number | "all")[]>(() => {
    const units = metaList
      .filter((m) => m.subject === selectedSubject)
      .map((m) => m.unit);

    const uniqueUnits = Array.from(new Set(units)).sort((a, b) => a - b);
    return ["all", ...uniqueUnits];
  }, [metaList, selectedSubject]);

  const [selectedUnit, setSelectedUnit] = useState<number | "all" | null>("all");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [filtersOpen, setFiltersOpen] = useState(false);

  // ✅ Recientes
  const { recentMetas, last, markOpened, clearRecents } = useRecentQuizzes(metaList);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedUnit("all");
    setSearch("");
    setSelectedTags([]);
    setPage(1);
  };

  const handleUnitChange = (unit: number | "all") => {
    setSelectedUnit(unit);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedUnit("all");
    setSearch("");
    setSelectedTags([]);
    setPage(1);
  };
  const openQuiz = (quiz: QuizMeta) => {
    const slug =
      (quiz as any).slug ??
      `${quiz.subject}-${quiz.unit}-${quiz.classNo}`;

      router.push(`/quizzes/${slug}`);

  };

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (search.trim()) n += 1;
    if (selectedUnit !== null && selectedUnit !== "all") n += 1;
    if (selectedTags.length > 0) n += 1;
    return n;
  }, [search, selectedUnit, selectedTags]);

  const availableTags = useMemo(() => {
    const tags = metaList
      .filter((m) => m.subject === selectedSubject)
      .flatMap((m) => m.tags ?? []);
    return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
  }, [metaList, selectedSubject]);

  const filtered = useMemo(() => {
    let list = metaList.filter((m) => m.subject === selectedSubject);

    if (selectedUnit !== null && selectedUnit !== "all") {
      list = list.filter((m) => m.unit === selectedUnit);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const inTitle = m.title.toLowerCase().includes(q);
        const inDesc = (m.description ?? "").toLowerCase().includes(q);
        const inTags = (m.tags ?? []).join(" ").toLowerCase().includes(q);
        return inTitle || inDesc || inTags;
      });
    }

    if (selectedTags.length > 0) {
      list = list.filter((m) => {
        const tags = m.tags ?? [];
        return selectedTags.some((t) => tags.includes(t));
      });
    }

    list.sort((a, b) => {
      if (a.unit !== b.unit) return a.unit - b.unit;
      return a.classNo - b.classNo;
    });

    return list;
  }, [metaList, selectedSubject, selectedUnit, search, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Resumen bonito de filtros (texto corto)
  const filtersSummary = useMemo(() => {
    const parts: string[] = [];
    parts.push(`Materia: ${selectedSubject || "—"}`);
    parts.push(`Unidad: ${selectedUnit === "all" ? "Todas" : selectedUnit ?? "—"}`);
    if (selectedTags.length) parts.push(`Tags: ${selectedTags.length}`);
    if (search.trim()) parts.push(`Búsqueda: “${search.trim()}”`);
    return parts.join(" · ");
  }, [selectedSubject, selectedUnit, selectedTags.length, search]);

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 md:pt-16 md:pb-10">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                UVA Learning · Super Quiz
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/70 max-w-2xl">
                Entra rápido a tus clases. Usa filtros solo cuando los necesites.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                aria-expanded={filtersOpen}
              >
                Filtros{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Continuar / Recientes */}
          {(last || recentMetas.length > 0) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Continuar</p>
                  <p className="text-xs text-white/70">
                    Retoma donde te quedaste (guardado en este dispositivo).
                  </p>
                </div>

                <div className="flex gap-2">
                  {recentMetas.length > 0 && (
                    <button
                      type="button"
                      onClick={clearRecents}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                    >
                      Borrar recientes
                    </button>
                  )}
                </div>
              </div>

              {last && (
                <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-white/85">
                    <b>{last.title}</b>{" "}
                    <span className="text-white/60">
                      · Unidad {last.unit} · Clase {last.classNo}
                    </span>
                  </div>


                  <button
                    type="button"
                    onClick={() => {
                      if (!last) return;
                      markOpened(last);
                      openQuiz(last);
                    }}

                    className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold hover:opacity-90"
                  >
                    Ir a esa unidad
                  </button>
                </div>
              )}

              {recentMetas.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {recentMetas.slice(0, 6).map((m) => (
                    <button
                      key={(m as any).id ?? `${m.subject}-${m.unit}-${m.classNo}`}
                      type="button"
                      onClick={() => {
                        handleSubjectChange(m.subject);
                        handleUnitChange(m.unit);
                      }}
                      className="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Materia visible (mínimo esencial) */}
          <SubjectSelector
            subjects={subjects}
            selected={selectedSubject}
            onChange={handleSubjectChange}
          />

          {/* “Carrusel” de unidades (se siente moderno) */}
          <UnitCarousel
            units={unitsForSubject}
            selected={selectedUnit}
            onChange={handleUnitChange}
          />

          {/* Panel de filtros oculto */}
          <FiltersPanel
            open={filtersOpen}
            activeCount={activeFiltersCount}
            onClose={() => setFiltersOpen(false)}
            onClear={handleClearFilters}
            onApply={() => setFiltersOpen(false)}
          >
            <SearchBar value={search} onChange={handleSearchChange} />

            {/* Si prefieres no duplicar unidad: puedes quitar este UnitNavigator,
               porque ya tienes UnitCarousel arriba. Si lo dejas, sirve como “modo avanzado”. */}
            <UnitNavigator units={unitsForSubject} selected={selectedUnit} onChange={handleUnitChange} />

            <FilterTags tags={availableTags} selected={selectedTags} onChange={handleTagsChange} />
          </FiltersPanel>
        </div>
      </section>

      {/* Contenido */}
      <section className="mx-auto max-w-6xl px-4 pb-12 space-y-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-white/70">
            Resultados: <span className="text-white font-semibold">{filtered.length}</span>
          </p>
          <p className="text-xs text-white/55">{filtersSummary}</p>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <EmptyState onClear={handleClearFilters} />
        ) : (
          <>
            {/* ✅ Ideal: agrega onOpenQuiz para guardar “recientes” */}
            <ClassGrid
              quizzes={pageItems}
              onOpenQuiz={(quiz: QuizMeta) => {
                markOpened(quiz);
                openQuiz(quiz);  // ✅ abre el quiz
              }}
            />


            <Pagination current={currentPage} total={totalPages} onChange={setPage} />
          </>
        )}
      </section>
    </main>
  );
}
