import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from './api/apiCalls';

enum QuizType {
  SHORT_ANSWERS = 'short_answers',
  TF = 'TF',
  ESSAY = 'essay',
  MULTIPLE_CHOICE = 'multiplechoice'
}

interface QuestionDto {
  question: string;
  answer: string;
  no: number;
}

interface CreateQuizSetDto {
  title: string;
  public: boolean;
  quizType: QuizType;
  questions: QuestionDto[];
}

const CreateQuiz: React.FC = () => {
  const [quizData, setQuizData] = useState<CreateQuizSetDto>({
    title: '',
    public: false,
    quizType: QuizType.SHORT_ANSWERS,
    questions: [{ question: '', answer: '', no: 1 }]
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', answer: '', no: quizData.questions.length + 1 }]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuiz(quizData);
      alert('퀴즈가 성공적으로 생성되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('퀴즈 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">새로운 퀴즈 생성</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2">퀴즈 제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={quizData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="public" className="block mb-2">공개 설정</label>
          <select
            id="public"
            name="public"
            value={quizData.public.toString()}
            onChange={(e) => setQuizData({ ...quizData, public: e.target.value === 'true' })}
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
            value={quizData.quizType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value={QuizType.SHORT_ANSWERS}>단답형</option>
            <option value={QuizType.TF}>OX형</option>
            <option value={QuizType.ESSAY}>서술형</option>
            <option value={QuizType.MULTIPLE_CHOICE}>객관식</option>
          </select>
        </div>
        <h2 className="text-2xl font-bold mb-4">문제</h2>
        {quizData.questions.map((question, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="mb-2">
              <label htmlFor={`question-${index}`} className="block mb-2">문제 {index + 1}</label>
              <textarea
                id={`question-${index}`}
                value={question.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={4}
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
            퀴즈 생성
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;