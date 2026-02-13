import React, { useState, useEffect } from 'react';
import Wizard from './components/Wizard';
import ConsultationForm from './components/ConsultationForm';
import EstimateForm from './components/EstimateForm';

function App() {
  const steps = [
    '상담',
    '견적1차',
    '견적2차',
    '견적3차',
    '데모',
    '계약',
    '납품',
    '검수',
    '결제',
    '완료',
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    consultation: {},
    estimate1: { items: [], total: 0, currency: 'KRW' },
    estimate2: { items: [], total: 0, currency: 'KRW' },
    estimate3: { items: [], total: 0, currency: 'KRW' },
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(formData));
  }, [formData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const updateFormData = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConsultationForm
            data={formData.consultation}
            onChange={(data) => updateFormData('consultation', data)}
          />
        );
      case 1:
        return (
          <EstimateForm
            title="견적 1차 입력내용"
            data={formData.estimate1}
            onChange={(data) => updateFormData('estimate1', data)}
          />
        );
      case 2:
        return (
          <EstimateForm
            title="견적 2차 입력내용"
            data={formData.estimate2}
            onChange={(data) => updateFormData('estimate2', data)}
          />
        );
      case 3:
        return (
          <EstimateForm
            title="견적 3차 입력내용"
            data={formData.estimate3}
            onChange={(data) => updateFormData('estimate3', data)}
          />
        );
      default:
        return (
          <div className="bg-white shadow-md rounded-lg p-10 text-center border border-gray-200 min-h-[400px] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{steps[currentStep]} 단계</h2>
            <p className="text-gray-600 mb-8">
              이 단계의 상세 입력 폼은 아직 구성되지 않았습니다.<br />
              필요한 경우 추가 개발이 가능합니다.
            </p>
            <div className="p-4 bg-gray-50 rounded border border-gray-200 w-full max-w-md">
              <p className="text-sm text-gray-500">현재까지 입력된 데이터는 자동으로 저장되고 있습니다.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800 tracking-tight">영업 상담 관리 시스템</h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Wizard */}
        <div className="mb-8">
          <Wizard steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Area */}
        <div className="flex justify-center mb-10">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between max-w-4xl mx-auto px-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all shadow-md
              ${currentStep === 0
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : 'bg-gray-600 hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
          >
            이전 단계
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-all shadow-md flex items-center
              ${currentStep === steps.length - 1
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
          >
            {currentStep === steps.length - 1 ? '완료하기' : '다음 단계'}
            {currentStep < steps.length - 1 && (
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          &copy; 2026 Sales Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
