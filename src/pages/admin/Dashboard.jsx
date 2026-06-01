import { usePromocoes } from '../../hooks/usePromocoes'
import { useProdutos } from '../../hooks/useProdutos'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { Link } from 'react-router-dom'
import {
  TagIcon,
  ShoppingCartIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

function formatarPreco(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcDesconto(original, promo) {
  return Math.round((1 - promo / original) * 100)
}

const cards = [
  {
    label: 'Gerenciar Promoções',
    descricao: 'Adicione e gerencie as ofertas da semana',
    icon: TagIcon,
    to: '/admin/promocoes',
    cor: 'bg-red-50 text-red-600',
    borda: 'border-red-100',
  },
  {
    label: 'Gerenciar Produtos',
    descricao: 'Cadastre e edite seu catálogo de produtos',
    icon: ShoppingCartIcon,
    to: '/admin/produtos',
    cor: 'bg-verde-50 text-verde-600',
    borda: 'border-verde-100',
  },
  {
    label: 'Horários',
    descricao: 'Defina os dias e horários de funcionamento',
    icon: ClockIcon,
    to: '/admin/horarios',
    cor: 'bg-blue-50 text-blue-600',
    borda: 'border-blue-100',
  },
  {
    label: 'Configurações',
    descricao: 'Altere telefone, slogan e redes sociais',
    icon: Cog6ToothIcon,
    to: '/admin/configuracoes',
    cor: 'bg-purple-50 text-purple-600',
    borda: 'border-purple-100',
  },
]

export default function Dashboard() {
  const { promocoes } = usePromocoes()
  const { produtos } = useProdutos()
  const { config } = useConfiguracoes()

  const categorias = new Set(produtos.map((p) => p.categoria).filter(Boolean))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-baloo font-black text-3xl text-verde-700">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bem-vindo ao painel de administração do Esquinão do Bá!
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { num: promocoes.length, label: 'Promoções', cor: 'text-red-600' },
          { num: produtos.length, label: 'Produtos', cor: 'text-verde-600' },
          { num: categorias.size, label: 'Categorias', cor: 'text-blue-600' },
          { num: config.horarios?.filter((h) => h.aberto).length ?? 0, label: 'Dias abertos', cor: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`font-baloo font-black text-4xl ${s.cor}`}>{s.num}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <h2 className="font-baloo font-bold text-xl text-gray-700 mb-4">Acesso rápido</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {cards.map(({ label, descricao, icon: Icon, to, cor, borda }) => (
          <Link
            key={to}
            to={to}
            className={`bg-white border ${borda} rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all group`}
          >
            <div className={`w-12 h-12 ${cor} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">{label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{descricao}</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Últimas promoções */}
      {promocoes.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-baloo font-bold text-lg text-gray-700">Promoções recentes</h2>
            <Link to="/admin/promocoes" className="text-xs font-bold text-verde-500 hover:text-verde-700">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {promocoes.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.emoji || '🛒'}</span>
                  <span className="text-sm font-semibold text-gray-700">{p.nome}</span>
                </div>
                <div className="text-right">
                  <p className="font-baloo font-black text-verde-700 text-sm">
                    {formatarPreco(p.precoPromocional)}
                  </p>
                  <p className="text-red-400 text-xs font-bold">
                    -{calcDesconto(p.precoOriginal, p.precoPromocional)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}