import React, { useState } from 'react';
import { exportToExcel } from '../utils/excelExporter';

const SalesList = ({ records, onSelect, onDelete, onCreate, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('전체');

    const steps = ['상담', '1차', '2차', '3차', '데모', '계약', '납품', '검수', '결제', '완료'];

    const filteredRecords = records.filter(record => {
        const clientName = record.client_name || record.data?.consultation?.clientName || '이름 없음';
        const manager = record.data?.consultation?.manager || '';
        const currentStepIndex = record.data?.currentStep || 0;
        const currentStepName = steps[currentStepIndex];

        const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             manager.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '전체' || currentStepName === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (stepIndex) => {
        if (stepIndex >= 9) return 'bg-green-100 text-green-800';
        if (stepIndex >= 5) return 'bg-blue-100 text-blue-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-6xl mx-auto border border-gray-200">
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">영업 상담 목록</h2>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="업체명 또는 담당자 검색"
                                className="pl-10 pr-4 py-1.5 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                const date = new Date().toISOString().slice(0, 10);
                                exportToExcel(records, `Sales_Total_Backup_${date}.xlsx`);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-bold shadow transition-all active:scale-95 flex items-center gap-1 shrink-0 text-sm"
                            title="전체 목록 엑셀 다운로드"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            엑셀 전체
                        </button>
                        <button
                            onClick={onCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold shadow transition-all active:scale-95 flex items-center gap-1 shrink-0 text-sm"
                        >
                            신규
                        </button>
                    </div>
                </div>

                {/* 단계별 필터 탭 */}
                <div className="flex overflow-x-auto pb-1 scrollbar-hide gap-1 border-b">
                    {['전체', ...steps].map((step) => (
                        <button
                            key={step}
                            onClick={() => setStatusFilter(step)}
                            className={`px-3 py-1.5 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all ${
                                statusFilter === step
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {step}
                        </button>
                    ))}
                </div>
            </div>

            {/* PC용 테이블 (높이 축소 버전) */}
            <div className="hidden lg:block overflow-x-auto border rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">업체명</th>
                            <th className="px-4 py-2 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">담당자</th>
                            <th className="px-4 py-2 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">현재 단계</th>
                            <th className="px-4 py-2 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">최종 수정일</th>
                            <th className="px-4 py-2 text-right text-[11px] font-black text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer group" onClick={() => onSelect(record.id)}>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm font-bold text-blue-600 group-hover:underline">
                                            {record.client_name || record.data?.consultation?.clientName || '이름 없음'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-xs text-gray-700">{record.data?.consultation?.manager || '-'}</div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(record.data?.currentStep || 0)}`}>
                                            {steps[(record.data?.currentStep || 0)]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-[10px] text-gray-400">
                                        {record.updated_at ? new Date(record.updated_at).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const clientName = record.client_name || record.data?.consultation?.clientName || 'NoName';
                                                    const safeName = clientName.replace(/[\\/:*?"<>|]/g, '_');
                                                    const date = new Date().toISOString().slice(0, 10);
                                                    exportToExcel([record], `Sales_${safeName}_${date}.xlsx`);
                                                }}
                                                className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded-lg transition-colors hover:bg-green-100"
                                                title="엑셀"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </button>
                                            {userRole === 'admin' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(record.id);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded-lg transition-colors hover:bg-red-100"
                                                    title="삭제"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold italic text-sm">해당 단계에 등록된 내역이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 모바일용 리스트 (압축형) */}
            <div className="lg:hidden space-y-2 mt-2">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                        <div
                            key={record.id}
                            className="bg-gray-50 p-3 rounded-xl border border-gray-100 active:bg-blue-50 transition-colors"
                            onClick={() => onSelect(record.id)}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-black text-blue-600">
                                        {record.client_name || record.data?.consultation?.clientName || '이름 없음'}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        {record.data?.consultation?.manager || '-'} | {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-black rounded-full shadow-sm ${getStatusColor(record.data?.currentStep || 0)}`}>
                                    {steps[record.data?.currentStep || 0]}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-10 text-center text-gray-400 text-xs italic bg-gray-50 rounded-xl border-2 border-dashed">내역 없음</div>
                )}
            </div>
            
            <div className="mt-4 text-[10px] text-gray-400 font-medium">
                * 필터 탭을 눌러 단계별로 빠르게 확인할 수 있습니다.
            </div>
        </div>
    );
};

export default SalesList;
