// src/components/home/HomeClient.tsx
"use client";

import { useMemo, useState } from "react";
import type { QuizMeta } from "@/data/quizzes/registry";
import { SubjectSelector } from "./SubjectSelector";
import { UnitNavigator } from "./UnitNavigator";
import { SearchBar } from "./SearchBar";
import { FilterTags } from "./FilterTags";
import { ClassGrid } from "./ClassGrid";
import { Pagination } from "./Pagination";

const ITEMS_PER_PAGE = 9;

interface HomeClientProps {
  metaList: QuizMeta[];
}

export default function HomeClient({ metaList }: HomeClientProps) {
  // Materias disponibles
  const subjects = useMemo(
    () => Array.from(new Set(metaList.map((m) => m.subject))),
    [metaList]
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0] ?? ""
  );

  // Unidades para la materia seleccionada (incluye opción "Todas")
  const unitsForSubject = useMemo<(number | "all")[]>(() => {
    const units = metaList
      .filter((m) => m.subject === selectedSubject)
      .map((m) => m.unit);

    const uniqueUnits = Array.from(new Set(units)).sort((a, b) => a - b);

    // Siempre agregamos la opción "all" al principio
    return ["all", ...uniqueUnits];
  }, [metaList, selectedSubject]);

  // "all" = todas las unidades
  const [selectedUnit, setSelectedUnit] = useState<number | "all" | null>("all");

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Reset cuando cambia materia
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    // Al cambiar de materia empezamos viendo todas las unidades
    setSelectedUnit("all");
    setSearch("");
    setSelectedTags([]);
    setPage(1);
  };

  // Reset página cuando cambian filtros
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

  // Tags posibles (según materia seleccionada)
  const availableTags = useMemo(() => {
    const tags = metaList
      .filter((m) => m.subject === selectedSubject)
      .flatMap((m) => m.tags ?? []);
    return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
  }, [metaList, selectedSubject]);

  // Filtro completo
  const filtered = useMemo(() => {
    let list = metaList.filter((m) => m.subject === selectedSubject);

    // Filtrar por unidad solo si NO es "all" ni null
    if (selectedUnit !== null && selectedUnit !== "all") {
      list = list.filter((m) => m.unit === selectedUnit);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const inTitle = m.title.toLowerCase().includes(q);
        const inDesc = (m.description ?? "").toLowerCase().includes(q);
        const inTags = (m.tags ?? [])
          .join(" ")
          .toLowerCase()
          .includes(q);
        return inTitle || inDesc || inTags;
      });
    }

    if (selectedTags.length > 0) {
      list = list.filter((m) => {
        const tags = m.tags ?? [];
        return selectedTags.some((t) => tags.includes(t));
      });
    }

    // Orden por unidad y clase
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

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 md:pt-16 md:pb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          UVA Learning · Super Quiz
        </h1>
        <p className="mt-3 text-sm md:text-base text-white/70 max-w-2xl">
          Elige una materia y entra directo al quiz interactivo con audio,
          bilingüe y explicaciones paso a paso.
        </p>
      </section>

      {/* Controles + contenido */}
      <section className="mx-auto max-w-6xl px-4 pb-12 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SubjectSelector
            subjects={subjects}
            selected={selectedSubject}
            onChange={handleSubjectChange}
          />

          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <SearchBar value={search} onChange={handleSearchChange} />
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <UnitNavigator
            units={unitsForSubject}
            selected={selectedUnit}
            onChange={handleUnitChange}
          />

          <FilterTags
            tags={availableTags}
            selected={selectedTags}
            onChange={handleTagsChange}
          />
        </div>

        <ClassGrid quizzes={pageItems} />

        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={setPage}
        />
      </section>
    </main>
  );
}
