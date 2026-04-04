import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { HeroSlide } from '../types';

export const heroService = {
  // Subscribe to all hero slides, ordered by creation date
  subscribeToHeroSlides: (callback: (slides: HeroSlide[]) => void) => {
    const q = query(collection(db, 'hero'), orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const slides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroSlide[];
      callback(slides);
    }, (error) => {
      console.error("Error subscribing to hero slides:", error);
      callback([]); // return empty on error to fallback to mock data
    });
  },

  // Get all slides as a static fetch
  getAllHeroSlides: async (): Promise<HeroSlide[]> => {
    try {
      const q = query(collection(db, 'hero'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroSlide[];
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      throw error;
    }
  },

  // Create a new slide
  createHeroSlide: async (slideData: Omit<HeroSlide, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'hero'), slideData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating hero slide:', error);
      throw error;
    }
  },

  // Update a slide
  updateHeroSlide: async (id: string, slideData: Partial<HeroSlide>) => {
    try {
      const slideRef = doc(db, 'hero', id);
      await updateDoc(slideRef, slideData);
    } catch (error) {
      console.error('Error updating hero slide:', error);
      throw error;
    }
  },

  // Delete a slide
  deleteHeroSlide: async (id: string) => {
    try {
      const slideRef = doc(db, 'hero', id);
      await deleteDoc(slideRef);
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      throw error;
    }
  }
};
