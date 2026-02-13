import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('komi');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Check password first (since it's the encryption key)
        if (password === 'komi3386') {
            if (username === 'komi') {
                onLogin(password, 'admin'); // Admin role
            } else if (username === 'guest') {
                onLogin(password, 'viewer'); // Viewer role
            } else {
                setError('등록되지 않은 아이디입니다. (komi 또는 guest)');
            }
        } else {
            setError('비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full border border-gray-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-800">영업 상담 관리</h2>
                    <p className="text-gray-500 text-sm mt-1">로그인이 필요합니다.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="아이디 입력"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="비밀번호 입력"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        로그인
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    sales management system v1.0
                </div>
            </div>
        </div>
    );
};

export default Login;
