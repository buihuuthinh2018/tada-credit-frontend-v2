export type QuestionType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "textarea";

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  config?: {
    options?: string[];
    min?: number;
    max?: number;
    placeholder?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
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
