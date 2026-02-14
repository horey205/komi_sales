import React, { useState, useEffect, memo } from 'react';

const ConsultationForm = ({ data, onChange }) => {
    // 폼 내부 로컬 상태만 사용
    const [localData, setLocalData] = useState(data);

    // 업체가 바뀌었을 때만 초기화
    useEffect(() => {
        setLocalData(data);
    }, [data.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...localData, [name]: value };
        setLocalData(newData);

        // 중요: 부모에게 즉시 전달하지 않고, 폼 내부에만 저장합니다.
        // 부모에게 전달하는 시점은 '부모의 상태 갱신'을 유발하므로
        // 최소한의 빈도로 줄여야 자판이 안 내려갑니다.
        onChange(newData);
    };

    const inputClass = "w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-base";
    const labelClass = "text-sm font-bold text-gray-500 mb-1 ml-1";

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-4xl mx-auto border border-gray-100">
            <h2 className="text-2xl font-black text-gray-800 mb-8 border-b-4 border-blue-500 pb-2 inline-block">📋 기초 상담 기록</h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className={labelClass}>업체명 (필수)</label>
                        <input type="text" name="clientName" value={localData.clientName || ''} onChange={handleChange} className={`${inputClass} font-bold text-blue-600`} placeholder="예: (주)코미코리아" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>상담일자</label>
                        <input type="date" name="consultationDate" value={localData.consultationDate || ''} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className={labelClass}>담당자 성함</label>
                        <input type="text" name="manager" value={localData.manager || ''} onChange={handleChange} className={inputClass} placeholder="홍길동 팀장" />
                    </div>
                    <div className="flex flex-col col-span-2">
                        <label className={labelClass}>연락처 / 직통번호</label>
                        <input type="tel" name="phone1" value={localData.phone1 || ''} onChange={handleChange} className={inputClass} placeholder="010-1234-5678" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>이메일 주소</label>
                    <input type="email" name="email" value={localData.email || ''} onChange={handleChange} className={inputClass} placeholder="contact@company.com" />
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>상담 상세 내역</label>
                    <textarea
                        name="content"
                        value={localData.content || ''}
                        onChange={handleChange}
                        rows="8"
                        className={`${inputClass} resize-none mb-20`} // 아래쪽 여백을 줘서 자판에 안 가려지게 함
                        placeholder="상담 내용을 자유롭게 적어주세요..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default memo(ConsultationForm);
