"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks';
import { fetchSearchMovies } from '@/src/lib/features/movies/moviesSlice';
import MovieCard from '@/app/components/MovieCard';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('query') || searchParams?.get('q') || '';
  const dispatch = useAppDispatch();
  const { items, status, error, page } = useAppSelector((s) => s.movies);

  useEffect(() => {
    if (q && q.trim().length > 0) {
      dispatch(fetchSearchMovies({ query: q.trim(), page: 1 }));
    }
  }, [q, dispatch]);

  useEffect(() => {
    // debug: log status and items length to help diagnose why results not rendering
    // only in development to avoid noisy logs in production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('SearchPage debug', { q, status, itemsLength: items.length });
    }
  }, [q, status, items.length]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-black mb-6">Resultados para: <span className="text-blue-500">{q}</span></h2>

      {(!q || q.trim() === '') ? (
        <div className="text-slate-400">Introduce un término para buscar películas.</div>
      ) : status === 'loading' ? (
        <div className="text-slate-400">Buscando...</div>
      ) : error ? (
        <div className="text-red-400">Error: {error}</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400">No se han encontrado resultados.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {items.map((movie, idx) => (
            <MovieCard key={movie.id} movie={movie} idx={idx} />
          ))}
        </div>
      )}
    </main>
  );
}
