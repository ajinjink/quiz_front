import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { updateQuizSet } from './../../api/apiCalls';
import { getQuizzesBySetId } from './../../api/apiCalls';
import { fetchQuizDetails } from './../../api/apiCalls';
import { QuizDto } from '../../interfaces/quiz.dto';

interface QuizQuestion {
  id: number;
  no: number;
  question: string;
  answer: string;
  quizSetID: number;
}

const EditQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState<QuizDto>(location.state.quiz);
  const [questions, setQuestions] = useState<QuizQuestion[]>(location.state.questions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        let quizData: QuizDto;
        let questionsData: QuizQuestion[];
        
        // location.state에서 데이터를 우선 사용
        if (location.state?.quiz && location.state?.questions) {
          quizData = location.state.quiz;
          questionsData = location.state.questions;
        } else {
          // state가 없으면 API로 가져옴
          [quizData, questionsData] = await Promise.all([
            fetchQuizDetails(id),
            getQuizzesBySetId(id)
          ]);
        }
        
        setQuiz(quizData);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
        setError('퀴즈 데이터를 불러오는데 실패했습니다.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, location.state, navigate]);

  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: name === 'public' ? value === 'true' : value }));
  };

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Math.max(...questions.map(q => q.id)) + 1,
      no: questions.length + 1,
      question: '',
      answer: '',
      quizSetID: quiz.setID
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !quiz) {
      console.error('Quiz ID or quiz data is undefined');
      return;
    }

    try {
      const updateData = {
        ...quiz,
        questions: questions.map(({ id, no, question, answer }) => ({
          id,
          no,
          question,
          answer
        }))
      };
      
      await updateQuizSet(id, updateData);
      alert('퀴즈가 성공적으로 수정되었습니다!');
      
      // 수정된 데이터와 함께 QuizDetail 페이지로 이동
      navigate(`/quiz/${id}`, {
        replace: true,
        state: {
          quiz,
          questions
        }
      });
    } catch (error) {
      console.error('Failed to update quiz:', error);
      setError('퀴즈 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">퀴즈 수정</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2">퀴즈 제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={quiz.title}
            onChange={handleQuizChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="public" className="block mb-2">공개 설정</label>
          <select
            id="public"
            name="public"
            value={quiz.public.toString()}
            onChange={handleQuizChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="false">비공개</option>
            <option value="true">공개</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="quizType" className="block mb-2">퀴즈 유형</label>
          <select
            id="quizType"
            name="quizType"
            value={quiz.quizType}
            onChange={handleQuizChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="short_answers">단답형</option>
            <option value="TF">OX형</option>
            <option value="essay">서술형</option>
            <option value="multiplechoice">객관식</option>
          </select>
        </div>
        <h2 className="text-2xl font-bold mb-4">문제</h2>
        {questions.map((question, index) => (
          <div key={question.id} className="mb-4 p-4 border rounded">
            <div className="mb-2">
              <label htmlFor={`question-${index}`} className="block mb-2">문제 {index + 1}</label>
              <input
                type="text"
                id={`question-${index}`}
                value={question.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor={`answer-${index}`} className="block mb-2">답변</label>
              <input
                type="text"
                id={`answer-${index}`}
                value={question.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          문제 추가
        </button>
        <div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          퀴즈 수정 완료
        </button>
        <button
          type="button"
          onClick={() => navigate(`/quiz/${id}`, {
            state: { quiz, questions }
          })}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          취소
        </button>
      </div>
      </form>
    </div>
  );
};

export default EditQuiz;