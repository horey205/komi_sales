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
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-6xl mx-auto border border-gray-100">
            <div className="flex flex-col gap-5 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        영업 현황 마스터
                    </h2>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-72">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="업체명 또는 담당자 검색"
                                className="pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl w-full focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={onCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-1 shrink-0 text-sm"
                        >
                            <span className="text-lg">+</span> 신규 등록
                        </button>
                    </div>
                </div>

                {/* 단계별 필터 탭 (강조된 디자인) */}
                <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 px-1">
                    {['전체', ...steps].map((step, idx) => (
                        <button
                            key={step}
                            onClick={() => setStatusFilter(step)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex flex-col items-center gap-1 group ${
                                statusFilter === step
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-y-[-2px]'
                                    : 'bg-gray-50 text-gray-500 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100'
                            }`}
                        >
                            <span className={`text-[10px] opacity-70 ${statusFilter === step ? 'text-blue-100' : 'text-gray-400'}`}>
                                {step === '전체' ? 'ALL' : `STEP ${idx}`}
                            </span>
                            {step}
                        </button>
                    ))}
                </div>
            </div>

            {/* PC용 테이블 */}
            <div className="hidden lg:block overflow-hidden border-2 border-gray-50 rounded-2xl bg-gray-50/30">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-white border-b-2 border-gray-50">
                            <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">업체 정보</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">담당자</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">프로세스 단계</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">최종 업데이트</th>
                            <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <tr key={record.id} className="bg-white hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => onSelect(record.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {record.client_name || record.data?.consultation?.clientName || '이름 없음'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{record.data?.consultation?.manager || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 text-[11px] font-black rounded-full shadow-sm border ${getStatusColor(record.data?.currentStep || 0)}`}>
                                            {steps[(record.data?.currentStep || 0)]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-gray-400">
                                        {record.updated_at ? new Date(record.updated_at).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const clientName = record.client_name || record.data?.consultation?.clientName || 'NoName';
                                                    const safeName = clientName.replace(/[\\/:*?"<>|]/g, '_');
                                                    const date = new Date().toISOString().slice(0, 10);
                                                    exportToExcel([record], `Sales_${safeName}_${date}.xlsx`);
                                                }}
                                                className="text-green-600 hover:bg-green-600 hover:text-white p-2 rounded-xl transition-all border border-green-100"
                                                title="엑셀 다운로드"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </button>
                                            {userRole === 'admin' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(record.id);
                                                    }}
                                                    className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-xl transition-all border border-red-100"
                                                    title="글 삭제"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white"><td colSpan="5" className="p-20 text-center text-gray-300 font-black italic text-lg uppercase tracking-widest">No Records Found in {statusFilter}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 모바일용 리스트 */}
            <div className="lg:hidden space-y-3 mt-4">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white p-5 rounded-2xl border-2 border-gray-50 shadow-sm active:scale-98 transition-all active:bg-blue-50/50"
                            onClick={() => onSelect(record.id)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-base font-black text-gray-900 leading-tight">
                                        {record.client_name || record.data?.consultation?.clientName || '이름 없음'}
                                    </div>
                                    <div className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-2">
                                        <span className="text-blue-500">{record.data?.consultation?.manager || '담당자 미정'}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{record.updated_at ? new Date(record.updated_at).toLocaleDateString() : '-'}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-black rounded-full shadow-sm border ${getStatusColor(record.data?.currentStep || 0)}`}>
                                    {steps[record.data?.currentStep || 0]}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Tap to View Details</span>
                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center text-gray-300 font-black italic bg-white rounded-3xl border-4 border-dashed border-gray-50">EMPTY LIST</div>
                )}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">TIP</div>
                <p className="text-[11px] text-blue-800 font-bold tracking-tight">
                    상단의 <span className="underline underline-offset-2">단계별 탭</span>을 클릭하면 현재 영업 진행 상황에 맞는 목록만 필터링하여 확인하실 수 있습니다.
                </p>
            </div>
        </div>
    );
};

export default SalesList;
