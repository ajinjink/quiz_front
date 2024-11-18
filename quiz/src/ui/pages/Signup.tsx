import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from './../../api/apiCalls';

interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  university: string;
  department: string;
}

interface SignupErrors {
  username?: string;
  email?: string;
  password?: string;
  university?: string;
  department?: string;
  server?: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateUserDto>({
    username: '',
    password: '',
    email: '',
    university: '',
    department: ''
  });
  
  const [errors, setErrors] = useState<SignupErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: undefined,
      server: undefined
    }));
  };

  const validateForm = () => {
    let newErrors: SignupErrors = {};
    let isValid = true;

    if (!formData.username.trim() || formData.username.length < 4) {
      newErrors.username = '사용자 이름은 4자 이상이어야 합니다.';
      isValid = false;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      isValid = false;
    }

    if (!formData.university.trim()) {
      newErrors.university = '대학교를 입력해주세요.';
      isValid = false;
    }

    if (!formData.department.trim()) {
      newErrors.department = '학과를 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await signup(formData);
        navigate('/');
      } catch (error: any) {
        // Backend error handling
        if (error.response?.data?.message?.includes('username')) {
          setErrors(prev => ({
            ...prev,
            username: '이미 사용 중인 사용자 이름입니다.'
          }));
        } else if (error.response?.data?.message?.includes('email')) {
          setErrors(prev => ({
            ...prev,
            email: '이미 사용 중인 이메일입니다.'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            server: '회원가입에 실패했습니다. 다시 시도해주세요.'
          }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Logo Header */}
      <div className="flex justify-center mb-8">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" className="w-full h-full text-blue-600">
              <path
                fill="currentColor"
                d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-blue-600">StudyBuddy</span>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
        
        {errors.server && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium">
              사용자 이름
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-sm text-gray-500">최소 4글자 이상</p>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-sm text-gray-500">최소 8글자 이상</p>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="university" className="block mb-1 font-medium">
              대학교
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.university ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ex) 서울대학교"
            />
            {errors.university && (
              <p className="mt-1 text-sm text-red-500">{errors.university}</p>
            )}
          </div>

          <div>
            <label htmlFor="department" className="block mb-1 font-medium">
              학과
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ex) 컴퓨터공학과"
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-500">{errors.department}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            회원가입
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;