export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // Detail description of the lesson
  steps?: string[]; // Step by step examples
  interactiveType?: 'abacus' | 'multiplication-table' | 'fraction-circle' | 'clock' | 'geometry-canvas';
  interactiveData?: any;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

export interface Question {
  id: string;
  type: 'boolean' | 'fill' | 'matching' | 'labeling' | 'choice';
  text: string;
  options?: string[]; // for choice
  correctAnswer: string | boolean | string[]; // depending on type
  matchingLeft?: string[]; // for matching questions
  matchingRight?: string[]; // correct matches correspond to indices of matchingLeft
  labelImage?: string; // or SVG identifier for diagram labeling
  labelPoints?: { id: string; name: string; x: number; y: number }[]; // For labeling component
  unitId: string;
  lessonId: string;
  score: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  points: number;
  completedLessons: string[]; // lesson ids
  completedUnits: string[]; // unit ids
  badges: Badge[];
  favorites: string[]; // lesson ids
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon string or emoji
  color: string;
  unlockedAt?: string;
}

export interface QuizResult {
  quizId: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpentSeconds: number;
  unitIds: string[];
  lessonIds: string[];
  performanceAnalysis: {
    strength: string;
    improvement: string;
    recommendation: string;
  };
}
