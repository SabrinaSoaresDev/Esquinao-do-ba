// src/components/BotaoContaFlutuante.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

export default function BotaoContaFlutuante() {
  const { usuario } = useAuth();

  return (
    <Link
      to={usuario ? "/minha-conta" : "/login-cliente"}
      className="fixed bottom-40 right-6 z-40 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all transform hover:scale-110 group border border-gray-200"
      title={usuario ? "Minha Conta" : "Entrar na conta"}
    >
      <div className="relative">
        <FaUserCircle 
          size={28} 
          className={`${usuario ? 'text-green-600' : 'text-gray-500'} group-hover:text-green-500 transition`}
        />
        {usuario && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </div>
      <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        {usuario ? 'Minha Conta' : 'Entrar'}
      </span>
    </Link>
  );
}