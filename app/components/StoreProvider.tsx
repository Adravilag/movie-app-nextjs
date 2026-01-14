'use client'; // Este componente debe ser un Client Component para usar Redux
import { useState, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../../src/lib/store';

export default function StoreProvider({ children }: { children: ReactNode }) {
  // Inicialización perezosa con el tipo AppStore
  const [store] = useState<AppStore>(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}