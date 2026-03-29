import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile, UserRole } from '../types';

export const authService = {
  // Login with Google
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if profile exists, if not create one
    const profile = await this.getUserProfile(user.uid);
    if (!profile) {
      await this.createUserProfile(user);
    }
    
    return user;
  },

  // Logout
  async logout() {
    return await signOut(auth);
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  },

  // Create initial user profile
  async createUserProfile(user: User, role: UserRole = 'user') {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || '',
      role: role,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      serverCreatedAt: serverTimestamp()
    });
    
    return profile;
  },

  // Listen for auth changes
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
