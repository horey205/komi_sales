# Komi Sales CRM (영업 상담 관리 시스템)

React 19 + Vite 기반의 반응형 영업 상담 및 프로세스 관리 시스템입니다.

- **사이트 URL**: [https://horey205.github.io/komi_sales/](https://horey205.github.io/komi_sales/)
- **데이터베이스**: Supabase (PostgreSQL / REST API)
- **호스팅**: GitHub Pages

---

## ⏰ Supabase 무료 플랜 비활성화(Pause) 방지 설정

Supabase 무료 티어는 7일간 DB 요청이 없을 시 프로젝트가 일시정지(Paused)됩니다. 이를 방지하기 위해 **이중 자동화(Dual Keep-Alive)**로 운영 중입니다.

### 1. cron-job.org (주 자동화 - 권장)
- **주기**: 매 12시간마다 실행 (`0 */12 * * *`, Asia/Seoul)
- **요청 URL**: `https://zygqappdbfwysxfndxps.supabase.co/rest/v1/sales?select=id&limit=1`
- **Request Method**: `GET`
- **Request Headers**:
  - `apikey`: `sb_publishable_7Ns5aTfzWpm5x-A2ZBpHaA_2ZXlh-68`
  - `Authorization`: `Bearer sb_publishable_7Ns5aTfzWpm5x-A2ZBpHaA_2ZXlh-68`

### 2. GitHub Actions (보조 자동화)
- **워크플로우 파일**: `.github/workflows/keep-alive.yml`
- **주기**: 매일 1회 (`cron: '0 0 * * *'`) 실행
- Supabase REST API 및 Auth Health 체크 핑 전송 + 30일 주기 빈 커밋(활동 유지) 푸시

---

## 🛠️ 개발 및 배포

- **로컬 실행**: `npm run dev`
- **빌드 및 배포**: `업데이트_및_배포.bat` 실행 시 빌드 후 GitHub Pages로 자동 배포

