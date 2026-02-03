// src/components/home/ClassGrid.tsx
import type { QuizMeta } from "@/data/quizzes/registry";
import { QuizCard } from "./QuizCard";

interface ClassGridProps {
  quizzes: QuizMeta[];
}

export function ClassGrid({ quizzes }: ClassGridProps) {
  if (quizzes.length === 0) {
    return (
      <div className="mt-6 text-sm text-white/70">
        No se encontraron clases con los filtros actuales.
        <br />
        <span className="text-white/50">
          Try adjusting search or tags to see more quizzes.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.slug} quiz={quiz} />
      ))}
    </div>
  );
}
