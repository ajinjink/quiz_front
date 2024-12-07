import React from "react";
import { Search } from "lucide-react";
import App from "../../App";
import { useNavigate } from 'react-router-dom';
import Logo from "../component/Logo";
import SearchBlock from '../component/SearchBlock';
import Button from "../component/Button";
import BlueButton from "../component/BlueButton";
import { useAuth } from "../../contexts/AuthContext";

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleLogin = () => {
      navigate('/login');
    };
    const handleSignup = () => {
      navigate('/signup');
    };
    const handleDashboard = () => {
        navigate('/dashboard');
      };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-6 mb-40">
                {/* Navigation Bar */}
                <nav className="flex items-center justify-between px-6 py-4">
                    <Logo />
                    {/* <SearchBlock placeholder="학교, 학과, 과목, 교재를 검색해보세요." onSearch={(keyword) => {
                        navigate('/quizzes', { 
                        state: { searchKeyword: keyword } 
                        });
                    }}/> */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <BlueButton text="대시보드" onClick={handleDashboard} />
                        ) : (
                            <>
                                <Button text="로그인" onClick={handleLogin}/>
                                <BlueButton text="회원가입" onClick={handleSignup}/>
                            </>
                        )}
                    </div>
                </nav>

                {/* Main Content - Centered vertically in viewport */}
                <div
                    className="flex items-center justify-center"
                    style={{ height: "calc(100vh - 72px)" }}>
                    <div className="max-w-7xl w-full px-4">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold mb-8">
                                내 마음대로 만들고 AI가 채점해주는
                                <br />
                                나만의 공부 자료
                            </h1>
                            <div className="flex justify-center gap-4">
                                <button 
                                    className="w-64 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" 
                                    onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/signup')}
                                >
                                    {isAuthenticated ? "대시보드로 이동하기" : "나만의 스터디 버디 만들러 가기"}
                                </button>
                                <button className="w-64 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                                    인기 퀴즈 보러 가기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-12 pt-16">
                    <h1 className="text-5xl font-bold mb-8">
                        왜 StudyBuddy일까요?
                    </h1>
                    <h2 className="text-2xl mb-8">
                        시험 전 날 암기가 부족한가요?
                        <br />
                        StudyBuddy와 퀴즈 셋을 생성하고 반복 학습으로 완벽해 질 수
                        있습니다.
                    </h2>
                    <h2 className="text-2xl mb-8">
                        다양한 시험지 유형으로 나에게 꼭 맞는 학습 자료를 만들 수
                        있어요.
                    </h2>
                    <h2 className="text-3xl font-bold">
                        오타가 나도 괜찮아요.
                    </h2>
                    <h2 className="text-2xl mb-8">
                        AI가 정답과 비교하여 채점해 줍니다.
                    </h2>
                </div>

                {/* Quiz Types - Below the fold */}
                <div className="max-w-4xl mx-auto px-4 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border-2 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <div className="font-bold mb-2">단답형</div>
                            <div className="text-gray-600">10-7은?</div>
                        </div>
                        <div className="border-2 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <div className="font-bold mb-2">서술형</div>
                            <div className="text-gray-600">
                                전기전도도법의
                                <br />
                                장점은?
                            </div>
                        </div>
                        <div className="border-2 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <div className="font-bold mb-2">객관식</div>
                            <div className="text-gray-600">
                                다음 중 니체가 한<br />
                                말이 아닌 것은?
                            </div>
                        </div>
                        <div className="border-2 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <div className="font-bold mb-2">T/F</div>
                            <div className="text-gray-600">
                                독도는 우리나라
                                <br />
                                영토이다.
                            </div>
                        </div>
                    </div>
                </div>


            </div>
            <footer className="mt-auto bg-gray-100 py-6 mt-40">
                <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8">
                            <svg
                                viewBox="0 0 24 24"
                                className="w-full h-full text-blue-600">
                                <path
                                    fill="currentColor"
                                    d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                            StudyBuddy
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">
                        © 2024 StudyBuddy OFFICIAL. All rights reserved.
                    </div>
                    <div className="flex items-center space-x-6">
                        <a
                            href="/about"
                            className="text-gray-600 hover:text-gray-900">
                            About
                        </a>
                        <a
                            href="/faq"
                            className="text-gray-600 hover:text-gray-900">
                            FAQ
                        </a>
                        <a
                            href="/report"
                            className="text-gray-600 hover:text-gray-900">
                            Report
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
