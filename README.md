# k-eel 🐟
k-민물장어

## Netlify 배포 템플릿

이 저장소는 Netlify에 바로 배포할 수 있는 간단한 정적 웹사이트 템플릿입니다.

## 특징

- ✅ 즉시 배포 가능한 구조
- ✅ 반응형 디자인
- ✅ Netlify 최적화 설정
- ✅ 보안 헤더 포함
- ✅ 간단하고 깔끔한 UI

## 파일 구조

```
k-eel/
├── index.html      # 메인 HTML 파일
├── styles.css      # CSS 스타일시트
├── netlify.toml    # Netlify 배포 설정
└── README.md       # 프로젝트 문서
```

## Netlify에 배포하기

### 방법 1: Netlify UI 사용

1. [Netlify](https://www.netlify.com/)에 로그인합니다
2. "New site from Git" 버튼을 클릭합니다
3. GitHub 저장소를 연결합니다
4. 저장소를 선택합니다 (hammansa/k-eel)
5. "Deploy site" 버튼을 클릭합니다

설정은 자동으로 `netlify.toml` 파일에서 읽어옵니다.

### 방법 2: Netlify CLI 사용

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod
```

### 방법 3: Deploy to Netlify 버튼

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/hammansa/k-eel)

## 사용자 정의

템플릿을 사용자 정의하려면:

1. `index.html` - 내용과 구조를 수정합니다
2. `styles.css` - 스타일과 색상을 변경합니다
3. `netlify.toml` - 빌드 설정과 리디렉션 규칙을 조정합니다

## 라이선스

MIT
