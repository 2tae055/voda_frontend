// 월간 보고서 생성
async function createMonthlyReport(data) {
    return await apiFetch('/report', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 월간 보고서 목록 조회
async function getMonthlyReports({ limit, cursor } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch(`/report${query}`);
}

// 특정 연도/월 보고서 조회
async function getMonthlyReportByMonth(year, month) {
    return await apiFetch(`/report/month?year=${year}&month=${month}`);
}

// reportId로 월간 보고서 조회
async function getMonthlyReportById(reportId) {
    return await apiFetch(`/report/${reportId}`);
}

// 월간 보고서 삭제
async function deleteMonthlyReport(reportId) {
    return await apiFetch(`/report/${reportId}`, {
        method: 'DELETE'
    });
}

// 주간 보고서 생성
async function createWeeklyReport(data) {
    return await apiFetch('/report/weekly', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 주간 보고서 목록 조회
async function getWeeklyReports({ limit, cursor } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch(`/report/weekly${query}`);
}

// reportId로 주간 보고서 조회
async function getWeeklyReportById(reportId) {
    return await apiFetch(`/report/weekly/${reportId}`);
}

// 주간 보고서 삭제
async function deleteWeeklyReport(reportId) {
    return await apiFetch(`/report/weekly/${reportId}`, {
        method: 'DELETE'
    });
}

// ── UI ──────────────────────────────────────────

async function loadReportPage() {
    await switchReportTab('monthly');
}

async function switchReportTab(type) {
    const tabMonthly = document.getElementById('tab-monthly');
    const tabWeekly = document.getElementById('tab-weekly');
    const listEl = document.getElementById('report-list');
    if (!listEl) return;

    if (tabMonthly) {
        tabMonthly.style.borderBottomColor = type === 'monthly' ? 'var(--primary-orange)' : 'transparent';
        tabMonthly.style.color = type === 'monthly' ? 'var(--primary-orange)' : 'var(--text-gray)';
        tabMonthly.style.fontWeight = type === 'monthly' ? '700' : '600';
    }
    if (tabWeekly) {
        tabWeekly.style.borderBottomColor = type === 'weekly' ? 'var(--primary-orange)' : 'transparent';
        tabWeekly.style.color = type === 'weekly' ? 'var(--primary-orange)' : 'var(--text-gray)';
        tabWeekly.style.fontWeight = type === 'weekly' ? '700' : '600';
    }

    listEl.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding:40px 0;">불러오는 중...</div>`;

    try {
        const response = type === 'monthly'
            ? await getMonthlyReports()
            : await getWeeklyReports();
        renderReportList(response.data.reports, type);
    } catch (e) {
        console.error(`[report] ${type} 목록 로드 실패:`, e);
        listEl.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding:40px 0;">불러오기 실패</div>`;
    }
}

function renderReportList(reports, type) {
    const listEl = document.getElementById('report-list');
    if (!listEl) return;

    if (!reports || reports.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding:40px 0;">보고서가 없습니다</div>`;
        return;
    }

    listEl.innerHTML = reports.map(r => {
        const date = new Date(r.baseDate);
        const label = type === 'monthly'
            ? `${date.getFullYear()}년 ${date.getMonth() + 1}월`
            : `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 주`;
        return `
            <div onclick="openReportDetail('${r.reportId}', '${type}')"
                 style="background:white; border-radius:16px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); cursor:pointer; display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <div style="font-size:16px; font-weight:700; color:var(--text-dark);">${label}</div>
                    <div style="font-size:13px; color:var(--text-gray); margin-top:4px;">${type === 'monthly' ? '월간' : '주간'} 레포트</div>
                </div>
                <span class="material-symbols-rounded" style="color:var(--text-gray);">chevron_right</span>
            </div>
        `;
    }).join('');
}

async function openReportDetail(reportId, type) {
    const listEl = document.getElementById('report-list');
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding:40px 0;">불러오는 중...</div>`;

    try {
        const response = type === 'monthly'
            ? await getMonthlyReportById(reportId)
            : await getWeeklyReportById(reportId);
        renderReportDetail(response.data, type);
    } catch (e) {
        listEl.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding:40px 0;">불러오기 실패</div>`;
    }
}

function renderReportDetail(data, type) {
    const listEl = document.getElementById('report-list');
    if (!listEl) return;

    const date = new Date(data.baseDate);
    const dateLabel = type === 'monthly'
        ? `${date.getFullYear()}년 ${date.getMonth() + 1}월`
        : `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 주`;

    const photos = data.detailsJson?.photos || [];
    const photosHTML = photos.length > 0 ? `
        <div style="background:white; border-radius:16px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-bottom:12px;">
            <div style="font-size:13px; font-weight:700; color:var(--text-gray); margin-bottom:12px;">사진</div>
            <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">
                ${photos.map(url => `<img src="${url}" style="width:90px; height:90px; object-fit:cover; border-radius:12px; flex-shrink:0;">`).join('')}
            </div>
        </div>
    ` : '';

    const weeklyBreakdown = data.detailsJson?.weeklyBreakdown || [];
    const weeklyHTML = weeklyBreakdown.length > 0 ? `
        <div style="background:white; border-radius:16px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-bottom:12px;">
            <div style="font-size:13px; font-weight:700; color:var(--text-gray); margin-bottom:16px;">일별 기록</div>
            ${weeklyBreakdown.map(day => {
                const d = new Date(day.date);
                const photo = day.photos?.[0];
                return `
                    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:16px;">
                        ${photo ? `<img src="${photo}" style="width:56px; height:56px; object-fit:cover; border-radius:10px; flex-shrink:0;">` : ''}
                        <div>
                            <div style="font-size:13px; font-weight:700; color:var(--text-dark);">${d.getMonth() + 1}월 ${d.getDate()}일 (${day.dayOfWeek})</div>
                            <div style="font-size:13px; color:var(--text-gray); margin-top:4px; line-height:1.6;">${day.dailyAnalysis}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    ` : '';

    listEl.innerHTML = `
        <div style="padding-bottom:40px;">
            <button onclick="switchReportTab('${type}')"
                    style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:2px; color:var(--text-gray); font-size:14px; padding:0 0 16px 0; font-family:'Pretendard';">
                <span class="material-symbols-rounded" style="font-size:18px;">arrow_back_ios</span>목록으로
            </button>

            <div style="font-size:20px; font-weight:800; color:var(--text-dark); margin-bottom:4px;">${dateLabel}</div>
            <div style="font-size:13px; color:var(--text-gray); margin-bottom:20px;">${type === 'monthly' ? '월간' : '주간'} 레포트</div>

            <div style="display:flex; gap:12px; margin-bottom:12px;">
                <div style="flex:1; background:white; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size:22px; font-weight:800; color:var(--primary-orange);">${data.summary?.diaryCount ?? 0}</div>
                    <div style="font-size:12px; color:var(--text-gray); margin-top:4px;">일기</div>
                </div>
                <div style="flex:1; background:white; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size:22px; font-weight:800; color:var(--primary-orange);">${data.summary?.photoCount ?? 0}</div>
                    <div style="font-size:12px; color:var(--text-gray); margin-top:4px;">사진</div>
                </div>
            </div>

            ${data.summary?.text ? `
            <div style="background:white; border-radius:16px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-bottom:12px;">
                <div style="font-size:13px; font-weight:700; color:var(--text-gray); margin-bottom:8px;">AI 분석</div>
                <div style="font-size:14px; color:var(--text-dark); line-height:1.7;">${data.summary.text}</div>
            </div>
            ` : ''}

            ${photosHTML}
            ${weeklyHTML}
        </div>
    `;
}

window.createMonthlyReport = createMonthlyReport;
window.getMonthlyReports = getMonthlyReports;
window.getMonthlyReportByMonth = getMonthlyReportByMonth;
window.getMonthlyReportById = getMonthlyReportById;
window.deleteMonthlyReport = deleteMonthlyReport;
window.createWeeklyReport = createWeeklyReport;
window.getWeeklyReports = getWeeklyReports;
window.getWeeklyReportById = getWeeklyReportById;
window.deleteWeeklyReport = deleteWeeklyReport;
window.loadReportPage = loadReportPage;
window.switchReportTab = switchReportTab;
window.openReportDetail = openReportDetail;
