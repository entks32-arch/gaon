// 전역 변수
let currentUser = null;
let posts = [];

// 로컬 스토리지에서 데이터 로드
function loadData() {
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
}

// 로컬 스토리지에 데이터 저장
function saveData() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// 로그인
function login() {
    const password = document.getElementById('loginPassword').value;
    
    if (password === '8810') {
        currentUser = 'admin';
        showScreen('adminScreen');
        renderPosts('admin');
    } else if (password === '1478') {
        currentUser = 'user';
        showScreen('userScreen');
        renderPosts('user');
    } else {
        alert('❌ 비밀번호가 올바르지 않습니다.');
    }
    
    document.getElementById('loginPassword').value = '';
}

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

// 폼 초기화
function clearForm() {
    document.getElementById('adminContent').value = '';
    document.getElementById('adminEstimate').value = '';
    document.getElementById('adminSurvey').value = '했음';
    document.getElementById('adminImage').value = '';
}

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
    
    // 이미지 파일 읽기
    const images = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('이미지 파일 처리 시작:', files.length, '개');
        let filesRead = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                console.log('이미지 로드 완료:', i + 1, '/', files.length);
                images.push(e.target.result);
                filesRead++;
                
                if (filesRead === files.length) {
                    console.log('모든 이미지 로드 완료, 저장 시작');
                    savePost(content, estimate, survey, images);
                }
            };
            
            reader.onerror = function(e) {
                console.error('이미지 로드 실패:', e);
                alert('❌ 이미지 로드 중 오류가 발생했습니다.');
            };
            
            reader.readAsDataURL(file);
        }
    } else {
        console.log('이미지 없이 저장');
        savePost(content, estimate, survey, images);
    }
}

// 게시글 저장
function savePost(content, estimate, survey, images) {
    console.log('게시글 저장 시작:', { content, estimate, survey, imagesCount: images.length });
    
    const post = {
        id: Date.now(),
        content: content,
        estimate: estimate,
        survey: survey,
        images: images,
        date: new Date().toLocaleString('ko-KR')
    };
    
    posts.unshift(post);
    console.log('현재 게시글 수:', posts.length);
    
    saveData();
    console.log('로컬 스토리지 저장 완료');
    
    alert('✅ 게시글이 등록되었습니다.');
    hideAddPostForm();
    renderPosts('admin');
    console.log('게시글 등록 완료');
}

// 게시글 삭제
function deletePost(postId) {
    if (confirm('🗑️ 정말 이 게시글을 삭제하시겠습니까?')) {
        posts = posts.filter(post => post.id !== postId);
        saveData();
        renderPosts('admin');
        alert('✅ 게시글이 삭제되었습니다.');
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

// 이미지 모달 표시 (ID로 찾기)
function showImageModalById(postId, imageIndex) {
    const post = posts.find(p => p.id === postId);
    if (post && post.images[imageIndex]) {
        showImageModal(post.images[imageIndex]);
    }
}

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

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('postModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// 엔터키로 로그인
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    const loginInput = document.getElementById('loginPassword');
    if (loginInput) {
        loginInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});
