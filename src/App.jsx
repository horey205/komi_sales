import React, { useState, useEffect, useCallback, memo } from 'react';
import { supabase } from './utils/supabaseClient';
import Wizard from './components/Wizard';
import ConsultationForm from './components/ConsultationForm';
import EstimateForm from './components/EstimateForm';
import Login from './components/Login';
import DeliveryInspectionForm from './components/DeliveryInspectionForm';
import PaymentForm from './components/PaymentForm';
import SalesList from './components/SalesList';

const MemoizedConsultationForm = memo(ConsultationForm);
const MemoizedEstimateForm = memo(EstimateForm);
const MemoizedDeliveryInspectionForm = memo(DeliveryInspectionForm);
const MemoizedPaymentForm = memo(PaymentForm);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('viewer');
  const [view, setView] = useState('list');
  const [records, setRecords] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      const loaded = data.map(row => {
        try { return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; }
        catch (e) { return null; }
      }).filter(r => r && r.id);
      setRecords(loaded);
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedRole = sessionStorage.getItem('userRole');
    if (loggedIn) {
      setIsLoggedIn(true);
      setUserRole(savedRole || 'viewer');
      fetchRecords();
    }

    const handleHash = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#list') {
        setView('list');
        setCurrentId(null);
        setEditingRecord(null);
        fetchRecords();
      } else if (hash.startsWith('#edit/')) {
        const id = hash.split('/')[1];
        setCurrentId(id);
        setView('edit');
      }
    };
    window.addEventListener('popstate', handleHash);
    handleHash();
    return () => window.removeEventListener('popstate', handleHash);
  }, []);

  const handleManualSave = async (recordToSave = editingRecord) => {
    if (!recordToSave || isSaving) return;
    setIsSaving(true);
    const finalRecord = { ...recordToSave, updatedAt: new Date().toISOString() };

    const { error } = await supabase
      .from('sales')
      .upsert({
        id: finalRecord.id,
        client_name: finalRecord.consultation?.clientName || '이름 없음',
        manager_name: finalRecord.consultation?.manager || '',
        updated_at: finalRecord.updatedAt,
        data: finalRecord
      }, { onConflict: 'id' });

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      setRecords(prev => prev.map(r => String(r.id) === String(finalRecord.id) ? finalRecord : r));
      setEditingRecord(finalRecord);
    }
    setIsSaving(false);
  };

  const handleSelect = (id) => {
    const record = records.find(r => String(r.id) === String(id));
    if (record) {
      setEditingRecord(record);
      setCurrentId(id);
      setCurrentStep(record.currentStep || 0);
      window.location.hash = `#edit/${id}`;
    }
  };

  const handleCreate = async () => {
    const newId = Date.now().toString();
    const newRecord = {
      id: newId, currentStep: 0, updatedAt: new Date().toISOString(),
      consultation: { clientName: '' }, estimate1: { items: [], total: 0, currency: 'KRW' }, estimate2: { items: [], total: 0, currency: 'KRW' }, estimate3: { items: [], total: 0, currency: 'KRW' },
      demo: { items: [], total: 0, currency: 'KRW' }, contract: { items: [], total: 0, currency: 'KRW' }, delivery: { rows: [] }, inspection: { rows: [] }, payment: { rows: [] }
    };
    setEditingRecord(newRecord);
    setCurrentId(newId);
    setCurrentStep(0);
    window.location.hash = `#edit/${newId}`;
    await handleManualSave(newRecord);
  };

  const updateCurrentRecord = useCallback((section, data) => {
    setEditingRecord(prev => ({ ...prev, [section]: data }));
  }, []);

  const handleGoToList = () => {
    window.location.hash = '#list';
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  if (!isLoggedIn) return <Login onLogin={(key, role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', role);
    fetchRecords();
  }} />;

  const sectionNames = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract'];
  const currentSection = sectionNames[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-2 flex justify-between items-center shadow-sm">
        <h1 className="font-black text-blue-800 cursor-pointer text-xl" onClick={handleGoToList}>영업DB</h1>
        <div className="flex gap-2">
          {view === 'edit' && (
            <button
              onClick={() => handleManualSave()}
              disabled={isSaving}
              className={`px-4 py-1.5 rounded-lg font-bold text-white shadow-md transition-all ${isSaving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSaving ? '저장 중...' : '✔ 지금 저장'}
            </button>
          )}
          <button onClick={handleGoToList} className="px-3 py-1.5 bg-gray-100 rounded-lg font-bold text-gray-600">목록</button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        {view === 'list' ? (
          <SalesList records={records} onSelect={handleSelect} onCreate={handleCreate} onDelete={handleDelete} userRole={userRole} />
        ) : (
          <div key={currentId}>
            <div className="mb-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800">작업 중: {editingRecord?.consultation?.clientName || '신규 업체'}</span>
              <span className="text-xs text-blue-500 font-bold">단계 {currentStep + 1}/10</span>
            </div>

            <Wizard steps={['상담', '1차', '2차', '3차', '데모', '계약', '납품', '검수', '결제', '완료']} currentStep={currentStep} onStepClick={(idx) => {
              setCurrentStep(idx);
              setEditingRecord(prev => ({ ...prev, currentStep: idx }));
            }} />

            <div className="mt-6 mb-10">
              {currentStep === 0 && <MemoizedConsultationForm data={editingRecord?.consultation || {}} onChange={(d) => updateCurrentRecord('consultation', d)} />}
              {currentStep >= 1 && currentStep <= 5 && <MemoizedEstimateForm title={['상담', '견적1차', '견적2차', '견적3차', '데모', '계약'][currentStep]} data={editingRecord?.[currentSection] || {}} onChange={(d) => updateCurrentRecord(currentSection, d)} />}
              {currentStep === 6 && <MemoizedDeliveryInspectionForm data={editingRecord?.delivery || {}} onChange={(d) => updateCurrentRecord('delivery', d)} />}
              {currentStep === 7 && <MemoizedDeliveryInspectionForm data={editingRecord?.inspection || {}} onChange={(d) => updateCurrentRecord('inspection', d)} />}
              {currentStep === 8 && <MemoizedPaymentForm data={editingRecord?.payment || {}} onChange={(d) => updateCurrentRecord('payment', d)} />}
              {currentStep === 9 && <div className="p-20 text-center bg-white rounded-xl border border-blue-200 shadow-inner"><h2 className="text-2xl font-black text-blue-800 mb-4">🚀 모든 절차 완료</h2><button onClick={handleGoToList} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">목록으로 돌아가기</button></div>}
            </div>

            {currentStep < 9 && (
              <div className="flex gap-4 sticky bottom-4">
                <button onClick={() => {
                  const prev = currentStep - 1;
                  if (prev >= 0) {
                    setCurrentStep(prev);
                    setEditingRecord(p => ({ ...p, currentStep: prev }));
                    window.scrollTo(0, 0);
                  }
                }} disabled={currentStep === 0} className={`flex-1 py-4 rounded-xl font-bold shadow-lg ${currentStep === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-600 text-white'}`}>이전</button>
                <button onClick={() => {
                  const next = currentStep + 1;
                  if (next <= 9) {
                    setCurrentStep(next);
                    setEditingRecord(p => ({ ...p, currentStep: next }));
                    window.scrollTo(0, 0);
                  }
                }} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg text-lg">다음 단계 →</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
