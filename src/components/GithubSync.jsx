import React, { useState, useEffect } from 'react';
import { encrypt, decrypt, isEncrypted } from '../utils/crypto';

const GithubSync = ({ records, setRecords, encryptionKey }) => {
    // Helper to get decrypted setting
    const getDecryptedSetting = (key) => {
        const val = localStorage.getItem(key) || '';
        if (isEncrypted(val) && encryptionKey) {
            return decrypt(val, encryptionKey) || val;
        }
        return val;
    };

    const [token, setToken] = useState(getDecryptedSetting('github_token'));
    const [repo, setRepo] = useState(localStorage.getItem('github_repo') || 'horey205/komi_sales');
    const [status, setStatus] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    // Re-initialize when encryptionKey changes (e.g. login)
    useEffect(() => {
        setToken(getDecryptedSetting('github_token'));
    }, [encryptionKey]);

    const saveSettings = () => {
        if (!token) {
            setStatus('토큰을 입력해주세요.');
            return;
        }
        const encryptedToken = encryptionKey ? encrypt(token, encryptionKey) : token;
        localStorage.setItem('github_token', encryptedToken);
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
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/db_v1_secure.dat`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) throw new Error('불러오기 실패');

            const data = await response.json();
            let contentString = decodeURIComponent(escape(atob(data.content)));

            // Decrypt if encrypted
            if (isEncrypted(contentString)) {
                if (!encryptionKey) throw new Error('암호 해독 키가 없습니다.');
                const decrypted = decrypt(contentString, encryptionKey);
                if (decrypted === null) throw new Error('암호 해독 실패 (비밀번호 확인 필요)');
                contentString = typeof decrypted === 'string' ? decrypted : JSON.stringify(decrypted);
            }

            let json = JSON.parse(contentString);

            if (!Array.isArray(json)) {
                json = json && Object.keys(json).length > 0 ? [{ ...json, id: Date.now(), updatedAt: new Date().toISOString() }] : [];
            }

            setRecords(json);
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

            const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/db_v1_secure.dat`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!getResponse.ok) throw new Error('파일 정보 확인 실패');

            const fileData = await getResponse.json();
            const sha = fileData.sha;

            // Encrypt content before saving
            const jsonString = JSON.stringify(records, null, 2);
            const finalContentString = encryptionKey ? encrypt(jsonString, encryptionKey) : jsonString;
            const content = btoa(unescape(encodeURIComponent(finalContentString)));

            const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/db_v1_secure.dat`, {
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
            if (!records || records.length === 0) {
                setStatus('내역이 없습니다.');
                return;
            }

            const rows = [];
            records.forEach((record, recordIdx) => {
                const client = record.consultation?.clientName || '이름 없음';
                rows.push([`=== 상담 ${recordIdx + 1} (${client}) ===`]);
                const c = record.consultation || {};
                rows.push(['[기본]', '업체', c.clientName, '담당', c.manager, '연락', c.phone1]);
                ['estimate1', 'estimate2', 'estimate3', 'demo', 'contract'].forEach(k => {
                    const s = record[k] || { total: 0, currency: 'KRW' };
                    rows.push([k, s.total, s.currency]);
                });
                rows.push([]);
            });

            const csvContent = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sales_export_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            setStatus('CSV 완성!');
        } catch (e) {
            setStatus('CSV 오류');
        }
    };

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-black text-blue-800 truncate max-w-[40px] sm:max-w-none">{status}</span>

            <div className="flex gap-1">
                <button onClick={loadFromGithub} className="bg-gray-100 p-2 sm:px-3 rounded-md border border-gray-300 text-xs font-bold hover:bg-gray-200" title="불러오기">⬇(Load)</button>
                <button onClick={saveToGithub} className="bg-blue-600 p-2 sm:px-3 rounded-md text-white text-xs font-bold hover:bg-blue-700" title="저장하기">⬆(Save)</button>
                <button onClick={downloadCSV} className="bg-green-600 p-2 sm:px-3 rounded-md text-white text-xs font-bold hover:bg-green-700" title="CSV">💾(CSV)</button>
                <button
                    onClick={() => setShowSettings(true)}
                    className="bg-gray-800 text-white p-2 rounded-md hover:bg-black"
                    title="GitHub 설정"
                >
                    ⚙
                </button>
            </div>

            {showSettings && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '16px'
                    }}
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '360px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-gray-900">GitHub 연동 설정</h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 text-2xl">&times;</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">GitHub Token (Classic)</label>
                                <input
                                    type="password"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                                    placeholder="ghp_..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-700 mb-1 uppercase tracking-wider">Repository (Owner/Repo)</label>
                                <input
                                    type="text"
                                    value={repo}
                                    onChange={(e) => setRepo(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm font-mono"
                                    placeholder="username/repo"
                                />
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={saveSettings}
                                    className="flex-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
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
