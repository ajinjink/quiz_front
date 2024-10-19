import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuizzes, login } from './api/apiCalls';

interface Quiz {
  setID: number;
  title: string;
  creator: string;
  public: boolean;
  quizType: string;
  sharedList: string[];
  cnt: number;
}

interface LoginUserDto {
  username: string;
  password: string;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
    onClick={onClick}
  >
    {children}
  </button>
);

const QuizCard: React.FC<{ quiz: Quiz; onClick: () => void }> = ({ quiz, onClick }) => (
  <div className="border rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:bg-gray-100" onClick={onClick}>
    <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
    <p>Quiz Type: {quiz.quizType}</p>
    <p>Public: {quiz.public ? 'Yes' : 'No'}</p>
    <p>Shared with: {quiz.sharedList.length} users</p>
    <p>Total Attempts: {quiz.cnt}</p>
  </div>
);

const Main: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loginData, setLoginData] = useState<LoginUserDto>({ username: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchQuizzesData();
    }
  }, []);

  const fetchQuizzesData = async () => {
    try {
      const fetchedQuizzes = await fetchQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    }
  };

  const handleLogin = async () => {
    const success = await login(loginData.username, loginData.password);
    if (success) {
      setIsLoggedIn(true);
      setLoginData({ username: '', password: '' });
      fetchQuizzesData();
    } else {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setQuizzes([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleQuizClick = (quiz: Quiz) => {
    navigate(`/quiz/${quiz.setID}`, { state: { quiz } });
  };

  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        {!isLoggedIn ? (
          <>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleInputChange}
              placeholder="사용자 이름"
              className="mr-2 px-2 py-1 border rounded"
            />
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
              placeholder="비밀번호"
              className="mr-2 px-2 py-1 border rounded"
            />
            <Button onClick={handleLogin}>로그인</Button>
            <Button onClick={handleSignUpClick}>회원가입</Button>
          </>
        ) : (
          <Button onClick={handleLogout}>로그아웃</Button>
        )}
      </div>

      {isLoggedIn && (
        <div className="mt-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">My Quizzes</h1>
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.setID} quiz={quiz} onClick={() => handleQuizClick(quiz)} />
          ))}
          <button
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateQuiz}
          >
            새로운 퀴즈 생성하기
          </button>
        </div>
      )}
    </div>
  );
};

export default Main;