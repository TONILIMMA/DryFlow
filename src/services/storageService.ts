// services/storageService.ts
import { User } from '../types';

export const storageService = {
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Erro ao salvar "${key}" no localStorage:`, err);
    }
  },

  get<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : fallback;
    } catch (err) {
      console.error(`Erro ao ler "${key}" do localStorage:`, err);
      return fallback;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Erro ao remover "${key}" do localStorage:`, err);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (err) {
      console.error("Erro ao limpar o localStorage:", err);
    }
  },

  // Funções específicas para o usuário
  setCurrentUser(user: User | null): void {
    this.set('currentUser', user);
  },

  getCurrentUser(): User | null {
    return this.get('currentUser', null);
  }
};
