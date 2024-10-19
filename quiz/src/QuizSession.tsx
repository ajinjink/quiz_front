import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateAnswer } from './api/apiCalls';

interface QuizQuestion {
  id: number;
  no: number;
  question: string;
  answer: string;
  quizSetID: number;
}

interface QuizSessionProps {
  questions: QuizQuestion[];
}

const QuizSession: React.FC<QuizSessionProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [evaluation, setEvaluation] = useState<{ is_correct: boolean; explanation: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestions = isReviewMode ? wrongQuestions : questions;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setEvaluation(null);
      setIsSubmitting(false);
    } else {
      setShowResult(true);
    }
  }, [currentQuestionIndex, currentQuestions.length]);

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

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setEvaluation({
        is_correct: true,
        explanation: '정확히 일치하는 답변입니다!'
      });
      setScore(score + 1);
      setTimeout(() => {
        setIsSubmitting(false);
        moveToNextQuestion();
      }, 2000);
    } else {
      try {
        const result = await evaluateAnswer(currentQuestion.question, currentQuestion.answer, userAnswer);
        setEvaluation(result);

        if (result.is_correct) {
          setScore(score + 1);
          setTimeout(() => {
            setIsSubmitting(false);
            moveToNextQuestion();
          }, 5000);
        } else {
          setWrongQuestions(prev => [...prev, currentQuestion]);
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Failed to evaluate answer:', error);
        alert('답변 평가에 실패했습니다. 다시 시도해주세요.');
        setIsSubmitting(false);
      }
    }
  }, [evaluation, userAnswer, isSubmitting, currentQuestion, score, moveToNextQuestion]);

  

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (evaluation) {
          moveToNextQuestion();
        } else if (!isSubmitting && userAnswer.trim() !== '') {
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [evaluation, userAnswer, isSubmitting, handleSubmit, moveToNextQuestion]);

  const handleFinish = () => {
    navigate('/');
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
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">퀴즈 결과</h2>
        <p className="text-xl mb-4">
          총 {currentQuestions.length}문제 중 {score}문제를 맞추셨습니다!
        </p>
        {!isReviewMode && wrongQuestions.length > 0 && (
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={handleReviewWrongQuestions}
          >
            틀린 문제 다시 풀기 ({wrongQuestions.length}개)
          </button>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleFinish}
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {isReviewMode ? "복습 모드" : ""} 문제 {currentQuestion.no}
      </h2>
      <p className="text-xl mb-4 whitespace-pre-wrap text-left">
        {formatQuestion(currentQuestion.question)}
      </p>
      <input
        ref={inputRef}
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="답변을 입력하세요"
        disabled={evaluation !== null || isSubmitting}
      />
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {evaluation ? '다음 문제' : isSubmitting ? '제출 중...' : '제출'}
      </button>
      {evaluation && (
        <div className={`mt-4 p-4 rounded ${evaluation.is_correct ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-bold">{evaluation.is_correct ? '정답입니다!' : '틀렸습니다.'}</p>
          <p className="whitespace-pre-wrap">{evaluation.explanation}</p>
          <p className="text-sm text-gray-600 mt-2">엔터 키를 눌러 다음 문제로 이동하세요.</p>
        </div>
      )}
    </div>
  );
};

export default QuizSession;