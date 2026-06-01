// src/hooks/useClubeAdmin.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export function useClubeAdmin() {
  const [configuracoes, setConfiguracoes] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar configurações do clube
  async function carregarConfiguracoes() {
    try {
      const docRef = doc(db, 'configuracoes', 'clube');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfiguracoes(docSnap.data());
      } else {
        // Configurações padrão
        const defaultConfig = {
          pontosPorReal: 1,
          pontosParaDesconto: 100,
          valorDesconto: 5.00,
          maxDescontoPorCompra: 50.00,
          pontosExpiracaoDias: 365,
          niveis: {
            Bronze: { pontosMinimo: 0, desconto: 5, freteGratis: false },
            Prata: { pontosMinimo: 200, desconto: 10, freteGratis: true },
            Ouro: { pontosMinimo: 500, desconto: 15, freteGratis: true },
            Diamante: { pontosMinimo: 1000, desconto: 20, freteGratis: true }
          }
        };
        await setDoc(docRef, defaultConfig);
        setConfiguracoes(defaultConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    }
  }

  // Atualizar configurações
  async function atualizarConfiguracoes(dados) {
    try {
      const docRef = doc(db, 'configuracoes', 'clube');
      await updateDoc(docRef, dados);
      setConfiguracoes(prev => ({ ...prev, ...dados }));
      toast.success('Configurações atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    }
  }

  // Listar todos os clientes
  async function listarClientes(filtros = {}) {
    setLoading(true);
    try {
      let q = query(collection(db, 'clientes'), orderBy('nome'));
      
      if (filtros.nivel && filtros.nivel !== 'todos') {
        q = query(q, where('nivel', '==', filtros.nivel));
      }
      
      if (filtros.ativo !== undefined && filtros.ativo !== 'todos') {
        q = query(q, where('ativo', '==', filtros.ativo === 'ativo'));
      }
      
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(lista);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  // Adicionar pontos manualmente
  async function adicionarPontos(clienteId, pontos, motivo, valorCompra = null) {
    try {
      const clienteRef = doc(db, 'clientes', clienteId);
      const clienteDoc = await getDoc(clienteRef);
      
      if (!clienteDoc.exists()) {
        toast.error('Cliente não encontrado');
        return false;
      }
      
      const cliente = clienteDoc.data();
      const novosPontos = (cliente.pontos || 0) + pontos;
      const nivel = calcularNivel(novosPontos, configuracoes);
      
      await updateDoc(clienteRef, {
        pontos: novosPontos,
        pontosAcumulados: (cliente.pontosAcumulados || 0) + pontos,
        nivel: nivel,
        ultimaAtualizacao: serverTimestamp()
      });
      
      // Registrar transação
      await addDoc(collection(db, 'transacoes_pontos'), {
        clienteId: clienteId,
        tipo: 'ajuste',
        pontos: pontos,
        descricao: motivo,
        valorCompra: valorCompra,
        data: serverTimestamp(),
        status: 'confirmado'
      });
      
      toast.success(`${pontos} pontos adicionados com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      toast.error('Erro ao adicionar pontos');
      return false;
    }
  }

  // Calcular nível baseado nos pontos
  function calcularNivel(pontos, config) {
    const niveis = config?.niveis || {
      Bronze: { pontosMinimo: 0 },
      Prata: { pontosMinimo: 200 },
      Ouro: { pontosMinimo: 500 },
      Diamante: { pontosMinimo: 1000 }
    };
    
    if (pontos >= niveis.Diamante.pontosMinimo) return 'Diamante';
    if (pontos >= niveis.Ouro.pontosMinimo) return 'Ouro';
    if (pontos >= niveis.Prata.pontosMinimo) return 'Prata';
    return 'Bronze';
  }

  // Exportar relatório de clientes
  function exportarRelatorioClientes() {
    if (clientes.length === 0) {
      toast.error('Nenhum cliente para exportar');
      return;
    }
    
    const relatorio = clientes.map(cliente => ({
      Nome: cliente.nome || '-',
      Email: cliente.email || '-',
      Telefone: cliente.telefone || '-',
      Pontos: cliente.pontos || 0,
      'Pontos Acumulados': cliente.pontosAcumulados || 0,
      'Pontos Resgatados': cliente.pontosResgatados || 0,
      Nível: cliente.nivel || 'Bronze',
      'Total Gasto (R$)': cliente.totalGasto || 0,
      'Data Cadastro': cliente.dataCadastro ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : '-',
      'Última Compra': cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR') : '-'
    }));
    
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_clube_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado!');
  }

  return {
    configuracoes,
    clientes,
    transacoes,
    loading,
    carregarConfiguracoes,
    atualizarConfiguracoes,
    listarClientes,
    adicionarPontos,
    exportarRelatorioClientes,
    calcularNivel
  };
}