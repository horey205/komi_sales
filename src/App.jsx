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
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('sales').select('*').order('updated_at', { ascending: false });
    if (!error && data) {
      const loaded = data.map(row => {
        try { return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; }
        catch (e) { return null; }
      }).filter(r => r && r.id);
      setRecords(loaded);
    }
    setIsLoading(false);
  };

  const handleRouting = useCallback(() => {
    const hash = window.location.hash;
    if (!hash || hash === '#list') {
      setView('list');
      setEditingRecord(null);
      setCurrentId(null);
    } else if (hash.startsWith('#edit/')) {
      const id = hash.split('/')[1];
      setCurrentId(id);
      setView('edit');
    }
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setIsLoggedIn(true);
      setUserRole(sessionStorage.getItem('userRole') || 'viewer');
      fetchRecords();
    }
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
    return () => window.removeEventListener('hashchange', handleRouting);
  }, [handleRouting]);

  useEffect(() => {
    if (view === 'edit' && currentId && records.length > 0 && !editingRecord) {
      const record = records.find(r => String(r.id) === String(currentId));
      if (record) {
        setEditingRecord(record);
        setCurrentStep(record.currentStep || 0);
      }
    }
  }, [view, currentId, records, editingRecord]);

  const handleManualSave = async (recordToSave = editingRecord) => {
    if (!recordToSave || isSaving) return;
    setIsSaving(true);
    const finalRecord = { ...recordToSave, updatedAt: new Date().toISOString() };
    const { error } = await supabase.from('sales').upsert({
      id: finalRecord.id,
      client_name: finalRecord.consultation?.clientName || '이름 없음',
      manager_name: finalRecord.consultation?.manager || '',
      updated_at: finalRecord.updatedAt,
      data: finalRecord
    }, { onConflict: 'id' });
    if (!error) {
      setEditingRecord(finalRecord);
      setRecords(prev => prev.map(r => String(r.id) === String(finalRecord.id) ? finalRecord : r));
    } else { alert('저장 실패: ' + error.message); }
    setIsSaving(false);
  };

  const handleCopyPrevious = useCallback(() => {
    if (!editingRecord || currentStep < 1) return;
    const steps = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract'];
    const prevSection = steps[currentStep - 1];
    const currentSection = steps[currentStep];
    const prevData = editingRecord[prevSection];
    if (prevData) {
      setEditingRecord(prev => ({ ...prev, [currentSection]: { ...prevData } }));
    }
  }, [editingRecord, currentStep]);

  const updateCurrentRecord = useCallback((section, data) => {
    setEditingRecord(prev => prev ? ({ ...prev, [section]: data }) : null);
  }, []);

  if (!isLoggedIn) return <Login onLogin={(key, role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', role);
    fetchRecords();
  }} />;

  const sectionMap = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract', 'delivery', 'inspection', 'payment'];
  const titles = ['상담 정보', '견적 1차', '견적 2차', '견적 3차', '데모', '계약', '납품', '검수', '결제'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-2 flex justify-between items-center shadow-sm">
        <h1 className="font-black text-blue-800 cursor-pointer text-xl" onClick={() => window.location.hash = '#list'}>영업DB</h1>
        <div className="flex gap-2">
          {view === 'edit' && (
            <button onClick={() => handleManualSave()} disabled={isSaving} className={`px-4 py-1.5 rounded-lg font-bold text-white shadow-md ${isSaving ? 'bg-gray-400' : 'bg-green-600'}`}>
              {isSaving ? '저장 중...' : '✔ 지금 저장'}
            </button>
          )}
          <button onClick={() => window.location.hash = '#list'} className="px-3 py-1.5 bg-gray-100 rounded-lg font-bold text-gray-600">목록</button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        {view === 'list' ? (
          <SalesList records={records} onSelect={(id) => window.location.hash = `#edit/${id}`} onCreate={async () => {
            const newId = Date.now().toString();
            const newRecord = { id: newId, currentStep: 0, updatedAt: new Date().toISOString(), consultation: { clientName: '' }, estimate1: { items: [], total: 0, currency: 'KRW' }, estimate2: { items: [], total: 0, currency: 'KRW' }, estimate3: { items: [], total: 0, currency: 'KRW' }, demo: { items: [], total: 0, currency: 'KRW' }, contract: { items: [], total: 0, currency: 'KRW' }, delivery: { rows: [] }, inspection: { rows: [] }, payment: { rows: [] } };
            await supabase.from('sales').insert({ id: newId, client_name: '신규 업체', data: newRecord });
            window.location.hash = `#edit/${newId}`;
          }} onDelete={async (id) => { if (window.confirm('삭제하시겠습니까?')) { await supabase.from('sales').delete().eq('id', id); fetchRecords(); } }} userRole={userRole} />
        ) : (
          <div key={currentId}>
            <div className="mb-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-blue-800">업체: {editingRecord?.consultation?.clientName || '로딩 중...'}</span>
              <span className="text-xs text-blue-500 font-bold bg-white px-2 py-1 rounded-full border">단계 {currentStep + 1}/10</span>
            </div>
            <Wizard steps={['상담', '1차', '2차', '3차', '데모', '계약', '납품', '검수', '결제', '완료']} currentStep={currentStep} onStepClick={(idx) => { setCurrentStep(idx); setEditingRecord(p => p ? ({ ...p, currentStep: idx }) : null); }} />
            <div className="mt-6 mb-10">
              {currentStep === 0 && <MemoizedConsultationForm data={editingRecord?.consultation || {}} onChange={(d) => updateCurrentRecord('consultation', d)} />}
              {currentStep >= 1 && currentStep <= 5 && <MemoizedEstimateForm title={titles[currentStep]} data={editingRecord?.[sectionMap[currentStep]] || { items: [], total: 0 }} onChange={(d) => updateCurrentRecord(sectionMap[currentStep], d)} onCopyPrevious={currentStep > 0 ? handleCopyPrevious : null} />}
              {currentStep === 6 && <MemoizedDeliveryInspectionForm data={editingRecord?.delivery || { rows: [] }} onChange={(d) => updateCurrentRecord('delivery', d)} onCopyPrevious={handleCopyPrevious} />}
              {currentStep === 7 && <MemoizedDeliveryInspectionForm data={editingRecord?.inspection || { rows: [] }} onChange={(d) => updateCurrentRecord('inspection', d)} />}
              {currentStep === 8 && <MemoizedPaymentForm data={editingRecord?.payment || { rows: [] }} onChange={(d) => updateCurrentRecord('payment', d)} />}
              {currentStep === 9 && <div className="p-20 text-center bg-white rounded-xl border border-blue-200 shadow-inner"><h2 className="text-2xl font-black text-blue-800 mb-4">🚀 완료되었습니다</h2><button onClick={() => window.location.hash = '#list'} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">목록가기</button></div>}
            </div>
            {currentStep < 9 && (
              <div className="flex gap-4 sticky bottom-4">
                <button onClick={() => { const s = currentStep - 1; if (s >= 0) { setCurrentStep(s); setEditingRecord(p => p ? ({ ...p, currentStep: s }) : null); window.scrollTo(0, 0); } }} disabled={currentStep === 0} className={`flex-1 py-4 rounded-xl font-bold shadow-lg ${currentStep === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-600 text-white'}`}>이전</button>
                <button onClick={() => { const s = currentStep + 1; if (s <= 9) { setCurrentStep(s); setEditingRecord(p => p ? ({ ...p, currentStep: s }) : null); window.scrollTo(0, 0); } }} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg text-lg">다음 단계 →</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
