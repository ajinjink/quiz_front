import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, Share2, Edit, Trash2 } from 'lucide-react';
import { getQuizzesBySetId, fetchQuizDetails, incrementQuizCount, deleteQuiz } from '../../api/apiCalls';
import { QuizDto } from '../../interfaces/quiz.dto';
import QuizSession from './QuizSession';
import Logo from '../component/Logo';

interface QuizQuestion {
  id: number;
  no: number;
  question: string;
  answer: string;
  quizSetID: number;
}

const QuizDetail = () => {
  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        let quizData: QuizDto;
        let questionsData: QuizQuestion[];
        
        // location.state로부터 quiz 데이터를 우선 사용
        if (location.state?.quiz) {
          quizData = location.state.quiz;
        } else {
          quizData = await fetchQuizDetails(id);
        }
        
        // questions는 항상 API로 가져옴
        questionsData = await getQuizzesBySetId(id);
        
        setQuiz(quizData);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
        setError('퀴즈 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, location.state]);


  const handleStartQuiz = async () => {
    if (!id || questions.length === 0) return;
    
    try {
      await incrementQuizCount(id);
    } catch (error) {
      console.error('Failed to increment quiz count:', error);
    }

    setIsSessionStarted(true);
  };

  if (isSessionStarted && questions.length > 0) {
    return <QuizSession 
      questions={questions} 
      onEndSession={() => setIsSessionStarted(false)} 
    />;
  }

  const handleEdit = () => {
    if (!quiz || !questions || !id) return;
    navigate(`/edit/${id}`, { state: { quiz, questions } });
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    // 사용자 확인
    const isConfirmed = window.confirm('정말로 이 퀴즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!isConfirmed) return;
    
    try {
      await deleteQuiz(id);
      alert('퀴즈가 성공적으로 삭제되었습니다.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('퀴즈 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleShare = () => {
    // Share functionality implementation
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">퀴즈를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-blue-600"
            >
              <Logo />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quiz Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
              <div className="text-gray-600 mb-4">
                {quiz.creator}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">총 {questions.length}문제</span>
                <span className="text-gray-600">누적 풀이 {quiz.cnt}회</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleStartQuiz}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              시작하기
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              수정하기
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제하기
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">댓글</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="border-b last:border-b-0 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium mr-2">T5****</span>
                    <span className="text-gray-500">그냥 그랬어요</span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= 3 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;