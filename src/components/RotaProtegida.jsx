// src/components/RotaProtegida.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RotaProtegida({ children }) {
  const { usuario, loading } = useAuth();

  console.log('RotaProtegida - usuario:', usuario, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!usuario) {
    console.log('Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  console.log('Usuário autenticado, permitindo acesso');
  return children;
}