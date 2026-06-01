// server/api/webhook-compras.js (Backend para receber dados do ERP)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  // suas configurações
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clienteId, valorTotal, pedidoId, itens, formaPagamento } = req.body;

    // Buscar cliente
    const clienteRef = doc(db, 'clientes', clienteId);
    const clienteDoc = await getDoc(clienteRef);

    if (!clienteDoc.exists()) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const cliente = clienteDoc.data();
    const configRef = doc(db, 'configuracoes', 'clube');
    const configDoc = await getDoc(configRef);
    const config = configDoc.data();

    // Calcular pontos ganhos
    const pontosGanhos = Math.floor(valorTotal * (config.pontosPorReal || 1));
    const novosPontos = (cliente.pontos || 0) + pontosGanhos;

    // Atualizar cliente
    await updateDoc(clienteRef, {
      pontos: novosPontos,
      pontosAcumulados: (cliente.pontosAcumulados || 0) + pontosGanhos,
      totalGasto: (cliente.totalGasto || 0) + valorTotal,
      ultimaCompra: new Date().toISOString()
    });

    // Registrar transação
    await addDoc(collection(db, 'transacoes_pontos'), {
      clienteId,
      tipo: 'ganho',
      pontos: pontosGanhos,
      descricao: `Compra #${pedidoId} via ERP`,
      valorCompra: valorTotal,
      pedidoId,
      itens,
      formaPagamento,
      data: new Date().toISOString(),
      status: 'confirmado'
    });

    return res.status(200).json({
      success: true,
      pontosGanhos,
      novosPontos,
      mensagem: `${pontosGanhos} pontos adicionados!`
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}