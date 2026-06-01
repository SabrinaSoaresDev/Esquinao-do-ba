// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CarrinhoProvider } from './contexts/CarrinhoContext';
import { ClubeProvider } from './contexts/ClubeContext';
import RotaProtegida from './components/RotaProtegida';
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';
import CarrinhoLateral from './components/CarrinhoLateral';
import BotaoContaFlutuante from './components/BotaoContaFlutuante';
import Inicio from './pages/Inicio';
import Produtos from './pages/Produtos';
import Promocoes from './pages/Promocoes';
import Contato from './pages/Contato';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminProdutos from './pages/admin/AdminProdutos';
import AdminPromocoes from './pages/admin/AdminPromocoes';
import AdminHorario from './pages/admin/AdminHorario';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';
import AdminClube from './pages/admin/AdminClube';
import ClienteLogin from './pages/ClienteLogin';
import ClienteCadastro from './pages/ClienteCadastro';
import MinhaConta from './pages/MinhaConta';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClubeProvider>
          <CarrinhoProvider>
            <Routes>
              {/* Rotas públicas com Layout padrão */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Inicio />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="promocoes" element={<Promocoes />} />
                <Route path="contato" element={<Contato />} />
                <Route path="login-cliente" element={<ClienteLogin />} />
                <Route path="cadastro" element={<ClienteCadastro />} />
                <Route path="minha-conta" element={<MinhaConta />} />
              </Route>
              
              {/* Rota de login admin */}
              <Route path="/login" element={<Login />} />
              
              {/* Rotas protegidas do admin */}
              <Route path="/admin" element={
                <RotaProtegida>
                  <AdminLayout />
                </RotaProtegida>
              }>
                <Route index element={<Dashboard />} />
                <Route path="produtos" element={<AdminProdutos />} />
                <Route path="promocoes" element={<AdminPromocoes />} />
                <Route path="horario" element={<AdminHorario />} />
                <Route path="configuracoes" element={<AdminConfiguracoes />} />
                <Route path="clube" element={<AdminClube />} />
              </Route>
            </Routes>
            
            {/* Componentes globais */}
            <CarrinhoLateral />
            <BotaoContaFlutuante />
          </CarrinhoProvider>
        </ClubeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;