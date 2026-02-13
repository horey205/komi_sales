import React, { useState } from 'react';

const GithubSync = ({ formData, setFormData }) => {
    const [token, setToken] = useState(localStorage.getItem('github_token') || '');
    const [repo, setRepo] = useState(localStorage.getItem('github_repo') || 'horey205/komi_sales');
    const [status, setStatus] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const saveSettings = () => {
        if (!token) {
            setStatus('토큰을 입력해주세요.');
            return;
        }
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_repo', repo);
        setStatus('설정 저장됨');
        setTimeout(() => setStatus(''), 2000);
        setShowSettings(false);
    };

    const loadFromGithub = async () => {
        if (!token) {
            setShowSettings(true);
            setStatus('먼저 설정해주세요.');
            return;
        }

        setStatus('불러오는 중...');
        try {
            const [owner, repoName] = repo.split('/');
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/data.json`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) throw new Error('불러오기 실패');

            const data = await response.json();
            const content = decodeURIComponent(escape(atob(data.content)));
            const json = JSON.parse(content);

            setFormData(json);
            setStatus('불러오기 완료!');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error(error);
            setStatus(`오류: ${error.message}`);
        }
    };

    const saveToGithub = async () => {
        if (!token) {
            setShowSettings(true);
            setStatus('먼저 설정해주세요.');
            return;
        }

        setStatus('저장 중...');
        try {
            const [owner, repoName] = repo.split('/');

            const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/data.json`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!getResponse.ok) throw new Error('파일 정보 확인 실패');

            const fileData = await getResponse.json();
            const sha = fileData.sha;

            const content = btoa(unescape(encodeURIComponent(JSON.stringify(formData, null, 2))));

            const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/data.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Update sales data - ${new Date().toLocaleString()}`,
                    content: content,
                    sha: sha,
                }),
            });

            if (!updateResponse.ok) throw new Error('저장 실패');

            setStatus('저장 완료!');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error(error);
            setStatus(`오류: ${error.message}`);
        }
    };

    const downloadCSV = () => {
        try {
            const rows = [];

            // 1. Consultation Detail
            const cons = formData.consultation || {};
            rows.push(['[상담 내역]']);
            rows.push(['항목', '내용']);
            Object.entries(cons).forEach(([key, value]) => {
                rows.push([key, `"${value || ''}"`]);
            });
            rows.push([]);

            // 2. Estimates
            ['estimate1', 'estimate2', 'estimate3'].forEach((estKey, idx) => {
                const est = formData[estKey] || { items: [], total: 0, currency: 'KRW' };
                rows.push([`[견적 ${idx + 1}차]`]);
                rows.push(['모델명', '스펙', '수량', '단가', '합계']);
                (est.items || []).forEach(item => {
                    rows.push([`"${item.model || ''}"`, `"${item.spec || ''}"`, item.qty || 0, item.price || 0, (item.qty || 0) * (item.price || 0)]);
                });
                rows.push(['총계', '', '', '', `"${est.total} ${est.currency}"`]);
                rows.push([]);
            });

            const csvContent = rows.map(row => row.join(',')).join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = `sales_data_${new Date().toISOString().slice(0, 10)}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus('CSV 다운로드 완료!');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error(error);
            setStatus('CSV 다운로드 실패');
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-blue-600 mr-1 truncate max-w-[80px] sm:max-w-none hidden sm:block">{status}</span>

            <button
                onClick={loadFromGithub}
                className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 border border-gray-300 flex items-center justify-center h-10 w-10 min-w-[40px]"
                title="불러오기"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>

            <button
                onClick={saveToGithub}
                className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 border border-blue-300 flex items-center justify-center h-10 w-10 min-w-[40px]"
                title="저장하기"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </button>

            <button
                onClick={downloadCSV}
                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 border border-green-300 flex items-center justify-center h-10 w-10 min-w-[40px]"
                title="엑셀(CSV) 저장"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </button>

            <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 h-10 w-10 flex items-center justify-center min-w-[40px]"
                title="GitHub 설정"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">GitHub 연동 설정</h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Personal Access Token</label>
                                <input
                                    type="password"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="ghp_..."
                                />
                                <p className="text-xs text-gray-500 mt-1">GitHub Settings &gt; Developer settings &gt; Tokens (Classic)</p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Repository (Owner/Repo)</label>
                                <input
                                    type="text"
                                    value={repo}
                                    onChange={(e) => setRepo(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="username/repository"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={saveSettings}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold transition-colors shadow-sm"
                                >
                                    저장하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GithubSync;
