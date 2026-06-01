// src/pages/admin/AdminProdutos.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { 
  Image, 
  X, 
  Upload, 
  Search,
  Filter,
  ArrowUpDown,
  Package,
  Tag,
  DollarSign,
  CheckCircle,
  Star
} from 'lucide-react';

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImagem, setPreviewImagem] = useState('');
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroEstoque, setFiltroEstoque] = useState('todos');
  const [filtroDestaque, setFiltroDestaque] = useState('todos');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nome');
  const [ordenarDir, setOrdenarDir] = useState('asc');
  const [showFiltros, setShowFiltros] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    categoria: '',
    descricao: '',
    imagem: '',
    emEstoque: true,
    destaque: false,
    precoAntigo: ''
  });

  const categorias = ['Hortifruti', 'Açougue', 'Padaria', 'Bebidas', 
                       'Mercearia', 'Limpeza', 'Higiene', 'Outros'];

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Aplicar filtros sempre que os critérios mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [produtos, searchTerm, filtroCategoria, filtroEstoque, filtroDestaque, precoMin, precoMax, ordenarPor, ordenarDir]);

  async function carregarProdutos() {
    setLoading(true);
    try {
      const q = query(collection(db, 'produtos'), orderBy('nome'));
      const snapshot = await getDocs(q);
      const produtosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdutos(produtosList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let filtrados = [...produtos];

    // Filtro por busca (nome ou descrição)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nome?.toLowerCase().includes(term) || 
        p.descricao?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoria
    if (filtroCategoria !== 'todas') {
      filtrados = filtrados.filter(p => p.categoria === filtroCategoria);
    }

    // Filtro por estoque
    if (filtroEstoque === 'emEstoque') {
      filtrados = filtrados.filter(p => p.emEstoque === true);
    } else if (filtroEstoque === 'semEstoque') {
      filtrados = filtrados.filter(p => p.emEstoque === false);
    }

    // Filtro por destaque
    if (filtroDestaque === 'destaque') {
      filtrados = filtrados.filter(p => p.destaque === true);
    } else if (filtroDestaque === 'naoDestaque') {
      filtrados = filtrados.filter(p => p.destaque !== true);
    }

    // Filtro por faixa de preço
    if (precoMin) {
      filtrados = filtrados.filter(p => p.preco >= parseFloat(precoMin));
    }
    if (precoMax) {
      filtrados = filtrados.filter(p => p.preco <= parseFloat(precoMax));
    }

    // Ordenação
    filtrados.sort((a, b) => {
      let valorA, valorB;
      
      switch(ordenarPor) {
        case 'nome':
          valorA = a.nome || '';
          valorB = b.nome || '';
          break;
        case 'preco':
          valorA = a.preco || 0;
          valorB = b.preco || 0;
          break;
        case 'data':
          valorA = a.createdAt || a.updatedAt || '';
          valorB = b.createdAt || b.updatedAt || '';
          break;
        default:
          valorA = a.nome || '';
          valorB = b.nome || '';
      }
      
      if (ordenarDir === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    setProdutosFiltrados(filtrados);
  }

  function limparFiltros() {
    setSearchTerm('');
    setFiltroCategoria('todas');
    setFiltroEstoque('todos');
    setFiltroDestaque('todos');
    setPrecoMin('');
    setPrecoMax('');
    setOrdenarPor('nome');
    setOrdenarDir('asc');
  }

  // Função para converter imagem para Base64
  function converterImagemParaBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Por favor, selecione uma imagem válida (JPEG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB para ser salva no Firestore');
      return;
    }

    setUploading(true);
    try {
      const base64 = await converterImagemParaBase64(file);
      setFormData({ ...formData, imagem: base64 });
      setPreviewImagem(base64);
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      alert('Erro ao processar a imagem');
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setFormData({ ...formData, imagem: '' });
    setPreviewImagem('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.nome || !formData.preco || !formData.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const dados = {
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        categoria: formData.categoria,
        descricao: formData.descricao || '',
        imagem: formData.imagem || '',
        emEstoque: formData.emEstoque,
        destaque: formData.destaque || false,
        precoAntigo: formData.precoAntigo ? parseFloat(formData.precoAntigo) : null,
        updatedAt: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'produtos', editando.id), dados);
        alert('Produto atualizado com sucesso!');
      } else {
        dados.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'produtos'), dados);
        alert('Produto adicionado com sucesso!');
      }
      
      setModalOpen(false);
      resetForm();
      carregarProdutos();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  }

  async function handleDelete(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteDoc(doc(db, 'produtos', id));
        alert('Produto excluído!');
        carregarProdutos();
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir produto');
      }
    }
  }

  function resetForm() {
    setFormData({
      nome: '',
      preco: '',
      categoria: '',
      descricao: '',
      imagem: '',
      emEstoque: true,
      destaque: false,
      precoAntigo: ''
    });
    setPreviewImagem('');
    setEditando(null);
  }

  function editarProduto(produto) {
    setEditando(produto);
    setFormData({
      nome: produto.nome,
      preco: produto.preco,
      categoria: produto.categoria,
      descricao: produto.descricao || '',
      imagem: produto.imagem || '',
      emEstoque: produto.emEstoque ?? true,
      destaque: produto.destaque || false,
      precoAntigo: produto.precoAntigo || ''
    });
    setPreviewImagem(produto.imagem || '');
    setModalOpen(true);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-green-600" />
          Gerenciar Produtos
        </h1>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> Novo Produto
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Botão mostrar/esconder filtros */}
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filtros
            {(filtroCategoria !== 'todas' || filtroEstoque !== 'todos' || filtroDestaque !== 'todos' || precoMin || precoMax) && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">!</span>
            )}
          </button>

          {/* Ordenação */}
          <div className="flex gap-2">
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="nome">Ordenar por Nome</option>
              <option value="preco">Ordenar por Preço</option>
              <option value="data">Ordenar por Data</option>
            </select>
            <button
              onClick={() => setOrdenarDir(ordenarDir === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Painel de Filtros Avançados */}
        {showFiltros && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Estoque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Estoque</label>
              <select
                value={filtroEstoque}
                onChange={(e) => setFiltroEstoque(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="emEstoque">Em Estoque</option>
                <option value="semEstoque">Sem Estoque</option>
              </select>
            </div>

            {/* Filtro por Destaque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destaque</label>
              <select
                value={filtroDestaque}
                onChange={(e) => setFiltroDestaque(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="destaque">Em Destaque</option>
                <option value="naoDestaque">Não Destaque</option>
              </select>
            </div>

            {/* Filtro por Faixa de Preço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faixa de Preço</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botão Limpar Filtros */}
        {(searchTerm || filtroCategoria !== 'todas' || filtroEstoque !== 'todos' || filtroDestaque !== 'todos' || precoMin || precoMax) && (
          <div className="mt-4 text-right">
            <button
              onClick={limparFiltros}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
            >
              <X className="w-4 h-4" />
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Informações de resultados */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando <span className="font-bold text-green-600">{produtosFiltrados.length}</span> de{' '}
          <span className="font-bold">{produtos.length}</span> produtos
        </p>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destaque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      {produto.imagem ? (
                        <img 
                          src={produto.imagem} 
                          alt={produto.nome}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{produto.descricao}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {produto.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-green-600">R$ {produto.preco?.toFixed(2)}</div>
                      {produto.precoAntigo && (
                        <div className="text-xs text-gray-400 line-through">R$ {produto.precoAntigo.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${
                        produto.emEstoque ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <CheckCircle size={12} />
                        {produto.emEstoque ? 'Em estoque' : 'Sem estoque'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {produto.destaque && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                          <Star size={12} />
                          Destaque
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        onClick={() => editarProduto(produto)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulário */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">
          {editando ? 'Editar Produto' : 'Novo Produto'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto px-1">
          {/* Upload de imagem */}
          <div>
            <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {previewImagem ? (
                <div className="relative inline-block">
                  <img 
                    src={previewImagem} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="mt-2">
                    <label className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-1 text-sm">
                      <Upload size={14} />
                      Trocar imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Image size={48} className="text-gray-400" />
                    <span className="text-gray-600">
                      {uploading ? 'Convertendo imagem...' : 'Clique para selecionar uma imagem'}
                    </span>
                    <span className="text-xs text-gray-400">Máximo 2MB - JPEG, PNG, WEBP</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Nome do produto */}
          <div>
            <label className="block text-sm font-medium mb-1 text-red-600">* Nome</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Arroz Branco Tipo 1"
            />
          </div>
          
          {/* Preços */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-red-600">* Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.preco}
                onChange={(e) => setFormData({...formData, preco: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço antigo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.precoAntigo}
                onChange={(e) => setFormData({...formData, precoAntigo: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Para mostrar desconto"
              />
            </div>
          </div>
          
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-1 text-red-600">* Categoria</label>
            <select
              required
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione uma categoria...</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Descreva o produto..."
            />
          </div>
          
          {/* Opções */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emEstoque}
                onChange={(e) => setFormData({...formData, emEstoque: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium">Produto em estoque</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.destaque}
                onChange={(e) => setFormData({...formData, destaque: e.target.checked})}
                className="w-4 h-4 text-yellow-500 rounded"
              />
              <span className="text-sm font-medium">⭐ Produto em destaque (aparece na página inicial)</span>
            </label>
          </div>
          
          {/* Botões */}
          <div className="flex gap-2 pt-4 border-t">
            <button 
              type="submit" 
              disabled={uploading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {uploading ? 'Processando...' : 'Salvar Produto'}
            </button>
            <button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}