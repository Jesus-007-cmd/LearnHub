// src/data/quizzes/registry.ts
/* eslint-disable @typescript-eslint/no-var-requires */

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
  // opcional: carpeta física, por si quieres agrupar por carpeta
  folder?: string;
};

// === CARGA AUTOMÁTICA DE TODOS LOS JSON BAJO src/data/quizzes ===
// Este archivo está en src/data/quizzes/registry.ts,
// por eso usamos "." como base.

/* @ts-ignore - require.context es de webpack */
const ctx = require.context(".", true, /\.json$/);

const QUIZ_JSON: Record<string, QuizFile> = {};
const QUIZ_META: QuizMeta[] = [];

// para evitar duplicar tarjetas: subject + unit + classNo
const seenMetaKeys = new Set<string>();

// solo para diagnóstico (no obligatorio)
const rawKeys = ctx.keys();

console.log("===============================================");
console.log("[registry] Iniciando carga de quizzes JSON");
console.log("[registry] Archivos encontrados por webpack:", rawKeys.length);
console.log("===============================================");

rawKeys.forEach((key: string) => {
  // 🔹 1) Filtrar rutas "fantasma" que vimos en el log:
  //     data/quizzes/forense-apps/forense-apps1.json, etc.
  if (key.startsWith("data/quizzes/")) {
    console.warn("[registry] Saltando ruta duplicada por path:", key);
    return;
  }

  const file = ctx(key) as QuizFile;

  if (!file?.meta?.slug) {
    console.warn("[registry] JSON sin meta.slug, se ignora:", key);
    return;
  }

  const m = file.meta;

  // 🔹 2) Clave lógica para NO repetir clases:
  //     misma materia, misma unidad, misma clase ⇒ se considera duplicado
  const metaKey = `${m.subject}|${m.unit}|${m.classNo}`;

  if (seenMetaKeys.has(metaKey)) {
    console.warn(
      "[registry] Duplicado detectado por subject/unit/class, se omite:",
      metaKey,
      "archivo:",
      key
    );
    return;
  }
  seenMetaKeys.add(metaKey);

  // 🔹 3) Carpeta física (ej. "forense-apps" o "criptografia")
  const parts = key.split("/");
  const folder = parts.length > 1 ? parts[1] : undefined;

  // 🔹 4) Guardar el JSON completo en el mapa por slug
  QUIZ_JSON[m.slug] = file;

  // 🔹 5) Guardar solo la meta para listarla en la home
  QUIZ_META.push({
    slug: m.slug,
    title: m.title,
    subject: m.subject,
    unit: m.unit,
    classNo: m.classNo,
    description: m.description,
    tags: m.tags,
    folder,
  });
});

// 🔹 6) Ordenamos por materia, unidad y clase
QUIZ_META.sort((a, b) => {
  if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
  if (a.unit !== b.unit) return a.unit - b.unit;
  return a.classNo - b.classNo;
});

console.log("[registry] Quizzes registrados (sin duplicados):", QUIZ_META.length);
QUIZ_META.forEach((q) => {
  console.log(
    `  - ${q.subject} · U${q.unit}C${q.classNo} · slug=${q.slug}`
  );
});
console.log("===============================================");

// ---------- API que usa el resto del proyecto ----------

export function getAllQuizMeta(): QuizMeta[] {
  return QUIZ_META;
}

export function getQuizBySlug(slug: string): QuizMeta | undefined {
  return QUIZ_META.find((q) => q.slug === slug);
}

export async function loadQuizJsonBySlug(
  slug: string
): Promise<QuizFile | null> {
  const data = QUIZ_JSON[slug];
  if (!data) {
    console.error("[registry] JSON no encontrado para slug:", slug);
    return null;
  }
  return data; // meta + Questions
}
