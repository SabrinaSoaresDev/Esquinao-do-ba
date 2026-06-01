// src/pages/Promocoes.jsx
import { usePromocoes } from '../hooks/usePromocoes'
import Spinner from '../components/Spinner'

function formatarPreco(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(ts) {
  if (!ts) return 'Sem validade'
  // Aceita tanto Timestamp Firebase quanto string
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR')
}

function calcDesconto(original, promo) {
  return Math.round((1 - promo / original) * 100)
}

// Função para verificar se a promoção ainda é válida
function isPromocaoValida(promocao) {
  // Se não tem data de validade, considera sempre válida
  if (!promocao.validoAte) return true
  
  // Converte para Date (suporta Timestamp Firebase e string)
  const dataValidade = promocao.validoAte?.toDate 
    ? promocao.validoAte.toDate() 
    : new Date(promocao.validoAte)
  
  const agora = new Date()
  
  // Compara apenas as datas (ignora horas)
  dataValidade.setHours(23, 59, 59, 999)
  
  return dataValidade >= agora
}

export default function Promocoes() {
  const { promocoes, carregando } = usePromocoes()
  
  // Filtra apenas as promoções válidas
  const promocoesValidas = promocoes.filter(isPromocaoValida)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-1">🏷️ Promoções da Semana</h1>
        <p className="text-gray-500">Aproveite nossas ofertas especiais enquanto durar o estoque!</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20"><Spinner tamanho={10} /></div>
      ) : promocoesValidas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🏷️</p>
          <p className="text-gray-400 text-lg font-semibold">Nenhuma promoção no momento.</p>
          <p className="text-gray-400 text-sm mt-1">Volte em breve para novidades!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {promocoesValidas.map((p) => {
            const desc = calcDesconto(p.precoOriginal, p.precoPromocional)
            // Verificar se tem imagem (suporta tanto imagemUrl quanto imagemBase64)
            const imagem = p.imagemUrl || p.imagemBase64 || null
            
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 hover:border-yellow-400"
              >
                {/* Imagem ou emoji */}
                {imagem ? (
                  <div className="relative">
                    <img 
                      src={imagem} 
                      alt={p.nome} 
                      className="w-full h-44 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `
                          <div class="relative h-44 bg-green-50 flex items-center justify-center text-6xl">
                            ${p.emoji || '🛒'}
                            <span class="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                              -${desc}%
                            </span>
                          </div>
                        `
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                      -{desc}%
                    </span>
                  </div>
                ) : (
                  <div className="relative h-44 bg-green-50 flex items-center justify-center text-6xl">
                    {p.emoji || '🛒'}
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                      -{desc}%
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-bold text-base mb-2 leading-tight">{p.nome}</h3>
                  {p.descricao && (
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">{p.descricao}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-gray-400 line-through text-sm">
                      {formatarPreco(p.precoOriginal)}
                    </span>
                    <span className="font-bold text-green-700 text-2xl">
                      {formatarPreco(p.precoPromocional)}
                    </span>
                  </div>
                  <p className="text-red-500 text-xs font-black mb-1">ECONOMIZE {desc}%</p>
                  <p className="text-gray-400 text-xs">
                    Válido até: {formatarData(p.validoAte)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}