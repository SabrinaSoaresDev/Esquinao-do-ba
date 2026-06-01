// src/pages/admin/AdminConfiguracoes.jsx
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../../components/Spinner';

export default function AdminConfiguracoes() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [config, setConfig] = useState({
    nomeLoja: 'Mercearia do João',
    telefone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    email: 'contato@mercearia.com',
    endereco: 'Rua Exemplo, 123 - Centro',
    cidade: 'São Paulo - SP',
    cep: '01234-567',
    instagram: 'https://instagram.com/mercearia',
    facebook: 'https://facebook.com/mercearia',
    corPrimaria: '#16a34a',
    corSecundaria: '#f59e0b',
    whatsappAtivo: true,
    entregasDisponiveis: true,
    taxaEntrega: 5.00,
    valorMinimoEntrega: 20.00
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    try {
      const docRef = doc(db, 'configuracoes', 'loja');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSalvando(true);
    try {
      await setDoc(doc(db, 'configuracoes', 'loja'), config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações da Loja</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Loja</label>
              <input
                type="text"
                value={config.nomeLoja}
                onChange={(e) => setConfig({...config, nomeLoja: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={config.telefone}
                onChange={(e) => setConfig({...config, telefone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="tel"
                value={config.whatsapp}
                onChange={(e) => setConfig({...config, whatsapp: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({...config, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                type="text"
                value={config.endereco}
                onChange={(e) => setConfig({...config, endereco: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input
                type="text"
                value={config.cidade}
                onChange={(e) => setConfig({...config, cidade: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input
                type="text"
                value={config.cep}
                onChange={(e) => setConfig({...config, cep: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Redes Sociais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="url"
                value={config.instagram}
                onChange={(e) => setConfig({...config, instagram: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="url"
                value={config.facebook}
                onChange={(e) => setConfig({...config, facebook: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Aparência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cor Primária</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.corPrimaria}
                  onChange={(e) => setConfig({...config, corPrimaria: e.target.value})}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.corPrimaria}
                  onChange={(e) => setConfig({...config, corPrimaria: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor Secundária</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.corSecundaria}
                  onChange={(e) => setConfig({...config, corSecundaria: e.target.value})}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.corSecundaria}
                  onChange={(e) => setConfig({...config, corSecundaria: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link do Grupo WhatsApp</label>
              <input
                type="url"
                value={config.linkGrupoWhatsApp || ''}
                onChange={(e) => setConfig({...config, linkGrupoWhatsApp: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://chat.whatsapp.com/seu-link"
              />
              <p className="text-xs text-gray-500 mt-1">Link para o grupo VIP de ofertas</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={salvando}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            {salvando ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}