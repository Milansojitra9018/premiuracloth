import { 
    collection, 
    getDocs, 
    query, 
    orderBy,
    doc,
    updateDoc,
    getDoc
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  const COLLECTION_NAME = 'users';
  
  export const userService = {
    async getAllUsers() {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  
    async updateUserRole(uid: string, role: string) {
      const docRef = doc(db, COLLECTION_NAME, uid);
      return await updateDoc(docRef, { role });
    },
  
    async getUserById(uid: string) {
      const docRef = doc(db, COLLECTION_NAME, uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    }
  };
  