// src/context/AuthContext.jsx

import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // firebase.js'ten auth'u import ediyoruz
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Başlangıçta kimlik doğrulama durumu kontrol ediliyor

  // Yeni kullanıcı kaydı fonksiyonu
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Mevcut kullanıcı giriş fonksiyonu
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Çıkış yapma fonksiyonu
  function logout() {
    return signOut(auth);
  }

  // Firebase'in kendi kullanıcı durumu dinleyicisi.
  // Bu sayede sayfa yenilense bile kullanıcı giriş yapmışsa bilgisi kaybolmaz.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false); // Kullanıcı durumu belirlendi, yükleme bitti.
    });

    return unsubscribe; // Component kaldırıldığında listener'ı temizle
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  // loading false olana kadar (yani kullanıcı durumu netleşene kadar) children'ı render etme.
  // Bu, kullanıcı giriş yapmışken sayfa yenilendiğinde kısa bir anlığına giriş sayfasının görünmesini engeller.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}