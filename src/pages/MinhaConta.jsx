// src/pages/MinhaConta.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClube } from '../contexts/ClubeContext';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Gift, 
  LogOut, 
  Edit3, 
  Save, 
  X,
  Home,
  Building,
  Map,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MinhaConta() {
  const { usuario, logout } = useAuth();
  const { pontos, nivel, descontoDisponivel } = useClube();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    complemento: '',
    referencia: ''
  });

  // Carregar dados do cliente
  useEffect(() => {
    if (usuario) {
      carregarDadosCliente();
    }
  }, [usuario]);

  async function carregarDadosCliente() {
    try {
      const clienteRef = doc(db, 'clientes', usuario.uid);
      const clienteDoc = await getDoc(clienteRef);
      
      if (clienteDoc.exists()) {
        const data = clienteDoc.data();
        setDadosCliente({
          nome: data.nome || usuario.displayName || '',
          email: data.email || usuario.email || '',
          telefone: data.telefone || '',
          endereco: data.endereco || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          cep: data.cep || '',
          complemento: data.complemento || '',
          referencia: data.referencia || ''
        });
      } else {
        // Dados iniciais
        setDadosCliente({
          nome: usuario.displayName || '',
          email: usuario.email || '',
          telefone: '',
          endereco: '',
          numero: '',
          bairro: '',
          cidade: '',
          cep: '',
          complemento: '',
          referencia: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  async function handleSalvarDados() {
    setCarregando(true);
    try {
      // Atualizar perfil no Firebase Auth
      if (dadosCliente.nome !== usuario.displayName) {
        await updateProfile(usuario, { displayName: dadosCliente.nome });
      }

      // Atualizar dados no Firestore
      const clienteRef = doc(db, 'clientes', usuario.uid);
      await updateDoc(clienteRef, {
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        endereco: dadosCliente.endereco,
        numero: dadosCliente.numero,
        bairro: dadosCliente.bairro,
        cidade: dadosCliente.cidade,
        cep: dadosCliente.cep,
        complemento: dadosCliente.complemento,
        referencia: dadosCliente.referencia,
        atualizadoEm: new Date().toISOString()
      });

      toast.success('✅ Dados atualizados com sucesso!');
      setEditando(false);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function handleCancelarEdicao() {
    carregarDadosCliente();
    setEditando(false);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setDadosCliente(prev => ({ ...prev, [name]: value }));
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  const niveis = {
    Bronze: { cor: 'from-amber-600 to-amber-700', icone: '🥉', limite: '0 - 199 pontos' },
    Prata: { cor: 'from-gray-400 to-gray-500', icone: '🥈', limite: '200 - 499 pontos' },
    Ouro: { cor: 'from-yellow-500 to-yellow-600', icone: '🥇', limite: '500 - 999 pontos' },
    Diamante: { cor: 'from-blue-400 to-blue-600', icone: '💎', limite: '1000+ pontos' }
  };

  const nivelAtual = niveis[nivel] || niveis.Bronze;

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Faça login para acessar sua conta</p>
          <Link to="/login-cliente" className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {dadosCliente.nome?.[0] || usuario.email?.[0] || 'M'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {dadosCliente.nome || 'Cliente'}
                </h1>
                <p className="text-gray-500 text-sm">{usuario.email}</p>
                {dadosCliente.telefone && (
                  <p className="text-gray-500 text-xs mt-1">📞 {dadosCliente.telefone}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar dados
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSalvarDados}
                    disabled={carregando}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {carregando ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={handleCancelarEdicao}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </>
              )}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Status do Clube */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl shadow-md p-6 mb-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{nivelAtual.icone}</span>
                <h2 className="text-xl font-bold">Nível {nivel}</h2>
              </div>
              <p className="text-sm opacity-90">Acumule pontos e suba de nível!</p>
              <div className="mt-2 bg-white/20 rounded-full h-2 w-48">
                <div 
                  className="bg-yellow-400 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min((pontos / 1000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs mt-1 opacity-80">{pontos} pontos acumulados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{pontos}</p>
              <p className="text-sm opacity-90">Pontos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">R$ {descontoDisponivel}</p>
              <p className="text-sm opacity-90">Desconto disponível</p>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Dados Pessoais
          </h3>
          
          {!editando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nome completo</label>
                <p className="text-gray-800 mt-1">{dadosCliente.nome || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-800 mt-1">{dadosCliente.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">WhatsApp</label>
                <p className="text-gray-800 mt-1">{dadosCliente.telefone || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Endereço completo</label>
                <p className="text-gray-800 mt-1">
                  {dadosCliente.endereco ? (
                    <>
                      {dadosCliente.endereco}, {dadosCliente.numero}
                      {dadosCliente.complemento && ` - ${dadosCliente.complemento}`}
                      <br />
                      {dadosCliente.bairro} - {dadosCliente.cidade}
                      {dadosCliente.cep && ` - CEP: ${dadosCliente.cep}`}
                    </>
                  ) : (
                    'Não informado'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={dadosCliente.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={dadosCliente.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Email não pode ser alterado</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={dadosCliente.telefone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="(33) 98827-0853"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço de entrega
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      name="endereco"
                      value={dadosCliente.endereco}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Rua Herculano Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={dadosCliente.numero}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="148"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      name="complemento"
                      value={dadosCliente.complemento}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Apto, casa, bloco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      name="bairro"
                      value={dadosCliente.bairro}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={dadosCliente.cidade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Monte Formoso"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      name="cep"
                      value={dadosCliente.cep}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="39870-000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ponto de referência</label>
                    <input
                      type="text"
                      name="referencia"
                      value={dadosCliente.referencia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Próximo à praça, igreja..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Próximos níveis */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Próximos níveis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(niveis).map(([key, value]) => (
              <div 
                key={key}
                className={`bg-gradient-to-r ${value.cor} rounded-lg p-3 text-white ${nivel === key ? 'ring-2 ring-yellow-400' : 'opacity-60'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{value.icone}</span>
                  <span className="font-bold text-sm">{key}</span>
                </div>
                <p className="text-xs opacity-90">{value.limite}</p>
                {nivel === key && <span className="text-xs font-bold">✓ Atual</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Benefícios */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Seus benefícios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold">Descontos exclusivos</p>
                <p className="text-sm text-gray-600">Troque pontos por descontos reais</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-semibold">Frete grátis*</p>
                <p className="text-sm text-gray-600">Para compras acima de R$ 100</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-semibold">Grupo VIP WhatsApp</p>
                <p className="text-sm text-gray-600">Ofertas exclusivas todos os dias</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-semibold">Promoções relâmpago</p>
                <p className="text-sm text-gray-600">Descontos especiais para membros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão do grupo WhatsApp */}
        <div className="bg-green-50 rounded-xl shadow-md p-6 text-center">
          <h3 className="font-bold text-lg mb-2">📱 Participe do nosso grupo VIP</h3>
          <p className="text-gray-600 mb-4">Receba ofertas todos os dias no WhatsApp!</p>
          <a 
            href="https://chat.whatsapp.com/seu-link" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Entrar no grupo VIP
          </a>
        </div>

        {/* Modal de confirmação de logout */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowLogoutConfirm(false)}></div>
            <div className="relative bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-bold mb-4">Sair da conta</h3>
              <p className="text-gray-600 mb-6">Tem certeza que deseja sair?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}