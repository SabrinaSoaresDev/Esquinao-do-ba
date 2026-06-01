// Script para executar no console do navegador (já autenticado)
(async function() {
  // Importar Firebase
  const { getFirestore, collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
  
  // Obter o db do seu app (já inicializado)
  const db = window.firebaseDb || (await import('/src/firebase.js')).db;
  
  console.log('🔍 Buscando produtos...');
  const produtosSnap = await getDocs(collection(db, 'produtos'));
  const produtos = {};
  produtosSnap.docs.forEach(doc => {
    const nome = doc.data().nome.toLowerCase().trim();
    produtos[nome] = { id: doc.id, nomeOriginal: doc.data().nome };
    console.log(`   Produto: "${doc.data().nome}" -> ID: ${doc.id}`);
  });
  
  console.log('\n🔍 Buscando promoções...');
  const promocoesSnap = await getDocs(collection(db, 'promocoes'));
  let count = 0;
  
  for (const promoDoc of promocoesSnap.docs) {
    const promo = promoDoc.data();
    const nomePromo = promo.nome.toLowerCase().trim();
    
    let produtoMatch = null;
    if (produtos[nomePromo]) {
      produtoMatch = produtos[nomePromo];
    } else {
      for (const [nomeProduto, produto] of Object.entries(produtos)) {
        if (nomeProduto.includes(nomePromo) || nomePromo.includes(nomeProduto)) {
          produtoMatch = produto;
          break;
        }
      }
    }
    
    if (produtoMatch && !promo.produtoId) {
      await updateDoc(doc(db, 'promocoes', promoDoc.id), { produtoId: produtoMatch.id });
      console.log(`✅ Vinculado: "${promo.nome}" -> "${produtoMatch.nomeOriginal}"`);
      count++;
    } else if (promo.produtoId) {
      console.log(`⏩ Já vinculado: "${promo.nome}"`);
    } else {
      console.log(`❌ Não encontrado: "${promo.nome}"`);
    }
  }
  
  console.log(`\n🎉 Concluído! ${count} promoções vinculadas.`);
})();