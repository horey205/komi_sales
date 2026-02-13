import React, { useEffect } from 'react';

const DeliveryInspectionForm = ({ data, onChange }) => {
    const categories = [
        '카메라', '렌즈', '삼각대', '조명', '컴퓨터', '액세서리1', '액세서리2', '액세서리3', '액세서리4'
    ];

    // Initialize rows if empty on mount
    useEffect(() => {
        if (!data.rows || data.rows.length === 0) {
            const initialRows = categories.map(cat => ({
                category: cat,
                model: '',
                spec: '',
                confirmed: false
            }));
            onChange({ ...data, rows: initialRows });
        }
    }, []);

    const handleChange = (index, field, value) => {
        const currentRows = data.rows && data.rows.length > 0
            ? data.rows
            : categories.map(cat => ({ category: cat, model: '', spec: '', confirmed: false }));

        const newRows = [...currentRows];
        newRows[index] = { ...newRows[index], [field]: value };
        onChange({ ...data, rows: newRows });
    };

    const rows = (data.rows && data.rows.length > 0)
        ? data.rows
        : categories.map(cat => ({ category: cat, model: '', spec: '', confirmed: false }));

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">납품/검수 내용 입력</h2>
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
                                        className="w-full border-2 border-gray-100 rounded px-2 py-1 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <input
                                        type="text"
                                        value={row.spec || ''}
                                        onChange={(e) => handleChange(idx, 'spec', e.target.value)}
                                        className="w-full border-2 border-gray-100 rounded px-2 py-1 focus:border-blue-500 outline-none"
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

export default DeliveryInspectionForm;
