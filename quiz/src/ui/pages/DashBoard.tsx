import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, User } from 'lucide-react';
import Logo from '../component/Logo';
import SearchBlock from '../component/SearchBlock';
import { getRecentQuizSets, getFilteredPublicQuizSets } from '../../api/apiCalls';
import { QuizDto } from '../../interfaces/quiz.dto';
import { useAuth } from '../../contexts/AuthContext';

const getRecentQuizzes = (quizzes: QuizDto[]) => {
    return quizzes
      .sort((a, b) => {
        // 둘 다 lastAttemptDate가 없으면 동일 순위
        if (!a.lastAttemptDate && !b.lastAttemptDate) return 0;
        // a만 lastAttemptDate가 없으면 b가 먼저
        if (!a.lastAttemptDate) return 1;
        // b만 lastAttemptDate가 없으면 a가 먼저
        if (!b.lastAttemptDate) return -1;
        // 둘 다 있으면 날짜 비교
        return new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime();
      })
      .slice(0, 4);
};
  
const formatDate = (dateString: string | null) => {
if (!dateString) return '아직 학습하지 않음';

const date = new Date(dateString);
return new Intl.DateTimeFormat('ko-KR', { 
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
}).format(date);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentQuizzes, setRecentQuizzes] = useState<QuizDto[]>([]);
  const [topQuizzes, setTopQuizzes] = useState<QuizDto[]>([]);
  const [topDepartmentQuizzes, setTopDepartmentQuizzes] = useState<QuizDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopQuizzesLoading, setIsTopQuizzesLoading] = useState(true);
  const [isTopDepartmentQuizzesLoading, setIsTopDepartmentQuizzesLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const [myQuizzesData, topQuizzesData, topDepartmentQuizzesData] = await Promise.all([
          getRecentQuizSets(),
          getFilteredPublicQuizSets({limit: 8}),
          getFilteredPublicQuizSets({
            university: user?.university,
            department: user?.department,
            limit: 8
          })
        ]);
        setRecentQuizzes(myQuizzesData);
        setTopQuizzes(topQuizzesData);
        setTopDepartmentQuizzes(topDepartmentQuizzesData);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      } finally {
        setIsLoading(false);
        setIsTopQuizzesLoading(false);
        setIsTopDepartmentQuizzesLoading(false);
      }
    };
    loadQuizzes();
    console.log(recentQuizzes);
    console.log(topQuizzes);
  }, []);

  const handleProfileClick = () => {
    navigate(`/profile`);
  }

  const handleQuizClick = (quiz: QuizDto) => {
    navigate(`/quiz/${quiz.setID}`, { state: { quiz } });
  };

  const renderQuizCard = (quiz: QuizDto) => (
    <div 
      key={quiz.setID}
      onClick={() => handleQuizClick(quiz)}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <h3 className="text-lg font-medium mb-2">{quiz.title}</h3>
      <div className="text-sm text-gray-600">
        <p>{quiz.subject}</p>
        <p>{quiz.university} {quiz.department}</p>
        <div className="mt-2 text-xs text-gray-500">
          마지막 학습: {formatDate(quiz.lastAttemptDate)}
        </div>
        <div className="flex justify-between mt-2">
          {/* <span>총 {}문제</span> */}
          <span> </span>
          <span>조회수 {quiz.cnt}</span>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <p>아직 생성하신 퀴즈셋이 한 개도 없으시군요.</p>
      <p>나만의 퀴즈셋을 만들어보세요!</p>
      <button
        onClick={() => navigate('/create-quiz')}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        퀴즈셋 만들기
      </button>
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
            <SearchBlock 
              placeholder="학교, 학과, 과목, 교재를 검색해보세요" 
              onSearch={(keyword) => {
                navigate('/quizzes', { 
                  state: { searchKeyword: keyword } 
                });
              }}
            />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/create-quiz')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                퀴즈셋 생성
              </button>
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white" onClick={handleProfileClick}>
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Continue Learning Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">학습 계속하기</h2>
          </div>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
                ) : recentQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getRecentQuizzes(recentQuizzes).map(renderQuizCard)}
                </div>
                ) : (
                renderEmptyState()
            )}
        </section>

        {/* Popular in Department Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">우리 학과 인기 퀴즈셋</h2>
            <button className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate('/quizzes', { 
                state: { 
                  university: user?.university, 
                  department: user?.department 
                }
            })}>더보기</button>
          </div>
          {isTopDepartmentQuizzesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topDepartmentQuizzes.map((quiz) => (
                <div
                  key={quiz.setID}
                  onClick={() => handleQuizClick(quiz)}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-medium mb-2">{quiz.title}</h3>
                  <div className="text-sm text-gray-600">
                    <p>{quiz.subject}</p>
                    <p className="text-sm text-gray-500">{quiz.university}</p>
                    <div className="flex justify-between mt-2">
                      <span>{quiz.department}</span>
                      <span>조회수 {quiz.cnt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Popular Overall Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">인기 퀴즈셋</h2>
            <button className="text-blue-600 hover:text-blue-800" onClick={() => navigate('/quizzes')} >더보기</button>
          </div>
          {isTopQuizzesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topQuizzes.map((quiz) => (
                <div
                  key={quiz.setID}
                  onClick={() => handleQuizClick(quiz)}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-medium mb-2">{quiz.title}</h3>
                  <div className="text-sm text-gray-600">
                    <p>{quiz.subject}</p>
                    <p className="text-sm text-gray-500">{quiz.university}</p>
                    <div className="flex justify-between mt-2">
                      <span>{quiz.department}</span>
                      <span>조회수 {quiz.cnt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
           
        </section>
      </main>
    </div>
  );
};

export default Dashboard;