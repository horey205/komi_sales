import React, { memo } from 'react';

const EstimateForm = ({ title, data, onChange, onCopyPrevious, isDemo = false }) => {
    // 부모의 데이터를 직접 사용 (입력 장애의 원인이 되는 localState 제거)
    const items = data?.items || [];
    const total = data?.total || 0;
    const currency = data?.currency || 'KRW';

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // 단가/수량 변경 시 금액 계산
        if (field === 'price' || field === 'qty' || field === 'amount') {
            const price = Number(newItems[index].price) || 0;
            const qty = Number(newItems[index].qty) || 0;
            if (field !== 'amount') {
                newItems[index].amount = price * qty;
            }
        }

        const newTotal = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        onChange({ ...data, items: newItems, total: newTotal });
    };

    const handleCurrencyChange = (newCurrency) => {
        onChange({ ...data, currency: newCurrency });
    };

    const handleDateChange = (e) => {
        onChange({ ...data, date: e.target.value });
    };

    const inputClass = "w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-5xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6 border-b-2 pb-4 gap-2 flex-wrap">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-800">{title}</h2>
                    <input
                        type="date"
                        value={data?.date || new Date().toISOString().slice(0, 10)}
                        onChange={handleDateChange}
                        className="border-2 border-blue-100 rounded-lg px-3 py-1 font-bold text-blue-800 focus:border-blue-500 outline-none"
                    />
                    {onCopyPrevious && (
                        <button
                            onClick={onCopyPrevious}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-1 active:scale-95"
                        >
                            📋 내용 불러오기
                        </button>
                    )}
                </div>
                {!isDemo && (
                    <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner font-black">
                        <button onClick={() => handleCurrencyChange('KRW')} className={`px-4 py-1.5 rounded-lg text-xs transition-all ${currency === 'KRW' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>KRW</button>
                        <button onClick={() => handleCurrencyChange('USD')} className={`px-4 py-1.5 rounded-lg text-xs transition-all ${currency === 'USD' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>USD</button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto border-2 border-gray-100 rounded-2xl mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 font-black text-gray-500 uppercase">
                        <tr className="text-center text-xs">
                            <th className="px-3 py-4">품목</th>
                            <th className="px-3 py-4">모델명</th>
                            <th className="px-3 py-4">규격</th>
                            {!isDemo && <th className="px-3 py-4 w-20">수량</th>}
                            {!isDemo && <th className="px-3 py-4 w-28">단가</th>}
                            {!isDemo && <th className="px-3 py-4 w-32">금액</th>}
                            {isDemo && <th className="px-3 py-4">비고</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {items.length > 0 ? items.map((item, index) => (
                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-2 py-2">
                                    <input type="text" value={item.name || ''} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className={`${inputClass} font-bold bg-gray-50`} placeholder="품목명" />
                                </td>
                                <td className="px-2 py-2">
                                    <input type="text" value={item.model || ''} onChange={(e) => handleItemChange(index, 'model', e.target.value)} className={inputClass} placeholder="모델명" />
                                </td>
                                <td className="px-2 py-2">
                                    <input type="text" value={item.spec || ''} onChange={(e) => handleItemChange(index, 'spec', e.target.value)} className={inputClass} placeholder="규격" />
                                </td>
                                {!isDemo && (
                                    <>
                                        <td className="px-2 py-2">
                                            <input type="number" value={item.qty || ''} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} className={`${inputClass} text-center`} placeholder="0" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input type="number" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className={`${inputClass} text-right`} placeholder="0" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input type="number" value={item.amount || ''} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} className={`${inputClass} text-right font-black bg-blue-50 text-blue-700`} placeholder="0" />
                                        </td>
                                    </>
                                )}
                                {isDemo && (
                                    <td className="px-2 py-2">
                                        <input type="text" value={item.note || ''} onChange={(e) => handleItemChange(index, 'note', e.target.value)} className={inputClass} placeholder="비고 입력" />
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr><td colSpan={isDemo ? 4 : 6} className="p-10 text-center text-gray-400 font-bold">표시할 품목이 없습니다.</td></tr>
                        )}
                        {!isDemo && (
                            <tr className="bg-blue-600 text-white font-black">
                                <td colSpan="5" className="px-4 py-4 text-right text-lg">합계 ({currency})</td>
                                <td className="px-4 py-4 text-right text-xl">
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
