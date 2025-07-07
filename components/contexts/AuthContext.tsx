import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithGoogle, onAuthStateChange, signOutUser, auth, firestore } from '../../lib/auth';
import { Alert } from 'react-native';

interface AuthContextType {
  user: any;
  loading: boolean;
  isLoading: boolean; // Add isLoading alias for compatibility
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Setting up auth listener");
    
    const authTimeout = setTimeout(() => {
      console.log("AuthContext: Timeout - showing signin");
      setLoading(false);
      setUser(null);
    }, 3000);
    
    const unsubscribe = onAuthStateChange(async (currentUser: any) => {
      console.log("AuthContext: Auth state changed:", currentUser?.uid || 'null');
      console.log("AuthContext: Full user object:", currentUser);
      clearTimeout(authTimeout);
      
      // Force state update
      setUser(currentUser);
      setLoading(false);
      
      // Force re-render by updating state
      setTimeout(() => {
        console.log("AuthContext: Force updating user state");
        setUser(currentUser);
      }, 100);
      
      if (currentUser) {
        console.log("AuthContext: User authenticated, uid:", currentUser.uid);
        console.log("AuthContext: User email:", currentUser.email);
        
        // Create user profile if needed
        if (firestore) {
          try {
            const { doc, setDoc, serverTimestamp } = require('firebase/firestore');
            const userRef = doc(firestore, 'users', currentUser.uid);
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              lastLogin: serverTimestamp()
            }, { merge: true });
            console.log("AuthContext: User profile created/updated in Firestore");
          } catch (error) {
            console.error("AuthContext: Error creating user profile:", error);
          }
        }
      } else {
        console.log("AuthContext: No user, should show signin page");
      }
    });
    
    return () => {
      clearTimeout(authTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async () => {
    console.log("AuthContext: Starting sign-in");
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      console.log("AuthContext: Sign-in successful:", user?.uid);
      
      // Don't set user here - let onAuthStateChanged handle it
      // The Firebase auth state will update and trigger navigation
      console.log("AuthContext: Waiting for auth state change...");
    } catch (error: any) {
      console.error("AuthContext: Sign-in failed:", error);
      Alert.alert("Sign In Failed", error?.message || "Could not sign in with Google.");
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      Alert.alert("Success", "Successfully signed out.");
    } catch (error: any) {
      console.error("Sign-out failed:", error);
      Alert.alert("Sign Out Failed", error?.message || "Could not sign out.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    const currentUser = auth?.currentUser;
    if (!currentUser) throw new Error('No user is signed in');
    
    try {
      const { updateProfile } = require('firebase/auth');
      await updateProfile(currentUser, updates);
      
      // Update in Firestore as well
      if (firestore) {
        const { doc, updateDoc, serverTimestamp } = require('firebase/firestore');
        const userRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userRef, {
          ...updates,
          lastUpdated: serverTimestamp()
        });
      }
      
      // Update local state
      setUser({ ...currentUser, ...updates });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoading: loading, signIn, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
