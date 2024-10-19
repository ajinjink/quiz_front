import axiosInstance from './axiosInstance';

interface Quiz {
    setID: number;
    title: string;
    creator: string;
    public: boolean;
    quizType: string;
    sharedList: string[];
    cnt: number;
}

interface LoginResponse {
  accessToken: string;
}

interface SignupData {
  username: string;
  password: string;
  email: string;
}

export const signup = async (signupData: SignupData): Promise<void> => {
  try {
    const response = await axiosInstance.post('/auth/signup', signupData);
    // console.log('회원가입 성공:', response.data);
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', { username, password });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  try {
    const response = await axiosInstance.get<Quiz[]>('/quiz/created');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    throw error;
  }
};

export const getQuizzesBySetId = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/quiz/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quiz questions:', error);
      throw error;
    }
};

export const updateQuizSet = async (id: string, updateQuizSetDto: any) => {
    try {
      const response = await axiosInstance.put(`/quiz/${id}`, updateQuizSetDto);
      return response.data;
    } catch (error) {
      console.error('Failed to update quiz set:', error);
      throw error;
    }
};

export const fetchQuizDetails = async (id: string): Promise<Quiz> => {
  try {
    const response = await axiosInstance.get<Quiz>(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch quiz details:', error);
    throw error;
  }
};

interface CreateQuizSetDto {
  title: string;
  public: boolean;
  quizType: string;
  questions: {
    question: string;
    answer: string;
    no: number;
  }[];
}

export const createQuiz = async (quizData: CreateQuizSetDto): Promise<void> => {
  try {
    await axiosInstance.post('/quiz', quizData);
  } catch (error) {
    console.error('Failed to create quiz:', error);
    throw error;
  }
};

interface EvaluationResponse {
  is_correct: boolean;
  explanation: string;
}

interface EvaluateDto {
  question: string;
  answer: string;
  user_answer: string;
}

export const evaluateAnswer = async (question: string, answer: string, userAnswer: string): Promise<EvaluationResponse> => {
  try {
    const evaluateDto: EvaluateDto = {
      question,
      answer,
      user_answer: userAnswer
    };
    const response = await axiosInstance.post<EvaluationResponse>('/evaluate', evaluateDto);
    return response.data;
  } catch (error) {
    console.error('Failed to evaluate answer:', error);
    throw error;
  }
};

export const incrementQuizCount = async (id: string): Promise<void> => {
  try {
    await axiosInstance.patch(`/quiz/${id}/increment-count`);
  } catch (error) {
    console.error('Failed to increment quiz count:', error);
    throw error;
  }
};