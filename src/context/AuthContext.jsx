// src/context/AuthContext.jsx (MİSAFİR VERİSİNİ TAŞIMAK İÇİN GÜNCELLENDİ)

import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { useFinans } from './FinansContext'; // YENİ: FinansContext'i import ediyoruz

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const finansContext = useFinans(); // YENİ: FinansContext'e erişim sağlıyoruz

  // Yeni kullanıcı kaydı fonksiyonu
  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // YENİ: Kayıt başarılı olduktan sonra misafir verilerini taşı
    if (userCredential.user && finansContext) {
      await finansContext.transferGuestDataToFirestore(userCredential.user.uid);
    }
    return userCredential;
  }

  // Mevcut kullanıcı giriş fonksiyonu
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // YENİ: Giriş başarılı olduktan sonra misafir verilerini taşı
    if (userCredential.user && finansContext) {
      await finansContext.transferGuestDataToFirestore(userCredential.user.uid);
    }
    return userCredential;
  }

  // Çıkış yapma fonksiyonu
  function logout() {
    return signOut(auth);
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}