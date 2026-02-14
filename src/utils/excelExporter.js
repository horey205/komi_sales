import * as XLSX from 'xlsx';

export const exportToExcel = (records) => {
    const steps = ['상담', '견적1차', '견적2차', '견적3차', '데모', '계약', '납품', '검수', '결제', '완료'];

    const formatItems = (items) => {
        if (!items || !items.length) return '';
        return items.map(i => `[${i.name}] ${i.model || '-'} / ${i.spec || '-'} (${Number(i.price || 0).toLocaleString()})`).join('\n');
    };

    const formatRows = (rows) => {
        if (!rows || !rows.length) return '';
        return rows.map(r => `[${r.category}] ${r.model || '-'} / ${r.spec || '-'} (${r.confirmed ? '검수완료' : '미검수'})`).join('\n');
    };

    const data = records.map(record => {
        const c = record.consultation || {};
        const e1 = record.estimate1 || {};
        const e2 = record.estimate2 || {};
        const e3 = record.estimate3 || {};
        const demo = record.demo || {};
        const contract = record.contract || {};
        const delivery = record.delivery || {};
        const inspection = record.inspection || {};
        const payment = record.payment || {};

        return {
            'ID': record.id,
            '진행상태': steps[record.currentStep || 0],
            '최종수정일': record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '',

            // 상담 정보
            '상담일자': c.consultationDate || '',
            '업체명': c.clientName || '',
            '부서': c.dept || '',
            '직책': c.position || '',
            '담당자': c.manager || '',
            '연락처1': c.phone1 || '',
            '연락처2': c.phone2 || '',
            '이메일': c.email || '',
            '주소': c.address || '',
            '상담메모': c.content || '',

            // 견적 1차
            '견적1차_날짜': e1.date || '',
            '견적1차_품목': formatItems(e1.items),
            '견적1차_총액': e1.total || 0,

            // 견적 2차
            '견적2차_날짜': e2.date || '',
            '견적2차_품목': formatItems(e2.items),
            '견적2차_총액': e2.total || 0,

            // 견적 3차
            '견적3차_날짜': e3.date || '',
            '견적3차_품목': formatItems(e3.items),
            '견적3차_총액': e3.total || 0,

            // 데모 및 계약
            '데모_날짜': demo.date || '',
            '데모_내용': formatItems(demo.items),
            '계약_날짜': contract.date || '',
            '계약_품목': formatItems(contract.items),
            '계약_총액': contract.total || 0,

            // 납품 및 검수
            '납품_날짜': delivery.date || '',
            '납품_현황': formatRows(delivery.rows),
            '검수_날짜': inspection.date || '',
            '검수_현황': formatRows(inspection.rows),

            // 결제
            '결제_정보': payment.date ? `${payment.date} / ${payment.status}` : ''
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-width for some columns
    const wscols = [
        { wch: 15 }, { wch: 10 }, { wch: 20 }, // Basic
        { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, // Client
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 40 }, // Contact & Memo
        { wch: 12 }, { wch: 40 }, { wch: 15 }, // Estimate 1
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "전체영업데이터");

    XLSX.writeFile(workbook, `SalesDB_Full_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
