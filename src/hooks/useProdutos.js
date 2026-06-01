import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export function useProdutos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'produtos'), orderBy('nome', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCarregando(false)
    })
    return unsub
  }, [])

  return { produtos, carregando }
}