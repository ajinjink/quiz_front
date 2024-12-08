import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, LogOut, Settings, BookOpen, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../component/Logo';
import { fetchMyQuizzes, fetchSharedQuizzes } from '../../api/apiCalls';
import { QuizDto } from '../../interfaces/quiz.dto';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('내 퀴즈셋');
  const [myQuizzes, setMyQuizzes] = useState<QuizDto[]>([]);
  const [sharedQuizzes, setSharedQuizzes] = useState<QuizDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadQuizzes = async () => {
      if (activeTab === '내 퀴즈셋') {
        try {
          const quizzes = await fetchMyQuizzes();
          setMyQuizzes(quizzes);
        } catch (error) {
          console.error('Failed to fetch quizzes:', error);
        } finally {
          setIsLoading(false);
        }
      }
      else if (activeTab === '공유받은 퀴즈셋') {
        try {
          const quizzes = await fetchSharedQuizzes();
          setSharedQuizzes(quizzes);
        } catch (error) {
          console.error('Failed to fetch quizzes:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadQuizzes();
  }, [activeTab]);

  const handleQuizClick = (quiz: QuizDto) => {
    navigate(`/quiz/${quiz.setID}`, { state: { quiz } });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '아직 학습하지 않음';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const navItems = [
    { id: '내 퀴즈셋', icon: <BookOpen className="w-5 h-5" /> },
    { id: '공유받은 퀴즈셋', icon: <Share2 className="w-5 h-5" /> },
    { id: '찜하기', icon: <BookOpen className="w-5 h-5" /> },
    { id: '계정 설정', icon: <Settings className="w-5 h-5" /> },
    { id: '로그아웃', icon: <LogOut className="w-5 h-5" /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const ProfileSummary = () => (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{user?.username}</h2>
        <button className="text-gray-600 hover:text-gray-900">
          <Pencil className="w-5 h-5" />
        </button>
      </div>
      <p className="text-gray-600 text-sm">{user?.university}</p>
      <p className="text-gray-600 text-sm">{user?.department}</p>
      <p className="text-gray-600 text-sm">{user?.email}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case '내 퀴즈셋':
        if (isLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (myQuizzes.length === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">아직 생성한 퀴즈가 없습니다.</p>
              <button
                onClick={() => navigate('/create-quiz')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                첫 퀴즈 만들기
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">내 퀴즈셋</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myQuizzes.map((quiz) => (
                <div
                  key={quiz.setID}
                  onClick={() => handleQuizClick(quiz)}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                  <p className="text-gray-600">{quiz.subject}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    마지막 학습: {formatDate(quiz.lastAttemptDate)}
                  </p>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{quiz.public ? '공개' : '비공개'}</span>
                    <span>조회수: {quiz.cnt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case '공유받은 퀴즈셋':
        if (isLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (sharedQuizzes.length === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">아직 공유받은 퀴즈가 없습니다.</p>
              {/* <button
                onClick={() => navigate('/create-quiz')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                첫 퀴즈 만들기
              </button> */}
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">공유받은 퀴즈셋</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedQuizzes.map((quiz) => (
                <div
                  key={quiz.setID}
                  onClick={() => handleQuizClick(quiz)}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                  <p className="text-gray-600">{quiz.subject}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    마지막 학습: {formatDate(quiz.lastAttemptDate)}
                  </p>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{quiz.public ? '공개' : '비공개'}</span>
                    <span>조회수: {quiz.cnt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case '계정 설정':
        return (
          <div className="flex justify-center">
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">계정 설정</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자 이름</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    defaultValue={user?.username}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">학교</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    defaultValue={user?.university}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">학과</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    defaultValue={user?.department}
                  />
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                  변경사항 저장
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>컨텐츠를 준비중입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="cursor-pointer" onClick={handleLogoClick}>
          <Logo />
        </div>
      </div>


      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r">
          {/* Profile Summary */}
          <div className="p-6 border-b">
            <ProfileSummary />
          </div>
          
          {/* Navigation */}
          <nav className="mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === '로그아웃' ? handleLogout() : setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 
                  ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              >
                {item.icon}
                <span className="ml-3">{item.id}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;