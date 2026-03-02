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
    isCurrency?: boolean;  // Flag to indicate if this is a currency field (for number type)
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
