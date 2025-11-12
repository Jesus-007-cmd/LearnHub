import Link from "next/link";
import { quizzes } from "@/data/quizzes";

type QuizMeta = {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  subject: string;   // Materia (p.ej. "Criptografía")
  unit: number;      // Unidad (1..n)
  classNo: number;   // Clase dentro de la unidad (1..n)
};

// Agrupar: Materia -> Unidad -> [Clases]
function group(quizzes: QuizMeta[]) {
  const subjects = new Map<string, Map<number, QuizMeta[]>>();
  for (const q of quizzes as QuizMeta[]) {
    if (!subjects.has(q.subject)) subjects.set(q.subject, new Map());
    const units = subjects.get(q.subject)!;
    if (!units.has(q.unit)) units.set(q.unit, []);
    units.get(q.unit)!.push(q);
  }
  // ordenar clases por classNo
  for (const [, units] of subjects) {
    for (const [u, arr] of units) {
      arr.sort((a, b) => a.classNo - b.classNo);
      units.set(u, arr);
    }
  }
  return subjects;
}

export default function Home() {
  const subjects = group(quizzes as QuizMeta[]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      {/* Fondo moderno */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px),linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -top-20 -left-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/30 blur-[100px]" />
        <div className="absolute bottom-[-8rem] right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/25 blur-[110px]" />
      </div>

      <section className="mx-auto max-w-6xl p-6 md:py-10 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              UVA Learning
            </h1>
            <p className="text-white/70">Quizzes y herramientas de aprendizaje</p>
          </div>
        </header>

        {/* Materias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...subjects.entries()].map(([subject, units]) => (
            <article
              key={subject}
              className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">{subject}</h2>
                <span className="text-xs text-white/70">
                  {Array.from(units.values()).reduce((acc, a) => acc + a.length, 0)} clases
                </span>
              </div>

              {/* Chips de tags (a partir de la primera clase con tags) */}
              {(() => {
                const first = Array.from(units.values())[0]?.[0];
                return first?.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {first.tags!.map((t) => (
                      <span
                        key={t}
                        className="text-xs text-white/85 bg-black/25 ring-1 ring-white/15 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Unidades */}
              <div className="mt-4 space-y-4">
                {[...units.entries()]
                  .sort((a, b) => a[0] - b[0])
                  .map(([unitNo, classes]) => (
                    <div key={unitNo} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Unidad {unitNo}</h3>
                        <span className="text-xs text-white/70">{classes.length} clases</span>
                      </div>

                      {/* Botones de clase */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {classes.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/quizzes/${c.slug}`}
                            className="group rounded-lg px-3 py-2 text-sm font-medium
                                       bg-gradient-to-b from-white/15 to-white/5
                                       ring-1 ring-white/15 hover:from-white/25 hover:to-white/10
                                       text-white flex items-center justify-between"
                          >
                            <span>
                              U{c.unit}C{c.classNo}
                            </span>
                            <span className="opacity-70 group-hover:opacity-100">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>

                      {/* Descripción breve (opcional) */}
                      {classes[0]?.description && (
                        <p className="mt-3 text-xs text-white/70">
                          {classes[0].description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </div>

        {/* Herramientas (placeholder) */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Herramientas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 text-white/90">
              <h3 className="font-semibold">Flashcards</h3>
              <p className="text-sm text-white/70">Repaso rápido de términos clave.</p>
              <button className="mt-3 rounded-lg bg-white/15 text-white px-3 py-1.5 opacity-60 cursor-not-allowed">
                Próximamente
              </button>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 text-white/90">
              <h3 className="font-semibold">Prácticas guiadas</h3>
              <p className="text-sm text-white/70">ACPO, NIST, etc.</p>
              <button className="mt-3 rounded-lg bg-white/15 text-white px-3 py-1.5 opacity-60 cursor-not-allowed">
                Próximamente
              </button>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 text-white/90">
              <h3 className="font-semibold">Glosario</h3>
              <p className="text-sm text-white/70">Definiciones bilingües.</p>
              <button className="mt-3 rounded-lg bg-white/15 text-white px-3 py-1.5 opacity-60 cursor-not-allowed">
                Próximamente
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
