"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/src/lib/hooks';
import { removeFavorite } from '@/src/lib/features/movies/moviesSlice';

export default function FavoritesPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const favorites = useAppSelector((s) => s.movies.favorites);
  const dispatch = useAppDispatch();

  // Dedupe and sort favorites for display
  const displayed = useMemo(() => {
    if (!favorites || favorites.length === 0) return [] as typeof favorites;
    const map = new Map<number, typeof favorites[number]>();
    for (const f of favorites) {
      if (!f || !f.id) continue;
      // keep first occurrence
      if (!map.has(f.id)) map.set(f.id, f);
    }
    return Array.from(map.values()).sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [favorites]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      ref={ref} 
      className="absolute right-0 mt-4 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden"
    >
      {/* Header del Popover */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="text-pink-400 text-sm">❤️</span>
          <h4 className="text-sm font-semibold text-white tracking-tight">Mis favoritos</h4>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      <div className="p-2">
        {displayed.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="text-3xl opacity-20">🎬</div>
            <p className="text-xs font-medium text-slate-500 tracking-wide">Tu lista está vacía</p>
          </div>
        ) : (
          <ul className="space-y-1 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {displayed.slice(0, 5).map((m) => (
              <li key={m.id} className="group">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                  {m.id ? (
                    <Link
                      href={`/movies/${m.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : '/placeholder.png'}
                          alt={m.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-slate-200 transition-colors">
                          {m.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-medium">
                            {m.release_date?.split('-')[0] || 'N/A'}
                          </span>
                          <span className="text-[11px] text-yellow-400 font-medium flex items-center gap-0.5">
                            ★ {m.vote_average?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0 opacity-60 cursor-not-allowed" title="ID inválido">
                      <div className="relative shrink-0">
                        <img
                          src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : '/placeholder.png'}
                          alt={m.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {m.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-medium">
                            {m.release_date?.split('-')[0] || 'N/A'}
                          </span>
                          <span className="text-[11px] text-yellow-400 font-medium flex items-center gap-0.5">
                            ★ {m.vote_average?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(removeFavorite(m.id));
                    }}
                    aria-label={`Eliminar ${m.title}`}
                    title="Eliminar"
                    className="ml-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-white/[0.02] border-t border-white/5">
        <div className="flex gap-2 justify-end items-center">
          <button
            onClick={() => {
              favorites.forEach((f) => dispatch(removeFavorite(f.id)));
              onClose();
            }}
            title="Eliminar todos"
            aria-label="Eliminar todos"
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-red-400 transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>

          <Link
            href="/favorites"
            onClick={onClose}
            title="Ver toda la lista"
            aria-label="Ver toda la lista"
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17h18" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}