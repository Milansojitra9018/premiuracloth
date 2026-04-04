import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { BudgetSpotlightItem } from '../types';

const COLLECTION_NAME = 'budgetSpotlight';

export const budgetSpotlightService = {
  subscribeToBudgetSpotlights(callback: (items: BudgetSpotlightItem[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const items: BudgetSpotlightItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BudgetSpotlightItem);
      });
      callback(items);
    }, (error) => {
      console.error("Error subscribing to budget spotlights:", error);
      callback([]);
    });
  },

  async getAllBudgetSpotlights(): Promise<BudgetSpotlightItem[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BudgetSpotlightItem[];
    } catch (error) {
      console.error('Error fetching budget spotlights:', error);
      return [];
    }
  },

  async createBudgetSpotlight(itemData: Omit<BudgetSpotlightItem, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), itemData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding budget spotlight:', error);
      throw error;
    }
  },

  async updateBudgetSpotlight(id: string, updates: Partial<Omit<BudgetSpotlightItem, 'id'>>): Promise<void> {
    try {
      const itemRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(itemRef, updates);
    } catch (error) {
      console.error('Error updating budget spotlight:', error);
      throw error;
    }
  },

  async deleteBudgetSpotlight(id: string): Promise<void> {
    try {
      const itemRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error deleting budget spotlight:', error);
      throw error;
    }
  }
};
