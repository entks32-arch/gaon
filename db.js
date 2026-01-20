// IndexedDB 관리 모듈
class PostDatabase {
    constructor() {
        this.dbName = 'ConstructionBoardDB';
        this.postStoreName = 'posts';
        this.materialStoreName = 'materials';
        this.db = null;
    }

    // 데이터베이스 초기화
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 2); // 버전 2로 업그레이드

            request.onerror = () => {
                console.error('데이터베이스 열기 실패:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('데이터베이스 연결 성공');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 시공 게시글 스토어
                if (!db.objectStoreNames.contains(this.postStoreName)) {
                    const postStore = db.createObjectStore(this.postStoreName, { keyPath: 'id' });
                    postStore.createIndex('date', 'date', { unique: false });
                    console.log('시공 게시글 스토어 생성 완료');
                }
                
                // 자재 스토어
                if (!db.objectStoreNames.contains(this.materialStoreName)) {
                    const materialStore = db.createObjectStore(this.materialStoreName, { keyPath: 'id' });
                    materialStore.createIndex('date', 'date', { unique: false });
                    materialStore.createIndex('name', 'name', { unique: false });
                    console.log('자재 스토어 생성 완료');
                }
                
                console.log('데이터베이스 스키마 생성 완료');
            };
        });
    }

    // 모든 게시글 가져오기
    async getAllPosts() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.postStoreName], 'readonly');
            const objectStore = transaction.objectStore(this.postStoreName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const posts = request.result || [];
                // 날짜순 정렬 (최신순)
                posts.sort((a, b) => b.id - a.id);
                console.log('게시글 로드 완료:', posts.length, '개');
                resolve(posts);
            };

            request.onerror = () => {
                console.error('게시글 로드 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 모든 자재 가져오기
    async getAllMaterials() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.materialStoreName], 'readonly');
            const objectStore = transaction.objectStore(this.materialStoreName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const materials = request.result || [];
                // 날짜순 정렬 (최신순)
                materials.sort((a, b) => b.id - a.id);
                console.log('자재 로드 완료:', materials.length, '개');
                resolve(materials);
            };

            request.onerror = () => {
                console.error('자재 로드 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 게시글 추가
    async addPost(post) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.postStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.postStoreName);
            const request = objectStore.add(post);

            request.onsuccess = () => {
                console.log('게시글 저장 성공:', post.id);
                resolve(post.id);
            };

            request.onerror = () => {
                console.error('게시글 저장 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 자재 추가
    async addMaterial(material) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.materialStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.materialStoreName);
            const request = objectStore.add(material);

            request.onsuccess = () => {
                console.log('자재 저장 성공:', material.id);
                resolve(material.id);
            };

            request.onerror = () => {
                console.error('자재 저장 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 게시글 삭제
    async deletePost(postId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.postStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.postStoreName);
            const request = objectStore.delete(postId);

            request.onsuccess = () => {
                console.log('게시글 삭제 성공:', postId);
                resolve();
            };

            request.onerror = () => {
                console.error('게시글 삭제 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 자재 삭제
    async deleteMaterial(materialId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.materialStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.materialStoreName);
            const request = objectStore.delete(materialId);

            request.onsuccess = () => {
                console.log('자재 삭제 성공:', materialId);
                resolve();
            };

            request.onerror = () => {
                console.error('자재 삭제 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 모든 게시글 삭제
    async clearAllPosts() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.postStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.postStoreName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                console.log('모든 게시글 삭제 완료');
                resolve();
            };

            request.onerror = () => {
                console.error('게시글 삭제 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 모든 자재 삭제
    async clearAllMaterials() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.materialStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.materialStoreName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                console.log('모든 자재 삭제 완료');
                resolve();
            };

            request.onerror = () => {
                console.error('자재 삭제 실패:', request.error);
                reject(request.error);
            };
        });
    }

    // 데이터베이스 크기 추정
    async getStorageEstimate() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
                quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2),
                percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
            };
        }
        return null;
    }
}

// 전역 데이터베이스 인스턴스
const postDB = new PostDatabase();

// 전역 접근을 위해 window 객체에 등록
window.postDB = postDB;
