import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// 1. Definimos el Thunk (El servicio asíncrono)
export const fetchPopularMovies = createAsyncThunk(
  'movies/fetchPopular',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`
      );
      if (!response.ok) throw new Error('Error al obtener películas');
      const data = await response.json();
      // Retornamos resultados y metadatos de paginación
      return {
        results: data.results as Movie[],
        page: data.page as number,
        total_pages: data.total_pages as number,
      };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Thunk para búsqueda por texto
export const fetchSearchMovies = createAsyncThunk(
  'movies/fetchSearch',
  async ({ query, page = 1 }: { query: string; page?: number }, { rejectWithValue }) => {
    try {
      if (!query) return rejectWithValue('Empty query');
      const encoded = encodeURIComponent(query);
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encoded}&page=${page}`);
      if (!response.ok) throw new Error('Error al buscar películas');
      const data = await response.json();
      return {
        results: data.results as Movie[],
        page: data.page as number,
        total_pages: data.total_pages as number,
      };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Definimos qué campos tiene una película según la API de TMDB
export interface Movie {
  id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  vote_average: number;
  release_date?: string | null;
  // otros campos opcionales que pueden venir de la API
  tagline?: string | null;
  genres?: { id: number; name: string }[];
}

interface MoviesState {
  items: Movie[];
  favorites: Movie[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  page: number;
  totalPages: number;
}

const initialState: MoviesState = {
  items: [],
  favorites: [],
  status: 'idle',
  error: null,
  page: 1,
  totalPages: 1,
};

export const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<Movie>) => {
      state.favorites.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(m => m.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularMovies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.results;
        state.page = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
    // Manejo de búsqueda
    builder
      .addCase(fetchSearchMovies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSearchMovies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.results;
        state.page = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchSearchMovies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { addFavorite, removeFavorite } = moviesSlice.actions;
export default moviesSlice.reducer;