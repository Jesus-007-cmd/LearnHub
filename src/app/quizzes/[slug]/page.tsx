export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

import { getQuizBySlug, quizzes } from "@/data/quizzes";
import DebugQuizPage from "@/components/InterviewQuiz";

// genera slugs válidos
export async function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

// ⬇️ Nota: función async porque params es una Promise
export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Espera el params real
  const { slug } = await params;

  console.log("[D8G] slug recibido:", slug);
  console.log("[D8G] slugs en índice:", quizzes.map((q) => q.slug));

  const meta = getQuizBySlug(slug);
  console.log("[D8G] meta encontrada?", !!meta);

  // evita 404 incluso si no encuentra meta
  return <DebugQuizPage initialQuizSlug={slug} />;
}
