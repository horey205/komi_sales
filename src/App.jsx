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

// 기본 품목 리스트
const defaultItems = [
  { name: '카메라', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '렌즈', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '삼각대', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '조명', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '컴퓨터', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '액세서리1', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '액세서리2', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '액세서리3', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' },
  { name: '액세서리4', model: '', spec: '', qty: 0, price: 0, amount: 0, currency: 'KRW' }
];

const defaultRows = defaultItems.map(item => ({ category: item.name, model: '', spec: '', qty: 0, confirmed: false }));

const STEPS = {
  CONSULTATION: 0,
  ESTIMATE_1: 1,
  ESTIMATE_2: 2,
  ESTIMATE_3: 3,
  DEMO: 4,
  CONTRACT: 5,
  DELIVERY: 6,
  INSPECTION: 7,
  PAYMENT: 8,
  COMPLETE: 9
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole') || 'viewer');
  const [view, setView] = useState('list');
  const [records, setRecords] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // 해시 라우팅 처리
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#edit/')) {
        const id = hash.replace('#edit/', '');
        setCurrentId(id);
        setView('edit');
      } else {
        setView('list');
        setCurrentId(null);
        setEditingRecord(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 데이터 불러오기
  const fetchRecords = async () => {
    const { data, error } = await supabase.from('sales').select('*').order('updated_at', { ascending: false });
    if (!error) setRecords(data);
  };

  useEffect(() => {
    if (isLoggedIn) fetchRecords();
  }, [isLoggedIn]);

  // 목록 보기로 전환 시 데이터 갱신
  useEffect(() => {
    if (view === 'list' && isLoggedIn) {
      fetchRecords();
    }
  }, [view, isLoggedIn]);

  // 편집 데이터 동기화
  useEffect(() => {
    if (view === 'edit' && currentId && records.length > 0) {
      const found = records.find(r => String(r.id) === String(currentId));
      if (found) {
        // 이미 편집 중인 데이터가 있고, ID가 같다면 덮어쓰지 않음 (로컬 상태 우선)
        // 단, 처음 진입(editingRecord가 null)이거나 다른 ID로 전환된 경우는 업데이트
        setEditingRecord(prev => {
          if (prev && String(prev.id) === String(currentId)) return prev;

          const d = found.data || found;
          const sanitized = {
            ...d,
            id: found.id,
            consultation: d.consultation || { clientName: '' },
            estimate1: d.estimate1 || { items: structuredClone(defaultItems), total: 0 },
            estimate2: d.estimate2 || { items: structuredClone(defaultItems), total: 0 },
            estimate3: d.estimate3 || { items: structuredClone(defaultItems), total: 0 },
            demo: d.demo || { items: structuredClone(defaultItems), total: 0 },
            contract: d.contract || { items: structuredClone(defaultItems), total: 0 },
            delivery: d.delivery || { rows: structuredClone(defaultRows) },
            inspection: d.inspection || { rows: structuredClone(defaultRows) },
            payment: d.payment || { rows: [] }
          };
          // update currentStep state as well
          setCurrentStep(d.currentStep || STEPS.CONSULTATION);
          return sanitized;
        });
      }
    }
  }, [view, currentId, records]); // Note: setCurrentStep logic inside might be tricky if not careful

  const updateCurrentRecord = useCallback((section, data) => {
    setEditingRecord(prev => prev ? ({ ...prev, [section]: data }) : null);
  }, []);

  // 통합 저장 함수 (Auto/Manual)
  const saveData = async (stepOverride = null, silent = false) => {
    if (!editingRecord) return;
    setIsSaving(true);

    // 단계 변경 시에는 변경된 단계로 저장, 아니면 현재 단계
    const stepToSave = stepOverride !== null ? stepOverride : currentStep;
    
    // 진행 단계가 뒤로 밀리지 않도록 처리 (요구사항 4번)
    const prevMaxStep = editingRecord.maxStep || 0;
    const newMaxStep = Math.max(prevMaxStep, stepToSave);
    
    const recordToSave = { 
      ...editingRecord, 
      currentStep: stepToSave,
      maxStep: newMaxStep // 최종 진행 단계를 별도로 기록
    };

    const { error } = await supabase.from('sales').upsert({
      id: editingRecord.id,
      client_name: editingRecord.consultation?.clientName || '미지정',
      data: recordToSave,
      updated_at: new Date().toISOString()
    });

    if (error) {
      if (!silent) alert('저장 실패: ' + error.message);
      console.error('Save error:', error);
    } else {
      if (!silent) {
        await fetchRecords(); // 수동 저장 시에는 목록 갱신
        alert('기록이 서버에 안전하게 저장되었습니다.');
      }
      // 자동 저장일 때는 fetchRecords 호출하지 않음 (편집 상태 유지 및 불필요한 리렌더링 방지)
    }
    setIsSaving(false);
  };

  const handleManualSave = () => saveData(null, false);

  const handleStepChange = async (newStep) => {
    setCurrentStep(newStep);
    window.scrollTo(0, 0);
    await saveData(newStep, true);
  };

  const handleCopyPrevious = useCallback(() => {
    if (!editingRecord) return;
    const steps = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract', 'delivery', 'inspection'];
    let prevSection = '';
    let currentSection = steps[currentStep];

    if (currentStep === STEPS.CONTRACT) prevSection = 'estimate1'; // 계약은 보통 1차 견적에서 복사
    else if (currentStep === STEPS.DELIVERY) prevSection = 'contract';
    else if (currentStep === STEPS.INSPECTION) prevSection = 'delivery';
    else if (currentStep > STEPS.CONSULTATION && currentStep <= STEPS.DEMO) prevSection = steps[currentStep - 1];

    if (prevSection && currentSection) {
      const prevData = editingRecord[prevSection];
      if (prevData) {
        let copiedContent;
        if (prevData.items && (currentSection === 'delivery' || currentSection === 'inspection')) {
          copiedContent = { rows: prevData.items.map(item => ({ category: item.name || '', model: item.model || '', spec: item.spec || '', qty: item.qty || 0, confirmed: false })), date: new Date().toISOString().slice(0, 10) };
        } else if (prevData.rows && currentSection === 'inspection') {
          copiedContent = { rows: prevData.rows.map(row => ({ ...row, confirmed: false })), date: new Date().toISOString().slice(0, 10) };
        } else {
          copiedContent = structuredClone(prevData);
        }
        setEditingRecord(prev => ({ ...prev, [currentSection]: copiedContent }));
      }
    }
  }, [editingRecord, currentStep]);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setIsLoggedIn(false);
      sessionStorage.clear();
      window.location.hash = '#list';
    }
  };

  if (!isLoggedIn) return <Login onLogin={(key, role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', role);
    fetchRecords();
  }} />;

  const sectionMap = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract', 'delivery', 'inspection', 'payment', 'complete'];
  const titles = ['기초 상담', '1차 견적', '2차 견적', '3차 견적', '데모 협의', '계약 확정', '제품 납품', '최종 검수', '결제 관리', '마침'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-blue-600 tracking-tighter cursor-pointer" onClick={() => window.location.hash = '#list'}>KOMI SALES</h1>
          <span className="hidden xs:inline-block bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">{userRole} AUTH</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.hash = '#list'} className="px-3 sm:px-5 py-2 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all active:scale-95 shadow-sm text-sm">목록</button>
          <button onClick={handleLogout} className="px-3 sm:px-5 py-2 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-all active:scale-95 shadow-sm text-sm">로그아웃</button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4 max-w-6xl mx-auto w-full mb-20">
        {view === 'list' ? (
          <SalesList records={records} onSelect={(id) => window.location.hash = `#edit/${id}`} onCreate={async () => {
            const newId = Date.now().toString();
            const newRecord = {
              id: newId,
              currentStep: STEPS.CONSULTATION,
              maxStep: STEPS.CONSULTATION,
              updatedAt: new Date().toISOString(),
              consultation: { clientName: '', dept: '', position: '', manager: '', phone1: '', phone2: '', email: '', address: '', content: '' },
              estimate1: { items: structuredClone(defaultItems), total: 0, currency: 'KRW' },
              estimate2: { items: structuredClone(defaultItems), total: 0, currency: 'KRW' },
              estimate3: { items: structuredClone(defaultItems), total: 0, currency: 'KRW' },
              demo: { items: structuredClone(defaultItems), total: 0 },
              contract: { items: structuredClone(defaultItems), total: 0, currency: 'KRW' },
              delivery: { rows: structuredClone(defaultRows) },
              inspection: { rows: structuredClone(defaultRows) },
              payment: { rows: [] }
            };
            const { error } = await supabase.from('sales').insert({ 
              id: newId, 
              client_name: '신규 업체(입력중)', 
              data: newRecord, 
              updated_at: new Date().toISOString() 
            });
            if (!error) { fetchRecords(); window.location.hash = `#edit/${newId}`; }
          }} onDelete={async (id) => { if (window.confirm('정말 삭제하시겠습니까?')) { await supabase.from('sales').delete().eq('id', id); fetchRecords(); } }} userRole={userRole} />
        ) : (
          <div key={currentId}>
            <div className="mb-6 flex justify-between items-center bg-blue-600 p-5 rounded-3xl shadow-xl border-4 border-white">
              <span className="font-black text-white text-xl">🏢 {editingRecord?.consultation?.clientName || '업체명 미입력'}</span>
              <span className="text-xs text-blue-600 font-black bg-white px-4 py-2 rounded-full shadow-inner">{titles[currentStep]} ({currentStep + 1}/10)</span>
            </div>

            <Wizard steps={['상담', '1차', '2차', '3차', '데모', '계약', '납품', '검수', '결제', '완료']} currentStep={currentStep} onStepClick={handleStepChange} />

            <div className="mt-8 space-y-8 pb-32">
              {/* 상단 통합 저장 버튼 (크기 축소) */}
              <div className="flex justify-end sticky top-16 sm:top-20 z-40 py-2">
                <button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-xl font-black text-white shadow-lg active:scale-95 transition-all text-sm flex items-center gap-2 ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isSaving ? '⏳ 저장중' : '💾 저장'}
                </button>
              </div>

              {currentStep === STEPS.CONSULTATION && <MemoizedConsultationForm data={editingRecord?.consultation} onChange={(d) => updateCurrentRecord('consultation', d)} />}
              {(currentStep >= STEPS.ESTIMATE_1 && currentStep <= STEPS.ESTIMATE_3) || currentStep === STEPS.CONTRACT ? (
                <MemoizedEstimateForm
                  title={titles[currentStep]}
                  data={editingRecord?.[sectionMap[currentStep]]}
                  onChange={(d) => updateCurrentRecord(sectionMap[currentStep], d)}
                  onCopyPrevious={currentStep !== STEPS.ESTIMATE_1 ? handleCopyPrevious : undefined}
                />
              ) : null}
              {currentStep === STEPS.DEMO && <MemoizedEstimateForm title="데모 협의" isDemo={true} data={editingRecord?.demo} onChange={(d) => updateCurrentRecord('demo', d)} onCopyPrevious={handleCopyPrevious} />}
              {currentStep === STEPS.DELIVERY && <MemoizedDeliveryInspectionForm title="제품 납품" mode="delivery" data={editingRecord?.delivery} onChange={(d) => updateCurrentRecord('delivery', d)} onCopyPrevious={handleCopyPrevious} />}
              {currentStep === STEPS.INSPECTION && <MemoizedDeliveryInspectionForm title="최종 검수" mode="inspection" data={editingRecord?.inspection} onChange={(d) => updateCurrentRecord('inspection', d)} onCopyPrevious={handleCopyPrevious} />}
              {currentStep === STEPS.PAYMENT && <MemoizedPaymentForm data={editingRecord?.payment} contractAmount={editingRecord?.contract?.total || 0} onChange={(d) => updateCurrentRecord('payment', d)} />}

              {currentStep === STEPS.COMPLETE && (
                <div className="p-10 mb-20 text-center bg-blue-50 rounded-3xl border-4 border-dashed border-blue-200">
                  <h2 className="text-3xl font-black text-blue-800 mb-2 italic">MISSION COMPLETE!</h2>
                  <p className="text-gray-500 mb-6 font-bold text-sm">모든 프로세스가 종료되었습니다. 내용을 다시 확인하려면 위 마일스톤의 단계를 클릭하세요.</p>
                  <button onClick={() => window.location.hash = '#list'} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-lg hover:bg-blue-700 shadow-lg transition-all active:scale-95">메인 대시보드로 이동</button>
                </div>
              )}

              {/* 하단 통합 저장 버튼 (크기 축소) */}
              {currentStep < STEPS.COMPLETE && (
                <div className="flex justify-center pt-10 mb-10">
                  <button
                    onClick={handleManualSave}
                    disabled={isSaving}
                    className={`w-full max-w-sm py-4 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all text-lg flex justify-center items-center gap-2 ${isSaving ? 'bg-gray-400 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isSaving ? '⏳ 데이터 전송 중...' : '✔ 현재 단계 저장'}
                  </button>
                </div>
              )}
            </div>

            {/* 스탭 이동 내비게이션 (스타일 개선) */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50 w-[92%] max-w-3xl">
              <button 
                onClick={() => { const s = currentStep - 1; if (s >= 0) handleStepChange(s); }} 
                disabled={currentStep === 0} 
                className={`flex-1 py-3 items-center justify-center rounded-xl font-black shadow-xl transition-all border-2 text-xs sm:text-sm ${currentStep === 0 ? 'bg-white/50 text-gray-300 border-gray-100 pointer-events-none' : 'bg-gray-800 text-white border-gray-700'}`}
              >
                ◀ 이전 단계
              </button>
              <button 
                onClick={() => { const s = currentStep + 1; if (s <= 9) handleStepChange(s); }} 
                className={`flex-[2] py-3 rounded-xl font-black shadow-xl text-sm sm:text-base border-2 transition-all ${currentStep === 9 ? 'bg-green-600 border-green-400 text-white' : 'bg-blue-600 text-white border-blue-400'}`}
              >
                {currentStep === 9 ? '최종 완료 확인' : '다음 단계로 이동 ▶'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
