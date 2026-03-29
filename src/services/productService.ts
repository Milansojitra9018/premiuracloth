import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const COLLECTION_NAME = 'products';

export const productService = {
  // Get all products (Admin)
  async getAllProducts() {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  // Get products by seller
  async getProductsBySeller(sellerId: string) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('sellerId', '==', sellerId)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get single product
  async getProductById(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Product;
    }
    return null;
  },

  // Create product
  async createProduct(productData: any) {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Update product
  async updateStock(productId: string, quantity: number) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const currentStock = snapshot.data().stock || 0;
      const newStock = Math.max(0, currentStock - quantity);
      return await updateDoc(docRef, {
        stock: newStock,
        updatedAt: serverTimestamp(),
      });
    }
    throw new Error('Product not found');
  },

  // Delete product
  // Update product
  async updateProduct(id: string, data: any): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
  async deleteProduct(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await deleteDoc(docRef);
  },

  // Real-time listener for all products
  subscribeToProducts(callback: (products: Product[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      callback(products);
    });
  }
};
