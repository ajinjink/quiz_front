import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { updateQuizSet } from './api/apiCalls';

interface QuizQuestion {
  id: number;
  no: number;
  question: string;
  answer: string;
  quizSetID: number;
}

interface Quiz {
  setID: number;
  title: string;
  creator: string;
  public: boolean;
  quizType: string;
  sharedList: string[];
  cnt: number;
}

const EditQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState<Quiz>(location.state.quiz);
  const [questions, setQuestions] = useState<QuizQuestion[]>(location.state.questions);

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
    if (!id) {
      console.error('Quiz ID is undefined');
      alert('퀴즈 ID를 찾을 수 없습니다.');
      return;
    }
    try {
      const updateData = {
        ...quiz,
        questions: questions.map(({ id, no, question, answer }) => ({ id, no, question, answer }))
      };
      const updatedQuiz = await updateQuizSet(id, updateData);
      alert('퀴즈가 성공적으로 수정되었습니다!');
      navigate(`/quiz/${id}`, { 
        replace: true, 
        state: { quiz: updatedQuiz } 
      });
    } catch (error) {
      console.error('Failed to update quiz:', error);
      alert('퀴즈 수정에 실패했습니다. 다시 시도해주세요.');
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
            onClick={() => navigate(`/quiz/${id}`)}
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