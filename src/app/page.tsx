// src/app/page.tsx
import { getAllQuizMeta, type QuizMeta } from "@/data/quizzes/registry";
import HomeClient from "@/components/home/HomeClient";

export default function HomePage() {
  const metaList: QuizMeta[] = getAllQuizMeta();

  return <HomeClient metaList={metaList} />;
}
