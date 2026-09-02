import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; username?: string }, token: string) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const endpoint = isRegister
        ? 'http://localhost:5001/api/auth/register'
        : 'http://localhost:5001/api/auth/login';

      const payload = isRegister ? { email, password, username } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || '操作失敗，請檢查輸入');
      }

      onLoginSuccess(data.data.user, data.data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '連線伺服器失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-dark-900 border border-slate-700/80 rounded-xl p-6 shadow-2xl relative">
        
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 標題 */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-cmc-blue flex items-center justify-center font-bold text-white text-lg mb-3">
            C
          </div>
          <h2 className="text-base font-bold text-white">
            {isRegister ? '註冊 CryptoRadar 帳號' : '登入 CryptoRadar'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? '建立免費帳號，雲端同步自選清單' : '登入以同步你的自選清單'}
          </p>
        </div>

        {/* 錯誤提示 */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-cmc-red text-xs">
            {errorMsg}
          </div>
        )}

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {isRegister && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">暱稱 (Username)</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="例如: Kaiwei"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">電子信箱 (Email)</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">密碼</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="至少 6 個字元"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-lg bg-cmc-blue hover:bg-blue-600 text-white font-semibold transition-colors cursor-pointer"
          >
            {isLoading ? '處理中...' : isRegister ? '建立帳號' : '登入'}
          </button>
        </form>

        {/* 切換註冊/登入 */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {isRegister ? '已有帳號？' : '還沒有帳號？'}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            className="ml-1 text-cmc-blue hover:underline font-semibold cursor-pointer"
          >
            {isRegister ? '前往登入' : '免費註冊'}
          </button>
        </div>

      </div>
    </div>
  );
}
