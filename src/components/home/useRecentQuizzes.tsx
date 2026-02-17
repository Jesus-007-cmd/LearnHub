"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuizMeta } from "@/data/quizzes/registry";

const STORAGE_KEY = "uva_recent_quizzes_v1";
const MAX_RECENTS = 8;

type RecentEntry = {
  id: string;
  ts: number; // timestamp
};

function safeParse(json: string | null): RecentEntry[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v
      .filter(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof x.id === "string" &&
          typeof x.ts === "number"
      )
      .slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

export function useRecentQuizzes(metaList: QuizMeta[]) {
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  // Cargar desde localStorage
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setRecents(safeParse(raw));
  }, []);

  const save = useCallback((next: RecentEntry[]) => {
    setRecents(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_RECENTS)));
    } catch {
      // si el storage falla, no hacemos nada
    }
  }, []);

  // Marcar un quiz como “abierto”
  const markOpened = useCallback(
    (quiz: QuizMeta) => {
      // OJO: asumimos que QuizMeta tiene algo estable como slug/id.
      // Si tu QuizMeta no tiene "id", cambia aquí por lo que uses (ej: quiz.slug).
      const id = (quiz as any).id ?? (quiz as any).slug ?? `${quiz.subject}-${quiz.unit}-${quiz.classNo}`;

      const now = Date.now();
      const filtered = recents.filter((r) => r.id !== id);
      const next: RecentEntry[] = [{ id, ts: now }, ...filtered].slice(0, MAX_RECENTS);
      save(next);
    },
    [recents, save]
  );

  // Convertir IDs a QuizMeta reales (si existen en metaList)
  const recentMetas = useMemo(() => {
    const map = new Map<string, QuizMeta>();
    for (const m of metaList) {
      const id = (m as any).id ?? (m as any).slug ?? `${m.subject}-${m.unit}-${m.classNo}`;
      map.set(id, m);
    }
    return recents
      .map((r) => map.get(r.id))
      .filter(Boolean) as QuizMeta[];
  }, [recents, metaList]);

  const last = recentMetas[0] ?? null;

  const clearRecents = useCallback(() => save([]), [save]);

  return { recentMetas, last, markOpened, clearRecents };
}
