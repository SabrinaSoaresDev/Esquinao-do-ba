// src/pages/Produtos.jsx
import { useState, useMemo } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { useProdutoComPromocao } from '../hooks/useProdutoComPromocao';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  FunnelIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useCarrinho } from '../contexts/CarrinhoContext';

export default function Produtos() {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { processarProdutosComPromocao, loadingPromocoes } = useProdutoComPromocao();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [precoMaximo, setPrecoMaximo] = useState(1000);
  const [ordenarPor, setOrdenarPor] = useState('nome');
  const [showFiltros, setShowFiltros] = useState(false);
  const { adicionarAoCarrinho } = useCarrinho();

  // Processar produtos com promoção - garantir que sempre tenha um array
  const produtosComPromocao = useMemo(() => {
    if (!produtos || produtos.length === 0) return [];
    return processarProdutosComPromocao(produtos);
  }, [produtos, processarProdutosComPromocao]);

  // Extrair categorias únicas
  const categorias = useMemo(() => {
    if (!produtosComPromocao || produtosComPromocao.length === 0) return ['todos'];
    const cats = ['todos', ...new Set(produtosComPromocao.map(p => p.categoria).filter(Boolean))];
    return cats;
  }, [produtosComPromocao]);

  // Filtrar produtos
  const produtosFiltrados = useMemo(() => {
    if (!produtosComPromocao || produtosComPromocao.length === 0) return [];

    let filtered = [...produtosComPromocao];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(produto => 
        produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de categoria
    if (categoriaSelecionada !== 'todos') {
      filtered = filtered.filter(produto => produto.categoria === categoriaSelecionada);
    }

    // Filtro de preço
    filtered = filtered.filter(produto => (produto.precoExibir || produto.preco) <= precoMaximo);

    // Ordenação
    switch(ordenarPor) {
      case 'menor-preco':
        filtered.sort((a, b) => (a.precoExibir || a.preco) - (b.precoExibir || b.preco));
        break;
      case 'maior-preco':
        filtered.sort((a, b) => (b.precoExibir || b.preco) - (a.precoExibir || a.preco));
        break;
      case 'nome':
        filtered.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [produtosComPromocao, searchTerm, categoriaSelecionada, precoMaximo, ordenarPor]);

  // Log para debug
  console.log('Produtos carregados:', produtos?.length);
  console.log('Produtos com promoção:', produtosComPromocao?.length);
  console.log('Produtos filtrados:', produtosFiltrados?.length);

  // Estado de carregamento
  if (loadingProdutos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-green-500 font-semibold">Carregando produtos...</div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem produtos
  if (!produtos || produtos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nossos Produtos</h1>
            <p className="text-xl opacity-90">Qualidade e frescor direto para sua casa</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-600">Volte em breve para conferir nossas novidades!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header da página */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Nossos Produtos
          </h1>
          <p className="text-xl opacity-90 animate-fade-in-up animation-delay-200">
            Qualidade e frescor direto para sua casa
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Barra de busca e filtros */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-gray-300 px-6 py-3 rounded-xl"
            >
              <FunnelIcon className="w-5 h-5" />
              Filtros
            </button>

            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="nome">Ordenar por: Nome</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </div>

          {/* Filtros Desktop & Mobile */}
          <div className={`mt-6 ${showFiltros ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="font-bold text-lg">Filtros</h3>
                <button onClick={() => setShowFiltros(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5" />
                    Categorias
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoriaSelecionada(cat)}
                        className={`px-4 py-2 rounded-full transition-all ${
                          categoriaSelecionada === cat
                            ? 'bg-green-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'todos' ? 'Todos' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Preço máximo: R$ {precoMaximo}</h4>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={precoMaximo}
                    onChange={(e) => setPrecoMaximo(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>R$ 0</span>
                    <span>R$ 500</span>
                    <span>R$ 1000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
          <p className="text-gray-600">
            Encontramos <span className="font-bold text-green-600">{produtosFiltrados.length}</span> produtos
          </p>
          {(categoriaSelecionada !== 'todos' || searchTerm) && (
            <button
              onClick={() => {
                setCategoriaSelecionada('todos');
                setSearchTerm('');
                setPrecoMaximo(1000);
              }}
              className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Grid de produtos */}
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Tente ajustar seus filtros ou buscar por outro termo</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoriaSelecionada('todos');
                setPrecoMaximo(1000);
              }}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => {
              // Determinar preço a exibir
              const precoExibir = produto.emPromocao ? produto.precoPromocional : (produto.precoExibir || produto.preco);
              const precoOriginal = produto.emPromocao ? (produto.precoOriginalOriginal || produto.preco) : null;
              const desconto = produto.emPromocao ? produto.descontoPercentual : null;
              
              return (
                <div
                  key={produto.id}
                  className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                    produto.emPromocao ? 'border-2 border-red-400' : ''
                  }`}
                >
                  <div className="relative overflow-hidden h-64 bg-gray-100">
                    <img
                      src={produto.imagem || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
                      alt={produto.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
                      }}
                    />
                    
                    {produto.emPromocao && (
                      <div className="absolute top-4 left-4 z-20">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                          <FireIcon className="w-4 h-4" />
                          OFERTA {desconto}% OFF
                        </div>
                      </div>
                    )}
                    
                    {!produto.emEstoque && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                          Esgotado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                        {produto.categoria || 'Geral'}
                      </span>
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                      {produto.nome}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {produto.descricao || 'Produto de alta qualidade'}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {precoOriginal ? (
                          <div>
                            <span className="text-gray-400 line-through text-sm">
                              R$ {precoOriginal.toFixed(2)}
                            </span>
                            <span className="text-red-600 font-bold text-xl ml-2">
                              R$ {precoExibir.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-green-600 font-bold text-xl">
                            R$ {precoExibir?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => adicionarAoCarrinho({
                          id: produto.id,
                          nome: produto.nome,
                          preco: precoExibir,
                          imagem: produto.imagem
                        })}
                        disabled={!produto.emEstoque}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                          produto.emEstoque 
                            ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}