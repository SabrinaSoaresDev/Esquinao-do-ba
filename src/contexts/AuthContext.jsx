// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Verificar se é admin
  const isAdmin = useMemo(() => {
    if (!usuario) return false;
    const adminEmails = ['admin@mercearia.com', 'admin@esquinaodoba.com'];
    return adminEmails.includes(usuario.email) || userData?.role === 'admin';
  }, [usuario, userData]);

  // Buscar dados adicionais do usuário no Firestore
  const fetchUserData = useCallback(async (uid) => {
    try {
      const userDocRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        try {
          const newUserData = {
            email: usuario?.email,
            role: 'user',
            createdAt: new Date().toISOString(),
            nome: usuario?.displayName || '',
            telefone: '',
            endereco: '',
            avatar: usuario?.photoURL || ''
          };
          await setDoc(doc(db, 'usuarios', uid), newUserData);
          setUserData(newUserData);
        } catch (err) {
          console.warn('Não foi possível criar documento do usuário:', err.message);
          setUserData({ role: 'user', email: usuario?.email });
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar dados do usuário:', error.message);
      setUserData({ role: 'user', email: usuario?.email });
    }
  }, [usuario]);

  // Monitorar estado de autenticação
  useEffect(() => {
    let unsubscribe;
    
    const initAuth = async () => {
      await setPersistence(auth, browserLocalPersistence);
      
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user?.email);
        setUsuario(user);
        
        if (user) {
          await fetchUserData(user.uid);
        } else {
          setUserData(null);
        }
        
        setLoading(false);
        setError(null);
      });
    };
    
    initAuth();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchUserData]);

  // Login
  const login = useCallback(async (email, senha, rememberMe = true) => {
    setError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      console.log('Login successful:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido. Verifique o formato do email.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta conta foi desativada. Contate o administrador.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado. Verifique o email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta. Tente novamente.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
      setUserData(null);
      setUsuario(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout. Tente novamente.');
      throw error;
    }
  }, []);

  // Recuperar senha
  const resetPassword = useCallback(async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      let errorMessage = 'Erro ao enviar email de recuperação.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado com este email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Atualizar perfil
  const updateUserProfile = useCallback(async (data) => {
    setError(null);
    try {
      if (usuario) {
        await updateProfile(usuario, {
          displayName: data.nome || usuario.displayName,
          photoURL: data.avatar || usuario.photoURL
        });
        
        const userDocRef = doc(db, 'usuarios', usuario.uid);
        await updateDoc(userDocRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
        
        setUserData(prev => ({ ...prev, ...data }));
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil.');
      throw error;
    }
  }, [usuario]);

  // Mudar email
  const changeEmail = useCallback(async (newEmail) => {
    setError(null);
    try {
      if (usuario) {
        await updateEmail(usuario, newEmail);
        return true;
      }
    } catch (error) {
      let errorMessage = 'Erro ao alterar email.';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por favor, faça login novamente para alterar o email.';
      }
      setError(errorMessage);
      throw error;
    }
  }, [usuario]);

  // Mudar senha
  const changePassword = useCallback(async (newPassword) => {
    setError(null);
    try {
      if (usuario) {
        await updatePassword(usuario, newPassword);
        return true;
      }
    } catch (error) {
      let errorMessage = 'Erro ao alterar senha.';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por favor, faça login novamente para alterar a senha.';
      }
      setError(errorMessage);
      throw error;
    }
  }, [usuario]);

  // Enviar verificação de email
  const sendVerificationEmail = useCallback(async () => {
    setError(null);
    try {
      if (usuario) {
        await sendEmailVerification(usuario);
        return true;
      }
    } catch (error) {
      console.error('Erro ao enviar verificação:', error);
      setError('Erro ao enviar email de verificação.');
      throw error;
    }
  }, [usuario]);

  const isAuthenticated = useMemo(() => !!usuario, [usuario]);

  const value = {
    usuario,
    userData,
    loading,
    error,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    changeEmail,
    changePassword,
    sendVerificationEmail,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}