import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const SalesList = ({ records, onSelect, onDelete, onCreate, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecords = records.filter(record => {
        const clientName = record.consultation?.clientName || '이름 없음';
        const manager = record.consultation?.manager || '';
        return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getStatusColor = (stepIndex) => {
        if (stepIndex >= 9) return 'bg-green-100 text-green-800';
        if (stepIndex >= 5) return 'bg-blue-100 text-blue-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    const steps = ['상담', '견적1차', '견적2차', '견적3차', '데모', '계약', '납품', '검수', '결제', '완료'];

    const handleDownloadExcel = () => {
        const formatItems = (items) => {
            if (!items || !items.length) return '';
            return items.map(i => `[${i.name}] ${i.model || '-'} / ${i.spec || '-'} (${Number(i.price || 0).toLocaleString()})`).join('\n');
        };

        const formatRows = (rows) => {
            if (!rows || !rows.length) return '';
            return rows.map(r => `[${r.category}] ${r.model || '-'} / ${r.spec || '-'} (${r.confirmed ? '검수완료' : '미검수'})`).join('\n');
        };

        const data = records.map(record => {
            const c = record.consultation || {};
            const e1 = record.estimate1 || {};
            const e2 = record.estimate2 || {};
            const e3 = record.estimate3 || {};
            const demo = record.demo || {};
            const contract = record.contract || {};
            const delivery = record.delivery || {};
            const inspection = record.inspection || {};
            const payment = record.payment || {};

            return {
                'ID': record.id,
                '진행상태': getStepLabel(record.currentStep),
                '최종수정일': record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '',

                // 상담 정보
                '상담일자': c.consultationDate || '',
                '업체명': c.clientName || '',
                '부서': c.dept || '',
                '직책': c.position || '',
                '담당자': c.manager || '',
                '연락처1': c.phone1 || '',
                '연락처2': c.phone2 || '',
                '이메일': c.email || '',
                '주소': c.address || '',
                '상담메모': c.content || '',

                // 견적 1차
                '견적1차_날짜': e1.date || '',
                '견적1차_품목': formatItems(e1.items),
                '견적1차_총액': e1.total || 0,

                // 견적 2차
                '견적2차_날짜': e2.date || '',
                '견적2차_품목': formatItems(e2.items),
                '견적2차_총액': e2.total || 0,

                // 견적 3차
                '견적3차_날짜': e3.date || '',
                '견적3차_품목': formatItems(e3.items),
                '견적3차_총액': e3.total || 0,

                // 데모 및 계약
                '데모_날짜': demo.date || '',
                '데모_내용': formatItems(demo.items),
                '계약_날짜': contract.date || '',
                '계약_품목': formatItems(contract.items),
                '계약_총액': contract.total || 0,

                // 납품 및 검수
                '납품_날짜': delivery.date || '',
                '납품_현황': formatRows(delivery.rows),
                '검수_날짜': inspection.date || '',
                '검수_현황': formatRows(inspection.rows),

                // 결제
                '결제_정보': payment.date ? `${payment.date} / ${payment.status}` : ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Auto-width for some columns
        const wscols = [
            { wch: 15 }, { wch: 10 }, { wch: 20 }, // Basic
            { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, // Client
            { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 40 }, // Contact & Memo
            { wch: 12 }, { wch: 40 }, { wch: 15 }, // Estimate 1
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "전체영업데이터");

        XLSX.writeFile(workbook, `SalesDB_Full_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-6xl mx-auto border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">영업 상담 목록</h2>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="업체명 또는 담당자 검색"
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Grant Create permission to everyone (per user request) */}
                    <button
                        onClick={onCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center gap-1 shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        신규 등록
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center gap-1 shrink-0"
                    >
                        <span>📊</span> 엑셀 저장
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">업체명</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">담당자</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">현재 단계</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">최종 수정일</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => onSelect(record.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-blue-600 group-hover:underline">
                                            {record.consultation?.clientName || '이름 없음'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{record.consultation?.manager || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(record.currentStep || 0)}`}>
                                            {steps[record.currentStep || 0]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {userRole === 'admin' ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Explicitly call onDelete
                                                    onDelete(record.id);
                                                }}
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                                title="삭제"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 text-xs cursor-not-allowed" title="삭제 권한 없음">삭제불가</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    등록된 상담 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-gray-400">
                * 목록에서 업체를 클릭하면 상세 내용을 확인하거나 수정할 수 있습니다.
            </div>
        </div>
    );
};

export default SalesList;
