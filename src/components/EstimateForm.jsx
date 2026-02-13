import React, { useEffect, useState } from 'react';

const EstimateForm = ({ title, data, onChange, onCopyPrevious }) => {
    // Default structure for a row if not present
    const defaultItems = [
        { name: '카메라', model: '', spec: '', price: 0 },
        { name: '렌즈', model: '', spec: '', price: 0 },
        { name: '삼각대', model: '', spec: '', price: 0 },
        { name: '조명', model: '', spec: '', price: 0 },
        { name: '컴퓨터', model: '', spec: '', price: 0 },
        { name: '액세서리1', model: '', spec: '', price: 0 },
        { name: '액세서리2', model: '', spec: '', price: 0 },
        { name: '액세서리3', model: '', spec: '', price: 0 },
        { name: '액세서리4', model: '', spec: '', price: 0 },
    ];

    // Initialize data if empty
    useEffect(() => {
        if (!data.items || data.items.length === 0) {
            onChange({ ...data, items: defaultItems, currency: 'KRW' });
        }
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...(data.items || defaultItems)];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate total immediately
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

        onChange({ ...data, items: newItems, total });
    };

    const handleCurrencyChange = (currency) => {
        onChange({ ...data, currency });
    };

    const items = data.items || defaultItems;
    const total = data.total || 0;
    const currency = data.currency || 'KRW';

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
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
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currency === 'KRW' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        원화 (KRW)
                    </button>
                    <button
                        onClick={() => handleCurrencyChange('USD')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currency === 'USD' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
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
                                                value={item.model}
                                                onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="text"
                                                value={item.spec}
                                                onChange={(e) => handleItemChange(index, 'spec', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                value={item.price || ''}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-right"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="bg-blue-50 font-bold">
                                    <td colSpan="3" className="px-4 py-3 text-right text-sm text-gray-800">
                                        총 합계
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-blue-600">
                                        {currency === 'KRW' ? '₩' : '$'} {total.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
                * 금액을 입력하면 자동으로 합계가 계산됩니다.
            </div>
        </div>
    );
};

export default EstimateForm;
