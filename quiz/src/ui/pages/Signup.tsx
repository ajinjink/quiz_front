import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signup, checkUsernameExists, checkEmailExists } from './../../api/apiCalls';

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
  passwordConfirm?: string;
  university?: string;
  department?: string;
  server?: string;
}

interface ValidatedFields {
  username: boolean;
  email: boolean;
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
  const [isChecking, setIsChecking] = useState<{username: boolean; email: boolean}>({
    username: false,
    email: false
  });
  const [validated, setValidated] = useState<ValidatedFields>({
    username: false,
    email: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleCheckUsername = async () => {
    if (!formData.username.trim() || formData.username.length < 4) {
      setErrors(prev => ({
        ...prev,
        username: '사용자 이름은 4자 이상이어야 합니다.'
      }));
      return;
    }

    setIsChecking(prev => ({ ...prev, username: true }));
    try {
      const exists = await checkUsernameExists(formData.username);
      if (exists) {
        setErrors(prev => ({
          ...prev,
          username: '이미 사용중인 사용자 이름입니다.'
        }));
        setValidated(prev => ({ ...prev, username: false }));
      } else {
        setErrors(prev => ({ ...prev, username: undefined }));
        setValidated(prev => ({ ...prev, username: true }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        username: '확인에 실패했습니다. 다시 시도해주세요.'
      }));
    } finally {
      setIsChecking(prev => ({ ...prev, username: false }));
    }
  };

  const handleCheckEmail = async () => {
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: '유효한 이메일 주소를 입력해주세요.'
      }));
      return;
    }

    setIsChecking(prev => ({ ...prev, email: true }));
    try {
      const exists = await checkEmailExists(formData.email);
      if (exists) {
        setErrors(prev => ({
          ...prev,
          email: '이미 사용중인 이메일입니다.'
        }));
        setValidated(prev => ({ ...prev, email: false }));
      } else {
        setErrors(prev => ({ ...prev, email: undefined }));
        setValidated(prev => ({ ...prev, email: true }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        email: '확인에 실패했습니다. 다시 시도해주세요.'
      }));
    } finally {
      setIsChecking(prev => ({ ...prev, email: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 값 바뀌면 검증 초기화
    if (name === 'username' || name === 'email') {
      setValidated(prev => ({ ...prev, [name]: false }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
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

    if (!passwordConfirm || passwordConfirm !== formData.password) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
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

    if (!validated.username) {
      newErrors.username = '사용자 이름 중복 확인이 필요합니다.';
      isValid = false;
    }
    if (!validated.email) {
      newErrors.email = '이메일 중복 확인이 필요합니다.';
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
        navigate('/login');
      } catch (error: any) {
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

      <div className="max-w-md mx-auto bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
        
        {errors.server && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='text-left'>
            <label htmlFor="username" className="block mb-1 ml-1 font-medium">
              아이디
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.username ? 'border-red-500' : validated.username ? 'border-green-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={handleCheckUsername}
                disabled={isChecking.username}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded text-sm
                  ${errors.username 
                    ? 'bg-white text-red-500 hover:text-red-700'
                    : validated.username 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:bg-gray-300`}
              >
                {isChecking.username 
                  ? '확인 중...' 
                  : errors.username
                    ? '다시 확인'
                    : validated.username 
                      ? '확인 완료' 
                      : '중복 확인'}
              </button>
            </div>
            <p className="mt-1 ml-1 text-sm text-gray-500">최소 4글자 이상</p>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className='text-left'>
            <label htmlFor="email" className="block mb-1 ml-1 font-medium">
              이메일
            </label>
            <div className='relative'>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500' : validated.email ? 'border-green-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={isChecking.email}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded text-sm
                  ${errors.email 
                    ? 'bg-white text-red-500 hover:text-red-700'
                    : validated.email 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:bg-gray-300`}
              >
                {isChecking.email 
                  ? '확인 중...' 
                  : errors.email
                    ? '다시 확인'
                    : validated.email 
                      ? '확인 완료' 
                      : '중복 확인'}
              </button>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className='text-left'>
            <label htmlFor="password" className="block mb-1 ml-1 font-medium">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 ml-1 text-sm text-gray-500">최소 8글자 이상</p>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className='text-left'>
            <label htmlFor="passwordConfirm" className="block mb-1 ml-1 font-medium">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  if (errors.passwordConfirm) {
                    setErrors(prev => ({ ...prev, passwordConfirm: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.passwordConfirm 
                    ? 'border-red-500' 
                    : passwordConfirm && passwordConfirm === formData.password
                      ? 'border-green-500'
                      : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswordConfirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.passwordConfirm && (
              <p className="mt-1 text-sm text-red-500">{errors.passwordConfirm}</p>
            )}
            {passwordConfirm && passwordConfirm === formData.password && !errors.passwordConfirm && (
              <p className="mt-1 text-sm text-green-500">비밀번호가 일치합니다.</p>
            )}
          </div>

          <div className='text-left'>
            <label htmlFor="university" className="block mb-1 ml-1 font-medium">
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

          <div className='text-left'>
            <label htmlFor="department" className="block mb-1 ml-1 font-medium">
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

          <div>
            <button
              type="submit"
              className="w-full bg-white text-blue-600 border-2 border-blue-600 py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition duration-200 mt-6"
            >
              회원가입
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-slate-400 hover:text-blue-800"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;