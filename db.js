// Firebase Firestore 데이터베이스 관리 모듈
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
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
        return {
            usage: 0,
            quota: Infinity,
            usageInMB: '0.00',
            quotaInMB: '무제한',
            percentUsed: '0.00'
        };
    }
}

// 전역 데이터베이스 인스턴스
const postDB = new PostDatabase();

// 전역 접근을 위해 window 객체에 등록
window.postDB = postDB;
