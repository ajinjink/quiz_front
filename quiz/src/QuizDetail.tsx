import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QuizSession from './QuizSession';
import { getQuizzesBySetId, fetchQuizDetails, incrementQuizCount } from './api/apiCalls';

interface QuizDetail {
  setID: number;
  title: string;
  creator: string;
  public: boolean;
  quizType: string;
  sharedList: string[];
  cnt: number;
}

interface QuizQuestion {
  id: number;
  no: number;
  question: string;
  answer: string;
  quizSetID: number;
}

const QuizDetails: React.FC = () => {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('Quiz ID is undefined');
        
        let quizData: QuizDetail;
        if (location.state?.quiz) {
          quizData = location.state.quiz;
        } else {
          quizData = await fetchQuizDetails(id);
        }
        
        const questionsData = await getQuizzesBySetId(id);
        
        setQuiz(quizData);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
        setError('퀴즈 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [id, location.state]);

  const handleStartQuiz = async () => {
    if (id) {
      try {
        await incrementQuizCount(id);
        setIsSessionStarted(true);
      } catch (error) {
        console.error('Failed to increment quiz count:', error);
        setIsSessionStarted(true); // api 실패해도 퀴즈는 실행
      }
    }
  };

  const handleEditQuiz = () => {
    if (quiz) {
      navigate(`/edit/${quiz.setID}`, { state: { quiz, questions } });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (isSessionStarted && questions.length > 0) {
    return <QuizSession questions={questions} />;
  }

  if (!quiz) {
    return <div>퀴즈 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>Quiz ID:</strong> {quiz.setID}</p>
        <p><strong>Creator:</strong> {quiz.creator}</p>
        <p><strong>Type:</strong> {quiz.quizType}</p>
        <p><strong>Public:</strong> {quiz.public ? 'Yes' : 'No'}</p>
        <p><strong>Shared with:</strong> {quiz.sharedList?.length || 0} users</p>
        <p><strong>Question Count:</strong> {questions.length}</p>
      </div>
      <button
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
        onClick={handleStartQuiz}
      >
        시작하기
      </button>
      <button
        className="mt-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
        onClick={handleEditQuiz}
      >
        수정하기
      </button>
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('/')}
      >
        Back to List
      </button>
    </div>
  );
};

export default QuizDetails;