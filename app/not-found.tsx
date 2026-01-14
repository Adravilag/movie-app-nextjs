// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <h2 className="text-4xl font-bold mb-4">404 - Página no encontrada</h2>
      <p className="mb-8">Lo sentimos, no pudimos encontrar la película que buscas.</p>
      <Link 
        href="/" 
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}