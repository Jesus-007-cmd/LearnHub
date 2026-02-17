"use client";

import Link from "next/link";
import type { QuizMeta } from "@/data/quizzes/registry";

export function ClassGrid({
  quizzes,
  onOpenQuiz,
}: {
  quizzes: QuizMeta[];
  onOpenQuiz?: (q: QuizMeta) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((q) => (
        <Link
          key={q.slug}
          href={`/quizzes/${q.slug}`}
          onClick={() => onOpenQuiz?.(q)}
          className="
            group relative overflow-hidden
            rounded-2xl border border-white/10 bg-white/5 p-4
            hover:bg-white/10 hover:border-white/20 hover:-translate-y-1
            hover:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.85)]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out
            motion-reduce:transition-none
          "
        >
          <div
            className="
              pointer-events-none absolute inset-0 opacity-0
              group-hover:opacity-100
              bg-gradient-to-br from-indigo-400/10 via-transparent to-violet-400/10
              motion-safe:transition-opacity motion-safe:duration-300
            "
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold leading-snug">{q.title}</div>
              <div className="mt-1 text-xs text-white/70">
                Unidad {q.unit} · Clase {q.classNo}
              </div>
            </div>

            <div
              className="
                text-white/60
                motion-safe:transition-transform motion-safe:duration-300
                group-hover:translate-x-1 group-hover:text-white
              "
              aria-hidden
            >
              →
            </div>
          </div>

          {q.description && (
            <p className="mt-3 line-clamp-2 text-xs text-white/70">
              {q.description}
            </p>
          )}

          {q.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {q.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="
                    rounded-full border border-white/15 bg-white/5
                    px-2 py-0.5 text-[10px] text-white/70
                    group-hover:bg-white/10
                    motion-safe:transition-colors motion-safe:duration-200
                  "
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
