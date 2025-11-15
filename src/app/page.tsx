// src/app/page.tsx
import Link from "next/link";
import { getAllQuizMeta, type QuizMeta } from "@/data/quizzes/registry";

function groupBySubject(list: QuizMeta[]) {
  const map = new Map<string, QuizMeta[]>();

  for (const q of list) {
    const key = q.subject;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(q);
  }

  for (const [key, arr] of map.entries()) {
    arr.sort((a, b) => {
      if (a.unit !== b.unit) return a.unit - b.unit;
      return a.classNo - b.classNo;
    });
    map.set(key, arr);
  }

  return Array.from(map.entries());
}

export default function HomePage() {
  const metaList = getAllQuizMeta();
  const grouped = groupBySubject(metaList);

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

      {/* Materias */}
      <section className="mx-auto max-w-6xl px-4 pb-12 space-y-10">
        {grouped.map(([subject, items]) => (
          <div key={subject} className="space-y-4">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-xl md:text-2xl font-bold">{subject}</h2>
              <span className="text-xs md:text-sm text-white/60">
                {items.length} clase{items.length !== 1 && "s"}
              </span>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((quiz) => (
                <article
                  key={quiz.slug}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/30 backdrop-blur-sm hover:bg-white/8 hover:ring-white/20 transition"
                >
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
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
