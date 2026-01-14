"use client";

import React, { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/src/lib/hooks';
import MovieCard from '@/app/components/MovieCard';
import { addFavorite, removeFavorite, Movie } from '@/src/lib/features/movies/moviesSlice';

export default function FavoritesPage() {
  const favorites = useAppSelector((s) => s.movies.favorites);
  const dispatch = useAppDispatch();

  const displayed = useMemo(() => {
    if (!favorites) return [] as Movie[];
    const map = new Map<number, Movie>();
    for (const f of favorites) {
      if (!f || !f.id) continue;
      if (!map.has(f.id)) map.set(f.id, f);
    }
    return Array.from(map.values()).sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [favorites]);

  const toggleFavorite = (m: Movie) => {
    const exists = favorites.some((f) => f.id === m.id);
    if (exists) dispatch(removeFavorite(m.id));
    else dispatch(addFavorite(m));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-6">Mis Favoritos</h1>

        {displayed.length === 0 ? (
          <div className="py-20 text-center text-slate-400">No tienes películas en favoritos.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayed.map((m, i) => (
              <MovieCard key={m.id} movie={m} favorites={displayed} toggleFavorite={toggleFavorite} idx={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
