"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Movie, addFavorite, removeFavorite } from '@/src/lib/features/movies/moviesSlice';
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks';
import MovieFavoriteButton from './MovieFavoriteButton';

type Props = {
  movie: Movie;
  favorites?: Movie[];
  toggleFavorite?: (m: Movie) => void;
  onClick?: (m: Movie) => void; // opcional: si no se pasa, se usará Link a /movies/:id
  idx?: number;
};

type TMDBVideo = {
  id: string;
  iso_639_1?: string;
  iso_3166_1?: string;
  key: string;
  name: string;
  site: string;
  size?: number;
  type: string;
  official?: boolean;
  published_at?: string;
};

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3';

export default function MovieCard({ movie, favorites, toggleFavorite, onClick, idx = 0 }: Props) {
  const dispatch = useAppDispatch();
  const favsFromStore = useAppSelector((s) => s.movies.favorites);
  const effectiveFavorites = favorites ?? favsFromStore;
  const isFavorite = effectiveFavorites.some(m => m.id === movie.id);

  const handleToggleFavorite = (m: Movie) => {
    if (toggleFavorite) return toggleFavorite(m);
    if (isFavorite) dispatch(removeFavorite(m.id));
    else dispatch(addFavorite(m));
  };
  const keyForTrailer = `hasTrailer_${movie.id}`;
  const [hasTrailer, setHasTrailer] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const cached = sessionStorage.getItem(keyForTrailer);
      return cached === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem(keyForTrailer) : null;
      if (cached !== null) {
        // already initialized from cache, nothing more to do
        return;
      }
    } catch {
      // ignore
    }

    if (!API_KEY) return;

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}&language=es-ES`);
        if (!res.ok) return;
        const data = await res.json();
        const trailer = data.results?.find((v: TMDBVideo) => v.type === 'Trailer' && v.site === 'YouTube');
        if (!mounted) return;
        setHasTrailer(Boolean(trailer));
        try { sessionStorage.setItem(keyForTrailer, trailer ? '1' : '0'); } catch {}
      } catch (err) {
        // ignore
      }
    })();

    return () => { mounted = false; };
  }, [movie.id, keyForTrailer]);

  const ratingColor = movie.vote_average >= 7 ? 'text-green-400' : movie.vote_average >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <article
      className="group relative flex flex-col bg-neutral-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.3)] hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
      style={{ animationDelay: `${(idx % 10) * 50}ms` }}
    >
      {/* Contenedor de Imagen con Overlays */}
      {onClick ? (
        <div 
          className="relative aspect-[2/3] overflow-hidden cursor-pointer"
          onClick={() => onClick(movie)}
        >
          {/** contenido abajo **/}
          <>
            <img
              src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Degradado Cinematográfico */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />

            {/* Badge de Rating */}
            <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
              <svg className={`w-3.5 h-3.5 ${ratingColor} fill-current`} viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-[11px] font-black text-white/90">{movie.vote_average.toFixed(1)}</span>
            </div>

            {hasTrailer && (
              <div className="absolute top-4 left-28 z-40 bg-black/50 backdrop-blur-xl border border-white/5 px-2 py-1 rounded-xl flex items-center gap-2 shadow-md">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span className="text-[11px] font-semibold text-white">Trailer</span>
              </div>
            )}

            {/* Botón Favorito Flotante */}
            {/* Botón Favorito Flotante (usa MovieFavoriteButton si no se pasa toggleFavorite) */}
            <div className="absolute top-4 right-4 z-50">
              {toggleFavorite ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(movie);
                  }}
                  aria-pressed={isFavorite}
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  className={`p-3 rounded-2xl backdrop-blur-2xl border transition-all duration-300 transform active:scale-90 ${
                    isFavorite
                      ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40'
                      : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {isFavorite ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.02 4.02 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 17.98 4 20 6.02 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  )}
                </button>
              ) : (
                <MovieFavoriteButton
                  movie={movie}
                  iconOnly
                  className={`p-3 rounded-2xl backdrop-blur-2xl border transition-all duration-300 transform active:scale-90 ${
                    isFavorite
                      ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40'
                      : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/20'
                  }`}
                />
              )}
            </div>

            {/* Indicador de Acción en Hover */}
            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-blue-600/10 backdrop-blur-[2px]">
              <div className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                Ver Detalles
              </div>
            </div>
          </>
        </div>
      ) : (
        <Link href={`/movies/${movie.id}`} className="relative aspect-[2/3] overflow-hidden cursor-pointer">
          <img
            src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
          <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
            <svg className={`w-3.5 h-3.5 ${ratingColor} fill-current`} viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="text-[11px] font-black text-white/90">{movie.vote_average.toFixed(1)}</span>
          </div>
          {hasTrailer && (
            <div className="absolute top-4 left-28 z-40 bg-black/50 backdrop-blur-xl border border-white/5 px-2 py-1 rounded-xl flex items-center gap-2 shadow-md">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span className="text-[11px] font-semibold text-white">Trailer</span>
            </div>
          )}
          <div className="absolute top-4 right-4 z-50">
            <MovieFavoriteButton
              movie={movie}
              iconOnly
              className={`p-3 rounded-2xl backdrop-blur-2xl border transition-all duration-300 transform active:scale-90 ${
                isFavorite
                  ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40'
                  : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/20'
              }`}
            />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-blue-600/10 backdrop-blur-[2px]">
            <div className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              Ver Detalles
            </div>
          </div>
        </Link>
      )}
      

      {/* Info de la Película */}
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div className="space-y-2">
          <h3 
            className="font-black text-base leading-tight uppercase tracking-tight truncate group-hover:text-blue-500 transition-colors cursor-pointer"
            onClick={() => onClick?.(movie)}
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
              {movie.release_date?.split('-')[0] || 'N/A'}
            </span>
            <div className="h-px flex-grow bg-white/5" />
          </div>
        </div>
        
        {/* Botón de acción rápido (Opcional, pero limpio) */}
        <div className="mt-6 flex items-center justify-between">
           <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">Premium Quality</span>
           <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
           </svg>
        </div>
      </div>
    </article>
  );
}