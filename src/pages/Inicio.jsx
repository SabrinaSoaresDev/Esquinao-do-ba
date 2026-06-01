// src/pages/Inicio.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { usePromocoes } from '../hooks/usePromocoes';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { useAuth } from '../contexts/AuthContext';
import { useClube } from '../contexts/ClubeContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useProdutoComPromocao } from '../hooks/useProdutoComPromocao';
import superOfertasImg from '../assets/super-ofertas.png';
import hortifruttiImg from '../assets/hortifrutti.png';
import clubImg from '../assets/club.png';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  ClockIcon, 
  StarIcon, 
  FireIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { FaWhatsapp } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function Inicio() {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { promocoes, loading: loadingPromocoes } = usePromocoes();
  const { config } = useConfiguracoes();
  const { usuario } = useAuth();
  const { pontos, nivel, descontoDisponivel, usarDesconto } = useClube();
  const { adicionarAoCarrinho } = useCarrinho();
  const { processarProdutosComPromocao } = useProdutoComPromocao();
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [showDescontoModal, setShowDescontoModal] = useState(false);

  // Função para cadastrar newsletter
  function handleCadastrarNewsletter() {
    if (!emailNewsletter) {
      alert('Digite seu email');
      return;
    }
    localStorage.setItem('newsletterEmail', emailNewsletter);
    alert('✅ Email cadastrado com sucesso! Você receberá nossas ofertas.');
    setEmailNewsletter('');
  }

  // Função para resgatar desconto
  function handleResgatarDesconto() {
    if (descontoDisponivel > 0) {
      usarDesconto();
      setShowDescontoModal(true);
      setTimeout(() => setShowDescontoModal(false), 3000);
    }
  }

  // Processar produtos com promoção usando o hook (APENAS UMA VEZ)
  const produtosProcessados = useMemo(() => {
    if (!produtos) return [];
    const processados = processarProdutosComPromocao(produtos);
    // Log para debug
    console.log('Produtos processados:', processados.map(p => ({
      nome: p.nome,
      emPromocao: p.emPromocao,
      precoOriginal: p.preco,
      precoPromocional: p.precoPromocional,
      precoExibir: p.precoExibir
    })));
    return processados;
  }, [produtos, processarProdutosComPromocao]);

  // Produtos em destaque (já com informações de promoção)
  const produtosDestaque = produtosProcessados?.filter(p => p.destaque && p.emEstoque)?.slice(0, 12) || [];

  // Filtrar promoções ativas para a seção de ofertas
  const promocoesAtivas = promocoes?.filter(p => {
    if (!p.ativa) return false;
    if (p.validoAte && new Date(p.validoAte) < new Date()) return false;
    return true;
  }) || [];

  // Categorias do supermercado
  const categoriasSupermercado = [
    { id: 'ofertas', nome: '🔥 Ofertas', icon: FireIcon, cor: 'bg-red-500' },
    { id: 'hortifruti', nome: 'Hortifrúti', icon: '🍎', cor: 'bg-green-500' },
    { id: 'acougue', nome: 'Açougue', icon: '🥩', cor: 'bg-red-600' },
    { id: 'padaria', nome: 'Padaria', icon: '🍞', cor: 'bg-yellow-500' },
    { id: 'bebidas', nome: 'Bebidas', icon: '🥤', cor: 'bg-blue-500' },
    { id: 'mercearia', nome: 'Mercearia', icon: '🛒', cor: 'bg-orange-500' },
    { id: 'limpeza', nome: 'Limpeza', icon: '🧹', cor: 'bg-cyan-500' },
    { id: 'higiene', nome: 'Higiene', icon: '🧴', cor: 'bg-purple-500' },
  ];

  // Banners promocionais
  const banners = [
    { imagem: superOfertasImg},
    { imagem: hortifruttiImg},
    { imagem: clubImg},
  ];

  // Diferenciais do supermercado
  const diferenciais = [
    { icon: TruckIcon, titulo: 'Entrega em até 2h', descricao: 'Para região central', cor: 'bg-blue-500' },
    { icon: CreditCardIcon, titulo: 'Parcele em até 3x', descricao: 'Sem juros no cartão', cor: 'bg-green-500' },
    { icon: ShieldCheckIcon, titulo: 'Produtos frescos', descricao: 'Garantia de qualidade', cor: 'bg-purple-500' },
    { icon: ClockIcon, titulo: 'Horário estendido', descricao: 'Funcionamos aos sábados', cor: 'bg-orange-500' },
  ];

  if (loadingProdutos && loadingPromocoes) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Carregando produtos incríveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Banner Principal */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        effect="fade"
        className="h-[400px] md:h-[500px]"
      >
        {banners.map((banner, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative h-full w-full">
              <img 
                src={banner.imagem} 
                alt={banner.titulo}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.cor} opacity-85`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">{banner.titulo}</h2>
                  <p className="text-xl md:text-2xl mb-6 animate-fade-in-up animation-delay-200">{banner.subtitulo}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Diferenciais */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {diferenciais.map((dif, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                <div className={`${dif.cor} p-2 rounded-full text-white`}>
                  <dif.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{dif.titulo}</h3>
                  <p className="text-xs text-gray-500">{dif.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Ofertas Especiais */}
      {promocoesAtivas.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FireIcon className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">OFERTAS ESPECIAIS</h2>
                </div>
                <p className="text-gray-600">Não perca as melhores promoções do dia</p>
              </div>
              <Link to="/promocoes" className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-1">
                Ver todos <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promocoesAtivas.slice(0, 4).map((promo) => {
                const desconto = Math.round((1 - promo.precoPromocional / promo.precoOriginal) * 100);
                return (
                  <div key={promo.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        {promo.imagemBase64 ? (
                          <img src={promo.imagemBase64} alt={promo.nome} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <span className="text-6xl">{promo.emoji || '🏷️'}</span>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -{desconto}%
                      </div>
                      {desconto > 30 && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                          🔥 SUPER OFERTA
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{promo.nome}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{promo.descricao}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-400 line-through text-sm">R$ {promo.precoOriginal.toFixed(2)}</span>
                        <span className="text-green-600 font-bold text-xl">R$ {promo.precoPromocional.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => adicionarAoCarrinho({
                          id: promo.id,
                          nome: promo.nome,
                          preco: promo.precoPromocional,
                          imagem: promo.imagemBase64
                        })}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingBagIcon className="w-4 h-4" />
                        Comprar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categorias em Destaque */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            Compre por Categoria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categoriasSupermercado.map((cat) => (
              <Link key={cat.id} to={`/produtos?categoria=${cat.id}`} className="group">
                <div className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className={`${cat.cor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                    {typeof cat.icon === 'string' ? (
                      <span className="text-2xl">{cat.icon}</span>
                    ) : (
                      <cat.icon className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-700">{cat.nome}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque - Com promoção integrada */}
      {produtosDestaque.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">⭐ Produtos em Destaque</h2>
                <p className="text-gray-600">Os mais pedidos pelos nossos clientes</p>
              </div>
              <Link to="/produtos" className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1">
                Ver todos <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {produtosDestaque.map((produto) => {
                // O produto já vem com as informações de promoção do hook
                const precoExibir = produto.emPromocao ? produto.precoPromocional : produto.preco;
                const precoOriginal = produto.emPromocao ? produto.precoOriginalOriginal : null;
                const desconto = produto.emPromocao ? produto.descontoPercentual : null;
                
                return (
                  <div key={produto.id} className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all group ${produto.emPromocao ? 'border-2 border-red-300' : ''}`}>
                    <div className="relative h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                      <img 
                        src={produto.imagem || 'https://via.placeholder.com/150'} 
                        alt={produto.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      {!produto.emEstoque && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Esgotado</span>
                        </div>
                      )}
                      {produto.emPromocao && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{desconto}%
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1">{produto.nome}</h3>
                    
                    {/* Preço com promoção */}
                    <div className="mb-2">
                      {precoOriginal ? (
                        <div>
                          <span className="text-gray-400 line-through text-xs">R$ {precoOriginal.toFixed(2)}</span>
                          <span className="text-red-600 font-bold text-base ml-1">R$ {precoExibir.toFixed(2)}</span>
                        </div>
                      ) : (
                        <p className="text-green-600 font-bold text-base">R$ {precoExibir?.toFixed(2)}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-600">4.8</span>
                      </div>
                      <button 
                        onClick={() => adicionarAoCarrinho({
                          id: produto.id,
                          nome: produto.nome,
                          preco: precoExibir,
                          imagem: produto.imagem
                        })}
                        className="text-green-600 hover:text-green-700 transition"
                        disabled={!produto.emEstoque}
                      >
                        <ShoppingBagIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Banner Promocional Meio - Clube de Vantagens */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between p-8">
              <div className="text-white text-center md:text-left mb-6 md:mb-0">
                <h3 className="text-3xl font-bold mb-2">Clube de Vantagens</h3>
                <p className="text-lg opacity-90">Acumule pontos a cada compra e troque por produtos</p>
                <p className="text-sm mt-2">Cadastre-se grátis e ganhe 100 pontos de boas-vindas</p>
              </div>
              <Link 
                to="/cadastro" 
                className="bg-yellow-500 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition shadow-lg"
              >
                Quero me cadastrar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clube Esquinão do Bá - Seção Completa */}
      <section className="py-16 bg-gradient-to-br from-green-900 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full mb-4">
              <span className="text-2xl">⭐</span>
              <span className="font-bold">CLUBE ESQUINÃO DO BÁ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Faça parte do Clube de Vantagens
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Cadastre-se grátis e comece a acumular pontos a cada compra!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-lg mb-2">Acumule Pontos</h3>
              <p className="text-sm opacity-90">Ganhe 1 ponto a cada R$ 1 gasto</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-bold text-lg mb-2">Descontos Exclusivos</h3>
              <p className="text-sm opacity-90">100 pontos = R$ 5 de desconto</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold text-lg mb-2">Níveis Especiais</h3>
              <p className="text-sm opacity-90">Bronze → Prata → Ouro → Diamante</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2">Grupo VIP WhatsApp</h3>
              <p className="text-sm opacity-90">Ofertas exclusivas todos os dias</p>
            </div>
          </div>

          {usuario && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="font-bold">Seus pontos: {pontos}</p>
                  <p className="text-sm opacity-90">Nível: {nivel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-bold">Desconto disponível: R$ {descontoDisponivel}</p>
                  <p className="text-xs opacity-90">100 pontos = R$ 5 de desconto</p>
                </div>
              </div>
              <button 
                onClick={handleResgatarDesconto}
                disabled={descontoDisponivel === 0}
                className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                Resgatar desconto
              </button>
            </div>
          )}

          {showDescontoModal && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
              🎉 Desconto de R$ {descontoDisponivel} resgatado! Use no próximo pedido.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           

            {/* Grupo WhatsApp */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-400 rounded-full opacity-20 group-hover:opacity-30 transition"></div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>📱</span> Grupo VIP do WhatsApp
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Entre no nosso grupo exclusivo e receba ofertas todos os dias, promoções relâmpago e cupons de desconto especiais!
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span>✅</span> Ofertas exclusivas para membros
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>✅</span> Promoções relâmpago diárias
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>✅</span> Cupons de desconto especiais
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>✅</span> Produtos com preço especial
                </div>
              </div>
              <a 
                href={config?.linkGrupoWhatsApp || "https://chat.whatsapp.com/HMEU2O7jPZyCZ5pRXdC16O"}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition w-full justify-center group-hover:scale-105 transform transition"
              >
                <FaWhatsapp size={20} />
                Entrar no grupo VIP
              </a>
              <p className="text-xs opacity-70 mt-3 text-center">
                🔒 Grupo seguro • Ofertas diárias • Cupons exclusivos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer de Frete */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4" />
              <span>Frete grátis para compras acima de R$ 100,00, dentro da cidade!</span>
            </div>
            <div className="flex items-center gap-4">
              <span>📞 Central de Vendas: (33) 98827-0853</span>
              <span>📍 Retire na loja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}