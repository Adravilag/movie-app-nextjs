"use client";

import React, { useEffect, useState } from 'react';
import MovieCard from './components/MovieCard';

import { Movie } from '@/src/lib/features/movies/moviesSlice';
// --- Constantes ---

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem('mf_favorites');
      return raw ? JSON.parse(raw) as Movie[] : [];
    } catch (e) {
      console.error('Error reading favorites from localStorage', e);
      return [];
    }
  });
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchPopular = async () => {
      if (!API_KEY) return;
      try {
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`);
        const data = await res.json();
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) { console.error(err); }
    };
    fetchPopular();
  }, [page]);

  // Nota: la carga inicial de `favorites` se hace en el inicializador de useState

  // Alternar favorito
  const toggleFavorite = (m: Movie) => {
    setFavorites(prev => {
      const exists = prev.some(x => x.id === m.id);
      const next = exists ? prev.filter(x => x.id !== m.id) : [m, ...prev];
      try { localStorage.setItem('mf_favorites', JSON.stringify(next)); } catch (e) { console.error(e); }
      return next;
    });
  };

  // La búsqueda ahora se gestiona desde el Header global.

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header global se renderiza desde `app/layout.tsx` */}

      {/* Grid de Películas */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black mb-12 flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-600 rounded-full" />
          Tendencias
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} favorites={favorites} toggleFavorite={toggleFavorite} idx={i} />
          ))}
        </div>

        {/* Paginación */}
        <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-white/5 rounded-md disabled:opacity-40"
            >Anterior</button>
            <span className="text-sm font-semibold">Página {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white/5 rounded-md disabled:opacity-40"
            >Siguiente</button>
          </div>
      </section>
    </main>
  );
}