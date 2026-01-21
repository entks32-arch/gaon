# Firebase Hosting 배포 가이드

## 🚀 Firebase Hosting 배포 방법

### 방법 1: Firebase Console에서 직접 배포 (가장 쉬움)

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - gaondi 프로젝트 선택

2. **Hosting 메뉴로 이동**
   - 왼쪽 메뉴에서 "Hosting" 클릭
   - "시작하기" 버튼 클릭

3. **파일 업로드**
   - 다음 파일들을 압축(ZIP)하여 업로드:
     - index.html
     - style.css
     - script.js
     - materials.js
     - db.js
     - logo.png

4. **배포 완료**
   - 배포 URL: `https://gaondi.web.app` 또는 `https://gaondi.firebaseapp.com`

### 방법 2: Firebase CLI 사용 (로컬 컴퓨터에서)

**사전 준비:**
로컬 컴퓨터에 Node.js가 설치되어 있어야 합니다.

**단계:**

1. Firebase CLI 설치 (한 번만)
```bash
npm install -g firebase-tools
```

2. Firebase 로그인
```bash
firebase login
```

3. 프로젝트 초기화
```bash
cd /path/to/gaon/project
firebase init hosting
```
   - 프로젝트 선택: gaondi
   - Public directory: . (현재 디렉토리)
   - Single-page app: Yes
   - GitHub 자동 배포: No

4. 배포
```bash
firebase deploy
```

### 배포 후 URL
- **메인 URL**: https://gaondi.web.app
- **대체 URL**: https://gaondi.firebaseapp.com

### 커스텀 도메인 연결 (선택사항)
Firebase Console > Hosting > "커스텀 도메인 추가"에서 설정 가능

## 📝 배포된 파일 목록
- index.html (메인 페이지)
- style.css (스타일)
- script.js (시공 게시판 로직)
- materials.js (자재 게시판 로직)
- db.js (Firebase Firestore 연결)
- logo.png (로고 이미지)
- firebase.json (Hosting 설정)

## 🔧 배포 후 확인사항
1. 로그인 기능 테스트
2. 게시글 등록 테스트
3. 이미지 업로드 테스트
4. 모바일 환경 테스트

## 💡 팁
- 변경사항이 있을 때마다 `firebase deploy` 실행
- 배포는 몇 초 내에 완료됨
- 이전 버전으로 롤백 가능 (Console에서)
