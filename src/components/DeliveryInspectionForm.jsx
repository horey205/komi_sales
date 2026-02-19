import React, { memo } from 'react';

const DeliveryInspectionForm = ({ title, data, onChange, onCopyPrevious, mode = 'delivery' }) => {
    const rows = data?.rows || [];
    const date = data?.date || new Date().toISOString().slice(0, 10);

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        onChange({ ...data, rows: newRows });
    };

    const handleDateChange = (e) => {
        onChange({ ...data, date: e.target.value });
    };

    const inputClass = "w-full border border-gray-300 rounded px-2 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-5xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-800">{title}</h2>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="border-2 border-blue-100 rounded-lg px-3 py-1 font-bold text-blue-800 focus:border-blue-500 outline-none"
                    />
                    {onCopyPrevious && (
                        <button
                            onClick={onCopyPrevious}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-1 active:scale-95"
                        >
                            <span>📋</span> {mode === 'delivery' ? '계약 내용 불러오기' : '납품 내용 불러오기'}
                        </button>
                    )}
                </div>
            </div>
            {/* PC용 테이블 (lg 이상에서만 보임) */}
            <div className="hidden lg:block overflow-x-auto border-2 border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 font-black text-gray-500 uppercase">
                        <tr className="text-center">
                            <th className="px-4 py-4">품목</th>
                            <th className="px-4 py-4">모델명</th>
                            <th className="px-4 py-4">규격</th>
                            <th className="px-4 py-4 w-32">{mode === 'delivery' ? '납품수량' : '검수확인'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {rows.length > 0 ? rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={row.category || ''}
                                        onChange={(e) => handleChange(idx, 'category', e.target.value)}
                                        className={`${inputClass} font-bold bg-gray-50`}
                                        placeholder="품목명"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={row.model || ''}
                                        onChange={(e) => handleChange(idx, 'model', e.target.value)}
                                        className={inputClass}
                                        placeholder="모델명"
                                    />
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <input
                                        type="text"
                                        value={row.spec || ''}
                                        onChange={(e) => handleChange(idx, 'spec', e.target.value)}
                                        className={inputClass}
                                        placeholder="규격"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {mode === 'delivery' ? (
                                        <input
                                            type="number"
                                            value={row.qty || ''}
                                            onChange={(e) => handleChange(idx, 'qty', e.target.value)}
                                            className={`${inputClass} text-center font-black text-blue-600 bg-blue-50`}
                                            placeholder="0"
                                        />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={row.confirmed || false}
                                            onChange={(e) => handleChange(idx, 'confirmed', e.target.checked)}
                                            className="w-8 h-8 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer transition-transform active:scale-90"
                                        />
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold italic">표시할 데이터가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 모바일용 카드 리스트 (lg 미만에서 보임) */}
            <div className="lg:hidden space-y-4">
                {rows.length > 0 ? rows.map((row, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 relative">
                        <div className="flex justify-between items-start border-b pb-2">
                            <input
                                type="text"
                                value={row.category || ''}
                                onChange={(e) => handleChange(idx, 'category', e.target.value)}
                                className="bg-transparent font-black text-blue-600 outline-none w-2/3"
                                placeholder="품목명"
                            />
                            {mode === 'inspection' && (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">검수</span>
                                    <input
                                        type="checkbox"
                                        checked={row.confirmed || false}
                                        onChange={(e) => handleChange(idx, 'confirmed', e.target.checked)}
                                        className="w-7 h-7 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-gray-400">모델 / 규격</label>
                                <div className="flex gap-2">
                                    <input type="text" value={row.model || ''} onChange={(e) => handleChange(idx, 'model', e.target.value)} className={inputClass} placeholder="모델명" />
                                    <input type="text" value={row.spec || ''} onChange={(e) => handleChange(idx, 'spec', e.target.value)} className={inputClass} placeholder="규격" />
                                </div>
                            </div>
                            {mode === 'delivery' && (
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400">납품 수량</label>
                                    <input
                                        type="number"
                                        value={row.qty || ''}
                                        onChange={(e) => handleChange(idx, 'qty', e.target.value)}
                                        className={`${inputClass} text-center font-black text-blue-600 bg-blue-50 py-3`}
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="p-10 text-center text-gray-400 font-bold border-2 border-dashed rounded-2xl italic">표시할 데이터가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default memo(DeliveryInspectionForm);
