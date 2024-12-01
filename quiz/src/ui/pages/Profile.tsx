import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, LogOut, Settings, BookOpen, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../component/Logo';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('내 시험지');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { id: '내 시험지', icon: <BookOpen className="w-5 h-5" /> },
    { id: '공유받은 시험지', icon: <Share2 className="w-5 h-5" /> },
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
      case '내 시험지':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">내 시험지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold">운영체제 기말고사</h3>
                  <p className="text-gray-600">생성일: 2024-03-15</p>
                  <p className="text-gray-600">문제 수: 20</p>
                </div>
              ))}
            </div>
          </div>
        );
      case '공유받은 시험지':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">공유받은 시험지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold">자료구조 중간고사</h3>
                  <p className="text-gray-600">공유자: 김철수</p>
                  <p className="text-gray-600">문제 수: 15</p>
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