// src/hooks/useHorarios.js
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useHorarios() {
  const [horarios, setHorarios] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCarregando(true);
    
    const docRef = doc(db, 'configuracoes', 'horario');
    
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setHorarios(docSnap.data());
        } else {
          // Horários padrão caso não exista
          const defaultHorarios = {
            segunda: { aberto: true, abertura: "08:00", fechamento: "18:00" },
            terca: { aberto: true, abertura: "08:00", fechamento: "18:00" },
            quarta: { aberto: true, abertura: "08:00", fechamento: "18:00" },
            quinta: { aberto: true, abertura: "08:00", fechamento: "18:00" },
            sexta: { aberto: true, abertura: "08:00", fechamento: "18:00" },
            sabado: { aberto: true, abertura: "08:00", fechamento: "15:00" },
            domingo: { aberto: false, abertura: "09:00", fechamento: "13:00" }
          };
          setHorarios(defaultHorarios);
        }
        setCarregando(false);
      },
      (err) => {
        console.error('Erro ao carregar horários:', err);
        setError(err);
        setCarregando(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  return { horarios, carregando, error };
}