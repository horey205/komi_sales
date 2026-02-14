import React, { useState, useEffect, useCallback, memo } from 'react';

const EstimateForm = ({ title, data, onChange, onCopyPrevious }) => {
    // 로컬 상태 도입: 입력 중에는 이 데이터만 바뀝니다.
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        setLocalData(data);
    }, [data.id]); // 업체 ID가 바뀔 때만 동기화

    const handleItemChange = useCallback((index, field, value) => {
        setLocalData(prev => {
            const newItems = [...(prev.items || [])];
            newItems[index] = { ...newItems[index], [field]: value };
            const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            return { ...prev, items: newItems, total };
        });
    }, []);

    const handleCurrencyChange = useCallback((currency) => {
        setLocalData(prev => ({ ...prev, currency }));
    }, []);

    const handleDateChange = useCallback((e) => {
        const val = e.target.value;
        setLocalData(prev => ({ ...prev, date: val }));
    }, []);

    // 지연 보고: 입력이 0.5초 멈추면 그때 부모에게 전달
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(localData) !== JSON.stringify(data)) {
                onChange(localData);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localData, onChange, data]);

    const items = localData.items || [];
    const total = localData.total || 0;
    const currency = localData.currency || 'KRW';

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <input
                        type="date"
                        name="date"
                        value={localData.date || new Date().toISOString().slice(0, 10)}
                        onChange={handleDateChange}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 font-normal text-base sm:text-sm"
                    />
                    {onCopyPrevious && (
                        <button
                            onClick={onCopyPrevious}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
                            title="이전 단계의 내용을 그대로 가져옵니다"
                        >
                            <span>📋</span> 이전 내용 복사
                        </button>
                    )}
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => handleCurrencyChange('KRW')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currency === 'KRW' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        원화 (KRW)
                    </button>
                    <button
                        onClick={() => handleCurrencyChange('USD')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currency === 'USD' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        달러 (USD)
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">품목</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">모델명</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">규격</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">금액 ({currency})</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="text"
                                                value={item.model || ''}
                                                onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="text"
                                                value={item.spec || ''}
                                                onChange={(e) => handleItemChange(index, 'spec', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-base sm:text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                value={item.price || ''}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-right text-base sm:text-sm"
                                                placeholder="0"
                                                inputMode="numeric"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-blue-50 font-bold">
                                    <td colSpan="3" className="px-4 py-3 text-right text-sm text-gray-800">총 합계</td>
                                    <td className="px-4 py-3 text-right text-sm text-blue-600">{currency === 'KRW' ? '₩' : '$'} {total.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">* 금액을 입력하면 자동으로 합계가 계산됩니다.</div>
        </div>
    );
};

export default memo(EstimateForm);
