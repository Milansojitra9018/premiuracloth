import { 
    collection, 
    getDocs, 
    query, 
    orderBy,
    where,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    increment,
    getDoc
  } from 'firebase/firestore';
  import { db, handleFirestoreError, OperationType } from '../firebase';
  import { Review } from '../types';
  
  const COLLECTION_NAME = 'reviews';
  
  export const reviewService = {
    async getReviewsByProduct(productId: string): Promise<Review[]> {
      try {
        const q = query(
          collection(db, COLLECTION_NAME), 
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
        return [];
      }
    },
  
    async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>) {
      try {
        const reviewRef = await addDoc(collection(db, COLLECTION_NAME), {
          ...reviewData,
          createdAt: serverTimestamp()
        });
  
        // Update product rating and reviews count
        const productRef = doc(db, 'products', reviewData.productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentRating = productData.rating || 0;
          const currentCount = productData.reviewsCount || 0;
          
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;
          
          await updateDoc(productRef, {
            rating: newRating,
            reviewsCount: newCount
          });
        }
  
        return reviewRef;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
        throw error;
      }
    }
  };
  