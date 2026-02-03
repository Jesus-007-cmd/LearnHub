// src/components/home/QuizCard.tsx
import Link from "next/link";
import type { QuizMeta } from "@/data/quizzes/registry";

interface QuizCardProps {
  quiz: QuizMeta;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/30 backdrop-blur-sm hover:bg-white/8 hover:ring-white/20 transition">
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/15 blur-2xl group-hover:bg-indigo-500/20 transition" />

      <div className="relative p-5 md:p-6 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">
          Unidad {quiz.unit} · Clase {quiz.classNo}
        </p>
        <h3 className="text-lg md:text-xl font-semibold leading-snug">
          {quiz.title}
        </h3>

        {quiz.tags && quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {quiz.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Link
            href={`/quizzes/${quiz.slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/90 px-3.5 py-2 text-sm font-medium hover:bg-indigo-500 transition shadow-md shadow-indigo-500/40"
          >
            Iniciar quiz
            <span className="text-base leading-none group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
