# 🚀 배포 가이드 - 최신 변경사항 적용하기

## 📦 현재 상태
- ✅ 모든 변경사항이 Git에 커밋됨
- ✅ 배포 파일 준비 완료

## 🎯 배포 방법 (가장 쉬운 순서)

### 방법 1: Firebase Console에서 직접 배포 ⭐ (추천!)

**단계:**

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com/
   ```
   - Google 계정으로 로그인
   - `gaondi` 프로젝트 선택

2. **Hosting 메뉴 이동**
   - 왼쪽 메뉴에서 "Hosting" 클릭
   - "새 배포" 또는 "Release" 버튼 클릭

3. **파일 업로드**
   
   **옵션 A: 직접 드래그 앤 드롭**
   - 다음 파일들을 선택하여 드래그:
     - index.html
     - style.css
     - script.js
     - materials.js
     - db.js
     - logo.png
   
   **옵션 B: ZIP 파일 업로드** (더 쉬움)
   - `deploy-20260122-043758.zip` 파일 업로드
   - 또는 아래 명령어로 새로 생성:
     ```bash
     cd /home/user/webapp
     zip -r deploy.zip index.html style.css script.js materials.js db.js logo.png
     ```

4. **배포 확인**
   - 배포 완료 메시지 확인
   - URL: https://gaondi.web.app 또는 https://gaondi.firebaseapp.com

---

### 방법 2: Firebase CLI로 배포 (로컬 컴퓨터 필요)

**사전 준비:** Node.js 설치 필요

1. **Firebase CLI 설치** (한 번만)
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase 로그인**
   ```bash
   firebase login
   ```
   - 브라우저가 열리면 Google 계정으로 로그인

3. **프로젝트로 이동**
   ```bash
   cd /home/user/webapp
   ```

4. **배포 실행**
   ```bash
   firebase deploy --only hosting
   ```

5. **배포 완료!**
   - 터미널에 배포 URL 표시됨
   - 보통 10-30초 소요

---

### 방법 3: GitHub Actions 자동 배포 (고급)

**.github/workflows/firebase-hosting.yml 생성:**

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: gaondi
```

**설정:**
1. GitHub 저장소 설정
2. Firebase Service Account 키 추가
3. Push하면 자동 배포!

---

## 📋 배포 체크리스트

배포 전:
- [ ] Git 커밋 완료 확인
- [ ] 로컬에서 테스트 완료
- [ ] 파일 압축 또는 준비 완료

배포 후:
- [ ] https://gaondi.web.app 접속하여 확인
- [ ] 로그인 테스트
- [ ] 게시글 등록 테스트
- [ ] 이미지/영상 업로드 테스트
- [ ] 수정/삭제 기능 테스트
- [ ] 모바일 환경 확인

---

## 🔧 배포된 주요 기능 (최신)

✅ **게시글 관리**
- 비밀번호로 수정/삭제 가능
- 구조화된 입력 양식
- 텍스트 줄바꿈 지원

✅ **미디어 업로드**
- 이미지 자동 압축
- 영상 압축 (최대 30초, 480p)
- 업로드 진행률 표시

✅ **사용자 인터페이스**
- 시공 게시판 / 자재 게시판
- 관리자 / 사용자 권한 구분
- 모바일 반응형 디자인

---

## 💡 배포 URL

**메인 URL:**
- https://gaondi.web.app

**대체 URL:**
- https://gaondi.firebaseapp.com

---

## 🆘 문제 해결

**Q: 배포 후 변경사항이 안 보여요**
A: 브라우저 캐시 삭제 (Ctrl + Shift + R)

**Q: Firebase CLI 로그인이 안돼요**
A: `firebase logout` 후 다시 `firebase login`

**Q: 파일 업로드가 안돼요**
A: ZIP 파일 크기 확인 (100MB 미만)

**Q: 이전 버전으로 돌아가고 싶어요**
A: Firebase Console > Hosting > Release history에서 롤백

---

## 📞 추가 도움말

Firebase 공식 문서:
https://firebase.google.com/docs/hosting

Firebase 지원:
https://firebase.google.com/support

---

**마지막 업데이트:** 2026-01-22
**배포 파일:** deploy-20260122-043758.zip (92KB)
