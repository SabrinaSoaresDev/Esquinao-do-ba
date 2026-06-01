// src/pages/admin/AdminPromocoes.jsx
import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '../../firebase'
import { usePromocoes } from '../../hooks/usePromocoes'
import Modal from '../../components/Modal'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon 
} from '@heroicons/react/24/outline'

const EMOJIS = ['🛒','🍺','🥤','🍚','🫘','🛢️','🧴','🧼','🥩','🧀','🥛','🍌','🍫','🍃','🫧','🥗','🧃','🍞','🛍️']

const VAZIO = {
  emoji: '🛒',
  produtoId: '',
  nome: '',
  descricao: '',
  precoOriginal: '',
  precoPromocional: '',
  validoAte: '',
  imagemBase64: '',
  ativa: true
}

function formatarPreco(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcDesconto(original, promo) {
  return Math.round((1 - promo / original) * 100)
}

// Função para converter imagem para Base64
function converterImagemParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export default function AdminPromocoes() {
  const { promocoes, carregando } = usePromocoes()
  const [produtos, setProdutos] = useState([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [arquivoImagem, setArquivoImagem] = useState(null)
  const [previewImagem, setPreviewImagem] = useState('')

  // Carregar produtos para o select
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const q = query(collection(db, 'produtos'), orderBy('nome'))
        const snapshot = await getDocs(q)
        const produtosList = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          preco: doc.data().preco,
          imagem: doc.data().imagem || null
        }))
        setProdutos(produtosList)
        console.log('📦 Produtos carregados:', produtosList.length)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        toast.error('Erro ao carregar lista de produtos')
      } finally {
        setCarregandoProdutos(false)
      }
    }
    carregarProdutos()
  }, [])

  function abrirNovo() {
    setForm({...VAZIO})
    setEditandoId(null)
    setArquivoImagem(null)
    setPreviewImagem('')
    setModalAberto(true)
  }

  function abrirEditar(p) {
    console.log('Editando promoção:', p)
    
    setForm({
      emoji: p.emoji || '🛒',
      produtoId: p.produtoId || '',
      nome: p.nome || '',
      descricao: p.descricao || '',
      precoOriginal: p.precoOriginal || '',
      precoPromocional: p.precoPromocional || '',
      validoAte: p.validoAte?.toDate 
        ? p.validoAte.toDate().toISOString().split('T')[0]
        : p.validoAte || '',
      imagemBase64: p.imagemBase64 || p.imagemUrl || '',
      ativa: p.ativa !== undefined ? p.ativa : true
    })
    setEditandoId(p.id)
    setArquivoImagem(null)
    setPreviewImagem(p.imagemBase64 || p.imagemUrl || '')
    setModalAberto(true)
  }

  // Quando selecionar um produto, preencher nome e preço original automaticamente
  function handleProdutoChange(produtoId) {
    const produtoSelecionado = produtos.find(p => p.id === produtoId)
    if (produtoSelecionado) {
      console.log('Produto selecionado:', produtoSelecionado)
      setForm(prev => ({
        ...prev,
        produtoId: produtoId,
        nome: produtoSelecionado.nome,
        precoOriginal: produtoSelecionado.preco
      }))
      // Se a promoção não tiver imagem, pode usar a imagem do produto como fallback
      if (!prev.imagemBase64 && produtoSelecionado.imagem) {
        setPreviewImagem(produtoSelecionado.imagem)
      }
    } else {
      setForm(prev => ({
        ...prev,
        produtoId: produtoId,
        nome: '',
        precoOriginal: ''
      }))
    }
  }

  async function handleImagem(e) {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB para Base64.')
      return
    }
    
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Formato inválido. Use JPEG, PNG ou WEBP.')
      return
    }
    
    setArquivoImagem(file)
    setPreviewImagem(URL.createObjectURL(file))
    
    try {
      const base64 = await converterImagemParaBase64(file)
      setForm(prev => ({ ...prev, imagemBase64: base64 }))
      toast.success('Imagem processada com sucesso!')
    } catch (error) {
      console.error('Erro ao converter imagem:', error)
      toast.error('Erro ao processar imagem')
    }
  }

  async function salvar() {
    // Validação: verificar se um produto foi selecionado
    if (!form.produtoId) {
      toast.error('Por favor, selecione um produto da lista.')
      return
    }
    
    if (!form.precoPromocional || form.precoPromocional <= 0) {
      toast.error('Por favor, informe o preço promocional válido.')
      return
    }
    
    if (Number(form.precoPromocional) >= Number(form.precoOriginal)) {
      toast.error('O preço promocional deve ser menor que o preço original.')
      return
    }

    setSalvando(true)
    
    try {
      const dados = {
        produtoId: form.produtoId,  // ← Vincula pelo ID do produto
        emoji: form.emoji || '🛒',
        nome: form.nome.trim(),
        descricao: form.descricao ? form.descricao.trim() : '',
        precoOriginal: Number(form.precoOriginal),
        precoPromocional: Number(form.precoPromocional),
        validoAte: form.validoAte || null,
        imagemBase64: form.imagemBase64 || '',
        ativa: form.ativa !== undefined ? form.ativa : true,
        atualizadoEm: serverTimestamp()
      }

      console.log('💾 Salvando promoção:', dados)

      if (editandoId) {
        await updateDoc(doc(db, 'promocoes', editandoId), dados)
        toast.success('Promoção atualizada com sucesso!')
      } else {
        dados.criadoEm = serverTimestamp()
        await addDoc(collection(db, 'promocoes'), dados)
        toast.success('Promoção adicionada com sucesso!')
      }
      
      setModalAberto(false)
      
      // Recarregar a página para atualizar a lista
      setTimeout(() => {
        window.location.reload()
      }, 500)
      
    } catch (err) {
      console.error('Erro detalhado:', err)
      toast.error(`Erro ao salvar: ${err.message}`)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(p) {
    if (!confirm(`Tem certeza que deseja excluir a promoção "${p.nome}"?`)) return
    
    try {
      await deleteDoc(doc(db, 'promocoes', p.id))
      toast.success('Promoção excluída com sucesso!')
    } catch (err) {
      console.error('Erro ao excluir:', err)
      toast.error('Erro ao excluir promoção.')
    }
  }

  if (carregandoProdutos) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-700">🏷️ Promoções</h1>
          <p className="text-gray-500 text-sm">
            {promocoes.length} promoção(ões) cadastrada(s)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            💡 Dica: Selecione um produto existente para criar a promoção
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Nova Promoção
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : promocoes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-5xl mb-3">🏷️</p>
          <p className="text-gray-400 font-semibold">Nenhuma promoção cadastrada.</p>
          <button
            onClick={abrirNovo}
            className="mt-4 text-green-500 font-bold text-sm hover:text-green-700"
          >
            + Adicionar primeira promoção
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promocoes.map((p) => {
            const desconto = calcDesconto(p.precoOriginal, p.precoPromocional)
            const imagem = p.imagemBase64 || p.imagemUrl || null
            
            return (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md"
              >
                {imagem ? (
                  <img 
                    src={imagem} 
                    alt={p.nome} 
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="h-36 bg-green-50 flex items-center justify-center text-5xl">
                    {p.emoji || '🛒'}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm flex-1 pr-2 leading-tight">{p.nome}</p>
                    <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full shrink-0">
                      -{desconto}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400 line-through text-xs">
                      {formatarPreco(p.precoOriginal)}
                    </span>
                    <span className="font-bold text-green-700 text-lg">
                      {formatarPreco(p.precoPromocional)}
                    </span>
                  </div>
                  {p.descricao && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.descricao}</p>
                  )}
                  {/* Mostrar se está vinculado a um produto */}
                  <p className="text-xs text-gray-400 mb-2">
                    {p.produtoId ? '✅ Vinculado a um produto' : '⚠️ Não vinculado'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      <PencilIcon className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => excluir(p)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalAberto} onClose={() => !salvando && setModalAberto(false)}>
        <h2 className="text-xl font-bold mb-4">
          {editandoId ? 'Editar Promoção' : 'Nova Promoção'}
        </h2>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Seleção de Produto - ESSENCIAL */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              📦 Selecione o produto * (OBRIGATÓRIO)
            </label>
            <select
              value={form.produtoId}
              onChange={(e) => handleProdutoChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all"
              required
            >
              <option value="">-- Selecione um produto da lista --</option>
              {produtos.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} - R$ {produto.preco.toFixed(2)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ O produto precisa estar cadastrado primeiro em "Gerenciar Produtos"
            </p>
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              🎨 Ícone (usado se não tiver imagem)
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${
                    form.emoji === e
                      ? 'bg-green-500 ring-2 ring-green-400 ring-offset-1'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Imagem em Base64 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              🖼️ Foto do produto (opcional, máx 2MB)
            </label>
            {previewImagem ? (
              <div className="relative mb-2">
                <img 
                  src={previewImagem} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-xl" 
                />
                <button
                  type="button"
                  onClick={() => { 
                    setPreviewImagem('')
                    setArquivoImagem(null)
                    setForm((f) => ({ ...f, imagemBase64: '' }))
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all">
                <PhotoIcon className="w-7 h-7 text-gray-300 mb-1" />
                <span className="text-xs text-gray-400">Clique para selecionar imagem (JPEG, PNG até 2MB)</span>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg,image/webp" 
                  onChange={handleImagem} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {/* Nome (readonly, preenchido automaticamente) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              📝 Nome do produto
            </label>
            <input
              value={form.nome}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Preenchido automaticamente ao selecionar o produto</p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              📄 Descrição (opcional)
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Ex: Marca Tio João, tipo 1"
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 transition-all resize-none"
            />
          </div>

          {/* Preço original (readonly) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              💰 Preço original (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.precoOriginal}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Preenchido automaticamente ao selecionar o produto</p>
          </div>

          {/* Preço promocional */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              🏷️ Preço promocional (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.precoPromocional}
              onChange={(e) => setForm((f) => ({ ...f, precoPromocional: e.target.value }))}
              placeholder="7.99"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 transition-all"
            />
          </div>

          {/* Preview desconto */}
          {form.precoOriginal && form.precoPromocional && 
           Number(form.precoPromocional) < Number(form.precoOriginal) && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm text-green-700 font-bold text-center">
              🎉 Desconto de {calcDesconto(form.precoOriginal, form.precoPromocional)}% — 
              cliente economiza {formatarPreco(Number(form.precoOriginal) - Number(form.precoPromocional))}
            </div>
          )}

          {/* Validade */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              📅 Válido até (opcional)
            </label>
            <input
              type="date"
              value={form.validoAte}
              onChange={(e) => setForm((f) => ({ ...f, validoAte: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativa}
                onChange={(e) => setForm((f) => ({ ...f, ativa: e.target.checked }))}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium">✅ Promoção ativa</span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => setModalAberto(false)}
              disabled={salvando}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || !form.produtoId}
              className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                editandoId ? 'Salvar alterações' : 'Adicionar Promoção'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}