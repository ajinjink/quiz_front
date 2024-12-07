import { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { shareQuiz } from '../../api/apiCalls';

const ShareModal = ({ quizId, onClose }: { quizId: string; onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('사용자 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await shareQuiz(quizId, username.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || '공유에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            퀴즈 공유하기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4 text-green-600">
            성공적으로 공유되었습니다!
          </div>
        ) : (
          <form onSubmit={handleShare}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                공유할 사용자의 아이디를 입력하세요
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="사용자 아이디"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? '공유 중...' : '공유하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShareModal;