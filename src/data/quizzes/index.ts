// src/data/quizzes/index.ts
export type QuizMeta = {
  slug: string;
  title: string;
  subject: string;
  unit: number;
  classNo: number;
  tags?: string[];
};

export const quizzes: QuizMeta[] = [
  {
    slug: "criptografia1",
    title: "Criptografía – Unidad 1 (Clase 1)",
    subject: "Criptografía",
    unit: 1,
    classNo: 1,
    tags: ["AES", "Hash"]
  },
  {
    slug: "forense-apps1",
    title: "Forense de Apps – Unidad 1 (Clase 1)",
    subject: "Análisis Forense",
    unit: 1,
    classNo: 1
  }
];

export function getQuizBySlug(slug: string) {
  const match = quizzes.find(q => q.slug === slug);
  console.log("[D8G] getQuizBySlug()", { slug, found: !!match });
  return match;
}
