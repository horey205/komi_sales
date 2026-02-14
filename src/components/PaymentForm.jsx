import React, { memo } from 'react';

const PaymentForm = ({ data, onChange }) => {
    const rows = data?.rows || [];

    const handleAddRow = () => {
        const newRows = [...rows];
        const today = new Date().toISOString().slice(0, 10);
        newRows.push({ invoice: '', date: today, item: '', qty: 0, price: 0, supplyPrice: 0, tax: 0, total: 0, requested: '', status: '' });
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

    const inputClass = "w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none transition-all";

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-7xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
                <h2 className="text-2xl font-black text-gray-800">결제 내역 관리</h2>
                <button
                    onClick={handleAddRow}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <span className="text-lg">+</span> 결제 행 추가
                </button>
            </div>

            <div className="overflow-x-auto border-2 border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50 text-center font-black text-gray-500 uppercase">
                        <tr>
                            <th className="px-2 py-4 border-r">세금계산서 발행</th>
                            <th className="px-2 py-4 border-r">발행일자</th>
                            <th className="px-2 py-4 border-r">품목</th>
                            <th className="px-2 py-4 border-r w-16">수량</th>
                            <th className="px-2 py-4 border-r w-32">단가</th>
                            <th className="px-2 py-4 border-r w-32">공급가액</th>
                            <th className="px-2 py-4 border-r w-28">부가세</th>
                            <th className="px-2 py-4 border-r w-32">총금액</th>
                            <th className="px-2 py-4 border-r">청구비고</th>
                            <th className="px-2 py-4 border-r">결제상태</th>
                            <th className="px-2 py-4">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-1.5 border-r"><input type="text" value={row.invoice || ''} onChange={(e) => handleChange(idx, 'invoice', e.target.value)} className={inputClass} placeholder="발행번호" /></td>
                                <td className="p-1.5 border-r"><input type="date" value={row.date || ''} onChange={(e) => handleChange(idx, 'date', e.target.value)} className={inputClass} /></td>
                                <td className="p-1.5 border-r"><input type="text" value={row.item || ''} onChange={(e) => handleChange(idx, 'item', e.target.value)} className={inputClass} placeholder="품목명" /></td>
                                <td className="p-1.5 border-r"><input type="number" value={row.qty || ''} onChange={(e) => handleChange(idx, 'qty', e.target.value)} className={`${inputClass} text-center`} placeholder="0" /></td>
                                <td className="p-1.5 border-r"><input type="number" value={row.price || ''} onChange={(e) => handleChange(idx, 'price', e.target.value)} className={`${inputClass} text-right`} placeholder="0" /></td>
                                <td className="p-1.5 border-r text-right bg-gray-50 font-bold">{(row.supplyPrice || 0).toLocaleString()}</td>
                                <td className="p-1.5 border-r text-right bg-gray-50">{(row.tax || 0).toLocaleString()}</td>
                                <td className="p-1.5 border-r text-right font-black bg-blue-50 text-blue-700">{(row.total || 0).toLocaleString()}</td>
                                <td className="p-1.5 border-r"><input type="text" value={row.requested || ''} onChange={(e) => handleChange(idx, 'requested', e.target.value)} className={inputClass} placeholder="청구내용" /></td>
                                <td className="p-1.5 border-r"><input type="text" value={row.status || ''} onChange={(e) => handleChange(idx, 'status', e.target.value)} className={`${inputClass} font-bold text-center`} placeholder="결제완료/미결제" /></td>
                                <td className="p-1.5 text-center">
                                    <button onClick={() => handleRemoveRow(idx)} className="text-red-400 hover:text-red-700 transition-colors text-lg">✖</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {rows.length === 0 && (
                <div className="p-16 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-3xl mt-4">
                    결제 내역이 없습니다. 우측 상단의 '+ 결제 행 추가' 버튼을 눌러주세요.
                </div>
            )}
        </div>
    );
};

export default memo(PaymentForm);
