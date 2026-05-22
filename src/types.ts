export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Term = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  summary: string;
  content: string;
  examples: string[];
};

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  content: string;
  takeaways: string[];
};

export type Question = {
  id: string;
  type: "preflop" | "concept" | "exploit";
  category: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  metadata: {
    heroPosition?: string;
    villainType?: string;
    hand?: string;
    board?: string;
    potType?: string;
  };
};

export type Attempt = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  createdAt: string;
};
