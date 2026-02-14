import React, { useState, useEffect, memo } from 'react';

const ConsultationForm = ({ data, onChange }) => {
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        setLocalData(data);
    }, [data.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...localData, [name]: value };
        setLocalData(newData);
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
                        <input type="text" name="clientName" value={localData.clientName || ''} onChange={handleChange} className={`${inputClass} font-bold text-blue-600`} placeholder="업체명 입력" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>부서명</label>
                        <input type="text" name="dept" value={localData.dept || ''} onChange={handleChange} className={inputClass} placeholder="부서명 입력" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className={labelClass}>직책</label>
                        <input type="text" name="position" value={localData.position || ''} onChange={handleChange} className={inputClass} placeholder="직책 입력" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>담당자명</label>
                        <input type="text" name="manager" value={localData.manager || ''} onChange={handleChange} className={inputClass} placeholder="담당자 성함" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className={labelClass}>전화번호1</label>
                        <input type="tel" name="phone1" value={localData.phone1 || ''} onChange={handleChange} className={inputClass} placeholder="010-0000-0000" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>전화번호2</label>
                        <input type="tel" name="phone2" value={localData.phone2 || ''} onChange={handleChange} className={inputClass} placeholder="02-000-0000" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>이메일주소</label>
                    <input type="email" name="email" value={localData.email || ''} onChange={handleChange} className={inputClass} placeholder="example@email.com" />
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>주소</label>
                    <input type="text" name="address" value={localData.address || ''} onChange={handleChange} className={inputClass} placeholder="회사 주소 입력" />
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>상담내용</label>
                    <textarea
                        name="content"
                        value={localData.content || ''}
                        onChange={handleChange}
                        rows="8"
                        className={`${inputClass} resize-none mb-10`}
                        placeholder="상담 내용을 상세히 입력하세요..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default memo(ConsultationForm);
