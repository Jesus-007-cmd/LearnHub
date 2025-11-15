// src/data/quizzes/registry.ts
import criptografia1 from "../quizzes/criptografia/criptografia1.json";
import forenseApps1 from "../quizzes/forense-apps/forense-apps1.json";
import forenseApps2 from "../quizzes/forense-apps/forense-apps2.json";

// ---- Tipos que esperamos dentro del JSON ----
type QuizFile = {
  meta: {
    slug: string;
    title: string;
    subject: string;
    unit: number;
    classNo: number;
    description?: string;
    tags?: string[];
  };
  Questions: any[];
};

export type QuizMeta = {
  slug: string;
  title: string;
  subject: string;
  unit: number;
  classNo: number;
  description?: string;
  tags?: string[];
};

// === MAPA SLUG -> JSON REAL ===
const QUIZ_JSON: Record<string, QuizFile> = {
  "criptografia1": criptografia1 as QuizFile,
  "forense-apps1": forenseApps1 as QuizFile,
  "forense-apps2": forenseApps2 as QuizFile,
};

// === METADATOS AUTOMÁTICOS (leídos desde cada JSON.meta) ===
const QUIZ_META: QuizMeta[] = Object.values(QUIZ_JSON)
  .map((file) => {
    const m = file.meta;
    return {
      slug: m.slug,
      title: m.title,
      subject: m.subject,
      unit: m.unit,
      classNo: m.classNo,
      description: m.description,
      tags: m.tags,
    };
  })
  // opcional: ordenamos por materia, unidad y clase
  .sort((a, b) => {
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    if (a.unit !== b.unit) return a.unit - b.unit;
    return a.classNo - b.classNo;
  });

// ---------- API que usa el resto del proyecto ----------

export function getAllQuizMeta(): QuizMeta[] {
  return QUIZ_META;
}

export function getQuizBySlug(slug: string): QuizMeta | undefined {
  return QUIZ_META.find((q) => q.slug === slug);
}

export async function loadQuizJsonBySlug(slug: string): Promise<any> {
  const data = QUIZ_JSON[slug];
  if (!data) {
    console.error("[registry] JSON no encontrado para slug:", slug);
    return null;
  }
  return data; // devuelve el JSON completo (meta + Questions)
}
