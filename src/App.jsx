import React, { useState, useEffect } from 'react';
import Wizard from './components/Wizard';
import ConsultationForm from './components/ConsultationForm';
import EstimateForm from './components/EstimateForm';
import GithubSync from './components/GithubSync';
import Login from './components/Login';

// Configuration
const GITHUB_TOKEN = ''; // Token should be entered via UI settings for security
const GITHUB_REPO = 'horey205/komi_sales';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setIsLoggedIn(true);
      // Auto-configure GitHub settings if logged in
      if (!localStorage.getItem('github_token')) {
        localStorage.setItem('github_token', GITHUB_TOKEN);
      }
      if (!localStorage.getItem('github_repo')) {
        localStorage.setItem('github_repo', GITHUB_REPO);
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    // Save token to localStorage for GithubSync to use
    localStorage.setItem('github_token', GITHUB_TOKEN);
    localStorage.setItem('github_repo', GITHUB_REPO);

    // Optional: Auto reload window to ensure GithubSync picks up the token freshly if needed, 
    // but React state update should be enough if GithubSync reads from localStorage on mount.
    // We will just let it render.
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    // Optional: Clear token? Maybe keep it for convenience, or clear for security.
    // Let's clear it to be safe 'logout'.
    localStorage.removeItem('github_token');
  };

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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

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
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-row flex-wrap justify-between items-center gap-2">
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto text-center sm:text-left relative">
            <h1 className="text-lg sm:text-2xl font-bold text-blue-800 tracking-tight">영업 상담 관리</h1>
            {/* Mobile Date (optional, or hidden) */}
            <div className="text-xs text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 sm:hidden hidden">
              {new Date().toLocaleDateString().slice(5)}
            </div>
          </div>
          <GithubSync formData={formData} setFormData={setFormData} />
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
