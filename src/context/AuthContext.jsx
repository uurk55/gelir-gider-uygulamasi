// src/context/AuthContext.jsx (DOĞRU VE NİHAİ VERSİYON)

import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { useFinans } from './FinansContext';
import toast from 'react-hot-toast';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const finansContext = useFinans();

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user && finansContext) {
      await finansContext.transferGuestDataToFirestore(userCredential.user.uid);
    }
    return userCredential;
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user && finansContext) {
      await finansContext.transferGuestDataToFirestore(userCredential.user.uid);
    }
    return userCredential;
  }

  function logout() {
    return signOut(auth);
  }

  async function deleteAccount() {
    if (!currentUser) throw new Error("Hesabı silmek için giriş yapmış olmalısınız.");
    try {
      const uid = currentUser.uid;
      const batch = writeBatch(db);
      const userSettingsRef = doc(db, 'users', uid);
      batch.delete(userSettingsRef);
      await batch.commit();
      await deleteUser(currentUser);
      toast.success("Hesabınız ve tüm verileriniz kalıcı olarak silindi.");
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error("Bu hassas bir işlemdir. Lütfen çıkış yapıp tekrar giriş yaptıktan sonra deneyin.");
      } else {
        toast.error("Hesap silinirken bir hata oluştu.");
      }
      throw error;
    }
  }
  
  async function updateProfileName(newName) {
    if (!currentUser) throw new Error("Profili güncellemek için giriş yapmış olmalısınız.");
    await updateProfile(currentUser, { displayName: newName });
    setCurrentUser(prevUser => ({ ...prevUser, displayName: newName }));
    toast.success("Profil adınız güncellendi!");
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    deleteAccount,
    updateProfileName
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}