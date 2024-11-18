export interface QuizDto {
    setID: number;
    title: string;
    creator: string;
    public: boolean;
    university: string | null;
    department: string | null;
    subject : string | null;
    book : string | null;
    quizType: string;
    sharedWith: string[];
    cnt: number;
    lastAttemptDate: string | null;
}