// Firebase Firestore 데이터베이스 관리 모듈
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc,
    updateDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBFfMMAk11XI95zPoBxsfl4olIwypNJAxk",
    authDomain: "gaondi.firebaseapp.com",
    projectId: "gaondi",
    storageBucket: "gaondi.firebasestorage.app",
    messagingSenderId: "346202871348",
    appId: "1:346202871348:web:49d8bae30af5200e631c61",
    measurementId: "G-HE89RPBY84"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore 데이터베이스 관리 클래스
class PostDatabase {
    constructor() {
        this.db = db;
        this.postsCollection = 'posts';
        this.materialsCollection = 'materials';
        console.log('Firebase Firestore 초기화 완료');
    }

    // 데이터베이스 초기화 (호환성을 위해 유지)
    async init() {
        console.log('Firebase Firestore 연결 성공');
        return Promise.resolve(true);
    }

    // 모든 게시글 가져오기
    async getAllPosts() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.postsCollection));
            
            const posts = [];
            querySnapshot.forEach((doc) => {
                posts.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            
            // 클라이언트에서 정렬 (최신순)
            posts.sort((a, b) => b.id - a.id);
            
            console.log('게시글 로드 완료:', posts.length, '개');
            return posts;
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            return [];
        }
    }

    // 모든 자재 가져오기
    async getAllMaterials() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.materialsCollection));
            
            const materials = [];
            querySnapshot.forEach((doc) => {
                materials.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            
            // 클라이언트에서 정렬 (최신순)
            materials.sort((a, b) => b.id - a.id);
            
            console.log('자재 로드 완료:', materials.length, '개');
            return materials;
        } catch (error) {
            console.error('자재 로드 실패:', error);
            return [];
        }
    }

    // 게시글 추가
    async addPost(post) {
        try {
            const docRef = await addDoc(collection(this.db, this.postsCollection), post);
            console.log('게시글 저장 성공:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('게시글 저장 실패:', error);
            throw error;
        }
    }

    // 자재 추가
    async addMaterial(material) {
        try {
            const docRef = await addDoc(collection(this.db, this.materialsCollection), material);
            console.log('자재 저장 성공:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('자재 저장 실패:', error);
            throw error;
        }
    }

    // 게시글 삭제
    async deletePost(postId) {
        try {
            // firestoreId가 있으면 사용, 없으면 id 사용
            const posts = await this.getAllPosts();
            const post = posts.find(p => p.id === postId);
            
            if (post && post.firestoreId) {
                await deleteDoc(doc(this.db, this.postsCollection, post.firestoreId));
                console.log('게시글 삭제 성공:', postId);
            } else {
                throw new Error('게시글을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            throw error;
        }
    }

    // 게시글 수정
    async updatePost(postId, updatedData) {
        try {
            const posts = await this.getAllPosts();
            const post = posts.find(p => p.id === postId);
            
            if (post && post.firestoreId) {
                await updateDoc(doc(this.db, this.postsCollection, post.firestoreId), updatedData);
                console.log('게시글 수정 성공:', postId);
                return post.firestoreId;
            } else {
                throw new Error('게시글을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            throw error;
        }
    }

    // 자재 삭제
    async deleteMaterial(materialId) {
        try {
            // firestoreId가 있으면 사용, 없으면 id 사용
            const materials = await this.getAllMaterials();
            const material = materials.find(m => m.id === materialId);
            
            if (material && material.firestoreId) {
                await deleteDoc(doc(this.db, this.materialsCollection, material.firestoreId));
                console.log('자재 삭제 성공:', materialId);
            } else {
                throw new Error('자재를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('자재 삭제 실패:', error);
            throw error;
        }
    }

    // 모든 게시글 삭제
    async clearAllPosts() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.postsCollection));
            const deletePromises = [];
            
            querySnapshot.forEach((document) => {
                deletePromises.push(deleteDoc(doc(this.db, this.postsCollection, document.id)));
            });
            
            await Promise.all(deletePromises);
            console.log('모든 게시글 삭제 완료');
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            throw error;
        }
    }

    // 모든 자재 삭제
    async clearAllMaterials() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.materialsCollection));
            const deletePromises = [];
            
            querySnapshot.forEach((document) => {
                deletePromises.push(deleteDoc(doc(this.db, this.materialsCollection, document.id)));
            });
            
            await Promise.all(deletePromises);
            console.log('모든 자재 삭제 완료');
        } catch (error) {
            console.error('자재 삭제 실패:', error);
            throw error;
        }
    }

    // 저장 공간 정보 (Firestore는 클라우드이므로 제한 없음)
    async getStorageEstimate() {
        // Firestore는 자체적으로 저장 공간을 관리하므로
        // 실제 사용량을 측정하는 대신 게시글 개수 기반으로 예상 용량 표시
        try {
            const posts = await this.getAllPosts();
            const materials = await this.getAllMaterials();
            
            // 대략적인 예상 크기 계산 (MB)
            let estimatedSize = 0;
            
            // 게시글 크기 계산
            posts.forEach(post => {
                // 기본 정보 크기
                estimatedSize += 0.001; // 1KB
                
                // 이미지/영상 크기 추정
                if (post.images && post.images.length > 0) {
                    post.images.forEach(img => {
                        // base64 문자열 길이로 대략적인 크기 계산
                        estimatedSize += (img.length / 1024 / 1024); // MB로 변환
                    });
                }
            });
            
            // 자재 크기 계산
            materials.forEach(material => {
                estimatedSize += 0.001;
                if (material.images && material.images.length > 0) {
                    material.images.forEach(img => {
                        estimatedSize += (img.length / 1024 / 1024);
                    });
                }
            });
            
            // Firestore 무료 계획 할당량: 1GB
            const quotaMB = 1024;
            const usedMB = estimatedSize;
            const percentUsed = (usedMB / quotaMB) * 100;
            
            return {
                usage: usedMB * 1024 * 1024, // bytes
                quota: quotaMB * 1024 * 1024, // bytes
                usageInMB: usedMB.toFixed(2),
                quotaInMB: quotaMB.toFixed(0),
                percentUsed: percentUsed.toFixed(2)
            };
        } catch (error) {
            console.error('저장 공간 계산 오류:', error);
            return {
                usage: 0,
                quota: 1024 * 1024 * 1024, // 1GB in bytes
                usageInMB: 0,
                quotaInMB: 1024,
                percentUsed: 0
            };
        }
    }
}

// 전역 데이터베이스 인스턴스
const postDB = new PostDatabase();

// 전역 접근을 위해 window 객체에 등록
window.postDB = postDB;
