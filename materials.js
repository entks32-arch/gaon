// 자재 게시판 관리 스크립트

// 전역 변수
let materials = [];

// 자재 데이터 로드
async function loadMaterials() {
    try {
        materials = await window.postDB.getAllMaterials();
        console.log('자재 데이터 로드 완료:', materials.length, '개');
    } catch (error) {
        console.error('자재 데이터 로드 실패:', error);
        materials = [];
    }
}

// 전역 함수 등록
window.loadMaterials = loadMaterials;

// 탭 전환 함수
async function switchTab(tabType, tabName) {
    // 관리자 탭
    if (tabType === 'admin') {
        document.getElementById('adminConstructionTab').classList.remove('active');
        document.getElementById('adminMaterialTab').classList.remove('active');
        document.getElementById('adminConstructionContent').classList.remove('active');
        document.getElementById('adminMaterialContent').classList.remove('active');
        
        if (tabName === 'construction') {
            document.getElementById('adminConstructionTab').classList.add('active');
            document.getElementById('adminConstructionContent').classList.add('active');
            // 시공 게시판 데이터 로드
            await window.loadData();
            window.renderPosts('admin');
        } else {
            document.getElementById('adminMaterialTab').classList.add('active');
            document.getElementById('adminMaterialContent').classList.add('active');
            await loadMaterials();
            renderMaterials('admin');
        }
    }
    // 사용자 탭
    else {
        document.getElementById('userConstructionTab').classList.remove('active');
        document.getElementById('userMaterialTab').classList.remove('active');
        document.getElementById('userConstructionContent').classList.remove('active');
        document.getElementById('userMaterialContent').classList.remove('active');
        
        if (tabName === 'construction') {
            document.getElementById('userConstructionTab').classList.add('active');
            document.getElementById('userConstructionContent').classList.add('active');
            // 시공 게시판 데이터 로드
            await window.loadData();
            window.renderPosts('user');
        } else {
            document.getElementById('userMaterialTab').classList.add('active');
            document.getElementById('userMaterialContent').classList.add('active');
            await loadMaterials();
            renderMaterials('user');
        }
    }
}

// 전역 함수 등록
window.switchTab = switchTab;

// 자재 등록 폼 표시/숨기기
function showAddMaterialForm() {
    document.getElementById('addMaterialForm').style.display = 'block';
}

function hideAddMaterialForm() {
    document.getElementById('addMaterialForm').style.display = 'none';
    clearMaterialForm();
}

function showUserAddMaterialForm() {
    document.getElementById('userAddMaterialForm').style.display = 'block';
}

function hideUserAddMaterialForm() {
    document.getElementById('userAddMaterialForm').style.display = 'none';
    clearUserMaterialForm();
}

function clearMaterialForm() {
    document.getElementById('adminMaterialName').value = '';
    document.getElementById('adminMaterialDesc').value = '';
    document.getElementById('adminMaterialPrice').value = '';
    document.getElementById('adminMaterialImage').value = '';
}

function clearUserMaterialForm() {
    document.getElementById('userMaterialName').value = '';
    document.getElementById('userMaterialDesc').value = '';
    document.getElementById('userMaterialPrice').value = '';
    document.getElementById('userMaterialImage').value = '';
}

// 전역 함수 등록
window.showAddMaterialForm = showAddMaterialForm;
window.hideAddMaterialForm = hideAddMaterialForm;
window.showUserAddMaterialForm = showUserAddMaterialForm;
window.hideUserAddMaterialForm = hideUserAddMaterialForm;

// 관리자 자재 추가
function addMaterial() {
    console.log('자재 등록 시작');
    
    const name = document.getElementById('adminMaterialName').value.trim();
    const desc = document.getElementById('adminMaterialDesc').value.trim();
    const price = document.getElementById('adminMaterialPrice').value.trim();
    const imageInput = document.getElementById('adminMaterialImage');
    
    if (!name) {
        alert('❌ 자재명을 입력하세요.');
        return;
    }
    
    if (!price) {
        alert('❌ 금액을 입력하세요.');
        return;
    }
    
    const media = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('파일 처리 시작:', files.length, '개');
        
        if (files.length > 8) {
            alert('⚠️ 파일은 최대 8개까지 업로드할 수 있습니다.');
            return;
        }
        
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            if (window.isVideoFile(files[i])) {
                promises.push(window.processVideo(files[i]));
            } else {
                promises.push(window.compressImage(files[i]));
            }
        }
        
        Promise.all(promises)
            .then(async processedMedia => {
                console.log('모든 파일 처리 완료, 저장 시작');
                await saveMaterial(name, desc, price, processedMedia);
            })
            .catch(error => {
                console.error('파일 처리 실패:', error);
                alert('❌ 파일 처리 중 오류가 발생했습니다.');
            });
    } else {
        saveMaterial(name, desc, price, media);
    }
}

// 사용자 자재 추가
function addUserMaterial() {
    console.log('사용자 자재 등록 시작');
    
    const name = document.getElementById('userMaterialName').value.trim();
    const desc = document.getElementById('userMaterialDesc').value.trim();
    const price = document.getElementById('userMaterialPrice').value.trim();
    const imageInput = document.getElementById('userMaterialImage');
    
    if (!name) {
        alert('❌ 자재명을 입력하세요.');
        return;
    }
    
    if (!price) {
        alert('❌ 금액을 입력하세요.');
        return;
    }
    
    const media = [];
    const files = imageInput.files;
    
    if (files.length > 0) {
        console.log('파일 처리 시작:', files.length, '개');
        
        if (files.length > 8) {
            alert('⚠️ 파일은 최대 8개까지 업로드할 수 있습니다.');
            return;
        }
        
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            if (window.isVideoFile(files[i])) {
                promises.push(window.processVideo(files[i]));
            } else {
                promises.push(window.compressImage(files[i]));
            }
        }
        
        Promise.all(promises)
            .then(async processedMedia => {
                console.log('모든 파일 처리 완료, 저장 시작');
                await saveUserMaterial(name, desc, price, processedMedia);
            })
            .catch(error => {
                console.error('파일 처리 실패:', error);
                alert('❌ 파일 처리 중 오류가 발생했습니다.');
            });
    } else {
        saveUserMaterial(name, desc, price, media);
    }
}

// 전역 함수 등록
window.addMaterial = addMaterial;
window.addUserMaterial = addUserMaterial;

// 자재 저장
async function saveMaterial(name, desc, price, images) {
    const material = {
        id: Date.now(),
        name: name,
        description: desc,
        price: price,
        images: images,
        date: new Date().toLocaleString('ko-KR')
    };
    
    try {
        await window.postDB.addMaterial(material);
        await loadMaterials();
        
        alert('✅ 자재가 등록되었습니다.');
        hideAddMaterialForm();
        renderMaterials('admin');
    } catch (error) {
        console.error('자재 저장 실패:', error);
        alert('❌ 자재 저장 중 오류가 발생했습니다.');
    }
}

async function saveUserMaterial(name, desc, price, images) {
    const material = {
        id: Date.now(),
        name: name,
        description: desc,
        price: price,
        images: images,
        date: new Date().toLocaleString('ko-KR')
    };
    
    try {
        await window.postDB.addMaterial(material);
        await loadMaterials();
        
        alert('✅ 자재가 등록되었습니다.');
        hideUserAddMaterialForm();
        renderMaterials('user');
    } catch (error) {
        console.error('자재 저장 실패:', error);
        alert('❌ 자재 저장 중 오류가 발생했습니다.');
    }
}

// 자재 삭제
async function deleteMaterial(materialId) {
    if (confirm('🗑️ 정말 이 자재를 삭제하시겠습니까?')) {
        try {
            await window.postDB.deleteMaterial(materialId);
            await loadMaterials();
            renderMaterials('admin');
            alert('✅ 자재가 삭제되었습니다.');
        } catch (error) {
            console.error('자재 삭제 실패:', error);
            alert('❌ 자재 삭제 중 오류가 발생했습니다.');
        }
    }
}

// 전역 함수 등록
window.deleteMaterial = deleteMaterial;

// 전체 자재 초기화
async function clearAllMaterials() {
    if (confirm('⚠️ 경고!\n\n모든 자재가 삭제됩니다.\n정말 초기화하시겠습니까?')) {
        if (confirm('🔴 최종 확인\n\n이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?')) {
            try {
                await window.postDB.clearAllMaterials();
                materials = [];
                renderMaterials('admin');
                alert('✅ 모든 자재가 초기화되었습니다.');
            } catch (error) {
                console.error('자재 초기화 실패:', error);
                alert('❌ 자재 초기화 중 오류가 발생했습니다.');
            }
        }
    }
}

// 전역 함수 등록
window.clearAllMaterials = clearAllMaterials;

// 자재 렌더링
function renderMaterials(userType) {
    const listId = userType === 'admin' ? 'adminMaterialList' : 'userMaterialList';
    const listElement = document.getElementById(listId);
    
    if (materials.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <h3>📭 등록된 자재가 없습니다</h3>
                <p>첫 자재를 등록해보세요!</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = materials.map(material => {
        const escapedName = window.escapeHtml(material.name);
        const escapedDesc = window.escapeHtml(material.description || '');
        const escapedPrice = window.escapeHtml(material.price);
        
        return `
        <div class="post-item">
            <div class="post-header">
                <div class="post-date">📅 ${material.date}</div>
                ${userType === 'admin' ? `
                    <button class="btn-danger" onclick="deleteMaterial(${material.id})">🗑️ 삭제</button>
                ` : ''}
            </div>
            
            <div class="post-content">
                <h3>📦 ${escapedName}</h3>
                ${escapedDesc ? `<p>${escapedDesc}</p>` : ''}
            </div>
            
            <div class="post-details">
                <div class="detail-item">
                    <div class="detail-label">💰 금액</div>
                    <div class="detail-value">${escapedPrice}</div>
                </div>
            </div>
            
            ${material.images.length > 0 ? `
                <div class="post-images">
                    ${material.images.map((media, index) => {
                        const isVideo = media.startsWith('data:video/');
                        if (isVideo) {
                            return `
                                <video src="${media}" class="post-image" controls 
                                       onclick="event.stopPropagation(); showMaterialImageById(${material.id}, ${index})">
                                    브라우저가 비디오를 지원하지 않습니다.
                                </video>
                            `;
                        } else {
                            return `
                                <img src="${media}" alt="자재 이미지 ${index + 1}" class="post-image" 
                                     onclick="showMaterialImageById(${material.id}, ${index})">
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
window.renderMaterials = renderMaterials;

// 자재 이미지 모달
function showMaterialImageById(materialId, imageIndex) {
    const material = materials.find(m => m.id === materialId);
    if (material && material.images[imageIndex]) {
        showImageModal(material.images[imageIndex]);
    }
}

// 전역 함수 등록
window.showMaterialImageById = showMaterialImageById;

// 자재 검색
function searchMaterials(userType) {
    const searchInputId = userType === 'admin' ? 'adminMaterialSearchInput' : 'userMaterialSearchInput';
    const searchTerm = document.getElementById(searchInputId).value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderMaterials(userType);
        return;
    }
    
    const filteredMaterials = materials.filter(material => {
        return material.name.toLowerCase().includes(searchTerm) ||
               (material.description && material.description.toLowerCase().includes(searchTerm)) ||
               material.price.toLowerCase().includes(searchTerm);
    });
    
    const listId = userType === 'admin' ? 'adminMaterialList' : 'userMaterialList';
    const listElement = document.getElementById(listId);
    
    if (filteredMaterials.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <h3>🔍 검색 결과가 없습니다</h3>
                <p>"${searchTerm}"에 대한 결과를 찾을 수 없습니다.</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = filteredMaterials.map(material => {
        const escapedName = window.escapeHtml(material.name);
        const escapedDesc = window.escapeHtml(material.description || '');
        const escapedPrice = window.escapeHtml(material.price);
        
        return `
        <div class="post-item">
            <div class="post-header">
                <div class="post-date">📅 ${material.date}</div>
                ${userType === 'admin' ? `
                    <button class="btn-danger" onclick="deleteMaterial(${material.id})">🗑️ 삭제</button>
                ` : ''}
            </div>
            
            <div class="post-content">
                <h3>📦 ${escapedName}</h3>
                ${escapedDesc ? `<p>${escapedDesc}</p>` : ''}
            </div>
            
            <div class="post-details">
                <div class="detail-item">
                    <div class="detail-label">💰 금액</div>
                    <div class="detail-value">${escapedPrice}</div>
                </div>
            </div>
            
            ${material.images.length > 0 ? `
                <div class="post-images">
                    ${material.images.map((media, index) => {
                        const isVideo = media.startsWith('data:video/');
                        if (isVideo) {
                            return `
                                <video src="${media}" class="post-image" controls 
                                       onclick="event.stopPropagation(); showMaterialImageById(${material.id}, ${index})">
                                    브라우저가 비디오를 지원하지 않습니다.
                                </video>
                            `;
                        } else {
                            return `
                                <img src="${media}" alt="자재 이미지 ${index + 1}" class="post-image" 
                                     onclick="showMaterialImageById(${material.id}, ${index})">
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
window.searchMaterials = searchMaterials;
