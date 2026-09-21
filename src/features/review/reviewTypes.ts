export type ReviewQuestion = {
    id: string;
  
    quizSlug: string;
    questionIndex: number;
  
    question_es: string;
    question_en: string;
  
    options_es: string[];
    options_en: string[];
  
    correct_es: string;
    correct_en: string;
  
    category?: string;
  
    markedAt: string;
  
    // Para funciones futuras
    timesCorrect?: number;
    timesIncorrect?: number;
  };