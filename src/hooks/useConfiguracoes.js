import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const DEFAULTS = {
  nomeLoja: 'Mercearia Esquinao do Ba',
  whatsapp: '5533987270853',
  slogan: 'Tudo que você precisa, pertinho de casa!',
  mensagemBoasVindas: 'Bem-vindo ao Esquinão do Bá!',
  instagram: '',
  facebook: '',
  horarios: [
    { dia: 'Segunda-feira', abre: '07:00', fecha: '20:00', aberto: true },
    { dia: 'Terça-feira',   abre: '07:00', fecha: '20:00', aberto: true },
    { dia: 'Quarta-feira',  abre: '07:00', fecha: '20:00', aberto: true },
    { dia: 'Quinta-feira',  abre: '07:00', fecha: '20:00', aberto: true },
    { dia: 'Sexta-feira',   abre: '07:00', fecha: '20:00', aberto: true },
    { dia: 'Sábado',        abre: '07:00', fecha: '18:00', aberto: true },
    { dia: 'Domingo',       abre: '08:00', fecha: '12:00', aberto: false },
  ],
}

export function useConfiguracoes() {
  const [config, setConfig] = useState(DEFAULTS)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'configuracoes', 'loja'), (snap) => {
      if (snap.exists()) {
        setConfig({ ...DEFAULTS, ...snap.data() })
      }
      setCarregando(false)
    })
    return unsub
  }, [])

  return { config, carregando }
}