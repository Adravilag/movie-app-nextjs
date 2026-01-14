import { configureStore } from '@reduxjs/toolkit';
import moviesReducer, { Movie } from './features/movies/moviesSlice';

export const makeStore = () => {
  // Try to hydrate favorites from localStorage (only in browser)
  let favoritesFromStorage: Movie[] | undefined = undefined;
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem('movies_favorites');
      if (raw) {
        favoritesFromStorage = JSON.parse(raw) as Movie[];
      }
    }
  } catch {
    // ignore JSON errors
  }

  const store = configureStore({
    reducer: {
      movies: moviesReducer,
    },
  });

  // If we hydrated favorites from storage, populate the store
  if (favoritesFromStorage && favoritesFromStorage.length > 0) {
    // dispatch addFavorite for each saved movie
    favoritesFromStorage.forEach((m) => {
      store.dispatch({ type: 'movies/addFavorite', payload: m });
    });
  }

  // Subscribe to store changes and persist favorites to localStorage
  if (typeof window !== 'undefined') {
    let prev: string | null = null;
    store.subscribe(() => {
      try {
        const favs = store.getState().movies.favorites;
        const asJson = JSON.stringify(favs || []);
        if (asJson !== prev) {
          prev = asJson;
          window.localStorage.setItem('movies_favorites', asJson);
        }
      } catch {
        // ignore storage errors
      }
    });
  }

  return store;
};

// Definimos los tipos basados en el store mismo
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];