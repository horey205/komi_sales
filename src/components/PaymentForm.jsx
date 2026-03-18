import React, { memo } from 'react';

const PaymentForm = ({ data, onChange, contractAmount = 0 }) => {
    const rows = data?.rows || [];

    // 합계 계산
    const totalPaid = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
    const balance = contractAmount - totalPaid;

    const handleAddRow = () => {
        const newRows = [...rows];
        const today = new Date().toISOString().slice(0, 10);
        // 기본값으로 현재 순서에 맞는 결제 회차 설정
        const nextStatus = `${rows.length + 1}차 결제`;
        newRows.push({ 
            invoice: '', 
            date: today, 
            item: '제품 대금', 
            qty: 1, 
            price: balance > 0 ? balance : 0, 
            supplyPrice: balance > 0 ? Math.floor(balance / 1.1) : 0, 
            tax: balance > 0 ? balance - Math.floor(balance / 1.1) : 0, 
            total: balance > 0 ? balance : 0, 
            requested: '', 
            status: nextStatus 
        });
        onChange({ ...data, rows: newRows });
    };

    const handleRemoveRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        onChange({ ...data, rows: newRows });
    };

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        const row = { ...newRows[index], [field]: value };

        if (field === 'qty' || field === 'price') {
            const qty = Number(row.qty) || 0;
            const price = Number(row.price) || 0;
            row.supplyPrice = qty * price;
            row.tax = Math.floor(row.supplyPrice * 0.1);
            row.total = row.supplyPrice + row.tax;
        }

        newRows[index] = row;
        onChange({ ...data, rows: newRows });
    };

    const inputClass = "w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:border-blue-500 outline-none transition-all";

    return (
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-7xl mx-auto border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b-2 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">결제 내역 관리</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Payment & Invoice Management</p>
                </div>
                
                {/* 요약 카드 섹션 (요구사항 7번 핵심) */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                    <div className="bg-gray-50 border p-3 rounded-xl flex-1 md:w-32">
                        <div className="text-[10px] font-bold text-gray-400">납품금액(VAT제외)</div>
                        <div className="text-sm font-black text-gray-700">₩{Math.floor(contractAmount / 1.1).toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 border p-3 rounded-xl flex-1 md:w-32">
                        <div className="text-[10px] font-bold text-gray-400">총 계약금액(VAT 포함)</div>
                        <div className="text-sm font-black text-gray-700">₩{contractAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex-1 md:w-32">
                        <div className="text-[10px] font-bold text-blue-400">기결제 합계</div>
                        <div className="text-sm font-black text-blue-600">₩{totalPaid.toLocaleString()}</div>
                    </div>
                    <div className={`${balance > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} border p-3 rounded-xl flex-1 md:w-40`}>
                        <div className={`text-[10px] font-bold ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>남은 잔금</div>
                        <div className={`text-sm font-black ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>₩{balance.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAddRow}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <span className="text-base">+</span> 결제 회차 추가
                </button>
            </div>

            <div className="overflow-x-auto border-2 border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200 text-[11px]">
                    <thead className="bg-gray-50 text-center font-black text-gray-500 uppercase">
                        <tr>
                            <th className="px-2 py-3 border-r">발행 내역 (계산서 등)</th>
                            <th className="px-2 py-3 border-r">날짜</th>
                            <th className="px-2 py-3 border-r">품목</th>
                            <th className="px-2 py-3 border-r w-20">수량</th>
                            <th className="px-2 py-3 border-r w-24">단가</th>
                            <th className="px-2 py-3 border-r w-28">공급가액</th>
                            <th className="px-2 py-3 border-r w-16">부가세</th>
                            <th className="px-2 py-3 border-r w-28 text-blue-600">총합계</th>
                            <th className="px-2 py-3 border-r">결제 회차/상태</th>
                            <th className="px-2 py-3">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-center">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-1.5 border-r">
                                    <input type="text" value={row.invoice || ''} onChange={(e) => handleChange(idx, 'invoice', e.target.value)} className={inputClass} placeholder="발행번호" />
                                </td>
                                <td className="p-1.5 border-r">
                                    <input type="date" value={row.date || ''} onChange={(e) => handleChange(idx, 'date', e.target.value)} className={inputClass} />
                                </td>
                                <td className="p-1.5 border-r">
                                    <input type="text" value={row.item || ''} onChange={(e) => handleChange(idx, 'item', e.target.value)} className={inputClass} placeholder="품목" />
                                </td>
                                <td className="p-1.5 border-r">
                                    <input type="number" value={row.qty || ''} onChange={(e) => handleChange(idx, 'qty', e.target.value)} className={`${inputClass} text-center`} placeholder="0" />
                                </td>
                                <td className="p-1.5 border-r">
                                    <input type="number" value={row.price || ''} onChange={(e) => handleChange(idx, 'price', e.target.value)} className={`${inputClass} text-right`} placeholder="0" />
                                </td>
                                <td className="p-1.5 border-r text-right bg-gray-50/50 font-bold text-gray-600">
                                    {(row.supplyPrice || 0).toLocaleString()}
                                </td>
                                <td className="p-1.5 border-r text-right bg-gray-50/50 text-gray-500">
                                    {(row.tax || 0).toLocaleString()}
                                </td>
                                <td className="p-1.5 border-r text-right font-black bg-blue-50 text-blue-700">
                                    {(row.total || 0).toLocaleString()}
                                </td>
                                <td className="p-1.5 border-r">
                                    <input 
                                        type="text" 
                                        value={row.status || ''} 
                                        onChange={(e) => handleChange(idx, 'status', e.target.value)} 
                                        className={`${inputClass} font-black text-center text-blue-600 bg-blue-50/30 border-blue-100`} 
                                        placeholder="예: 1차결제" 
                                    />
                                </td>
                                <td className="p-1.5 text-center">
                                    <button onClick={() => handleRemoveRow(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {rows.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-3xl mt-4 text-sm">
                    결제 내역이 없습니다. '+ 결제 회차 추가'를 클릭하세요.
                </div>
            ) : (
                <div className="mt-4 flex justify-between items-center px-4">
                    <span className="text-[10px] text-gray-400 font-bold">* 각 결제 회차의 총금액 합계가 기결제 합계에 자동으로 반영됩니다.</span>
                    <div className="text-right">
                        <span className="text-xs font-bold text-gray-500">정산 대상 총액: </span>
                        <span className="text-sm font-black text-gray-800">₩{totalPaid.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(PaymentForm);
