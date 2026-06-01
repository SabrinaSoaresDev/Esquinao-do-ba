// src/components/CarrinhoLateral.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { 
  ShoppingCart,  // ← Mudado de ShoppingBagIcon para ShoppingCart
  X, 
  Minus, 
  Plus, 
  Trash2,
  CreditCard,
  Truck,
  Store
} from 'lucide-react';  // ← Usando lucide-react

export default function CarrinhoLateral() {
  const [aberto, setAberto] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [animando, setAnimando] = useState(false);
  const { carrinho, total, quantidadeItens, atualizarQuantidade, removerDoCarrinho, finalizarPedido } = useCarrinho();
  
  const [clienteInfo, setClienteInfo] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    complemento: '',
    referencia: '',
    troco: '',
    observacao: '',
    entrega: 'delivery'
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && aberto) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [aberto]);

  function handleOpen() {
    setAnimando(true);
    setAberto(true);
    document.body.style.overflow = 'hidden';
  }

  function handleClose() {
    setAnimando(false);
    setTimeout(() => {
      setAberto(false);
      setShowCheckout(false);
      document.body.style.overflow = 'auto';
    }, 300);
  }

  function handleFinalizarPedido(e) {
    e.preventDefault();
    if (!clienteInfo.nome || !clienteInfo.nome.trim()) {
      alert('Por favor, digite seu nome!');
      return;
    }
    if (!clienteInfo.telefone || !clienteInfo.telefone.trim()) {
      alert('Por favor, digite seu WhatsApp!');
      return;
    }
    if (clienteInfo.entrega === 'delivery' && !clienteInfo.endereco) {
      alert('Por favor, informe o endereço para entrega!');
      return;
    }
    finalizarPedido(clienteInfo);
    handleClose();
    setShowCheckout(false);
    setClienteInfo({
      nome: '',
      telefone: '',
      endereco: '',
      complemento: '',
      referencia: '',
      troco: '',
      observacao: '',
      entrega: 'delivery'
    });
  }

  const frete = total > 100 ? 0 : 10.00;  // ← Mudado de 50 para 100
const totalComFrete = total + frete;

  return (
    <>
      {/* Botão flutuante do carrinho */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center gap-2 group"
      >
        <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition" />
        {quantidadeItens > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {quantidadeItens}
          </span>
        )}
      </button>

      {/* Overlay */}
      {aberto && (
        <div 
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${animando ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleClose}
        />
      )}

      {/* Sidebar Carrinho */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transition-transform duration-300 transform ${
          animando ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            Meu Carrinho
            <span className="text-sm text-gray-400 ml-2">({quantidadeItens} itens)</span>
          </h2>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {carrinho.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-16 h-16 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
              <Link 
                to="/produtos" 
                onClick={handleClose} 
                className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Começar a comprar
              </Link>
            </div>
          ) : !showCheckout ? (
            <>
              {/* Lista de itens */}
              <div className="space-y-4 mb-6">
                {carrinho.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b pb-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.imagem || 'https://via.placeholder.com/80'} 
                        alt={item.nome} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.nome}</h3>
                      <p className="text-green-600 font-bold">R$ {item.preco.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)} 
                          className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantidade}</span>
                        <button 
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)} 
                          className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => removerDoCarrinho(item.id)} 
                          className="ml-2 text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cupom de desconto */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Cupom de desconto" 
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Resumo */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Frete:</span>
                  </div>
                  <span className="font-medium">
                    {frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`}
                  </span>
                </div>
                {total > 100 && (
                    <div className="bg-green-50 text-green-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Parabéns! Você ganhou frete grátis!
                    </div>
                    )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {totalComFrete.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={() => setShowCheckout(true)} 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all mt-4"
                >
                  Finalizar Pedido
                </button>
                
                <button 
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Continuar comprando
                </button>
              </div>
            </>
          ) : (
            // Formulário de checkout
            <form onSubmit={handleFinalizarPedido} className="space-y-4">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Dados para {clienteInfo.entrega === 'delivery' ? 'entrega' : 'retirada'}</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Seu nome *</label>
                <input
                  type="text"
                  required
                  value={clienteInfo.nome}
                  onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={clienteInfo.telefone}
                  onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="(33) 98827-0853"
                />
                <p className="text-xs text-gray-400 mt-1">Enviaremos a confirmação do pedido</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Opção de entrega *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${clienteInfo.entrega === 'delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      value="delivery"
                      checked={clienteInfo.entrega === 'delivery'}
                      onChange={(e) => setClienteInfo({...clienteInfo, entrega: e.target.value})}
                      className="hidden"
                    />
                    <Truck className="w-5 h-5" />
                    <span>Delivery</span>
                  </label>
                  <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${clienteInfo.entrega === 'retirada' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      value="retirada"
                      checked={clienteInfo.entrega === 'retirada'}
                      onChange={(e) => setClienteInfo({...clienteInfo, entrega: e.target.value})}
                      className="hidden"
                    />
                    <Store className="w-5 h-5" />
                    <span>Retirar na loja</span>
                  </label>
                </div>
              </div>

              {clienteInfo.entrega === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Endereço *</label>
                    <input
                      type="text"
                      required
                      value={clienteInfo.endereco}
                      onChange={(e) => setClienteInfo({...clienteInfo, endereco: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Complemento</label>
                    <input
                      type="text"
                      value={clienteInfo.complemento}
                      onChange={(e) => setClienteInfo({...clienteInfo, complemento: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Apto, casa, bloco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Ponto de referência</label>
                    <input
                      type="text"
                      value={clienteInfo.referencia}
                      onChange={(e) => setClienteInfo({...clienteInfo, referencia: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Próximo ao mercado, igreja..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Precisa de troco?</label>
                <input
                  type="text"
                  value={clienteInfo.troco}
                  onChange={(e) => setClienteInfo({...clienteInfo, troco: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: Troco para R$ 50,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Observações</label>
                <textarea
                  value={clienteInfo.observacao}
                  onChange={(e) => setClienteInfo({...clienteInfo, observacao: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Alguma observação sobre o pedido?"
                />
              </div>

              {/* Resumo do pedido no checkout */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-gray-800 mb-2">Resumo do pedido:</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{quantidadeItens} itens:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete:</span>
                  <span>{frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {totalComFrete.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCheckout(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Enviar Pedido
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}