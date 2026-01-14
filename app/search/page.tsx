import React from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="text-slate-400">Cargando búsqueda...</div>}>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <SearchClient />
      </main>
    </React.Suspense>
  );
}
