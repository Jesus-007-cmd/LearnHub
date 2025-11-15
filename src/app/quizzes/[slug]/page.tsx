// src/app/quizzes/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import InterviewQuiz from "@/components/InterviewQuiz";
import {
  getQuizBySlug,
  loadQuizJsonBySlug,
} from "@/data/quizzes/registry";

type Props = {
  // 👈 En Next 16 params viene como Promise
  params: Promise<{ slug: string }>;
};

export default async function QuizBySlugPage({ params }: Props) {
  // Desempacamos la Promise
  const { slug } = await params;

  const meta = getQuizBySlug(slug);
  const json = await loadQuizJsonBySlug(slug);

  if (!meta || !json) return notFound();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      {/* Fondo bonito */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)," +
              "linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <InterviewQuiz
        initialJson={json}
        initialQuizSlug={slug}
        forceLanguage="es-MX"
        hideQuizSelector
      />
    </main>
  );
}
