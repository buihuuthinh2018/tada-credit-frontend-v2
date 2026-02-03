export type QuestionType =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTISELECT"
  | "TEXTAREA";

export interface Question {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  questionType?: QuestionType;
  options?: string[];
  isRequired?: boolean;
  order?: number;
}
