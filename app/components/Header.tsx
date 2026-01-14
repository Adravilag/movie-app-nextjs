"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/src/lib/hooks';
import FavoritesPopover from './FavoritesPopover';

export default function Header({ 
  onSearch 
}: { 
  onSearch?: (query: string) => void 
}) {
  const router = useRouter();
  const favoritesCount = useAppSelector((s) => s.movies.favorites.length ?? 0);
  const [mounted, setMounted] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const favBtnRef = useRef<HTMLButtonElement | null>(null);
  
  const [scrolled, setScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // mark as mounted on client to avoid SSR/CSR mismatch for client-only data
    // schedule asynchronously to avoid synchronous setState inside effect
    const id = typeof window !== 'undefined' ? window.requestAnimationFrame(() => setMounted(true)) : null;
    return () => { if (id) window.cancelAnimationFrame(id); };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    } else {
      const trimmed = searchValue.trim();
      if (trimmed.length === 0) {
        router.push('/');
        return;
      }
      const q = encodeURIComponent(trimmed);
      router.push(`/search?query=${q}`);
    }
  };

  return (
    <div 
      className={`sticky top-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? "bg-slate-950/80 backdrop-blur-2xl py-3 border-b border-white/10 shadow-2xl" 
          : "bg-transparent py-6 border-b border-transparent"
      }`}
    >
      <header className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
        
        {/* Logo Cinematográfico */}
        <div 
          onClick={() => { router.push('/'); setSearchValue(""); }}
          className="group cursor-pointer flex items-center gap-2 shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
            <h1 className="relative text-2xl font-black tracking-tighter text-white">
              M<span className="text-blue-500">F</span>
            </h1>
          </div>
          <span className="text-xl font-black tracking-tighter hidden md:block">
            MOVIE<span className="text-blue-500 group-hover:text-blue-400 transition-colors">FLIX</span>
          </span>
        </div>

        {/* Buscador Ultra Moderno */}
        <form 
          onSubmit={handleSearchSubmit}
          className={`relative flex-1 max-w-xl transition-all duration-300 ${
            isSearchFocused ? "scale-105" : "scale-100"
          }`}
        >
          <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${
            isSearchFocused 
              ? "bg-white/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
              : "bg-white/5 border-white/5 hover:border-white/20"
          }`}>
            <div className="pl-4 text-slate-400">
              <svg className={`w-5 h-5 transition-colors ${isSearchFocused ? "text-blue-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Explorar títulos, géneros..."
              className="w-full bg-transparent border-none py-3 px-4 text-sm text-white placeholder:text-slate-500 focus:ring-0 outline-none font-medium"
            />
            {searchValue && (
              <button 
                type="button"
                onClick={() => setSearchValue("")}
                className="pr-4 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Lado Derecho: Favoritos y Perfil */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowFavs((s) => !s)}
              ref={favBtnRef}
              className="group relative p-2.5 bg-white/5 hover:bg-blue-600/10 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all"
            >
              <span className="text-xl group-hover:scale-110 transition-transform block">
                <svg
                  className={`w-6 h-6 ${mounted && favoritesCount > 0 ? 'fill-red-500 stroke-red-500' : 'stroke-slate-400 fill-none'}`}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </span>
              {mounted && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-4 ring-slate-950 animate-in zoom-in">
                  {favoritesCount}
                </span>
              )}
            </button>
            <FavoritesPopover open={showFavs} onClose={() => setShowFavs(false)} />
          </div>

          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            <div className="h-full w-full rounded-xl bg-slate-900 overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

      </header>
    </div>
  );
}