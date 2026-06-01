// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6LhqUW3h9T_iY5jx5bhXJNgkXGWRjfe4",
  authDomain: "esquinao-do-ba.firebaseapp.com",
  projectId: "esquinao-do-ba",
  storageBucket: "esquinao-do-ba.firebasestorage.app",
  messagingSenderId: "625624511056",
  appId: "1:625624511056:web:d2ffcdd65a9ac247619755",
  measurementId: "QVF1G88LGQ"  // Removi o "G-" porque geralmente não precisa
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Opcional: Analytics (só vai funcionar em HTTPS ou localhost)
// Se der erro, remova ou comente esta linha
// export const analytics = getAnalytics(app);

export default app;