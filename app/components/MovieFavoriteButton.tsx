"use client";

import { useAppDispatch, useAppSelector } from '../../src/lib/hooks';
import { addFavorite, removeFavorite } from '../../src/lib/features/movies/moviesSlice';
import type { Movie } from '../../src/lib/features/movies/moviesSlice';

type Props = {
  movie: Movie;
  className?: string;
  onToggle?: () => void; // si se provee, se usará en lugar del dispatch
  iconOnly?: boolean; // muestra solo el icono cuando es true
};

export default function MovieFavoriteButton({ movie, className = '', onToggle, iconOnly = false }: Props) {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((s) => s.movies.favorites);

  const isFav = favorites.some(f => f.id === movie.id);

  const toggle = () => {
    if (onToggle) return onToggle();
    if (isFav) dispatch(removeFavorite(movie.id));
    else dispatch(addFavorite(movie));
  };

  if (iconOnly) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
        aria-pressed={isFav}
        title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={className}
      >
        {isFav ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.02 4.02 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 17.98 4 20 6.02 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      className={`${className} px-3 py-1 rounded-full text-sm`}
      aria-pressed={isFav}
      title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {isFav ? '❤️ Favorito' : '🤍 Añadir'}
    </button>
  );
}
