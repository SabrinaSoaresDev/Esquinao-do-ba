// src/hooks/useProdutoComPromocao.js
import { useState, useEffect } from 'react';
import { usePromocoes } from './usePromocoes';

export function useProdutoComPromocao() {
  const { promocoes, loading: loadingPromocoes } = usePromocoes();
  const [mapaPromocoesPorId, setMapaPromocoesPorId] = useState({});

  // Criar mapa de promoções por produtoId
  useEffect(() => {
    if (promocoes && promocoes.length > 0) {
      const mapaPorId = {};
      
      promocoes.forEach(promo => {
        // Verificar se promoção está ativa e válida
        const isAtiva = promo.ativa !== false;
        const isValida = !promo.validoAte || new Date(promo.validoAte) > new Date();
        
        if (isAtiva && isValida && promo.produtoId) {
          mapaPorId[promo.produtoId] = {
            precoPromocional: promo.precoPromocional,
            precoOriginal: promo.precoOriginal,
            desconto: Math.round((1 - promo.precoPromocional / promo.precoOriginal) * 100),
            emPromocao: true,
            nomePromocao: promo.nome
          };
          console.log(`✅ Promoção mapeada: ${promo.nome} (ID: ${promo.produtoId}) -> R$ ${promo.precoOriginal} → R$ ${promo.precoPromocional}`);
        }
      });
      
      setMapaPromocoesPorId(mapaPorId);
      console.log(`📊 Total de promoções ativas: ${Object.keys(mapaPorId).length}`);
    }
  }, [promocoes]);

  // Função para obter produto com dados de promoção
  function getProdutoComPromocao(produto) {
    if (!produto) return null;
    
    // Buscar promoção por ID do produto
    const promocao = mapaPromocoesPorId[produto.id];
    
    if (promocao) {
      console.log(`🎯 Produto em promoção: "${produto.nome}" (ID: ${produto.id})`);
      console.log(`   Preço original: R$ ${produto.preco} → Promoção: R$ ${promocao.precoPromocional}`);
      
      return {
        ...produto,
        emPromocao: true,
        precoPromocional: promocao.precoPromocional,
        precoOriginalOriginal: produto.preco,  // Guarda o preço original original
        descontoPercentual: promocao.desconto,
        precoExibir: promocao.precoPromoconial,  // Preço a ser exibido
        precoOriginalExibir: produto.preco
      };
    }
    
    return {
      ...produto,
      emPromocao: false,
      precoExibir: produto.preco,
      precoOriginalOriginal: null,
      precoOriginalExibir: null,
      descontoPercentual: 0
    };
  }

  // Função para processar uma lista de produtos
  function processarProdutosComPromocao(produtosLista) {
    if (!produtosLista) return [];
    const processados = produtosLista.map(produto => getProdutoComPromocao(produto));
    const emPromocao = processados.filter(p => p.emPromocao);
    console.log(`📦 Total de produtos: ${processados.length}, em promoção: ${emPromocao.length}`);
    return processados;
  }

  return {
    mapaPromocoesPorId,
    getProdutoComPromocao,
    processarProdutosComPromocao,
    loadingPromocoes
  };
}