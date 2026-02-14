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

// 기본 품목 양식
// 기본 품목 리스트 (카메라, 렌즈, 삼각대, 조명, 컴퓨터, 액세서리1, 액세서리2, 액세서리3, 액세서리4)
const defaultItems = [
  { name: '카메라', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '렌즈', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '삼각대', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '조명', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '컴퓨터', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '액세서리1', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '액세서리2', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '액세서리3', model: '', spec: '', price: '', currency: 'KRW' },
  { name: '액세서리4', model: '', spec: '', price: '', currency: 'KRW' }
];

const defaultRows = defaultItems.map(item => ({ category: item.name, model: '', spec: '', confirmed: false }));

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
    const { data, error } = await supabase.from('sales').select('*').order('updated_at', { ascending: false });
    if (!error && data) {
      const loaded = data.map(row => {
        try { return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; }
        catch (e) { return null; }
      }).filter(r => r && r.id);
      setRecords(loaded);
    }
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

  // 레코드 데이터 로드 및 초기화 (핵심: 데이터가 없으면 기본 양식 주입)
  useEffect(() => {
    if (view === 'edit' && currentId && records.length > 0) {
      const found = records.find(r => String(r.id) === String(currentId));
      if (found) {
        // 데이터가 비어있다면 기본 양식으로 채워줌
        const sanitized = {
          ...found,
          consultation: found.consultation || { clientName: '' },
          estimate1: { items: found.estimate1?.items?.length ? found.estimate1.items : defaultItems, total: found.estimate1?.total || 0 },
          estimate2: { items: found.estimate2?.items?.length ? found.estimate2.items : defaultItems, total: found.estimate2?.total || 0 },
          estimate3: { items: found.estimate3?.items?.length ? found.estimate3.items : defaultItems, total: found.estimate3?.total || 0 },
          demo: { items: found.demo?.items?.length ? found.demo.items : defaultItems, total: found.demo?.total || 0 },
          contract: { items: found.contract?.items?.length ? found.contract.items : defaultItems, total: found.contract?.total || 0 },
          delivery: { rows: found.delivery?.rows?.length ? found.delivery.rows : defaultRows },
          inspection: { rows: found.inspection?.rows?.length ? found.inspection.rows : defaultRows },
          payment: found.payment || { rows: [] }
        };
        setEditingRecord(sanitized);
        setCurrentStep(found.currentStep || 0);
      }
    }
  }, [view, currentId, records]);

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
    } else {
      alert('저장 실패: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleCopyPrevious = useCallback(() => {
    if (!editingRecord) return;

    let prevSection = '';
    let currentSection = '';

    // 단계별 복사 로직 정의
    if (currentStep === 5) { // 계약 단계 (step 6)
      prevSection = 'estimate1'; // 예: 견적 1차에서 가져옴
      currentSection = 'contract';
    } else if (currentStep === 6) { // 납품 단계 (step 7)
      prevSection = 'contract';
      currentSection = 'delivery';
    } else if (currentStep === 7) { // 검수 단계 (step 8)
      prevSection = 'delivery';
      currentSection = 'inspection';
    } else if (currentStep >= 1 && currentStep <= 4) { // 견적 1~3, 데모
      const steps = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo'];
      prevSection = steps[currentStep - 1];
      currentSection = steps[currentStep];
    }

    if (prevSection && currentSection) {
      const prevData = editingRecord[prevSection];
      if (prevData) {
        let copiedContent;

        // 데이터 구조 변환 (items -> rows)
        if (prevData.items && (currentSection === 'delivery' || currentSection === 'inspection')) {
          copiedContent = {
            rows: prevData.items.map(item => ({
              category: item.name || '',
              model: item.model || '',
              spec: item.spec || '',
              qty: item.qty || 0,
              confirmed: false
            }))
          };
        } else if (prevData.rows && currentSection === 'inspection') {
          // 납품(rows) -> 검수(rows)
          copiedContent = {
            rows: prevData.rows.map(row => ({
              ...row,
              confirmed: false
            }))
          };
        } else {
          // 동일 구조 복사
          copiedContent = JSON.parse(JSON.stringify(prevData));
        }

        setEditingRecord(prev => ({ ...prev, [currentSection]: copiedContent }));
      }
    }
  }, [editingRecord, currentStep]);

  const updateCurrentRecord = useCallback((section, data) => {
    setEditingRecord(prev => prev ? ({ ...prev, [section]: data }) : null);
  }, []);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setIsLoggedIn(false);
      setUserRole('viewer');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userRole');
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

  const sectionMap = ['consultation', 'estimate1', 'estimate2', 'estimate3', 'demo', 'contract', 'delivery', 'inspection', 'payment'];
  const titles = ['상담 정보', '견적 1차', '견적 2차', '견적 3차', '데모', '계약', '납품', '검수', '결제'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-2 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-black text-blue-800 cursor-pointer text-xl" onClick={() => window.location.hash = '#list'}>영업DB</h1>
          <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md ${userRole === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
            {userRole === 'admin' ? 'ADMIN' : 'VIEWER'}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.hash = '#list'} className="px-3 py-1.5 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors">목록</button>
          <button onClick={handleLogout} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold border border-red-100 hover:bg-red-100 transition-colors">로그아웃</button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        {view === 'list' ? (
          <SalesList records={records} onSelect={(id) => window.location.hash = `#edit/${id}`} onCreate={async () => {
            const newId = Date.now().toString();
            const newRecord = { id: newId, currentStep: 0, updatedAt: new Date().toISOString(), consultation: { clientName: '', dept: '', position: '', manager: '', phone1: '', phone2: '', email: '', address: '', content: '' }, estimate1: { items: defaultItems, total: 0 }, estimate2: { items: defaultItems, total: 0 }, estimate3: { items: defaultItems, total: 0 }, demo: { items: defaultItems, total: 0 }, contract: { items: defaultItems, total: 0 }, delivery: { rows: defaultRows }, inspection: { rows: defaultRows }, payment: { rows: [] } };
            await supabase.from('sales').insert({ id: newId, client_name: '신규 업체', data: newRecord });
            fetchRecords();
            window.location.hash = `#edit/${newId}`;
          }} onDelete={async (id) => { if (window.confirm('삭제하시겠습니까?')) { await supabase.from('sales').delete().eq('id', id); fetchRecords(); } }} userRole={userRole} />
        ) : (
          <div key={currentId}>
            <div className="mb-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-blue-800">업체: {editingRecord?.consultation?.clientName || '신규 업체'}</span>
              <span className="text-xs text-blue-500 font-bold bg-white px-2 py-1 rounded-full border">단계 {currentStep + 1}/10</span>
            </div>
            <Wizard steps={['상담', '1차', '2차', '3차', '데모', '계약', '납품', '검수', '결제', '완료']} currentStep={currentStep} onStepClick={(idx) => { setCurrentStep(idx); setEditingRecord(p => p ? ({ ...p, currentStep: idx }) : null); }} />
            <div className="mt-6 mb-20 space-y-6">
              {/* 상단 저장 버튼 (sticky) */}
              <div className="flex justify-end sticky top-16 z-40 py-2">
                <button
                  onClick={() => handleManualSave()}
                  disabled={isSaving}
                  className={`px-10 py-4 rounded-2xl font-black text-white shadow-2xl active:scale-95 transition-all text-xl flex items-center gap-2 ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}
                >
                  {isSaving ? '⏳ 저장 중...' : '💾 지금 저장하기'}
                </button>
              </div>

              {currentStep === 0 && <MemoizedConsultationForm data={editingRecord?.consultation || {}} onChange={(d) => updateCurrentRecord('consultation', d)} />}

              {/* 견적 1~3차 및 계약 */}
              {(currentStep >= 1 && currentStep <= 3) || currentStep === 5 ? (
                <MemoizedEstimateForm
                  title={titles[currentStep]}
                  data={editingRecord?.[sectionMap[currentStep]] || { items: defaultItems, total: 0 }}
                  onChange={(d) => updateCurrentRecord(sectionMap[currentStep], d)}
                  onCopyPrevious={handleCopyPrevious}
                />
              ) : null}

              {/* 데모 단계 */}
              {currentStep === 4 && (
                <MemoizedEstimateForm
                  title="데모 정보"
                  isDemo={true}
                  data={editingRecord?.demo || { items: defaultItems }}
                  onChange={(d) => updateCurrentRecord('demo', d)}
                  onCopyPrevious={handleCopyPrevious}
                />
              )}

              {/* 납품 단계 */}
              {currentStep === 6 && (
                <MemoizedDeliveryInspectionForm
                  title="납품 정보"
                  mode="delivery"
                  data={editingRecord?.delivery || { rows: defaultRows }}
                  onChange={(d) => updateCurrentRecord('delivery', d)}
                  onCopyPrevious={handleCopyPrevious}
                />
              )}

              {/* 검수 단계 */}
              {currentStep === 7 && (
                <MemoizedDeliveryInspectionForm
                  title="검수 정보"
                  mode="inspection"
                  data={editingRecord?.inspection || { rows: defaultRows }}
                  onChange={(d) => updateCurrentRecord('inspection', d)}
                  onCopyPrevious={handleCopyPrevious}
                />
              )}

              {currentStep === 8 && <MemoizedPaymentForm data={editingRecord?.payment || { rows: [] }} onChange={(d) => updateCurrentRecord('payment', d)} />}

              {currentStep === 9 && (
                <div className="p-20 text-center bg-white rounded-3xl border-4 border-blue-500 shadow-2xl">
                  <h2 className="text-4xl font-black text-blue-800 mb-6">🚀 모든 작업 완료!</h2>
                  <p className="text-gray-500 mb-10 font-bold text-lg">기초 상담부터 결제까지 모든 단계가 기록되었습니다.</p>
                  <button onClick={() => window.location.hash = '#list'} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-2xl hover:bg-blue-700 shadow-xl transition-all active:scale-95">대시보드로 돌아가기</button>
                </div>
              )}

              {/* 하단 저장 버튼 (강조) */}
              {currentStep < 9 && (
                <div className="flex justify-center pt-10 border-t border-gray-200">
                  <button
                    onClick={() => handleManualSave()}
                    disabled={isSaving}
                    className={`w-full max-w-xl py-6 rounded-2xl font-black text-white shadow-2xl active:scale-95 transition-all text-2xl flex justify-center items-center gap-3 ${isSaving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isSaving ? '⏳ 서버 전송 중...' : '✔ 입력 완료 및 최종 저장'}
                  </button>
                </div>
              )}
            </div>
            {currentStep < 9 && (
              <div className="flex gap-4 sticky bottom-4 z-40 bg-gray-50/80 backdrop-blur-sm p-2 rounded-2xl">
                <button onClick={() => { const s = currentStep - 1; if (s >= 0) { setCurrentStep(s); setEditingRecord(p => p ? ({ ...p, currentStep: s }) : null); window.scrollTo(0, 0); } }} disabled={currentStep === 0} className={`flex-1 py-5 rounded-2xl font-black shadow-lg transition-all ${currentStep === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-700 text-white hover:bg-gray-800'}`}>이전 단계</button>
                <button onClick={() => { const s = currentStep + 1; if (s <= 9) { setCurrentStep(s); setEditingRecord(p => p ? ({ ...p, currentStep: s }) : null); window.scrollTo(0, 0); } }} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg text-xl hover:bg-blue-700 active:scale-95">다음 단계 →</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
