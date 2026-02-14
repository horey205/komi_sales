import React, { useState, useEffect, useCallback, memo } from 'react';

const DeliveryInspectionForm = ({ data, onChange, onCopyPrevious }) => {
    // 로컬 상태 도입
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        setLocalData(data);
    }, [data.id]);

    const handleChange = useCallback((index, field, value) => {
        setLocalData(prev => {
            const currentRows = prev.rows || [];
            const newRows = [...currentRows];
            newRows[index] = { ...newRows[index], [field]: value };
            return { ...prev, rows: newRows };
        });
    }, []);

    const handleDateChange = useCallback((e) => {
        const val = e.target.value;
        setLocalData(prev => ({ ...prev, date: val }));
    }, []);

    // 지연 보고
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(localData) !== JSON.stringify(data)) {
                onChange(localData);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localData, onChange, data]);

    const rows = localData.rows || [];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">납품/검수 내용 입력</h2>
                    <input
                        type="date"
                        name="date"
                        value={localData.date || new Date().toISOString().slice(0, 10)}
                        onChange={handleDateChange}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 font-normal text-base sm:text-sm"
                    />
                </div>
                {onCopyPrevious && (
                    <button
                        onClick={onCopyPrevious}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
                        title="계약 단계의 품목을 가져옵니다"
                    >
                        <span>📋</span> 품목 가져오기
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-black text-gray-500 uppercase">품목</th>
                            <th className="px-4 py-2 text-left text-xs font-black text-gray-500 uppercase">모델명</th>
                            <th className="px-4 py-2 text-left text-xs font-black text-gray-500 uppercase">규격</th>
                            <th className="px-4 py-2 text-center text-xs font-black text-gray-500 uppercase">검수확인</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50">{row.category}</td>
                                <td className="px-4 py-2 text-sm">
                                    <input
                                        type="text"
                                        value={row.model || ''}
                                        onChange={(e) => handleChange(idx, 'model', e.target.value)}
                                        className="w-full border-2 border-gray-100 rounded px-2 py-1 focus:border-blue-500 outline-none text-base sm:text-sm"
                                    />
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <input
                                        type="text"
                                        value={row.spec || ''}
                                        onChange={(e) => handleChange(idx, 'spec', e.target.value)}
                                        className="w-full border-2 border-gray-100 rounded px-2 py-1 focus:border-blue-500 outline-none text-base sm:text-sm"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={row.confirmed || false}
                                        onChange={(e) => handleChange(idx, 'confirmed', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(DeliveryInspectionForm);
