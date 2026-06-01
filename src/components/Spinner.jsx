// src/components/Spinner.jsx
export default function Spinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-green-500 font-semibold">Carregando...</div>
        </div>
      </div>
    </div>
  );
}