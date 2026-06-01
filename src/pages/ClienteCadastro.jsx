// src/pages/ClienteCadastro.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClienteCadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCarregando(false);
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      setCarregando(false);
      return;
    }

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Atualizar perfil com nome
      await updateProfile(user, { displayName: nome });

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, 'clientes', user.uid), {
        uid: user.uid,
        nome: nome,
        email: email,
        telefone: telefone || '',
        endereco: endereco || '',
        pontos: 0,
        nivel: 'Bronze',
        dataCadastro: new Date().toISOString(),
        ultimoAcesso: new Date().toISOString()
      });

      toast.success('✅ Cadastro realizado com sucesso!');
      toast.success('🎉 Você ganhou 100 pontos de boas-vindas!');
      
      // Redirecionar para a área do cliente
      navigate('/minha-conta');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErro('Este email já está cadastrado. Faça login ou use outro email.');
          break;
        case 'auth/invalid-email':
          setErro('Email inválido. Verifique o formato do email.');
          break;
        case 'auth/weak-password':
          setErro('Senha muito fraca. Use pelo menos 6 caracteres.');
          break;
        default:
          setErro('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Cadastre-se e comece a acumular pontos agora mesmo!
          </p>
        </div>
        
        {/* Benefícios */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm mb-2">🎁 Benefícios exclusivos:</h3>
          <div className="space-y-1 text-xs text-green-700">
            <p>✓ 100 pontos de boas-vindas</p>
            <p>✓ Descontos exclusivos para membros</p>
            <p>✓ Promoções relâmpago no WhatsApp</p>
            <p>✓ Acumule pontos a cada compra</p>
          </div>
        </div>
        
        {/* Mensagem de erro */}
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{erro}</p>
          </div>
        )}
        
        {/* Formulário */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="(33) 98827-0853"
              />
            </div>
          </div>

          <div>
            <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="endereco"
                name="endereco"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Rua, número, bairro"
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="appearance-none relative block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="appearance-none relative block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Digite a senha novamente"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={carregando}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {carregando ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Cadastrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar minha conta
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Link para login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login-cliente" className="font-medium text-green-600 hover:text-green-500">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}