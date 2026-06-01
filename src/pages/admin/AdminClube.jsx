// src/pages/admin/AdminClube.jsx
import { useState, useEffect } from 'react';
import { useClubeAdmin } from '../../hooks/useClubeAdmin';
import Spinner from '../../components/Spinner';
import { 
  Users, 
  Trophy, 
  Coins, 
  Settings, 
  TrendingUp,
  Award,
  Gift,
  Download,
  Search,
  Filter,
  Edit,
  Save,
  X
} from 'lucide-react';

export default function AdminClube() {
  const [aba, setAba] = useState('clientes');
  const [filtros, setFiltros] = useState({ nivel: 'todos', ativo: 'todos' });
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [showModalPontos, setShowModalPontos] = useState(false);
  const [pontosAdicionar, setPontosAdicionar] = useState('');
  const [motivo, setMotivo] = useState('');
  const [editandoConfig, setEditandoConfig] = useState(false);
  
  const { 
    configuracoes, 
    clientes, 
    loading, 
    carregarConfiguracoes,
    atualizarConfiguracoes,
    listarClientes,
    adicionarPontos,
    exportarRelatorioClientes
  } = useClubeAdmin();

  useEffect(() => {
    carregarConfiguracoes();
    listarClientes(filtros);
  }, []);

  useEffect(() => {
    listarClientes(filtros);
  }, [filtros]);

  async function handleAdicionarPontos() {
    if (!clienteSelecionado || !pontosAdicionar || pontosAdicionar <= 0) {
      alert('Preencha os dados corretamente');
      return;
    }
    
    await adicionarPontos(clienteSelecionado.id, parseInt(pontosAdicionar), motivo);
    setShowModalPontos(false);
    setPontosAdicionar('');
    setMotivo('');
    listarClientes(filtros);
  }

  async function handleSalvarConfig() {
    await atualizarConfiguracoes(configuracoes);
    setEditandoConfig(false);
  }

  if (loading) return <Spinner />;

  const stats = {
    totalClientes: clientes.length,
    totalPontos: clientes.reduce((acc, c) => acc + (c.pontos || 0), 0),
    totalGasto: clientes.reduce((acc, c) => acc + (c.totalGasto || 0), 0),
    mediaPontos: Math.round(clientes.reduce((acc, c) => acc + (c.pontos || 0), 0) / (clientes.length || 1))
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Clube de Vantagens
          </h1>
          <p className="text-gray-500">Gerencie pontos, clientes e configurações do clube</p>
        </div>
        <button
          onClick={exportarRelatorioClientes}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Clientes</p>
              <p className="text-2xl font-bold">{stats.totalClientes}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pontos Ativos</p>
              <p className="text-2xl font-bold">{stats.totalPontos.toLocaleString()}</p>
            </div>
            <Coins className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Gasto</p>
              <p className="text-2xl font-bold">R$ {stats.totalGasto.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Média de Pontos</p>
              <p className="text-2xl font-bold">{stats.mediaPontos}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setAba('clientes')}
            className={`px-4 py-2 font-medium transition-colors ${
              aba === 'clientes' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Clientes
          </button>
          <button
            onClick={() => setAba('configuracoes')}
            className={`px-4 py-2 font-medium transition-colors ${
              aba === 'configuracoes' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configurações
          </button>
        </nav>
      </div>

      {/* Conteúdo da Aba Clientes */}
      {aba === 'clientes' && (
        <>
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Nível</label>
                <select
                  value={filtros.nivel}
                  onChange={(e) => setFiltros({...filtros, nivel: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                  <option value="Diamante">Diamante</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filtros.ativo}
                  onChange={(e) => setFiltros({...filtros, ativo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Clientes */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nível</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gasto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desconto Disponível</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes.map(cliente => {
                    const descontoDisponivel = Math.floor((cliente.pontos || 0) / 100) * 5;
                    return (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{cliente.nome}</div>
                            <div className="text-sm text-gray-500">{cliente.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cliente.nivel === 'Bronze' ? 'bg-amber-100 text-amber-800' :
                            cliente.nivel === 'Prata' ? 'bg-gray-100 text-gray-800' :
                            cliente.nivel === 'Ouro' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {cliente.nivel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{cliente.pontos?.toLocaleString()}</td>
                        <td className="px-6 py-4">R$ {cliente.totalGasto?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-green-600 font-semibold">R$ {descontoDisponivel.toFixed(2)}</td>
                        <td className="px-6 py-4 space-x-2">
                          <button
                            onClick={() => {
                              setClienteSelecionado(cliente);
                              setShowModalPontos(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Adicionar Pontos
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Conteúdo da Aba Configurações */}
      {aba === 'configuracoes' && configuracoes && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Configurações do Clube</h2>
            {editandoConfig ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSalvarConfig}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={() => setEditandoConfig(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditandoConfig(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pontos por R$ 1 gasto</label>
                <input
                  type="number"
                  value={configuracoes.pontosPorReal}
                  onChange={(e) => setConfiguracoes({...configuracoes, pontosPorReal: parseInt(e.target.value)})}
                  disabled={!editandoConfig}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pontos para R$ 5 de desconto</label>
                <input
                  type="number"
                  value={configuracoes.pontosParaDesconto}
                  onChange={(e) => setConfiguracoes({...configuracoes, pontosParaDesconto: parseInt(e.target.value)})}
                  disabled={!editandoConfig}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor do desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={configuracoes.valorDesconto}
                  onChange={(e) => setConfiguracoes({...configuracoes, valorDesconto: parseFloat(e.target.value)})}
                  disabled={!editandoConfig}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Máximo desconto por compra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={configuracoes.maxDescontoPorCompra}
                  onChange={(e) => setConfiguracoes({...configuracoes, maxDescontoPorCompra: parseFloat(e.target.value)})}
                  disabled={!editandoConfig}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-4">Níveis do Clube</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(configuracoes.niveis || {}).map(([nivel, config]) => (
                  <div key={nivel} className="border rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2">{nivel}</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm">Pontos mínimos</label>
                        <input
                          type="number"
                          value={config.pontosMinimo}
                          onChange={(e) => {
                            const novosNiveis = {...configuracoes.niveis};
                            novosNiveis[nivel].pontosMinimo = parseInt(e.target.value);
                            setConfiguracoes({...configuracoes, niveis: novosNiveis});
                          }}
                          disabled={!editandoConfig}
                          className="w-full px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Desconto (%)</label>
                        <input
                          type="number"
                          value={config.desconto}
                          onChange={(e) => {
                            const novosNiveis = {...configuracoes.niveis};
                            novosNiveis[nivel].desconto = parseInt(e.target.value);
                            setConfiguracoes({...configuracoes, niveis: novosNiveis});
                          }}
                          disabled={!editandoConfig}
                          className="w-full px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={config.freteGratis}
                          onChange={(e) => {
                            const novosNiveis = {...configuracoes.niveis};
                            novosNiveis[nivel].freteGratis = e.target.checked;
                            setConfiguracoes({...configuracoes, niveis: novosNiveis});
                          }}
                          disabled={!editandoConfig}
                        />
                        Frete grátis
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Pontos */}
      {showModalPontos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModalPontos(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Adicionar Pontos</h3>
            <p className="mb-4">Cliente: <strong>{clienteSelecionado?.nome}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pontos atuais</label>
                <input
                  type="text"
                  value={clienteSelecionado?.pontos?.toLocaleString()}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pontos a adicionar</label>
                <input
                  type="number"
                  value={pontosAdicionar}
                  onChange={(e) => setPontosAdicionar(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Ex: Compra realizada, ajuste manual, bonificação..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdicionarPontos}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowModalPontos(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}