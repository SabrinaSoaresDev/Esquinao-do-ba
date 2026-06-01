// src/contexts/CarrinhoContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CarrinhoContext = createContext({});

export function useCarrinho() {
  return useContext(CarrinhoContext);
}

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [total, setTotal] = useState(0);
  const [quantidadeItens, setQuantidadeItens] = useState(0);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    calcularTotais();
  }, [carrinho]);

  function calcularTotais() {
    const novoTotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const novaQuantidade = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    setTotal(novoTotal);
    setQuantidadeItens(novaQuantidade);
  }

  function adicionarAoCarrinho(produto, quantidade = 1) {
    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        toast.success(`Mais um ${produto.nome} adicionado ao carrinho!`);
        return prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      }
      toast.success(`${produto.nome} adicionado ao carrinho!`);
      return [...prev, { ...produto, quantidade }];
    });
  }

  function removerDoCarrinho(id) {
    const item = carrinho.find(i => i.id === id);
    toast.error(`${item?.nome} removido do carrinho`);
    setCarrinho(prev => prev.filter(item => item.id !== id));
  }

  function atualizarQuantidade(id, quantidade) {
    if (quantidade <= 0) {
      removerDoCarrinho(id);
      return;
    }
    setCarrinho(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantidade } : item
      )
    );
  }

  function limparCarrinho() {
    setCarrinho([]);
    toast('Carrinho limpo!');
  }

  // Função para gerar mensagem do WhatsApp
  function gerarMensagemWhatsApp(clienteInfo) {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    let mensagem = `🍽️ *NOVO PEDIDO - MERCEARIA* 🍽️\n`;
    mensagem += `📅 Data: ${dataAtual} - ${horaAtual}\n`;
    mensagem += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    mensagem += `📋 *DADOS DO CLIENTE:*\n`;
    mensagem += `👤 Nome: ${clienteInfo.nome || 'Não informado'}\n`;
    mensagem += `📞 Telefone: ${clienteInfo.telefone || 'Não informado'}\n`;
    mensagem += `📍 Endereço: ${clienteInfo.endereco || 'Não informado'}\n`;
    mensagem += `🏠 Complemento: ${clienteInfo.complemento || 'Nenhum'}\n`;
    mensagem += `🔄 Troco para: ${clienteInfo.troco || 'Não precisa'}\n\n`;
    
    mensagem += `🛍️ *ITENS DO PEDIDO:*\n`;
    carrinho.forEach((item, index) => {
      mensagem += `${index + 1}. ${item.nome}\n`;
      mensagem += `   📦 Quantidade: ${item.quantidade}\n`;
      mensagem += `   💰 Preço: R$ ${(item.preco * item.quantidade).toFixed(2)}\n\n`;
    });
    
    mensagem += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensagem += `💰 *TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*\n`;
    mensagem += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (clienteInfo.observacao) {
      mensagem += `📝 *OBSERVAÇÃO:*\n${clienteInfo.observacao}\n\n`;
    }
    
    mensagem += `✨ *FORMA DE ENTREGA:*\n`;
    mensagem += clienteInfo.entrega === 'delivery' 
      ? `🚚 Delivery para o endereço informado\n⏱️ Prazo estimado: 60 minutos, entregas somente em Monte formoso-mg` 
      : `🏪 Retirada na loja\n📍 Rua Herculado Silva, 148 - Centro, Monte Formoso-MG`;
    
    return encodeURIComponent(mensagem);
  }

  function finalizarPedido(clienteInfo) {
    const mensagem = gerarMensagemWhatsApp(clienteInfo);
    const numeroWhatsApp = '5533988270853'; // WhatsApp da mercearia
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(url, '_blank');
    limparCarrinho();
  }

  return (
    <CarrinhoContext.Provider value={{
      carrinho,
      total,
      quantidadeItens,
      adicionarAoCarrinho,
      removerDoCarrinho,
      atualizarQuantidade,
      limparCarrinho,
      finalizarPedido
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}