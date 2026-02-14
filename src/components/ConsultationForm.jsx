import React, { memo } from 'react';

const ConsultationForm = ({ data, onChange }) => {
    // 순수 Controlled Component: 부모의 data를 직접 활용
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const inputClass = "w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-base";
    const labelClass = "text-sm font-black text-gray-400 mb-1.5 ml-1";

    return (
        <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-4xl mx-auto border border-gray-100">
            <h2 className="text-3xl font-black text-gray-800 mb-8 border-b-8 border-blue-500 pb-2 inline-block">📋 기초 상담 기록</h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClass}>업체명 (필수)</label>
                        <input type="text" name="clientName" value={data?.clientName || ''} onChange={handleChange} className={`${inputClass} font-bold text-blue-600 border-blue-100`} placeholder="업체명 입력" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>부서명</label>
                        <input type="text" name="dept" value={data?.dept || ''} onChange={handleChange} className={inputClass} placeholder="부서명 입력" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClass}>직책</label>
                        <input type="text" name="position" value={data?.position || ''} onChange={handleChange} className={inputClass} placeholder="직책 입력" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>담당자명</label>
                        <input type="text" name="manager" value={data?.manager || ''} onChange={handleChange} className={inputClass} placeholder="담당자 성함" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClass}>전화번호1</label>
                        <input type="tel" name="phone1" value={data?.phone1 || ''} onChange={handleChange} className={inputClass} placeholder="010-0000-0000" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>전화번호2</label>
                        <input type="tel" name="phone2" value={data?.phone2 || ''} onChange={handleChange} className={inputClass} placeholder="02-000-0000" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>이메일주소</label>
                    <input type="email" name="email" value={data?.email || ''} onChange={handleChange} className={inputClass} placeholder="example@email.com" />
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>주소</label>
                    <input type="text" name="address" value={data?.address || ''} onChange={handleChange} className={inputClass} placeholder="회사 주소 입력" />
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>상담내용</label>
                    <textarea
                        name="content"
                        value={data?.content || ''}
                        onChange={handleChange}
                        rows="10"
                        className={`${inputClass} resize-none mb-10 border-gray-100`}
                        placeholder="상담 내용을 상세히 입력하세요..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default memo(ConsultationForm);
