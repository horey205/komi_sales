import React, { useState, useEffect, useCallback, memo } from 'react';

const EstimateForm = ({ title, data, onChange, onCopyPrevious, isDemo = false }) => {
    const safeData = data || { items: [], total: 0, currency: 'KRW' };
    const [localData, setLocalData] = useState(safeData);

    useEffect(() => {
        setLocalData(safeData);
    }, [JSON.stringify(safeData)]);

    const handleItemChange = useCallback((index, field, value) => {
        setLocalData(prev => {
            const newItems = [...(prev.items || [])];
            newItems[index] = { ...newItems[index], [field]: value };

            // 단가(price)와 수량(qty)이 있으면 금액(amount) 계산
            if (field === 'price' || field === 'qty') {
                const price = Number(newItems[index].price) || 0;
                const qty = Number(newItems[index].qty) || 0;
                newItems[index].amount = price * qty;
            }

            const total = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            const newData = { ...prev, items: newItems, total };
            onChange(newData);
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
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-5xl mx-auto border border-gray-200">
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
                {!isDemo && (
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => handleCurrencyChange('KRW')} className={`px-3 py-1 text-xs font-bold rounded-md ${currency === 'KRW' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>KRW</button>
                        <button onClick={() => handleCurrencyChange('USD')} className={`px-3 py-1 text-xs font-bold rounded-md ${currency === 'USD' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>USD</button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="text-xs font-bold text-gray-500 uppercase text-center">
                            <th className="px-2 py-3">품목</th>
                            <th className="px-2 py-3">모델명</th>
                            <th className="px-2 py-3">규격</th>
                            {!isDemo && <th className="px-2 py-3 w-24">수량</th>}
                            {!isDemo && <th className="px-2 py-3 w-32">단가</th>}
                            {!isDemo && <th className="px-2 py-3 w-32">금액</th>}
                            {isDemo && <th className="px-2 py-3">비고</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? items.map((item, index) => (
                            <tr key={index}>
                                <td className="px-2 py-2">
                                    <input type="text" value={item.name || ''} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="w-full border rounded px-2 py-1 text-sm font-bold bg-gray-50" placeholder="품목명" />
                                </td>
                                <td className="px-2 py-2">
                                    <input type="text" value={item.model || ''} onChange={(e) => handleItemChange(index, 'model', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" placeholder="모델명" />
                                </td>
                                <td className="px-2 py-2">
                                    <input type="text" value={item.spec || ''} onChange={(e) => handleItemChange(index, 'spec', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" placeholder="규격" />
                                </td>
                                {!isDemo && (
                                    <>
                                        <td className="px-2 py-2">
                                            <input type="number" value={item.qty || ''} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} className="w-full border rounded px-2 py-1 text-sm text-center focus:border-blue-500 outline-none" placeholder="0" inputMode="numeric" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input type="number" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="w-full border rounded px-2 py-1 text-sm text-right focus:border-blue-500 outline-none" placeholder="0" inputMode="numeric" />
                                        </td>
                                        <td className="px-2 py-2 text-right text-sm font-bold bg-blue-50">
                                            {(item.amount || 0).toLocaleString()}
                                        </td>
                                    </>
                                )}
                                {isDemo && (
                                    <td className="px-2 py-2">
                                        <input type="text" value={item.note || ''} onChange={(e) => handleItemChange(index, 'note', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" placeholder="비고 입력" />
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr><td colSpan={isDemo ? 4 : 6} className="p-10 text-center text-gray-400">데이터가 없습니다.</td></tr>
                        )}
                        {!isDemo && (
                            <tr className="bg-blue-100 font-black">
                                <td colSpan="5" className="px-4 py-3 text-right text-gray-800">합계 ({currency})</td>
                                <td className="px-4 py-3 text-right text-blue-700">
                                    {currency === 'KRW' ? '₩' : '$'} {total.toLocaleString()}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(EstimateForm);
