// src/pages/admin/AdminHorario.jsx
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Spinner from '../../components/Spinner';

export default function AdminHorario() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [horarios, setHorarios] = useState({
    segunda: { aberto: true, abertura: '08:00', fechamento: '20:00' },
    terca: { aberto: true, abertura: '08:00', fechamento: '20:00' },
    quarta: { aberto: true, abertura: '08:00', fechamento: '20:00' },
    quinta: { aberto: true, abertura: '08:00', fechamento: '20:00' },
    sexta: { aberto: true, abertura: '08:00', fechamento: '20:00' },
    sabado: { aberto: true, abertura: '08:00', fechamento: '18:00' },
    domingo: { aberto: false, abertura: '08:00', fechamento: '13:00' }
  });

  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const nomesDias = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  useEffect(() => {
    carregarHorarios();
  }, []);

  async function carregarHorarios() {
    try {
      const docRef = doc(db, 'configuracoes', 'horario');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setHorarios(docSnap.data());
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSalvando(true);
    try {
      await setDoc(doc(db, 'configuracoes', 'horario'), horarios);
      alert('Horários salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar horários');
    } finally {
      setSalvando(false);
    }
  }

  function atualizarHorario(dia, campo, valor) {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Horário de Funcionamento</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {diasSemana.map(dia => (
            <div key={dia} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={horarios[dia]?.aberto}
                    onChange={(e) => atualizarHorario(dia, 'aberto', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-lg">{nomesDias[dia]}</span>
                </label>
              </div>
              
              {horarios[dia]?.aberto && (
                <div className="flex gap-4 ml-7">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Abertura</label>
                    <input
                      type="time"
                      value={horarios[dia]?.abertura || '08:00'}
                      onChange={(e) => atualizarHorario(dia, 'abertura', e.target.value)}
                      className="px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Fechamento</label>
                    <input
                      type="time"
                      value={horarios[dia]?.fechamento || '20:00'}
                      onChange={(e) => atualizarHorario(dia, 'fechamento', e.target.value)}
                      className="px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={salvando}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {salvando ? 'Salvando...' : 'Salvar Horários'}
          </button>
        </div>
      </div>
    </div>
  );
}