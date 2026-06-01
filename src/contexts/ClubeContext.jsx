// src/contexts/ClubeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ClubeContext = createContext({});

export function useClube() {
  return useContext(ClubeContext);
}

export function ClubeProvider({ children }) {
  const { usuario } = useAuth();
  const [membro, setMembro] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [descontoDisponivel, setDescontoDisponivel] = useState(0);

  // Carregar dados do membro
  useEffect(() => {
    if (usuario) {
      carregarDadosMembro();
    } else {
      setMembro(null);
      setPontos(0);
      setLoading(false);
    }
  }, [usuario]);

  async function carregarDadosMembro() {
    try {
      const membroRef = doc(db, 'clubeMembros', usuario.uid);
      const membroDoc = await getDoc(membroRef);
      
      if (membroDoc.exists()) {
        const data = membroDoc.data();
        setMembro(data);
        setPontos(data.pontos || 0);
        calcularDescontoDisponivel(data.pontos || 0);
      } else {
        // Criar novo membro
        const novoMembro = {
          uid: usuario.uid,
          email: usuario.email,
          nome: usuario.displayName || '',
          pontos: 0,
          pontosAcumulados: 0,
          memberSince: new Date().toISOString(), // ← Corrigido: vírgula extra removida
          ultimaCompra: null,
          nivel: 'Bronze'
        };
        await setDoc(membroRef, novoMembro);
        setMembro(novoMembro);
        setPontos(0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do clube:', error);
    } finally {
      setLoading(false);
    }
  }

  function calcularDescontoDisponivel(pontosAtuais) {
    // A cada 100 pontos = R$ 5 de desconto
    const desconto = Math.floor(pontosAtuais / 100) * 5;
    setDescontoDisponivel(Math.min(desconto, 50)); // Máximo R$ 50 de desconto
  }

  async function adicionarPontos(valorCompra, produtos) {
    if (!usuario) return;
    
    // 1 ponto para cada R$ 1 gasto
    const pontosGanhos = Math.floor(valorCompra);
    const novosPontos = pontos + pontosGanhos;
    
    try {
      const membroRef = doc(db, 'clubeMembros', usuario.uid);
      await updateDoc(membroRef, {
        pontos: novosPontos,
        pontosAcumulados: increment(pontosGanhos),
        ultimaCompra: new Date().toISOString(),
        nivel: calcularNivel(novosPontos)
      });
      
      setPontos(novosPontos);
      calcularDescontoDisponivel(novosPontos);
      
      toast.success(`🎉 Você ganhou ${pontosGanhos} pontos! Total: ${novosPontos} pontos`);
      return pontosGanhos;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
    }
  }

  function calcularNivel(pontos) {
    if (pontos >= 1000) return 'Diamante';
    if (pontos >= 500) return 'Ouro';
    if (pontos >= 200) return 'Prata';
    return 'Bronze';
  }

  async function usarDesconto() {
    if (!usuario || descontoDisponivel <= 0) return 0;
    
    const pontosUsados = descontoDisponivel * 20; // R$5 = 100 pontos
    const novosPontos = pontos - pontosUsados;
    
    try {
      const membroRef = doc(db, 'clubeMembros', usuario.uid);
      await updateDoc(membroRef, {
        pontos: novosPontos,
        nivel: calcularNivel(novosPontos)
      });
      
      setPontos(novosPontos);
      calcularDescontoDisponivel(novosPontos);
      
      toast.success(`💸 Desconto de R$ ${descontoDisponivel} aplicado!`);
      return descontoDisponivel;
    } catch (error) {
      console.error('Erro ao usar desconto:', error);
      return 0;
    }
  }

  function getBeneficiosPorNivel() {
    const nivel = calcularNivel(pontos);
    const beneficios = {
      Bronze: {
        desconto: '5% de desconto em produtos selecionados',
        pontosMultiplicador: 1,
        freteGratis: false,
        icone: '🥉',
        cor: 'from-amber-600 to-amber-700'
      },
      Prata: {
        desconto: '10% de desconto em produtos selecionados',
        pontosMultiplicador: 1.5,
        freteGratis: true,
        icone: '🥈',
        cor: 'from-gray-400 to-gray-500'
      },
      Ouro: {
        desconto: '15% de desconto em todos os produtos',
        pontosMultiplicador: 2,
        freteGratis: true,
        icone: '🥇',
        cor: 'from-yellow-500 to-yellow-600'
      },
      Diamante: {
        desconto: '20% de desconto em todos os produtos',
        pontosMultiplicador: 2.5,
        freteGratis: true,
        icone: '💎',
        cor: 'from-blue-400 to-blue-600'
      }
    };
    return beneficios[nivel] || beneficios.Bronze;
  }

  return (
    <ClubeContext.Provider value={{
      membro,
      pontos,
      descontoDisponivel,
      loading,
      nivel: calcularNivel(pontos),
      beneficios: getBeneficiosPorNivel(),
      adicionarPontos,
      usarDesconto,
      calcularDescontoDisponivel
    }}>
      {children}
    </ClubeContext.Provider>
  );
}