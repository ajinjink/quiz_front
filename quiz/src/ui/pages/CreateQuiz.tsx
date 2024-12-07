import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, User } from 'lucide-react';
import { createQuiz } from './../../api/apiCalls';
import Logo from '../component/Logo';
import SearchBlock from '../component/SearchBlock';

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
  subject: string;
  book: string | null;
  public: boolean;
  quizType: QuizType;
  questions: QuestionDto[];
}

const CreateQuiz: React.FC = () => {
  const [quizData, setQuizData] = useState<CreateQuizSetDto>({
    title: '',
    subject: '',
    book: '',
    public: false,
    quizType: QuizType.SHORT_ANSWERS,
    questions: [{ question: '', answer: '', no: 1 }]
  });
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // 교재 정보가 비어있으면 null로 설정
    setQuizData({ ...quizData, book: value.trim() === '' ? null : value });
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

  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setJsonError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const questions = JSON.parse(text);

      // JSON 형식 검증
      if (!Array.isArray(questions)) {
        throw new Error('JSON 파일은 배열 형태여야 합니다.');
      }

      // 각 문제 객체의 형식 검증
      const validQuestions = questions.map((q: any, index: number) => {
        if (!q.question || !q.answer) {
          throw new Error(`${index + 1}번째 문제에 question 또는 answer가 없습니다.`);
        }
        return {
          question: q.question,
          answer: q.answer,
          no: index + 1
        };
      });

      setQuizData(prev => ({
        ...prev,
        questions: validQuestions
      }));
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'JSON 파일 형식이 올바르지 않습니다.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleJsonMode = () => {
    if (!isJsonMode) {
      setJsonError(null);
    }
    setIsJsonMode(!isJsonMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 필수 필드 검증
      if (!quizData.subject.trim()) {
        alert('과목명은 필수 입력값입니다.');
        return;
      }

      await createQuiz(quizData);
      alert('퀴즈가 성공적으로 생성되었습니다!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('퀴즈 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderJsonUpload = () => (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">문제 JSON 업로드</h2>
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-sm text-gray-600 mb-4">
          JSON 파일 형식:
          <pre className="bg-gray-50 p-3 rounded mt-2 overflow-x-auto text-left">
{`[
  {
    "question": "문제 내용",
    "answer": "답변 내용"
  },
  ...
]`}
          </pre>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleJsonFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {jsonError && (
          <div className="mt-2 text-sm text-red-600">
            {jsonError}
          </div>
        )}
      </div>
    </div>
  );

  const renderQuestionsList = () => (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">문제</h2>
      {quizData.questions.map((question, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="mb-2">
            <label htmlFor={`question-${index}`} className="block mb-2 font-medium">
              문제 {index + 1}
            </label>
            <textarea
              id={`question-${index}`}
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              rows={4}
              required
            />
          </div>
          <div className="mb-2">
            <label htmlFor={`answer-${index}`} className="block mb-2 font-medium">
              답변
            </label>
            <input
              type="text"
              id={`answer-${index}`}
              value={question.answer}
              onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>
        </div>
      ))}
      {!isJsonMode && (
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          + 문제 추가
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Logo />
            </div>
            <div className="flex-1 max-w-3xl mx-12">
              {/* <SearchBlock placeholder="학교, 학과, 과목, 교재를 검색해보세요" /> */}
            </div>
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">새로운 퀴즈 생성</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                  퀴즈 제목
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={quizData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block mb-2 font-medium">
                  과목명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={quizData.subject}
                  onChange={handleInputChange}
                  placeholder="예) 컴퓨터구조, 영어회화, 미적분학"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="book" className="block mb-2 font-medium">
                  교재명 <span className="text-gray-500 text-sm">(선택사항)</span>
                </label>
                <input
                  type="text"
                  id="book"
                  name="book"
                  value={quizData.book || ''}
                  onChange={handleBookChange}
                  placeholder="예) 컴퓨터구조론 (David A. Patterson)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="public" className="block mb-2 font-medium">
                    공개 설정
                  </label>
                  <select
                    id="public"
                    name="public"
                    value={quizData.public.toString()}
                    onChange={(e) => setQuizData({ ...quizData, public: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="false">비공개</option>
                    <option value="true">공개</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quizType" className="block mb-2 font-medium">
                    퀴즈 유형
                  </label>
                  <select
                    id="quizType"
                    name="quizType"
                    value={quizData.quizType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={QuizType.SHORT_ANSWERS}>단답형</option>
                    <option value={QuizType.TF}>OX형</option>
                    <option value={QuizType.ESSAY}>서술형</option>
                    <option value={QuizType.MULTIPLE_CHOICE}>객관식</option>
                  </select>
                </div>
              </div>
            </div>

            {isJsonMode ? renderJsonUpload() : renderQuestionsList()}

            <div className="flex flex-col space-y-4 pt-4">
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  퀴즈 생성
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
              <button
                type="button"
                onClick={toggleJsonMode}
                className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isJsonMode ? "직접 문제 입력하기" : "JSON 파일로 퀴즈셋 생성"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;