import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import Wizard from './components/Wizard';
import ConsultationForm from './components/ConsultationForm';
import EstimateForm from './components/EstimateForm';
// import GithubSync from './components/GithubSync'; // Deprecated
import Login from './components/Login';
import DeliveryInspectionForm from './components/DeliveryInspectionForm';
import PaymentForm from './components/PaymentForm';
import SalesList from './components/SalesList';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('viewer'); // 'admin' or 'viewer'
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [records, setRecords] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Check login status and handle routing on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedKey = sessionStorage.getItem('encryptionKey');
    const savedRole = sessionStorage.getItem('userRole'); // Restore role
    if (loggedIn && savedKey) {
      setIsLoggedIn(true);
      setEncryptionKey(savedKey);
      setUserRole(savedRole || 'viewer');
    } else if (loggedIn && !savedKey) {
      // If logged in but key is missing (e.g. refresh), force relogin to get the key
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userRole');
    }

    // Handle initial routing or refresh
    const handleHash = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#list') {
        setView('list');
        setCurrentId(null);
      } else if (hash.startsWith('#edit/')) {
        const id = parseInt(hash.split('/')[1]);
        setCurrentId(id);
        setView('edit');
      }
    };

    window.addEventListener('popstate', handleHash);
    handleHash();

    return () => window.removeEventListener('popstate', handleHash);
  }, []);

  // Supabase Realtime & Initial Load
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching records:', error);
      } else if (data) {
        // Migration: If DB is empty but we have local data, upload it
        if (data.length === 0) {
          const local = localStorage.getItem('salesRecords');
          if (local) {
            // Try decrypt or parse
            // ... (Simplification: Just trust fresh start or manual migration later if needed)
          }
        }

        // Convert DB rows back to application record format
        // Safely map row.data to record, ensuring it has an id
        const loadedRecords = data.map(row => {
          if (typeof row.data === 'string') {
            try { return JSON.parse(row.data); } catch (e) { return null; }
          }
          return row.data;
        }).filter(r => r && r.id); // Filter out nulls

        setRecords(loadedRecords);
      }
    };

    fetchRecords();

    // Subscribe to changes
    const channel = supabase
      .channel('sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, (payload) => {
        // Reload all data on any change (Simple strategy)
        // Or cleaner: handle INSERT/UPDATE/DELETE locally
        fetchRecords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  // Auto-save to Supabase
  const saveToSupabase = async (record) => {
    if (!record) return;
    const { error } = await supabase
      .from('sales')
      .upsert({
        id: record.id,
        client_name: record.consultation?.clientName || '이름 없음',
        manager_name: record.consultation?.manager || '',
        updated_at: new Date().toISOString(),
        data: record
      });
    if (error) console.error('Supabase Save Error:', error);
  };

  const deleteFromSupabase = async (id) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    if (error) console.error('Supabase Delete Error:', error);
  };

  const handleLogin = (password, role = 'admin') => {
    setIsLoggedIn(true);
    setEncryptionKey(password);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('encryptionKey', password);
    sessionStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setIsLoggedIn(false);
      setEncryptionKey(null);
      setUserRole('viewer');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('encryptionKey');
      sessionStorage.removeItem('userRole');
      window.location.hash = '#list';
    }
  };

  const steps = [
    '상담', '견적1차', '견적2차', '견적3차', '데모', '계약', '납품', '검수', '결제', '완료',
  ];

  const emptyFormData = {
    consultation: { clientName: '', manager: '', phone1: '', email: '', content: '' },
    estimate1: { items: [], total: 0, currency: 'KRW' },
    estimate2: { items: [], total: 0, currency: 'KRW' },
    estimate3: { items: [], total: 0, currency: 'KRW' },
    demo: { items: [], total: 0, currency: 'KRW' },
    contract: { items: [], total: 0, currency: 'KRW' },
    delivery: { rows: [] },
    inspection: { rows: [] },
    payment: { rows: [] },
  };

  // Helper to ensure record has all necessary fields
  const sanitizeRecord = (record) => {
    if (!record) return null;
    return {
      id: record.id || Date.now(),
      currentStep: typeof record.currentStep === 'number' ? record.currentStep : 0,
      updatedAt: record.updatedAt || new Date().toISOString(),
      consultation: { ...emptyFormData.consultation, ...(record.consultation || {}) },
      estimate1: { ...emptyFormData.estimate1, ...(record.estimate1 || {}) },
      estimate2: { ...emptyFormData.estimate2, ...(record.estimate2 || {}) },
      estimate3: { ...emptyFormData.estimate3, ...(record.estimate3 || {}) },
      demo: { ...emptyFormData.demo, ...(record.demo || {}) },
      contract: { ...emptyFormData.contract, ...(record.contract || {}) },
      delivery: { ...emptyFormData.delivery, ...(record.delivery || {}) },
      inspection: { ...emptyFormData.inspection, ...(record.inspection || {}) },
      payment: { ...emptyFormData.payment, ...(record.payment || {}) },
      // Any other fields from record?
      ...record
    };
  };

  const currentRecordRaw = records.find(r => r.id === currentId);
  const currentRecord = currentRecordRaw ? sanitizeRecord(currentRecordRaw) : { ...emptyFormData, id: null, currentStep: 0 };

  const handleCreate = async () => {
    const newId = Date.now();
    const newRecord = { ...emptyFormData, id: newId, currentStep: 0, updatedAt: new Date().toISOString() };

    // Optimistic UI update
    setRecords([newRecord, ...records]);
    setCurrentId(newId);
    setCurrentStep(0);
    window.location.hash = `#edit/${newId}`;
    setView('edit');

    // Save to DB
    await saveToSupabase(newRecord);
  };

  const handleSelect = (id) => {
    const record = records.find(r => r.id === id);
    if (record) {
      setCurrentId(id);
      setCurrentStep(record.currentStep || 0);
      window.location.hash = `#edit/${id}`;
      setView('edit');
    }
  };

  const handleGoToList = () => {
    window.location.hash = '#list';
    setView('list');
    setCurrentId(null);
  }

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setRecords(records.filter(r => r.id !== id));
      await deleteFromSupabase(id);
    }
  };

  const updateCurrentRecord = (section, data) => {
    setRecords(prev => {
      const newRecords = prev.map(r => {
        if (r.id === currentId) {
          const updated = { ...r, [section]: data, updatedAt: new Date().toISOString() };
          saveToSupabase(updated); // Auto-save side effect
          return updated;
        }
        return r;
      });
      return newRecords;
    });
  };

  const handleCopyPrevious = () => {
    const keys = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract', 'delivery', 'inspection']; // Added delivery/inspection keys

    // Logic for Estimates/Demo/Contract (Copying items structure)
    if (currentStep > 1 && currentStep <= 5) {
      const currentKey = keys[currentStep];
      const prevKey = keys[currentStep - 1];
      const prevData = currentRecord[prevKey];

      if (prevData && prevData.items) {
        if (window.confirm(`${steps[currentStep - 1]}의 내용을 복사하시겠습니까?`)) {
          updateCurrentRecord(currentKey, JSON.parse(JSON.stringify(prevData)));
        }
      }
    }
    // Logic for Delivery/Inspection (Copying items to rows structure)
    else if (currentStep === 6 || currentStep === 7) {
      // Find the last valid estimate/contract to copy from. Usually Contract (step 5).
      // If contract is empty, try demo, then estimate3... but let's just grab from Contract for now as it's the preceding step.
      const prevKey = 'contract';
      const prevData = currentRecord[prevKey];

      if (prevData && prevData.items && prevData.items.length > 0) {
        if (window.confirm(`계약 단계의 품목을 ${steps[currentStep]} 목록으로 가져오겠습니까?`)) {
          // Transform items { name, model, spec } to rows { category, model, spec, confirmed }
          const newRows = prevData.items.filter(item => item.model || item.spec).map(item => ({
            category: item.name,
            model: item.model,
            spec: item.spec,
            confirmed: false
          }));
          // If the list is empty (no items with model/spec), maybe just copy structure? 
          // Let's just copy valid items.
          if (newRows.length > 0) {
            updateCurrentRecord(keys[currentStep], { rows: newRows });
          } else {
            alert('복사할 품목 정보가 없습니다 (모델명/규격이 입력된 항목만 복사됩니다).');
          }
        }
      } else {
        alert('계약 단계에 입력된 품목이 없습니다.');
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Sync step to record
      setRecords(prev => prev.map(r => r.id === currentId ? { ...r, currentStep: nextStep, updatedAt: new Date().toISOString() } : r));
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Sync step to record
      setRecords(prev => prev.map(r => r.id === currentId ? { ...r, currentStep: prevStep, updatedAt: new Date().toISOString() } : r));
      window.scrollTo(0, 0);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  /* 
   * ACCESS CONTROL LOGIC:
   * - Viewers and Admins can create and edit.
   * - Only Admins can delete.
   * - Wrapper no longer disables input based on role.
   */
  const renderStepContent = () => {
    // Debugging: Log current record to console
    console.log('Rendering Step:', currentStep, 'Current Record:', currentRecord);

    if (!currentRecord || !currentRecord.consultation) {
      return <div className="p-8 text-center text-red-500">데이터를 불러오는 중 오류가 발생했습니다. (ID: {currentId})</div>;
    }

    // Wrapper: Just a fragment now, as guests can edit too.
    const Wrapper = ({ children }) => <>{children}</>;

    try {
      switch (currentStep) {
        case 0: return <Wrapper><ConsultationForm data={currentRecord.consultation || {}} onChange={(d) => updateCurrentRecord('consultation', d)} /></Wrapper>;
        case 1: return <Wrapper><EstimateForm title="견적 1차 입력내용" data={currentRecord.estimate1 || { items: [], total: 0, currency: 'KRW' }} onChange={(d) => updateCurrentRecord('estimate1', d)} /></Wrapper>;
        case 2: return <Wrapper><EstimateForm title="견적 2차 입력내용" data={currentRecord.estimate2 || { items: [], total: 0, currency: 'KRW' }} onChange={(d) => updateCurrentRecord('estimate2', d)} onCopyPrevious={handleCopyPrevious} /></Wrapper>;
        case 3: return <Wrapper><EstimateForm title="견적 3차 입력내용" data={currentRecord.estimate3 || { items: [], total: 0, currency: 'KRW' }} onChange={(d) => updateCurrentRecord('estimate3', d)} onCopyPrevious={handleCopyPrevious} /></Wrapper>;
        case 4: return <Wrapper><EstimateForm title="데모 내용 입력" data={currentRecord.demo || { items: [], total: 0, currency: 'KRW' }} onChange={(d) => updateCurrentRecord('demo', d)} onCopyPrevious={handleCopyPrevious} /></Wrapper>;
        case 5: return <Wrapper><EstimateForm title="계약 내용 입력" data={currentRecord.contract || { items: [], total: 0, currency: 'KRW' }} onChange={(d) => updateCurrentRecord('contract', d)} onCopyPrevious={handleCopyPrevious} /></Wrapper>;
        case 6: return <Wrapper><DeliveryInspectionForm data={currentRecord.delivery || { rows: [] }} onChange={(d) => updateCurrentRecord('delivery', d)} onCopyPrevious={handleCopyPrevious} /></Wrapper>;
        case 7: return <Wrapper><DeliveryInspectionForm data={currentRecord.inspection || { rows: [] }} onChange={(d) => updateCurrentRecord('inspection', d)} onCopyPrevious={handleCopyPrevious} /></Wrapper>;
        case 8: return <Wrapper><PaymentForm data={currentRecord.payment || { rows: [] }} onChange={(d) => updateCurrentRecord('payment', d)} /></Wrapper>;
        default:
          return (
            <div className="bg-white shadow-md rounded-lg p-10 text-center border border-gray-200 min-h-[400px] flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{steps[currentStep]} 단계 완료</h2>
              <p className="text-gray-600 mb-8">영업 프로세스가 모두 완료되었습니다.</p>
              <button onClick={() => setView('list')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">목록으로 이동</button>
            </div>
          );
      }
    } catch (e) {
      console.error('Rendering Error:', e);
      return <div className="p-8 text-center text-red-600">화면을 표시하는 중 문제가 발생했습니다.<br />{e.message}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-1 overflow-visible">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <h1
              className="text-sm sm:text-xl font-black text-blue-800 cursor-pointer truncate"
              onClick={handleGoToList}
            >
              영업DB
            </h1>
            {userRole === 'viewer' && (
              <span className="bg-gray-200 text-gray-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold self-center ml-1 truncate">
                게스트 (수정가능/삭제불가)
              </span>
            )}
            {view === 'edit' && (
              <button
                onClick={handleGoToList}
                className="text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 px-1.5 py-1 rounded-md text-gray-600 font-bold transition-colors shrink-0"
              >
                ← 목록
              </button>
            )}
          </div>
          <div className="flex-shrink-0 scale-90 sm:scale-100 origin-right min-w-0 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-green-700 text-xs font-bold border border-green-200">
              <span className="animate-pulse">●</span> 실시간 저장 중
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 px-2 py-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors text-[10px] sm:text-xs font-bold shrink-0"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {view === 'list' ? (
          <SalesList
            records={records}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onCreate={handleCreate}
            userRole={userRole}
          />
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-gray-700">
                  작성 중: <span className="text-blue-600">{currentRecord.consultation?.clientName || '신규 상담'}</span>
                </h2>
                <div className="text-sm text-gray-400">최종 수정: {currentRecord.updatedAt ? new Date(currentRecord.updatedAt).toLocaleTimeString() : '-'}</div>
              </div>
              <Wizard
                steps={steps}
                currentStep={currentStep}
                onStepClick={(idx) => {
                  setCurrentStep(idx);
                  setRecords(prev => prev.map(r => r.id === currentId ? { ...r, currentStep: idx, updatedAt: new Date().toISOString() } : r));
                  window.scrollTo(0, 0);
                }}
              />
            </div>

            <div className="flex justify-center mb-10" key={currentStep}>
              {renderStepContent()}
            </div>

            <div className="flex justify-between max-w-4xl mx-auto px-4 gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md ${currentStep === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'}`}
              >
                이전 단계
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className={`flex-1 sm:flex-none px-6 sm:px-10 py-3 rounded-lg font-bold text-white transition-all shadow-md flex items-center justify-center ${currentStep === steps.length - 1 ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {currentStep === steps.length - 1 ? '최종 완료' : '다음 단계 →'}
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          &copy; 2026 Sales Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
