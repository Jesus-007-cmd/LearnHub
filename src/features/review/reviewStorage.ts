import type { ReviewQuestion } from "./reviewTypes";

const STORAGE_KEY = "uva-learning-review-questions";

export function getReviewQuestions(): ReviewQuestion[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error leyendo preguntas de repaso:", error);
    return [];
  }
}

export function saveReviewQuestions(
  questions: ReviewQuestion[]
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(questions)
    );
  } catch (error) {
    console.error(
      "Error guardando preguntas de repaso:",
      error
    );
  }
}

export function addReviewQuestion(
  question: ReviewQuestion
): ReviewQuestion[] {
  const current = getReviewQuestions();

  // Evitar duplicados
  const alreadyExists = current.some(
    (item) => item.id === question.id
  );

  if (alreadyExists) {
    return current;
  }

  const updated = [...current, question];

  saveReviewQuestions(updated);

  return updated;
}

export function removeReviewQuestion(
  id: string
): ReviewQuestion[] {
  const current = getReviewQuestions();

  const updated = current.filter(
    (item) => item.id !== id
  );

  saveReviewQuestions(updated);

  return updated;
}

export function isQuestionSaved(
  id: string
): boolean {
  return getReviewQuestions().some(
    (item) => item.id === id
  );
}

export function clearReviewQuestions(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
}