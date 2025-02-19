export interface User {
  id: string; // UUID
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string; // Timestamp
}

export interface Question {
  id: string; // UUID
  text: string;
  next_question_id: string | null; // UUID, optional reference to next question
  user_id: string; // UUID
  created_at: string; // Timestamp
  updated_at: string | null; // Timestamp
}

export interface Answer {
  id: string; // UUID
  question_id: string; // UUID
  answer: string;
  created_at: string; // Timestamp
}

export interface Response {
  id: string; // UUID
  answer_id: string; // UUID
  question_id: string; // UUID
  user_id: string | null; // UUID, optional since it can be SET NULL
  created_at: string; // Timestamp
}

// Helper type for creating new records (omitting auto-generated fields)
export type NewQuestion = Omit<Question, "id" | "created_at" | "updated_at"> & {
  updated_at?: string;
};

export type NewAnswer = Omit<Answer, "id" | "created_at">;

export type NewResponse = Omit<Response, "id" | "created_at">;

// Database schema type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      questions: {
        Row: Question;
        Insert: NewQuestion;
        Update: Partial<NewQuestion>;
      };
      answers: {
        Row: Answer;
        Insert: NewAnswer;
        Update: Partial<NewAnswer>;
      };
      responses: {
        Row: Response;
        Insert: NewResponse;
        Update: Partial<NewResponse>;
      };
    };
  };
}
