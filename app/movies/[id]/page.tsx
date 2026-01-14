'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Movie as BaseMovie, addFavorite, removeFavorite } from '@/src/lib/features/movies/moviesSlice';
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks';
import MovieFavoriteButton from '@/app/components/MovieFavoriteButton';

// Tipo local para el detalle (extiende el tipo base compartido)
interface MovieDetail extends BaseMovie {
  backdrop_path?: string | null;
  overview: string;
  release_date?: string | null;
  tagline?: string | null;
  genres?: { id: number; name: string }[];
}

// --- Constantes ---

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((s) => s.movies.favorites);

  const isFavorite = Boolean(movie && favorites.some((f) => f.id === movie.id));

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        setMovie(data);

        const videoRes = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`);
        const videoData = await videoRes.json();
        const trailer = videoData.results?.find((v: { type: string; site: string; key: string }) => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) setTrailerKey(trailer.key);
      } catch (err) { console.error(err); }
    };
    if (id) fetchDetails();
  }, [id]);

  if (!movie) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando...</div>;

  return (
    <main className="fixed inset-0 bg-slate-950 text-white overflow-hidden">

      {/* Botón Volver - Ajustado para estar debajo del header */}
      <button
        onClick={() => router.back()}
        className="fixed top-20 left-6 z-50 p-3 bg-slate-900/60 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/20 hover:scale-105 transition-all flex items-center gap-2 shadow-2xl"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="pr-2 font-bold text-xs uppercase tracking-widest">Volver</span>
      </button>

      {/* Fondo Hero con contenido superpuesto - Ajustado para el header */}
      <div className="relative h-full w-full overflow-hidden flex items-center justify-center pt-16">
        <img
          src={`${BACKDROP_BASE}${movie.backdrop_path || movie.poster_path}`}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt=""
        />
        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

        {/* Contenido centrado */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <img 
              src={`${IMAGE_BASE}${movie.poster_path}`} 
              className="w-64 md:w-72 rounded-2xl shadow-2xl border border-white/10" 
              alt={movie.title} 
            />

            <div className="flex-1 space-y-4 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{movie.title}</h1>
              {movie.tagline && <p className="text-lg text-blue-400/80 italic">{movie.tagline}</p>}

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Sinopsis</h3>
                <p className="text-base text-slate-300 leading-relaxed max-w-2xl">{movie.overview}</p>
              </div>

              {trailerKey && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                >
                  Ver Trailer
                </button>
              )}
              {/* Botón favorito en la página de detalle */}
              {movie && (
                <div className="ml-4 inline-block">
                  <MovieFavoriteButton
                    movie={movie as BaseMovie}
                    iconOnly
                    className={`p-3 rounded-2xl backdrop-blur-2xl border transition-all duration-300 transform active:scale-90 ${
                      isFavorite
                        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40'
                        : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Trailer */}
      {isModalOpen && trailerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
          <div className="relative w-full max-w-5xl aspect-video">
            <button onClick={() => setIsModalOpen(false)} className="absolute -top-12 right-0 text-white uppercase text-xs font-bold hover:text-blue-400 transition-colors">Cerrar</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              className="w-full h-full rounded-3xl"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  );
}