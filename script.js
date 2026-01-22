// 전역 변수
let currentUser = null;
let posts = [];
let dbInitialized = false;

// IndexedDB 초기화 및 데이터 로드
async function initDatabase() {
    try {
        await window.postDB.init();
        dbInitialized = true;
        console.log('IndexedDB 초기화 완료');
        return true;
    } catch (error) {
        console.error('IndexedDB 초기화 실패:', error);
        alert('⚠️ 데이터베이스 초기화 실패. 페이지를 새로고침 해주세요.');
        return false;
    }
}

// 데이터 로드
async function loadData() {
    if (!dbInitialized) {
        await initDatabase();
    }
    
    try {
        posts = await window.postDB.getAllPosts();
        console.log('데이터 로드 완료:', posts.length, '개');
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        posts = [];
    }
}

// 전역 함수 등록
window.loadData = loadData;

// 간단한 비밀번호 해싱 함수 (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// 전역 함수 등록
window.hashPassword = hashPassword;

// 데이터 저장 (Firebase Firestore 저장)
async function savePost(content, estimate, survey, images, password) {
    console.log('게시글 저장 시작:', { content, estimate, survey, imagesCount: images.length });
    
    // 비밀번호 해싱
    const hashedPassword = password ? await hashPassword(password) : null;
    
    const post = {
        id: Date.now(),
        content: content,
        estimate: estimate,
        survey: survey,
        images: images,
        password: hashedPassword,
        date: new Date().toLocaleString('ko-KR')
    };
    
    try {
        console.log('Firestore에 저장 중...', post);
        const docId = await window.postDB.addPost(post);
        console.log('Firestore 저장 성공, 문서 ID:', docId);
        
        await loadData(); // 목록 새로고침
        console.log('게시글 저장 완료');
        
        alert('✅ 게시글이 등록되었습니다.');
        hideAddPostForm();
        renderPosts('admin');
        await updateStorageInfo();
    } catch (error) {
        console.error('게시글 저장 실패 - 상세 에러:', error);
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
        alert('❌ 게시글 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 로그인
async function login() {
    const password = document.getElementById('loginPassword').value;
    
    if (password === '8810') {
        currentUser = 'admin';
        showBoardSelection('admin');
    } else if (password === '1478') {
        currentUser = 'user';
        showBoardSelection('user');
    } else {
        alert('❌ 비밀번호가 올바르지 않습니다.');
    }
    
    document.getElementById('loginPassword').value = '';
}

// 게시판 선택 화면 표시
function showBoardSelection(userType) {
    showScreen('boardSelectionScreen');
    
    const subtitle = document.getElementById('selectionUserType');
    if (userType === 'admin') {
        subtitle.textContent = '👔 관리자로 로그인하셨습니다';
    } else {
        subtitle.textContent = '👤 사용자로 로그인하셨습니다';
    }
}

// 시공 게시판으로 이동
async function goToConstructionBoard() {
    if (currentUser === 'admin') {
        showScreen('adminScreen');
        await loadData();
        renderPosts('admin');
        await updateStorageInfo();
        // 시공 게시판 탭 활성화
        switchTab('admin', 'construction');
    } else {
        showScreen('userScreen');
        await loadData();
        renderPosts('user');
        // 시공 게시판 탭 활성화
        switchTab('user', 'construction');
    }
}

// 자재 게시판으로 이동
async function goToMaterialBoard() {
    if (currentUser === 'admin') {
        showScreen('adminScreen');
        // 자재 게시판 탭 활성화
        switchTab('admin', 'material');
        await loadMaterials();
        renderMaterials('admin');
    } else {
        showScreen('userScreen');
        // 자재 게시판 탭 활성화
        switchTab('user', 'material');
        await loadMaterials();
        renderMaterials('user');
    }
}

// 전역 접근을 위해 window 객체에 등록
window.login = login;
window.showBoardSelection = showBoardSelection;
window.goToConstructionBoard = goToConstructionBoard;
window.goToMaterialBoard = goToMaterialBoard;

// 로그아웃
function logout() {
    currentUser = null;
    showScreen('loginScreen');
}

// 화면 전환
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 게시글 등록 폼 표시
function showAddPostForm() {
    document.getElementById('addPostForm').style.display = 'block';
}

// 게시글 등록 폼 숨기기
function hideAddPostForm() {
    document.getElementById('addPostForm').style.display = 'none';
    clearForm();
}

// 사용자 게시글 등록 폼 표시
function showUserAddPostForm() {
    document.getElementById('userAddPostForm').style.display = 'block';
}

// 사용자 게시글 등록 폼 숨기기
function hideUserAddPostForm() {
    document.getElementById('userAddPostForm').style.display = 'none';
    clearUserForm();
}

// 폼 초기화
function clearForm() {
    document.getElementById('adminContent').value = '';
    document.getElementById('adminEstimate').value = '';
    document.getElementById('adminSurvey').value = '했음';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminImage').value = '';
}

// 사용자 폼 초기화
function clearUserForm() {
    document.getElementById('userContent').value = '';
    document.getElementById('userEstimate').value = '';
    document.getElementById('userSurvey').value = '했음';
    document.getElementById('userPassword').value = '';
    document.getElementById('userImage').value = '';
}

// 전역 함수 등록
window.logout = logout;
window.showAddPostForm = showAddPostForm;
window.hideAddPostForm = hideAddPostForm;
window.showUserAddPostForm = showUserAddPostForm;
window.hideUserAddPostForm = hideUserAddPostForm;

// 이미지 압축 함수
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const fileId = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            uploadProgress.updateProgress(fileId, 30, '이미지 로딩 중...');
            
            const img = new Image();
            
            img.onload = function() {
                uploadProgress.updateProgress(fileId, 50, '이미지 압축 중...');
                
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 최대 너비 제한
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                uploadProgress.updateProgress(fileId, 80, '최종 처리 중...');
                
                // 압축된 이미지를 Base64로 변환
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                console.log('원본 크기:', (e.target.result.length / 1024).toFixed(2), 'KB');
                console.log('압축 후 크기:', (compressedDataUrl.length / 1024).toFixed(2), 'KB');
                
                uploadProgress.setComplete(fileId);
                
                resolve(compressedDataUrl);
            };
            
            img.onerror = () => {
                uploadProgress.setError(fileId, '이미지 로딩 실패');
                reject(new Error('이미지 로딩 실패'));
            };
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            uploadProgress.setError(fileId, '파일 읽기 실패');
            reject(new Error('파일 읽기 실패'));
        };
        reader.readAsDataURL(file);
    });
}

// 업로드 프로그레스 관리
const uploadProgress = {
    modal: null,
    container: null,
    items: new Map(),
    
    show() {
        this.modal = document.getElementById('uploadProgressModal');
        this.container = document.getElementById('uploadProgressContainer');
        this.modal.style.display = 'block';
        this.items.clear();
        this.container.innerHTML = '';
    },
    
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    },
    
    addFile(fileId, fileName, isVideo) {
        const icon = isVideo ? '🎬' : '🖼️';
        const itemHtml = `
            <div class="upload-progress-item" id="progress-${fileId}">
                <h4>
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${fileName}</span>
                </h4>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="progress-bar-${fileId}" style="width: 0%">
                        <span>0%</span>
                    </div>
                </div>
                <div class="progress-status" id="progress-status-${fileId}">준비 중...</div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', itemHtml);
        this.items.set(fileId, { fileName, isVideo });
    },
    
    updateProgress(fileId, percent, status) {
        const progressBar = document.getElementById(`progress-bar-${fileId}`);
        const progressStatus = document.getElementById(`progress-status-${fileId}`);
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
            progressBar.querySelector('span').textContent = Math.round(percent) + '%';
            
            if (percent >= 100) {
                progressBar.classList.add('completed');
            }
        }
        
        if (progressStatus && status) {
            progressStatus.textContent = status;
            if (percent >= 100) {
                progressStatus.classList.add('completed');
            }
        }
    },
    
    setComplete(fileId) {
        this.updateProgress(fileId, 100, '✅ 완료');
    },
    
    setError(fileId, errorMsg) {
        const progressStatus = document.getElementById(`progress-status-${fileId}`);
        if (progressStatus) {
            progressStatus.textContent = '❌ ' + errorMsg;
            progressStatus.style.color = '#dc3545';
        }
    }
};

// 전역 함수 등록
window.uploadProgress = uploadProgress;

// 비디오 파일 압축 함수
function compressVideo(file, maxWidth = 480, fps = 12, quality = 0.4, maxDuration = 30) {
    return new Promise((resolve, reject) => {
        const fileId = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        console.log('비디오 압축 시작:', file.name, (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.preload = 'metadata';
        video.muted = true;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            video.src = e.target.result;
            
            video.onloadedmetadata = function() {
                let duration = video.duration;
                
                // 영상 길이 제한
                if (duration > maxDuration) {
                    console.warn(`영상이 너무 깁니다 (${duration.toFixed(1)}초). ${maxDuration}초로 제한합니다.`);
                    duration = maxDuration;
                }
                
                let width = video.videoWidth;
                let height = video.videoHeight;
                
                // 최대 너비 제한
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                console.log('비디오 정보:', {
                    원본크기: `${video.videoWidth}x${video.videoHeight}`,
                    압축크기: `${width}x${height}`,
                    원본길이: video.duration.toFixed(2) + '초',
                    압축길이: duration.toFixed(2) + '초',
                    FPS: fps,
                    품질: quality
                });
                
                const frames = [];
                const frameInterval = 1 / fps;
                const totalFrames = Math.ceil(duration * fps);
                let currentTime = 0;
                let frameCount = 0;
                
                uploadProgress.updateProgress(fileId, 0, `프레임 추출 중... (0/${totalFrames})`);
                
                const captureFrame = () => {
                    if (currentTime >= duration) {
                        // 모든 프레임 캡처 완료
                        uploadProgress.updateProgress(fileId, 90, '최종 처리 중...');
                        
                        const compressedVideo = {
                            type: 'compressed-video',
                            frames: frames,
                            width: width,
                            height: height,
                            fps: fps,
                            duration: duration
                        };
                        
                        const jsonStr = JSON.stringify(compressedVideo);
                        const compressedDataUrl = 'data:application/json;base64,' + btoa(jsonStr);
                        
                        const originalSize = (e.target.result.length / 1024 / 1024).toFixed(2);
                        const compressedSize = (compressedDataUrl.length / 1024 / 1024).toFixed(2);
                        
                        console.log('비디오 압축 완료!');
                        console.log('원본 크기:', originalSize, 'MB');
                        console.log('압축 후 크기:', compressedSize, 'MB');
                        console.log('압축률:', ((1 - compressedDataUrl.length / e.target.result.length) * 100).toFixed(1) + '%');
                        
                        // Firestore 크기 제한 확인 (1MB = 1048576 bytes)
                        if (compressedDataUrl.length > 900000) {
                            uploadProgress.setError(fileId, '영상이 너무 큽니다. 더 짧은 영상을 사용하세요.');
                            reject(new Error('압축 후에도 파일이 너무 큽니다. 영상을 더 짧게 자르거나 더 작은 해상도로 촬영해주세요.'));
                            return;
                        }
                        
                        uploadProgress.setComplete(fileId);
                        
                        resolve(compressedDataUrl);
                        return;
                    }
                    
                    video.currentTime = currentTime;
                };
                
                video.onseeked = function() {
                    ctx.drawImage(video, 0, 0, width, height);
                    const frameData = canvas.toDataURL('image/jpeg', quality);
                    frames.push(frameData);
                    
                    frameCount++;
                    const progress = (frameCount / totalFrames) * 90; // 90%까지만 (나머지 10%는 최종 처리)
                    uploadProgress.updateProgress(fileId, progress, `프레임 추출 중... (${frameCount}/${totalFrames})`);
                    
                    currentTime += frameInterval;
                    captureFrame();
                };
                
                video.onerror = reject;
                captureFrame();
            };
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 파일 타입 확인 함수
function isVideoFile(file) {
    return file.type.startsWith('video/');
}

// 전역 함수 등록
window.compressImage = compressImage;
window.compressVideo = compressVideo;
window.isVideoFile = isVideoFile;

// 게시글 추가
function addPost() {
    console.log('게시글 등록 시작');
    
    const content = document.getElementById('adminContent').value.trim();
    const estimate = document.getElementById('adminEstimate').value.trim();
    const survey = document.getElementById('adminSurvey').value;
    const password = document.getElementById('adminPassword').value.trim();
    const imageInput = document.getElementById('adminImage');
    
    console.log('입력값:', { content, estimate, survey, filesCount: imageInput.files.length });
    
    if (!content) {
        alert('❌ 시공 내용을 입력하세요.');
        return;
    }
    
    if (!estimate) {
        alert('❌ 견적을 입력하세요.');
        return;
    }
    
    if (!password || password.length !== 4) {
        alert('❌ 4자리 수정 비밀번호를 입력하세요.');
        return;
    }
    
    // 이미지/비디오 파일 읽기 및 처리
    const media = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('파일 처리 시작:', files.length, '개');
        
        // 파일 개수 제한 (최대 8개)
        if (files.length > 8) {
            alert('⚠️ 파일은 최대 8개까지 업로드할 수 있습니다.');
            return;
        }
        
        // 프로그레스 모달 표시
        uploadProgress.show();
        
        // 각 파일에 대한 프로그레스 항목 추가
        for (let i = 0; i < files.length; i++) {
            const fileId = 'file-' + Date.now() + '-' + i;
            const isVideo = isVideoFile(files[i]);
            uploadProgress.addFile(fileId, files[i].name, isVideo);
        }
        
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            if (isVideoFile(files[i])) {
                promises.push(compressVideo(files[i]));
            } else {
                promises.push(compressImage(files[i]));
            }
        }
        
        Promise.all(promises)
            .then(async processedMedia => {
                console.log('모든 파일 처리 완료, 저장 시작');
                
                // 1초 후 모달 닫기 (사용자가 완료 상태를 볼 수 있도록)
                setTimeout(() => {
                    uploadProgress.hide();
                }, 1000);
                
                await savePost(content, estimate, survey, processedMedia, password);
            })
            .catch(error => {
                console.error('파일 처리 실패:', error);
                uploadProgress.hide();
                alert('❌ 파일 처리 중 오류가 발생했습니다.');
            });
    } else {
        console.log('파일 없이 저장');
        savePost(content, estimate, survey, media, password);
    }
}

// 전역 함수 등록
window.addPost = addPost;

// 사용자 게시글 추가
function addUserPost() {
    console.log('사용자 게시글 등록 시작');
    
    const content = document.getElementById('userContent').value.trim();
    const estimate = document.getElementById('userEstimate').value.trim();
    const survey = document.getElementById('userSurvey').value;
    const password = document.getElementById('userPassword').value.trim();
    const imageInput = document.getElementById('userImage');
    
    console.log('입력값:', { content, estimate, survey, filesCount: imageInput.files.length });
    
    if (!content) {
        alert('❌ 시공 내용을 입력하세요.');
        return;
    }
    
    if (!estimate) {
        alert('❌ 견적을 입력하세요.');
        return;
    }
    
    if (!password || password.length !== 4) {
        alert('❌ 4자리 수정 비밀번호를 입력하세요.');
        return;
    }
    
    // 이미지/비디오 파일 읽기 및 처리
    const media = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('파일 처리 시작:', files.length, '개');
        
        // 파일 개수 제한 (최대 8개)
        if (files.length > 8) {
            alert('⚠️ 파일은 최대 8개까지 업로드할 수 있습니다.');
            return;
        }
        
        // 프로그레스 모달 표시
        uploadProgress.show();
        
        // 각 파일에 대한 프로그레스 항목 추가
        for (let i = 0; i < files.length; i++) {
            const fileId = 'file-' + Date.now() + '-' + i;
            const isVideo = isVideoFile(files[i]);
            uploadProgress.addFile(fileId, files[i].name, isVideo);
        }
        
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            if (isVideoFile(files[i])) {
                promises.push(compressVideo(files[i]));
            } else {
                promises.push(compressImage(files[i]));
            }
        }
        
        Promise.all(promises)
            .then(async processedMedia => {
                console.log('모든 파일 처리 완료, 저장 시작');
                
                // 1초 후 모달 닫기
                setTimeout(() => {
                    uploadProgress.hide();
                }, 1000);
                
                await saveUserPost(content, estimate, survey, processedMedia, password);
            })
            .catch(error => {
                console.error('파일 처리 실패:', error);
                uploadProgress.hide();
                alert('❌ 파일 처리 중 오류가 발생했습니다.');
            });
    } else {
        console.log('파일 없이 저장');
        saveUserPost(content, estimate, survey, media, password);
    }
}

// 사용자 게시글 저장
async function saveUserPost(content, estimate, survey, images, password) {
    console.log('사용자 게시글 저장 시작:', { content, estimate, survey, imagesCount: images.length });
    
    // 비밀번호 해싱
    const hashedPassword = password ? await hashPassword(password) : null;
    
    const post = {
        id: Date.now(),
        content: content,
        estimate: estimate,
        survey: survey,
        images: images,
        password: hashedPassword,
        date: new Date().toLocaleString('ko-KR')
    };
    
    try {
        console.log('Firestore에 저장 중...', post);
        const docId = await window.postDB.addPost(post);
        console.log('Firestore 저장 성공, 문서 ID:', docId);
        
        await loadData(); // 목록 새로고침
        console.log('사용자 게시글 저장 완료');
        
        alert('✅ 게시글이 등록되었습니다.');
        hideUserAddPostForm();
        renderPosts('user');
    } catch (error) {
        console.error('사용자 게시글 저장 실패 - 상세 에러:', error);
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
        alert('❌ 게시글 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 전역 함수 등록
window.addUserPost = addUserPost;

// 게시글 삭제
async function deletePost(postId) {
    if (confirm('🗑️ 정말 이 게시글을 삭제하시겠습니까?')) {
        try {
            await window.postDB.deletePost(postId);
            await loadData();
            renderPosts('admin');
            await updateStorageInfo();
            alert('✅ 게시글이 삭제되었습니다.');
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            alert('❌ 게시글 삭제 중 오류가 발생했습니다.');
        }
    }
}

// 전역 함수 등록
window.deletePost = deletePost;

// 전체 데이터 초기화
async function clearAllData() {
    if (confirm('⚠️ 경고!\n\n모든 게시글이 삭제됩니다.\n정말 초기화하시겠습니까?')) {
        if (confirm('🔴 최종 확인\n\n이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?')) {
            try {
                await window.postDB.clearAllPosts();
                posts = [];
                renderPosts('admin');
                await updateStorageInfo();
                alert('✅ 모든 데이터가 초기화되었습니다.');
            } catch (error) {
                console.error('데이터 초기화 실패:', error);
                alert('❌ 데이터 초기화 중 오류가 발생했습니다.');
            }
        }
    }
}

// 전역 함수 등록
window.clearAllData = clearAllData;

// 저장 공간 정보 업데이트
async function updateStorageInfo() {
    const storageInfoDiv = document.getElementById('storageInfo');
    if (!storageInfoDiv) return;
    
    try {
        const estimate = await window.postDB.getStorageEstimate();
        
        if (estimate) {
            const usedMB = parseFloat(estimate.usageInMB);
            const quotaMB = parseFloat(estimate.quotaInMB);
            const percent = parseFloat(estimate.percentUsed);
            
            const isWarning = percent > 70;
            
            storageInfoDiv.innerHTML = `
                <div>
                    <strong>💾 저장 공간:</strong> ${usedMB} MB / ${quotaMB} MB 사용중 (게시글: ${posts.length}개)
                </div>
                <div class="storage-bar">
                    <div class="storage-bar-fill ${isWarning ? 'warning' : ''}" 
                         style="width: ${Math.min(percent, 100)}%"></div>
                </div>
                <div>
                    <strong>${percent}%</strong> ${isWarning ? '⚠️ 공간 부족' : '✅ 여유 공간'}
                </div>
            `;
        } else {
            storageInfoDiv.innerHTML = `
                <div>
                    <strong>💾 저장 공간:</strong> IndexedDB 사용중 (게시글: ${posts.length}개)
                </div>
                <div>✅ 대용량 저장 가능</div>
            `;
        }
    } catch (e) {
        console.error('저장 공간 정보 업데이트 실패:', e);
    }
}

// 게시글 렌더링
function renderPosts(userType) {
    const listId = userType === 'admin' ? 'adminPostList' : 'userPostList';
    const listElement = document.getElementById(listId);
    
    if (posts.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <h3>📭 등록된 게시글이 없습니다</h3>
                <p>첫 게시글을 등록해보세요!</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = posts.map(post => {
        const formattedContent = formatText(post.content);
        const escapedEstimate = escapeHtml(post.estimate);
        
        return `
        <div class="post-item">
            <div class="post-header">
                <div class="post-date">📅 ${post.date}</div>
                <div class="post-actions">
                    ${post.password ? `
                        <button class="btn-edit" onclick="showEditPost(${post.id})">✏️ 수정</button>
                    ` : ''}
                    ${userType === 'admin' ? `
                        <button class="btn-danger" onclick="deletePost(${post.id})">🗑️ 삭제</button>
                    ` : ''}
                </div>
            </div>
            
            <div class="post-content">
                <h3>📝 시공 내용</h3>
                <p class="formatted-text">${formattedContent}</p>
            </div>
            
            <div class="post-details">
                <div class="detail-item">
                    <div class="detail-label">💰 견적</div>
                    <div class="detail-value">${escapedEstimate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">📏 실측 여부</div>
                    <div class="detail-value ${post.survey === '했음' ? 'survey-yes' : 'survey-no'}">
                        ${post.survey === '했음' ? '✅' : '❌'} ${post.survey}
                    </div>
                </div>
            </div>
            
            ${post.images.length > 0 ? `
                <div class="post-images">
                    ${post.images.map((media, index) => {
                        const isVideo = media.startsWith('data:video/') || media.startsWith('data:application/json;base64,');
                        if (isVideo) {
                            return `
                                <div class="post-image video-container" onclick="showImageModalById(${post.id}, ${index})" 
                                     data-video-data="${media.replace(/"/g, '&quot;')}">
                                    <div class="video-placeholder">
                                        <div class="play-icon">▶</div>
                                        <small>클릭하여 재생</small>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <img src="${media}" alt="시공 이미지 ${index + 1}" class="post-image" 
                                     onclick="showImageModalById(${post.id}, ${index})">
                            `;
                        }
                    }).join('')}
                </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

// 전역 함수 등록
window.renderPosts = renderPosts;

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 텍스트를 보기 좋게 줄바꿈하는 함수
function formatText(text) {
    if (!text) return '';
    
    // HTML 이스케이프 먼저 적용
    const escaped = escapeHtml(text);
    
    // 줄바꿈 문자를 <br>로 변환
    return escaped.replace(/\n/g, '<br>');
}

// 전역 함수 등록
window.escapeHtml = escapeHtml;
window.formatText = formatText;

// 검색 기능
function searchPosts(userType) {
    const searchInputId = userType === 'admin' ? 'adminSearchInput' : 'userSearchInput';
    const searchTerm = document.getElementById(searchInputId).value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderPosts(userType);
        return;
    }
    
    const filteredPosts = posts.filter(post => {
        return post.content.toLowerCase().includes(searchTerm) ||
               post.estimate.toLowerCase().includes(searchTerm) ||
               post.survey.toLowerCase().includes(searchTerm);
    });
    
    const listId = userType === 'admin' ? 'adminPostList' : 'userPostList';
    const listElement = document.getElementById(listId);
    
    if (filteredPosts.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <h3>🔍 검색 결과가 없습니다</h3>
                <p>"${searchTerm}"에 대한 결과를 찾을 수 없습니다.</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = filteredPosts.map(post => {
        const formattedContent = formatText(post.content);
        const escapedEstimate = escapeHtml(post.estimate);
        
        return `
        <div class="post-item">
            <div class="post-header">
                <div class="post-date">📅 ${post.date}</div>
                <div class="post-actions">
                    ${post.password ? `
                        <button class="btn-edit" onclick="showEditPost(${post.id})">✏️ 수정</button>
                    ` : ''}
                    ${userType === 'admin' ? `
                        <button class="btn-danger" onclick="deletePost(${post.id})">🗑️ 삭제</button>
                    ` : ''}
                </div>
            </div>
            
            <div class="post-content">
                <h3>📝 시공 내용</h3>
                <p class="formatted-text">${formattedContent}</p>
            </div>
            
            <div class="post-details">
                <div class="detail-item">
                    <div class="detail-label">💰 견적</div>
                    <div class="detail-value">${escapedEstimate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">📏 실측 여부</div>
                    <div class="detail-value ${post.survey === '했음' ? 'survey-yes' : 'survey-no'}">
                        ${post.survey === '했음' ? '✅' : '❌'} ${post.survey}
                    </div>
                </div>
            </div>
            
            ${post.images.length > 0 ? `
                <div class="post-images">
                    ${post.images.map((media, index) => {
                        const isVideo = media.startsWith('data:video/') || media.startsWith('data:application/json;base64,');
                        if (isVideo) {
                            return `
                                <div class="post-image video-container" onclick="showImageModalById(${post.id}, ${index})" 
                                     data-video-data="${media.replace(/"/g, '&quot;')}">
                                    <div class="video-placeholder">
                                        <div class="play-icon">▶</div>
                                        <small>클릭하여 재생</small>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <img src="${media}" alt="시공 이미지 ${index + 1}" class="post-image" 
                                     onclick="showImageModalById(${post.id}, ${index})">
                            `;
                        }
                    }).join('')}
                </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

// 전역 함수 등록
window.searchPosts = searchPosts;

// 이미지 모달 표시 (ID로 찾기)
function showImageModalById(postId, imageIndex) {
    const post = posts.find(p => p.id === postId);
    if (post && post.images[imageIndex]) {
        showImageModal(post.images[imageIndex]);
    }
}

// 전역 함수 등록
window.showImageModalById = showImageModalById;

// 압축된 비디오 재생 함수
function playCompressedVideo(videoData) {
    return new Promise((resolve, reject) => {
        try {
            // JSON 데이터 파싱
            const base64Data = videoData.split(',')[1];
            const jsonStr = atob(base64Data);
            const videoInfo = JSON.parse(jsonStr);
            
            const canvas = document.createElement('canvas');
            canvas.width = videoInfo.width;
            canvas.height = videoInfo.height;
            canvas.style.width = '100%';
            canvas.style.borderRadius = '10px';
            canvas.style.cursor = 'pointer';
            
            const ctx = canvas.getContext('2d');
            let currentFrame = 0;
            let isPlaying = false;
            let animationId = null;
            
            const frames = videoInfo.frames.map(frameData => {
                const img = new Image();
                img.src = frameData;
                return img;
            });
            
            // 첫 프레임 로드
            frames[0].onload = function() {
                ctx.drawImage(frames[0], 0, 0, videoInfo.width, videoInfo.height);
                
                // 재생 버튼 그리기
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(videoInfo.width / 2, videoInfo.height / 2, 40, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(videoInfo.width / 2 - 15, videoInfo.height / 2 - 20);
                ctx.lineTo(videoInfo.width / 2 - 15, videoInfo.height / 2 + 20);
                ctx.lineTo(videoInfo.width / 2 + 20, videoInfo.height / 2);
                ctx.closePath();
                ctx.fill();
            };
            
            const playVideo = () => {
                if (!isPlaying) return;
                
                if (currentFrame < frames.length) {
                    if (frames[currentFrame].complete) {
                        ctx.drawImage(frames[currentFrame], 0, 0, videoInfo.width, videoInfo.height);
                    }
                    currentFrame++;
                    
                    const frameDuration = 1000 / videoInfo.fps;
                    animationId = setTimeout(() => {
                        playVideo();
                    }, frameDuration);
                } else {
                    // 재생 완료
                    isPlaying = false;
                    currentFrame = 0;
                    
                    // 첫 프레임으로 돌아가기
                    ctx.drawImage(frames[0], 0, 0, videoInfo.width, videoInfo.height);
                    
                    // 재생 버튼 다시 그리기
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.beginPath();
                    ctx.arc(videoInfo.width / 2, videoInfo.height / 2, 40, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.moveTo(videoInfo.width / 2 - 15, videoInfo.height / 2 - 20);
                    ctx.lineTo(videoInfo.width / 2 - 15, videoInfo.height / 2 + 20);
                    ctx.lineTo(videoInfo.width / 2 + 20, videoInfo.height / 2);
                    ctx.closePath();
                    ctx.fill();
                }
            };
            
            canvas.onclick = function() {
                if (!isPlaying) {
                    isPlaying = true;
                    currentFrame = 0;
                    playVideo();
                } else {
                    isPlaying = false;
                    if (animationId) clearTimeout(animationId);
                }
            };
            
            resolve(canvas);
        } catch (error) {
            reject(error);
        }
    });
}

// 전역 함수 등록
window.playCompressedVideo = playCompressedVideo;

// 이미지/비디오 모달 표시
function showImageModal(mediaSrc) {
    const modal = document.getElementById('postModal');
    const modalContent = document.getElementById('modalPostContent');
    
    const isCompressedVideo = mediaSrc.startsWith('data:application/json;base64,');
    const isOriginalVideo = mediaSrc.startsWith('data:video/');
    
    if (isCompressedVideo) {
        // 압축된 비디오 재생
        playCompressedVideo(mediaSrc).then(canvas => {
            modalContent.innerHTML = '';
            modalContent.appendChild(canvas);
            modal.style.display = 'block';
        }).catch(error => {
            console.error('비디오 재생 실패:', error);
            modalContent.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p>❌ 비디오를 재생할 수 없습니다.</p>
                </div>
            `;
            modal.style.display = 'block';
        });
    } else if (isOriginalVideo) {
        modalContent.innerHTML = `
            <video src="${mediaSrc}" style="width: 100%; border-radius: 10px;" controls autoplay>
                브라우저가 비디오를 지원하지 않습니다.
            </video>
        `;
        modal.style.display = 'block';
    } else {
        modalContent.innerHTML = `
            <img src="${mediaSrc}" style="width: 100%; border-radius: 10px;">
        `;
        modal.style.display = 'block';
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('postModal').style.display = 'none';
}

// 전역 함수 등록
window.showImageModal = showImageModal;
window.closeModal = closeModal;

// 엔터키로 로그인
document.addEventListener('DOMContentLoaded', function() {
    // 비동기 초기화를 IIFE로 감싸기
    (async function() {
        await initDatabase();
    })();
    
    // 로그인 관련 이벤트
    const loginButton = document.getElementById('loginButton');
    const loginInput = document.getElementById('loginPassword');
    
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }
    
    if (loginInput) {
        loginInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
    
    // 로그아웃 버튼
    const adminLogoutButton = document.getElementById('adminLogoutButton');
    const userLogoutButton = document.getElementById('userLogoutButton');
    const selectionLogoutButton = document.getElementById('selectionLogoutButton');
    
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener('click', logout);
    }
    
    if (userLogoutButton) {
        userLogoutButton.addEventListener('click', logout);
    }
    
    if (selectionLogoutButton) {
        selectionLogoutButton.addEventListener('click', logout);
    }
    
    // 게시판 선택 버튼
    const selectConstructionBoard = document.getElementById('selectConstructionBoard');
    const selectMaterialBoard = document.getElementById('selectMaterialBoard');
    
    if (selectConstructionBoard) {
        selectConstructionBoard.addEventListener('click', goToConstructionBoard);
    }
    
    if (selectMaterialBoard) {
        selectMaterialBoard.addEventListener('click', goToMaterialBoard);
    }
    
    // 관리자 버튼들
    const showAddPostButton = document.getElementById('showAddPostButton');
    const clearAllDataButton = document.getElementById('clearAllDataButton');
    const addPostButton = document.getElementById('addPostButton');
    const hideAddPostButton = document.getElementById('hideAddPostButton');
    
    if (showAddPostButton) {
        showAddPostButton.addEventListener('click', showAddPostForm);
    }
    
    if (clearAllDataButton) {
        clearAllDataButton.addEventListener('click', clearAllData);
    }
    
    if (addPostButton) {
        addPostButton.addEventListener('click', addPost);
    }
    
    if (hideAddPostButton) {
        hideAddPostButton.addEventListener('click', hideAddPostForm);
    }
    
    // 사용자 버튼들
    const userShowAddPostButton = document.getElementById('userShowAddPostButton');
    const userAddPostButton = document.getElementById('userAddPostButton');
    const userHideAddPostButton = document.getElementById('userHideAddPostButton');
    
    if (userShowAddPostButton) {
        userShowAddPostButton.addEventListener('click', showUserAddPostForm);
    }
    
    if (userAddPostButton) {
        userAddPostButton.addEventListener('click', addUserPost);
    }
    
    if (userHideAddPostButton) {
        userHideAddPostButton.addEventListener('click', hideUserAddPostForm);
    }
    
    // 검색 입력
    const adminSearchInput = document.getElementById('adminSearchInput');
    const userSearchInput = document.getElementById('userSearchInput');
    
    if (adminSearchInput) {
        adminSearchInput.addEventListener('keyup', function() {
            searchPosts('admin');
        });
    }
    
    if (userSearchInput) {
        userSearchInput.addEventListener('keyup', function() {
            searchPosts('user');
        });
    }
    
    // 탭 전환
    const adminConstructionTab = document.getElementById('adminConstructionTab');
    const adminMaterialTab = document.getElementById('adminMaterialTab');
    const userConstructionTab = document.getElementById('userConstructionTab');
    const userMaterialTab = document.getElementById('userMaterialTab');
    
    if (adminConstructionTab) {
        adminConstructionTab.addEventListener('click', () => switchTab('admin', 'construction'));
    }
    
    if (adminMaterialTab) {
        adminMaterialTab.addEventListener('click', () => switchTab('admin', 'material'));
    }
    
    if (userConstructionTab) {
        userConstructionTab.addEventListener('click', () => switchTab('user', 'construction'));
    }
    
    if (userMaterialTab) {
        userMaterialTab.addEventListener('click', () => switchTab('user', 'material'));
    }
    
    // 자재 관리 버튼 (관리자)
    const showAddMaterialButton = document.getElementById('showAddMaterialButton');
    const clearAllMaterialButton = document.getElementById('clearAllMaterialButton');
    const addMaterialButton = document.getElementById('addMaterialButton');
    const hideMaterialButton = document.getElementById('hideMaterialButton');
    
    if (showAddMaterialButton) {
        showAddMaterialButton.addEventListener('click', showAddMaterialForm);
    }
    
    if (clearAllMaterialButton) {
        clearAllMaterialButton.addEventListener('click', clearAllMaterials);
    }
    
    if (addMaterialButton) {
        addMaterialButton.addEventListener('click', addMaterial);
    }
    
    if (hideMaterialButton) {
        hideMaterialButton.addEventListener('click', hideAddMaterialForm);
    }
    
    // 자재 관리 버튼 (사용자)
    const userShowAddMaterialButton = document.getElementById('userShowAddMaterialButton');
    const userAddMaterialButton = document.getElementById('userAddMaterialButton');
    const userHideMaterialButton = document.getElementById('userHideMaterialButton');
    
    if (userShowAddMaterialButton) {
        userShowAddMaterialButton.addEventListener('click', showUserAddMaterialForm);
    }
    
    if (userAddMaterialButton) {
        userAddMaterialButton.addEventListener('click', addUserMaterial);
    }
    
    if (userHideMaterialButton) {
        userHideMaterialButton.addEventListener('click', hideUserAddMaterialForm);
    }
    
    // 자재 검색
    const adminMaterialSearchInput = document.getElementById('adminMaterialSearchInput');
    const userMaterialSearchInput = document.getElementById('userMaterialSearchInput');
    
    if (adminMaterialSearchInput) {
        adminMaterialSearchInput.addEventListener('keyup', function() {
            searchMaterials('admin');
        });
    }
    
    if (userMaterialSearchInput) {
        userMaterialSearchInput.addEventListener('keyup', function() {
            searchMaterials('user');
        });
    }
    
    // 모달 닫기 버튼
    const modalCloseButton = document.getElementById('modalCloseButton');
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeModal);
    }
    
    // 모달 외부 클릭시 닫기
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // 수정 모달 닫기 버튼
    const editModalCloseButton = document.getElementById('editModalCloseButton');
    if (editModalCloseButton) {
        editModalCloseButton.addEventListener('click', closeEditModal);
    }
    
    const cancelEditButton = document.getElementById('cancelEditButton');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', closeEditModal);
    }
    
    const saveEditButton = document.getElementById('saveEditButton');
    if (saveEditButton) {
        saveEditButton.addEventListener('click', saveEditedPost);
    }
});

// 게시글 수정 관련 전역 변수
let currentEditingPostId = null;

// 게시글 수정 모달 표시
async function showEditPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        alert('❌ 게시글을 찾을 수 없습니다.');
        return;
    }
    
    if (!post.password) {
        alert('❌ 이 게시글은 수정할 수 없습니다.');
        return;
    }
    
    // 비밀번호 확인
    const inputPassword = prompt('수정 비밀번호를 입력하세요 (4자리):');
    if (!inputPassword) return;
    
    try {
        const hashedInput = await hashPassword(inputPassword);
        
        if (hashedInput !== post.password) {
            alert('❌ 비밀번호가 일치하지 않습니다.');
            return;
        }
        
        // 비밀번호 일치, 수정 모달 표시
        currentEditingPostId = postId;
        
        document.getElementById('editContent').value = post.content;
        document.getElementById('editEstimate').value = post.estimate;
        document.getElementById('editSurvey').value = post.survey;
        
        const editModal = document.getElementById('editPostModal');
        editModal.style.display = 'block';
        
    } catch (error) {
        console.error('비밀번호 확인 실패:', error);
        alert('❌ 오류가 발생했습니다.');
    }
}

// 수정 모달 닫기
function closeEditModal() {
    const editModal = document.getElementById('editPostModal');
    editModal.style.display = 'none';
    currentEditingPostId = null;
}

// 수정된 게시글 저장
async function saveEditedPost() {
    if (!currentEditingPostId) return;
    
    const content = document.getElementById('editContent').value.trim();
    const estimate = document.getElementById('editEstimate').value.trim();
    const survey = document.getElementById('editSurvey').value;
    
    if (!content) {
        alert('❌ 시공 내용을 입력하세요.');
        return;
    }
    
    if (!estimate) {
        alert('❌ 견적을 입력하세요.');
        return;
    }
    
    try {
        const post = posts.find(p => p.id === currentEditingPostId);
        
        if (!post) {
            alert('❌ 게시글을 찾을 수 없습니다.');
            return;
        }
        
        // 업데이트할 데이터
        const updatedPost = {
            ...post,
            content: content,
            estimate: estimate,
            survey: survey,
            date: new Date().toLocaleString('ko-KR') + ' (수정됨)'
        };
        
        await window.postDB.updatePost(currentEditingPostId, updatedPost);
        await loadData();
        
        // 현재 화면 타입에 따라 렌더링
        if (currentUser === 'admin') {
            renderPosts('admin');
        } else {
            renderPosts('user');
        }
        
        closeEditModal();
        alert('✅ 게시글이 수정되었습니다.');
        
    } catch (error) {
        console.error('게시글 수정 실패:', error);
        alert('❌ 게시글 수정 중 오류가 발생했습니다.');
    }
}

// 전역 함수 등록
window.showEditPost = showEditPost;
window.closeEditModal = closeEditModal;
window.saveEditedPost = saveEditedPost;
