// src/hooks/usePromocoes.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function usePromocoes() {
  const [promocoes, setPromocoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCarregando(true);
    
    // Buscar TODAS as promoções (sem filtro de ativa)
    const q = query(
      collection(db, 'promocoes'),
      orderBy('criadoEm', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filtrar apenas as que estão ativas (se tiver o campo, senão considera ativa)
        const promocoesAtivas = lista.filter(promo => {
          // Se não tem o campo 'ativa', considera como ativa
          if (promo.ativa === undefined) return true;
          return promo.ativa === true;
        });
        
        console.log('Promoções carregadas:', promocoesAtivas.length);
        setPromocoes(promocoesAtivas);
        setCarregando(false);
      },
      (err) => {
        console.error('Erro ao carregar promoções:', err);
        setError(err);
        setCarregando(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  return { promocoes, carregando, error };
}