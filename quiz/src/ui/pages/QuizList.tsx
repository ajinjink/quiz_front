import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { getFilteredPublicQuizSets, searchQuizSet } from '../../api/apiCalls';
import { QuizDto } from '../../interfaces/quiz.dto';
import Logo from '../component/Logo';
import SearchBlock from '../component/SearchBlock';

interface LocationState {
    university?: string;
    department?: string;
    searchKeyword?: string;
  }

const ITEMS_PER_PAGE = 12;

const QuizList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { university, department, searchKeyword: initialSearchKeyword } = location.state as LocationState || {};
  
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword || '');

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        ...(university && { university }),
        ...(department && { department })
      };
      const data = await getFilteredPublicQuizSets(params);
      setQuizzes(data);
      setIsSearchMode(false);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setError('퀴즈 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [university, department]);

  const handleSearch = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    setSearchKeyword(keyword);
    
    try {
      const searchResults = await searchQuizSet(keyword);
      setQuizzes(searchResults);
      setIsSearchMode(true);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search quizzes:', error);
      setError('검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchKeyword) {
      handleSearch(searchKeyword);
    } else {
      fetchQuizzes();
    }
  }, [searchKeyword, fetchQuizzes, handleSearch]);

  const totalPages = Math.ceil(quizzes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentQuizzes = quizzes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleQuizClick = (quiz: QuizDto) => {
    navigate(`/quiz/${quiz.setID}`, { state: { quiz } });
  };

  const getTitle = () => {
    if (isSearchMode) {
      return `'${searchKeyword}' 검색 결과`;
    }
    if (university && department) {
      return `${university} ${department} 인기 시험지`;
    }
    return '전체 인기 시험지';
  };

  const getSubtitle = () => {
    if (isSearchMode) {
      return `${quizzes.length}개의 퀴즈셋을 찾았습니다.`;
    }
    if (university && department) {
      return `${university} ${department} 학생들이 많이 보는 시험지입니다.`;
    }
    return '전체 학생들이 많이 보는 인기 시험지입니다.';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Logo />
            </div>
            <div className="flex-1 max-w-3xl mx-12">
              <SearchBlock placeholder="학교, 학과, 과목, 교재를 검색해보세요" onSearch={handleSearch}/>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white"
              >
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-gray-600 mt-2">{getSubtitle()}</p>
          {isSearchMode && (
            <button
              onClick={fetchQuizzes}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              전체 퀴즈셋 보기
            </button>
          )}
        </div>

        {error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : quizzes.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            아직 등록된 시험지가 없습니다.
          </div>
        ) : (
          <>
            {/* Quiz Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentQuizzes.map((quiz) => (
                <div
                  key={quiz.setID}
                  onClick={() => handleQuizClick(quiz)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                >
                  <h3 className="text-lg font-medium mb-2">{quiz.title}</h3>
                  <div className="text-sm text-gray-600">
                    <p>{quiz.department}</p>
                    <p className="text-xs text-gray-500 mt-1">작성자: {quiz.creator}</p>
                    <div className="flex justify-between mt-4">
                      <span>{quiz.subject}</span>
                      <span>조회수 {quiz.cnt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return [
                        <span key={`ellipsis-${page}`} className="px-3 py-1">...</span>,
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ];
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizList;