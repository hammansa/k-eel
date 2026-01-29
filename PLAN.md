# 수정 계획 (local_xxxx.py / git_xxx.py 구분)

목표: 로컬 운영(PC/모바일)용 스크립트와 Netlify(깃) 배포용 스크립트를 분리해 관리합니다.

파일 구분 예시:

- 로컬용 (local_*.py)
  - `local_order_manager.py` : SQLite 기반 간단 주문 DB/조회/상태변경 도구 (현재 플레이스홀더)
  - 추후: `local_sync.py` (원격 DB 동기화/백업 스크립트)

- 깃/배포용 (git_*.py)
  - `git_deploy_helper.py` : 빌드 후 Netlify CLI로 배포하는 간단 헬퍼(현재 플레이스홀더)
  - 추후: `git_prepare_assets.py` (이미지 최적화, 빌드 전처리)

제안된 작업 흐름:
1. 현재 코드 정리: 인라인 JS를 `app.js`로 분리하고 빌드 스크립트 추가
2. 로컬용 스크립트 확장: 주문을 CSV/SQLite에 저장하고, 주기적 백업 기능 추가
3. 배포용 스크립트 확장: 빌드 -> 린트 -> 배포(자동화)
4. (옵션) Supabase 연동: 중장기적으로 원격 DB와 인증 도입

원하시면 다음을 바로 시작합니다:
- A: `app.js`로 인라인 스크립트 분리 + `index.html`에서 `defer`로 로드
- B: `local_order_manager.py` 에서 주문 수신(폼 POST) 자동 파싱 추가
- C: `git_deploy_helper.py`에 린트/테스트 단계 추가

원하시는 조합(A/B/C 또는 다른 요청)을 알려주세요.