// src/layouts/AdminLayout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Package, 
  Tag, 
  Clock, 
  Settings, 
  LogOut,
  Trophy  // ← Adicionar ícone do troféu
} from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/produtos', icon: Package, label: 'Produtos' },
    { path: '/admin/promocoes', icon: Tag, label: 'Promoções' },
    { path: '/admin/horario', icon: Clock, label: 'Horário' },
    { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/admin/clube', icon: Trophy, label: 'Clube de Vantagens' },  // ← Adicionar esta linha
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-green-600">Mercearia Admin</h1>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors mb-1"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full mt-4"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}