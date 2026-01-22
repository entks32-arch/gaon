#!/bin/bash

# Firebase 배포 스크립트
echo "🚀 Firebase Hosting 배포 시작..."

# Firebase CLI 경로
FIREBASE="./node_modules/.bin/firebase"

# 배포할 파일 확인
echo "📁 배포할 파일:"
ls -lh index.html style.css script.js materials.js db.js logo.png

# Firebase 배포 (CI 토큰 필요)
echo ""
echo "⚠️  배포하려면 다음 중 하나를 선택하세요:"
echo ""
echo "방법 1: Firebase 토큰 사용"
echo "  firebase login:ci  # 로컬 PC에서 실행하여 토큰 받기"
echo "  $FIREBASE deploy --token YOUR_TOKEN"
echo ""
echo "방법 2: Firebase Console에서 수동 배포"
echo "  1. 다음 파일들을 압축: index.html, style.css, script.js, materials.js, db.js, logo.png"
echo "  2. https://console.firebase.google.com/ 접속"
echo "  3. Hosting 메뉴에서 파일 업로드"
echo ""
echo "방법 3: GitHub Actions 자동 배포 (추천)"
echo "  - GitHub에 푸시하면 자동으로 배포됨"
echo ""

