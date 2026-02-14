import React, { useState, useEffect, useCallback, memo } from 'react';

const PaymentForm = ({ data, onChange }) => {
    // 로컬 상태 도입
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        setLocalData(data);
    }, [data.id]);

    const handleAddRow = useCallback(() => {
        setLocalData(prev => {
            const rows = [...(prev.rows || [])];
            const today = new Date().toISOString().slice(0, 10);
            rows.push({ invoice: '', date: today, item: '', qty: 0, price: 0, supplyPrice: 0, tax: 0, total: 0, requested: '', status: '' });
            return { ...prev, rows };
        });
    }, []);

    const handleRemoveRow = useCallback((index) => {
        setLocalData(prev => {
            const rows = [...(prev.rows || [])];
            rows.splice(index, 1);
            return { ...prev, rows };
        });
    }, []);

    const handleChange = useCallback((index, field, value) => {
        setLocalData(prev => {
            const rows = [...(prev.rows || [])];
            const row = { ...rows[index], [field]: value };

            if (field === 'qty' || field === 'price') {
                const qty = Number(row.qty) || 0;
                const price = Number(row.price) || 0;
                row.supplyPrice = qty * price;
                row.tax = Math.floor(row.supplyPrice * 0.1);
                row.total = row.supplyPrice + row.tax;
            }

            rows[index] = row;
            return { ...prev, rows };
        });
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
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-7xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">결제 내용 입력 (분할결제 시 여러 칸을 추가할 수 있도록 함)</h2>
                <button
                    onClick={handleAddRow}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors"
                >
                    + 행 추가
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border text-xs">
                    <thead className="bg-gray-50 text-center">
                        <tr>
                            <th className="px-2 py-2 border">세금계산서 발행</th>
                            <th className="px-2 py-2 border">년월일</th>
                            <th className="px-2 py-2 border">품목</th>
                            <th className="px-2 py-2 border">수량</th>
                            <th className="px-2 py-2 border">단가</th>
                            <th className="px-2 py-2 border">공급가액</th>
                            <th className="px-2 py-2 border">부가세</th>
                            <th className="px-2 py-2 border">총금액</th>
                            <th className="px-2 py-2 border">청구</th>
                            <th className="px-2 py-2 border">결제여부표시</th>
                            <th className="px-2 py-2 border">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="p-1 border"><input type="text" value={row.invoice || ''} onChange={(e) => handleChange(idx, 'invoice', e.target.value)} className="w-full border p-1 text-base sm:text-xs" /></td>
                                <td className="p-1 border"><input type="date" value={row.date || ''} onChange={(e) => handleChange(idx, 'date', e.target.value)} className="w-full border p-1 text-base sm:text-xs" /></td>
                                <td className="p-1 border"><input type="text" value={row.item || ''} onChange={(e) => handleChange(idx, 'item', e.target.value)} className="w-full border p-1 text-base sm:text-xs" /></td>
                                <td className="p-1 border"><input type="number" value={row.qty || ''} onChange={(e) => handleChange(idx, 'qty', e.target.value)} className="w-full border p-1 text-center text-base sm:text-xs" inputMode="numeric" /></td>
                                <td className="p-1 border"><input type="number" value={row.price || ''} onChange={(e) => handleChange(idx, 'price', e.target.value)} className="w-full border p-1 text-right text-base sm:text-xs" inputMode="numeric" /></td>
                                <td className="p-1 border text-right bg-gray-50">{(row.supplyPrice || 0).toLocaleString()}</td>
                                <td className="p-1 border text-right bg-gray-50">{(row.tax || 0).toLocaleString()}</td>
                                <td className="p-1 border text-right font-bold bg-blue-50">{(row.total || 0).toLocaleString()}</td>
                                <td className="p-1 border"><input type="text" value={row.requested || ''} onChange={(e) => handleChange(idx, 'requested', e.target.value)} className="w-full border p-1 text-base sm:text-xs" /></td>
                                <td className="p-1 border"><input type="text" value={row.status || ''} onChange={(e) => handleChange(idx, 'status', e.target.value)} className="w-full border p-1 text-base sm:text-xs" /></td>
                                <td className="p-1 border text-center">
                                    <button onClick={() => handleRemoveRow(idx)} className="text-red-500 hover:text-red-700">✖</button>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan="11" className="p-4 text-center text-gray-500 italic">행 추가 버튼을 눌러 결제 정보를 입력하세요.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(PaymentForm);
