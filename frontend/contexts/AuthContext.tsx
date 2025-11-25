import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trader {
  uid: string;
  email: string | null;
  phone: string | null;
  name: string;
  photoURL: string | null;
  pendingProfits: number;
  realizedProfits: number;
  referralCommissionEarned: number;
  referralCount: number;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  trader: Trader | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const traderDoc = await getDoc(doc(db, 'traders', firebaseUser.uid));
          if (traderDoc.exists()) {
            setTrader({ uid: firebaseUser.uid, ...traderDoc.data() } as Trader);
          }
        } catch (error) {
          console.error('Error fetching trader data:', error);
        }
      } else {
        setTrader(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update login history (silently fail if permissions issue)
      try {
        const loginHistoryRef = doc(db, `traders/${userCredential.user.uid}/loginHistory/${Date.now()}`);
        await setDoc(loginHistoryRef, {
          timestamp: serverTimestamp(),
          method: 'email',
        });
      } catch (historyError) {
        console.log('Could not update login history:', historyError);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create trader document
      const traderData = {
        uid: userCredential.user.uid,
        email,
        phone,
        name,
        photoURL: null,
        pendingProfits: 0,
        realizedProfits: 0,
        referralCommissionEarned: 0,
        referralCount: 0,
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'traders', userCredential.user.uid), traderData);
      
      // Create login history
      const loginHistoryRef = doc(db, `traders/${userCredential.user.uid}/loginHistory/${Date.now()}`);
      await setDoc(loginHistoryRef, {
        timestamp: serverTimestamp(),
        method: 'email',
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.clear();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const sendPhoneVerification = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      // Note: For production, you'll need to implement proper reCAPTCHA
      // This is a placeholder - phone auth works differently on native
      throw new Error('Phone authentication requires native implementation');
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Check if trader document exists, create if not
      const traderDoc = await getDoc(doc(db, 'traders', userCredential.user.uid));
      if (!traderDoc.exists()) {
        const traderData = {
          uid: userCredential.user.uid,
          email: null,
          phone: userCredential.user.phoneNumber,
          name: '',
          photoURL: null,
          pendingProfits: 0,
          realizedProfits: 0,
          referralCommissionEarned: 0,
          referralCount: 0,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'traders', userCredential.user.uid), traderData);
      }
      
      // Create login history
      const loginHistoryRef = doc(db, `traders/${userCredential.user.uid}/loginHistory/${Date.now()}`);
      await setDoc(loginHistoryRef, {
        timestamp: serverTimestamp(),
        method: 'phone',
      });
    } catch (error: any) {
      console.error('Verify phone code error:', error);
      throw error;
    }
  };

  const value = {
    user,
    trader,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    sendPhoneVerification,
    verifyPhoneCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
