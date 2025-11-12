// src/data/quizzes/registry.ts
export type QuizMeta = { slug: string; title: string; json: any };

import criptografia1 from "./criptografia1.json";
import forenseApps1 from "./forense-apps1.json";

export const quizzes: QuizMeta[] = [
  { slug: "criptografia1",  title: "Criptografía – Unidad 1",             json: criptografia1 },
  { slug: "forense-apps1",  title: "Análisis Forense de Apps – Unidad 1", json: forenseApps1 },
];

export const getQuizBySlug = (slug: string) =>
  quizzes.find(q => q.slug === slug);
