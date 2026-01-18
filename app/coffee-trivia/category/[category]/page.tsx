import type { QuizCategory } from '@/lib/coffee-quiz/types';
import { CategoryPageContent } from './CategoryPageContent';

// 静的パラメータ生成（静的エクスポート用）
export function generateStaticParams() {
  const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];
  return categories.map((category) => ({ category }));
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryQuestionsPage({ params }: PageProps) {
  const { category } = await params;
  return <CategoryPageContent category={category as QuizCategory} />;
}
