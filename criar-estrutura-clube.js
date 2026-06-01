// criar-estrutura-clube.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC6LhqUW3h9T_iY5jx5bhXJNgkXGWRjfe4",
  authDomain: "esquinao-do-ba.firebaseapp.com",
  projectId: "esquinao-do-ba",
  storageBucket: "esquinao-do-ba.firebasestorage.app",
  messagingSenderId: "625624511056",
  appId: "1:625624511056:web:d2ffcdd65a9ac247619755"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function criarEstrutura() {
  try {
    // Criar configurações do clube
    await setDoc(doc(db, 'configuracoes', 'clube'), {
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
      },
      criadoEm: new Date().toISOString()
    });
    console.log('✅ Configurações do clube criadas');

    // Criar exemplo de cliente (opcional)
    await setDoc(doc(db, 'clientes', 'exemplo'), {
      nome: "Cliente Exemplo",
      email: "cliente@exemplo.com",
      telefone: "(33) 98827-0853",
      pontos: 150,
      pontosAcumulados: 150,
      pontosResgatados: 0,
      nivel: "Bronze",
      totalGasto: 150.00,
      dataCadastro: new Date().toISOString(),
      ativo: true
    });
    console.log('✅ Cliente exemplo criado');

    console.log('🎉 Estrutura criada com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

criarEstrutura();