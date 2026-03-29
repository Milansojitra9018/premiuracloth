import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'orders';

export const orderService = {
  async getAllOrders() {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getOrdersByUser(userId: string) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createOrder(orderData: any) {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
  },

  async updateOrderStatus(orderId: string, status: string) {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    return await updateDoc(docRef, { status });
  },

  async hasOrderedProduct(userId: string, productId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('userId', '==', userId),
        where('status', '==', 'delivered') // Only delivered orders can be reviewed? Or any order?
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.some(doc => {
        const order = doc.data();
        return order.items.some((item: any) => item.productId === productId);
      });
    } catch (error) {
      console.error('Error checking if user ordered product:', error);
      return false;
    }
  }
};
