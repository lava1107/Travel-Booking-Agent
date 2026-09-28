import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentContext = createContext();

const STORAGE_KEY = 'lyan_recently_accessed_v1';

export function RecentProvider({ children }) {
  const [recentPackages, setRecentPackages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).packages || [] : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).searches || [] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        packages: recentPackages,
        searches: recentSearches
      }));
    } catch (e) {
      console.error('Failed to persist recently accessed records:', e);
    }
  }, [recentPackages, recentSearches]);

  const addRecentPackage = (trip) => {
    if (!trip || !trip.id) return;
    setRecentPackages((prev) => {
      const filtered = prev.filter((p) => p.id !== trip.id);
      const entry = {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        source: trip.source || trip.origin || 'Chennai',
        amount: trip.amount,
        image_url: trip.image_url,
        rating: trip.rating,
        category: trip.category,
        viewedAt: new Date().toISOString()
      };
      return [entry, ...filtered].slice(0, 8);
    });
  };

  const addRecentSearch = (query) => {
    const q = (query || '').trim();
    if (!q || q.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== q.toLowerCase());
      return [q, ...filtered].slice(0, 6);
    });
  };

  const clearRecent = () => {
    setRecentPackages([]);
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RecentContext.Provider
      value={{
        recentPackages,
        recentSearches,
        addRecentPackage,
        addRecentSearch,
        clearRecent
      }}
    >
      {children}
    </RecentContext.Provider>
  );
}

export function useRecent() {
  const context = useContext(RecentContext);
  if (!context) {
    return {
      recentPackages: [],
      recentSearches: [],
      addRecentPackage: () => {},
      addRecentSearch: () => {},
      clearRecent: () => {}
    };
  }
  return context;
}
