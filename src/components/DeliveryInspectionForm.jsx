import React, { useState, useEffect, useCallback, memo } from 'react';

const DeliveryInspectionForm = ({ title, data, onChange, onCopyPrevious, mode = 'delivery' }) => {
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
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-5xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <input
                        type="date"
                        name="date"
                        value={localData.date || new Date().toISOString().slice(0, 10)}
                        onChange={handleDateChange}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 font-normal"
                    />
                </div>
                {onCopyPrevious && (
                    <button
                        onClick={onCopyPrevious}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                    >
                        <span>📋</span> {mode === 'delivery' ? '계약 내용 가져오기' : '납품 내용 가져오기'}
                    </button>
                )}
            </div>
            <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="text-xs font-bold text-gray-500 uppercase text-center">
                            <th className="px-4 py-3">품목</th>
                            <th className="px-4 py-3">모델명</th>
                            <th className="px-4 py-3">규격</th>
                            <th className="px-4 py-3 w-32">{mode === 'delivery' ? '납품수량' : '검수확인'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.length > 0 ? rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2">
                                    <input type="text" value={row.category || ''} onChange={(e) => handleChange(idx, 'category', e.target.value)} className="w-full border rounded px-2 py-1 text-sm font-bold bg-gray-50" />
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <input
                                        type="text"
                                        value={row.model || ''}
                                        onChange={(e) => handleChange(idx, 'model', e.target.value)}
                                        className="w-full border rounded px-2 py-1 focus:border-blue-500 outline-none"
                                        placeholder="모델명"
                                    />
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <input
                                        type="text"
                                        value={row.spec || ''}
                                        onChange={(e) => handleChange(idx, 'spec', e.target.value)}
                                        className="w-full border rounded px-2 py-1 focus:border-blue-500 outline-none"
                                        placeholder="규격"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {mode === 'delivery' ? (
                                        <input
                                            type="number"
                                            value={row.qty || ''}
                                            onChange={(e) => handleChange(idx, 'qty', e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm text-center focus:border-blue-500 outline-none"
                                            placeholder="0"
                                        />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={row.confirmed || false}
                                            onChange={(e) => handleChange(idx, 'confirmed', e.target.checked)}
                                            className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400">데이터가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(DeliveryInspectionForm);
