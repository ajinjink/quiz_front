import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { evaluateAnswer } from './../../api/apiCalls';
import Logo from '../component/Logo';

interface QuizQuestion {
  id: number;
  no: number;
  question: string;
  answer: string;
  quizSetID: number;
}

interface QuizSessionProps {
  questions: QuizQuestion[];
  onEndSession?: () => void;
}

const QuizSession: React.FC<QuizSessionProps> = ({ questions, onEndSession }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [evaluation, setEvaluation] = useState<{ is_correct: boolean; explanation: string; correct_answer: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isEvaluating, setIsEvaluating] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const autoMoveTimeoutRef = useRef<NodeJS.Timeout>();

  const currentQuestions = isReviewMode ? wrongQuestions : questions;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setEvaluation(null);
      setIsSubmitting(false);
      // setIsEvaluating(false);
    } else {
      setShowResult(true);
    }
  }, [currentQuestionIndex, currentQuestions.length]);

  useEffect(() => {
    return () => {
      if (autoMoveTimeoutRef.current) {
        clearTimeout(autoMoveTimeoutRef.current);
      }
    };
  }, []);

  const formatQuestion = (question: string) => {
    return question.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < question.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().replace(/\s/g, '');
  };

  const handleSubmit = useCallback(async () => {
    if (evaluation) {
      moveToNextQuestion();
      return;
    }

    if (userAnswer.trim() === '' || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(currentQuestion.answer);

    // 정확히 일치하는 경우
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setEvaluation({
        is_correct: true,
        explanation: '정확히 일치하는 답변입니다!',
        correct_answer: currentQuestion.answer
      });
      setScore(score + 1);
      
      // 2초 후 자동으로 다음 문제로 이동
      autoMoveTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
        moveToNextQuestion();
      }, 2000);
      
      return;
    }

    // 정확히 일치하지 않는 경우 API 호출
    try {
      const result = await evaluateAnswer(currentQuestion.question, currentQuestion.answer, userAnswer);
      setEvaluation({...result, correct_answer: currentQuestion.answer});

      if (result.is_correct) {
        setScore(score + 1);
      } else {
        setWrongQuestions(prev => [...prev, currentQuestion]);
      }
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      alert('답변 평가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluation, userAnswer, isSubmitting, currentQuestion, score, moveToNextQuestion]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isSubmitting) {
          return; // 제출 중에는 엔터키 무시
        }
        
        if (evaluation) {
          // 이전 타이머가 있다면 취소
          if (autoMoveTimeoutRef.current) {
            clearTimeout(autoMoveTimeoutRef.current);
          }
          moveToNextQuestion();
        } else if (userAnswer.trim() !== '') {
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [evaluation, userAnswer, isSubmitting, handleSubmit, moveToNextQuestion]);

  const handleEndSession = () => {
    if (onEndSession) {
      onEndSession();
    } else {
      navigate(-1);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const handleReviewWrongQuestions = () => {
    setIsReviewMode(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setUserAnswer('');
    setEvaluation(null);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <Logo />
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">퀴즈 결과</h2>
            <p className="text-xl mb-6">
              총 {currentQuestions.length}문제 중 {score}문제를 맞추셨습니다!
            </p>
            <div className="flex space-x-4">
              {!isReviewMode && wrongQuestions.length > 0 && (
                <button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  onClick={handleReviewWrongQuestions}
                >
                  틀린 문제 다시 풀기 ({wrongQuestions.length}개)
                </button>
              )}
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                onClick={handleFinish}
              >
                종료하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Logo />
            </div>
            <button
              onClick={handleEndSession}
              className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              그만 풀기
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isReviewMode ? "복습 모드" : ""} 문제 {currentQuestion.no}
            </h2>
            <span className="text-gray-500">
              {currentQuestionIndex + 1} / {currentQuestions.length}
            </span>
          </div>
          
          <p className="text-xl mb-6 whitespace-pre-wrap text-left">
            {formatQuestion(currentQuestion.question)}
          </p>
          
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="답변을 입력하세요"
            disabled={evaluation !== null || isSubmitting}
          />
          
          <button
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              evaluation
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {evaluation ? '다음 문제' : isSubmitting ? '제출 중...' : '제출'}
          </button>

          {evaluation && (
            <div className={`mt-6 p-4 rounded-lg ${evaluation.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-bold mb-2">{evaluation.is_correct ? '정답입니다!' : '틀렸습니다.'}</p>
              <p className="whitespace-pre-wrap font-bold mb-2"><span className="font-normal">정답은 : </span>{evaluation.correct_answer}</p>
              <p className="whitespace-pre-wrap">{evaluation.explanation}</p>
              <p className="text-sm text-gray-600 mt-2">엔터 키를 눌러 다음 문제로 이동하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizSession;