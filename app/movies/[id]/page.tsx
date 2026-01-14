import React from 'react';
import MovieDetailClient from './MovieDetailClient';

// Server component page — exports generateStaticParams below
export default async function Page({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params as { id: string };
  return (
    <MovieDetailClient id={id} />
  );
}

export async function generateStaticParams() {
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
  const BASE_URL = 'https://api.themoviedb.org/3';
  if (!API_KEY) return [];

  try {
    // Fetch first page of popular movies to generate params. Adjust pages if needed.
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    type TMDBMovieSummary = { id: number | string };
    return results.map((m: TMDBMovieSummary) => ({ id: String(m.id) }));
  } catch (err) {
    return [];
  }
}