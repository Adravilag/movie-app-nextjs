"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieFavoriteButton from './MovieFavoriteButton';
import type { Movie } from '../../src/lib/features/movies/moviesSlice';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export default function MovieDetailFallback() {
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFromPath = async () => {
      try {
        const path = window.location.pathname || '';
        const parts = path.split('/').filter(Boolean);
        const id = parts.length ? parts[parts.length - 1] : null;
        if (!id) {
          setError('No se pudo extraer id desde la URL');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/movie/${encodeURIComponent(id)}?api_key=${API_KEY}&language=es-ES`);
        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText || '');
          setError(`HTTP ${res.status} ${res.statusText} ${txt}`);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setMovie(data as Movie);
      } catch (e: unknown) {
        setError(String(e ?? 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchFromPath();
  }, []);

  if (loading) return <p className="text-slate-400">Cargando detalles...</p>;
  if (error) return (
    <div>
      <p className="text-red-400">{error}</p>
      <div className="mt-4">
        <Link href="/" className="text-blue-400 underline">Volver</Link>
      </div>
    </div>
  );

  if (!movie) return (
    <div>
      <p className="text-slate-400">No se encontró la película.</p>
      <Link href="/" className="text-blue-400 underline">Volver</Link>
    </div>
  );

  return (
    <div className="bg-slate-900 p-4 rounded">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <img src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : '/placeholder.png'} alt={movie.title} className="w-full h-64 object-cover rounded" />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold">{movie.title}</h2>
          <p className="text-slate-400">{movie.release_date}</p>
          <p className="mt-2 text-slate-300">{movie.overview}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-yellow-400">⭐ {movie.vote_average}</span>
            <MovieFavoriteButton movie={movie} />
          </div>
        </div>
      </div>
    </div>
  );
}
