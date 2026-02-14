import React, { useState, useEffect, useCallback, memo } from 'react';

const EstimateForm = ({ title, data, onChange, onCopyPrevious }) => {
    // data가 없을 때를 대비한 안전장치
    const safeData = data || { items: [], total: 0, currency: 'KRW' };
    const [localData, setLocalData] = useState(safeData);

    // 부모 데이터가 바뀌었을 때 (다른 레코드를 열거나 단계이동 시) 동기화
    // JSON.stringify를 통해 데이터 내용이 실제로 바뀌었을 때만 갱신
    useEffect(() => {
        setLocalData(safeData);
    }, [JSON.stringify(safeData)]);

    const handleItemChange = useCallback((index, field, value) => {
        setLocalData(prev => {
            const newItems = [...(prev.items || [])];
            newItems[index] = { ...newItems[index], [field]: value };
            const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            const newData = { ...prev, items: newItems, total };
            onChange(newData); // 수동 저장 체제이므로 즉시 부모에게는 알림 (서버 저장은 안함)
            return newData;
        });
    }, [onChange]);

    const handleCurrencyChange = useCallback((currency) => {
        const newData = { ...localData, currency };
        setLocalData(newData);
        onChange(newData);
    }, [localData, onChange]);

    const handleDateChange = useCallback((e) => {
        const newData = { ...localData, date: e.target.value };
        setLocalData(newData);
        onChange(newData);
    }, [localData, onChange]);

    const items = localData.items || [];
    const total = localData.total || 0;
    const currency = localData.currency || 'KRW';

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2 gap-2 flex-wrap text-sm sm:text-base">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <input
                        type="date"
                        name="date"
                        value={localData.date || new Date().toISOString().slice(0, 10)}
                        onChange={handleDateChange}
                        className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 text-gray-600"
                    />
                    {onCopyPrevious && (
                        <button
                            onClick={onCopyPrevious}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            📋 내용 복사
                        </button>
                    )}
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => handleCurrencyChange('KRW')} className={`px-3 py-1 text-xs font-bold rounded-md ${currency === 'KRW' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>KRW</button>
                    <button onClick={() => handleCurrencyChange('USD')} className={`px-3 py-1 text-xs font-bold rounded-md ${currency === 'USD' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>USD</button>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="text-xs font-bold text-gray-500 uppercase">
                            <th className="px-4 py-3 text-left">품목</th>
                            <th className="px-4 py-3 text-left">모델명</th>
                            <th className="px-4 py-3 text-left">규격</th>
                            <th className="px-4 py-3 text-right">금액</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? items.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 text-sm font-bold text-gray-900 bg-gray-50">{item.name}</td>
                                <td className="px-4 py-2"><input type="text" value={item.model || ''} onChange={(e) => handleItemChange(index, 'model', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" placeholder="모델명" /></td>
                                <td className="px-4 py-2"><input type="text" value={item.spec || ''} onChange={(e) => handleItemChange(index, 'spec', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" placeholder="규격" /></td>
                                <td className="px-4 py-2"><input type="number" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="w-full border rounded px-2 py-1 text-sm text-right focus:border-blue-500 outline-none" placeholder="0" inputMode="numeric" /></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400">데이터가 없습니다.</td></tr>
                        )}
                        <tr className="bg-blue-50 font-black">
                            <td colSpan="3" className="px-4 py-3 text-right text-gray-800">총 합계</td>
                            <td className="px-4 py-3 text-right text-blue-700">{currency === 'KRW' ? '₩' : '$'} {total.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(EstimateForm);
