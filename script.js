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

// 데이터 저장 (IndexedDB는 개별 저장)
async function savePost(content, estimate, survey, images) {
    console.log('게시글 저장 시작:', { content, estimate, survey, imagesCount: images.length });
    
    const post = {
        id: Date.now(),
        content: content,
        estimate: estimate,
        survey: survey,
        images: images,
        date: new Date().toLocaleString('ko-KR')
    };
    
    try {
        await window.postDB.addPost(post);
        await loadData(); // 목록 새로고침
        console.log('게시글 저장 완료');
        
        alert('✅ 게시글이 등록되었습니다.');
        hideAddPostForm();
        renderPosts('admin');
        await updateStorageInfo();
    } catch (error) {
        console.error('게시글 저장 실패:', error);
        alert('❌ 게시글 저장 중 오류가 발생했습니다.');
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
    document.getElementById('adminImage').value = '';
}

// 사용자 폼 초기화
function clearUserForm() {
    document.getElementById('userContent').value = '';
    document.getElementById('userEstimate').value = '';
    document.getElementById('userSurvey').value = '했음';
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
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
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
                
                // 압축된 이미지를 Base64로 변환
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                console.log('원본 크기:', (e.target.result.length / 1024).toFixed(2), 'KB');
                console.log('압축 후 크기:', (compressedDataUrl.length / 1024).toFixed(2), 'KB');
                
                resolve(compressedDataUrl);
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 전역 함수 등록
window.compressImage = compressImage;

// 게시글 추가
function addPost() {
    console.log('게시글 등록 시작');
    
    const content = document.getElementById('adminContent').value.trim();
    const estimate = document.getElementById('adminEstimate').value.trim();
    const survey = document.getElementById('adminSurvey').value;
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
    
    // 이미지 파일 읽기 및 압축
    const images = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('이미지 파일 처리 시작:', files.length, '개');
        
        // 이미지 개수 제한 (최대 5개)
        if (files.length > 5) {
            alert('⚠️ 이미지는 최대 5개까지 업로드할 수 있습니다.');
            return;
        }
        
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            promises.push(compressImage(files[i]));
        }
        
        Promise.all(promises)
            .then(async compressedImages => {
                console.log('모든 이미지 압축 완료, 저장 시작');
                await savePost(content, estimate, survey, compressedImages);
            })
            .catch(error => {
                console.error('이미지 압축 실패:', error);
                alert('❌ 이미지 처리 중 오류가 발생했습니다.');
            });
    } else {
        console.log('이미지 없이 저장');
        savePost(content, estimate, survey, images);
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
    
    // 이미지 파일 읽기 및 압축
    const images = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('이미지 파일 처리 시작:', files.length, '개');
        
        // 이미지 개수 제한 (최대 5개)
        if (files.length > 5) {
            alert('⚠️ 이미지는 최대 5개까지 업로드할 수 있습니다.');
            return;
        }
        
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            promises.push(compressImage(files[i]));
        }
        
        Promise.all(promises)
            .then(async compressedImages => {
                console.log('모든 이미지 압축 완료, 저장 시작');
                await saveUserPost(content, estimate, survey, compressedImages);
            })
            .catch(error => {
                console.error('이미지 압축 실패:', error);
                alert('❌ 이미지 처리 중 오류가 발생했습니다.');
            });
    } else {
        console.log('이미지 없이 저장');
        saveUserPost(content, estimate, survey, images);
    }
}

// 사용자 게시글 저장
async function saveUserPost(content, estimate, survey, images) {
    console.log('사용자 게시글 저장 시작:', { content, estimate, survey, imagesCount: images.length });
    
    const post = {
        id: Date.now(),
        content: content,
        estimate: estimate,
        survey: survey,
        images: images,
        date: new Date().toLocaleString('ko-KR')
    };
    
    try {
        await window.postDB.addPost(post);
        await loadData(); // 목록 새로고침
        console.log('사용자 게시글 저장 완료');
        
        alert('✅ 게시글이 등록되었습니다.');
        hideUserAddPostForm();
        renderPosts('user');
    } catch (error) {
        console.error('사용자 게시글 저장 실패:', error);
        alert('❌ 게시글 저장 중 오류가 발생했습니다.');
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
        const escapedContent = escapeHtml(post.content);
        const escapedEstimate = escapeHtml(post.estimate);
        
        return `
        <div class="post-item">
            <div class="post-header">
                <div class="post-date">📅 ${post.date}</div>
                ${userType === 'admin' ? `
                    <button class="btn-danger" onclick="deletePost(${post.id})">🗑️ 삭제</button>
                ` : ''}
            </div>
            
            <div class="post-content">
                <h3>📝 시공 내용</h3>
                <p>${escapedContent}</p>
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
                    ${post.images.map((img, index) => `
                        <img src="${img}" alt="시공 이미지 ${index + 1}" class="post-image" 
                             onclick="showImageModalById(${post.id}, ${index})">
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 전역 함수 등록
window.escapeHtml = escapeHtml;

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
        const escapedContent = escapeHtml(post.content);
        const escapedEstimate = escapeHtml(post.estimate);
        
        return `
        <div class="post-item">
            <div class="post-header">
                <div class="post-date">📅 ${post.date}</div>
                ${userType === 'admin' ? `
                    <button class="btn-danger" onclick="deletePost(${post.id})">🗑️ 삭제</button>
                ` : ''}
            </div>
            
            <div class="post-content">
                <h3>📝 시공 내용</h3>
                <p>${escapedContent}</p>
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
                    ${post.images.map((img, index) => `
                        <img src="${img}" alt="시공 이미지 ${index + 1}" class="post-image" 
                             onclick="showImageModalById(${post.id}, ${index})">
                    `).join('')}
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

// 이미지 모달 표시
function showImageModal(imageSrc) {
    const modal = document.getElementById('postModal');
    const modalContent = document.getElementById('modalPostContent');
    
    modalContent.innerHTML = `
        <img src="${imageSrc}" style="width: 100%; border-radius: 10px;">
    `;
    
    modal.style.display = 'block';
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
});
