// src/layouts/Layout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { useAuth } from '../contexts/AuthContext';
import { FaFacebook, FaWhatsapp, FaInstagram, FaUserCircle } from 'react-icons/fa';

import { 
  Home, 
  ShoppingBag, 
  Tag, 
  Phone,
  Menu,
  X,
  PhoneCall,
  MapPin,
  Mail,
  Clock,
  ShoppingCart
} from 'lucide-react';
import { useState } from 'react';
import { useCarrinho } from '../contexts/CarrinhoContext';

export default function Layout() {
  const { config } = useConfiguracoes();
  const { usuario } = useAuth();
  const { quantidadeItens } = useCarrinho();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/produtos', icon: ShoppingBag, label: 'Produtos' },
    { path: '/promocoes', icon: Tag, label: 'Promoções' },
    { path: '/contato', icon: Phone, label: 'Contato' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm py-2">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span>🎉 Frete grátis para compras acima de R$ 100,00 dentro da cidade </span>
            <span>📞 {config?.telefone || '(33) 98827-0853'}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{config?.nomeLoja || 'Mercearia Esquinao do Ba'}</h1>
                <p className="text-xs text-gray-500">Qualidade em cada detalhe</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-green-50 text-green-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              


              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {menuAberto ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuAberto && (
            <nav className="md:hidden mt-4 py-4 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuAberto(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-green-50 text-green-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                to={usuario ? "/minha-conta" : "/login-cliente"}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <FaUserCircle size={20} />
                <span>{usuario ? 'Minha Conta' : 'Entrar'}</span>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <h3 className="text-white font-bold text-lg">{config?.nomeLoja || 'Mercearia Esquinao do Ba'}</h3>
              </div>
              <p className="text-sm">
                Sua mercearia de confiança com produtos frescos e de qualidade.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Horário de Funcionamento</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Segunda - Sexta:</span>
                  <span>07:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span>07:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span>Fechado</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} />
                  <span>{config?.telefone || '(11) 98827-0853'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{config?.email || 'esquinaodoba@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{config?.endereco || 'Rua herculado silva 148, centro , monte formoso- MG'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <a href={config?.instagram || '#'} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <FaInstagram size={20} />
                </a>
                <a href={config?.facebook || '#'} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <FaFacebook size={20} />
                </a>
              </div>
            </div>
            
          </div>
          <Link to="/login" className="text-gray-400 hover:text-white transition">
            Area Administrativa
          </Link>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; 2026 {config?.nomeLoja || 'Mercearia'}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão WhatsApp Flutuante */}
      {config?.whatsappAtivo && (
        <a
          href={`https://wa.me/${config?.whatsapp?.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-110 z-50 animate-bounce"
        >
          <FaWhatsapp size={25} />
        </a>
      )}
    </div>
  );
}