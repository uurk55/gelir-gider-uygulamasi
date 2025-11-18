// src/context/AuthContext.jsx (GÜNCELLENMİŞ VE DOĞRU KOD)

import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  updateProfile,
  updatePassword,
  EmailAuthProvider,      // YENİ: Kimlik doğrulama için gerekli
  reauthenticateWithCredential // YENİ: Kimlik doğrulama için gerekli
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

  // signup, login, logout fonksiyonları aynı...
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

  // YENİ VE DOĞRU FONKSİYON: Önce kimliği doğrular, sonra şifreyi değiştirir
  async function reauthenticateAndChangePassword(currentPassword, newPassword) {
    if (!currentUser) throw new Error("İşlem için giriş yapmış olmalısınız.");
    
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      // 1. Adım: Kullanıcının kimliğini mevcut şifresiyle doğrula
      await reauthenticateWithCredential(currentUser, credential);
      // 2. Adım: Kimlik doğrulama başarılı olursa, yeni şifreyi ayarla
      await updatePassword(currentUser, newPassword);
      toast.success("Şifreniz başarıyla güncellendi.");

    } catch (error) {
      console.error("Yeniden kimlik doğrulama ve şifre güncelleme hatası:", error);
      if (error.code === 'auth/wrong-password') {
        toast.error("Mevcut şifreniz yanlış. Lütfen kontrol edin.");
      } else if (error.code === 'auth/requires-recent-login') {
         toast.error("Bu hassas bir işlemdir. Lütfen çıkış yapıp tekrar giriş yaptıktan sonra deneyin.");
      } else {
        toast.error("Şifre güncellenirken bir hata oluştu.");
      }
      throw error;
    }
  }
  
  // deleteAccount ve updateProfileName fonksiyonları aynı...
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
    updateProfileName,
    reauthenticateAndChangePassword // Eski fonksiyonu bununla değiştiriyoruz
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}