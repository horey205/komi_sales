import React from 'react';

const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
    </div>
);

const ConsultationForm = ({ data, onChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">상담 입력 내용</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <InputField label="업체명" name="clientName" value={data.clientName || ''} onChange={handleChange} />
                <InputField label="부서명" name="dept" value={data.dept || ''} onChange={handleChange} />
                <InputField label="직책" name="position" value={data.position || ''} onChange={handleChange} />
                <InputField label="담당자명" name="manager" value={data.manager || ''} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <InputField label="전화번호1" name="phone1" value={data.phone1 || ''} onChange={handleChange} />
                <InputField label="전화번호2" name="phone2" value={data.phone2 || ''} onChange={handleChange} />
                <InputField label="이메일주소" name="email" value={data.email || ''} onChange={handleChange} type="email" className="lg:col-span-2" />
            </div>

            <div className="mb-4">
                <InputField label="주소" name="address" value={data.address || ''} onChange={handleChange} />
            </div>

            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1">상담내용</label>
                <textarea
                    name="content"
                    value={data.content || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                ></textarea>
            </div>
        </div>
    );
};

export default ConsultationForm;
