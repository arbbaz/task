"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchApi } from "@/features/search/api/client";
import type { Review, UserProfile } from "@/lib/types";

interface SearchResults {
  reviews: Review[];
  users: UserProfile[];
}

const EMPTY_RESULTS: SearchResults = { reviews: [], users: [] };

export function useHeaderSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestIdRef = useRef(0);
  const resultsCacheRef = useRef(new Map<string, SearchResults>());

  const clearSearch = useCallback(() => {
    latestRequestIdRef.current += 1;
    setSearchQuery("");
    setSearchResults(EMPTY_RESULTS);
    setSearchLoading(false);
    setSearchOpen(false);
  }, []);

  const runSearch = useCallback(async (query: string) => {
    const term = query.trim();
    if (term.length < 2) {
      setSearchResults(EMPTY_RESULTS);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }

    const cached = resultsCacheRef.current.get(term.toLowerCase());
    if (cached) {
      setSearchResults(cached);
      setSearchLoading(false);
      setSearchOpen(true);
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setSearchLoading(true);
    setSearchOpen(true);

    try {
      const response = await searchApi.search({ q: term, type: "all", limit: 10 });
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      const results = response.data?.results;
      const nextResults = {
        reviews: results?.reviews ?? [],
        users: results?.users ?? [],
      };
      resultsCacheRef.current.set(term.toLowerCase(), nextResults);
      if (resultsCacheRef.current.size > 20) {
        const oldestKey = resultsCacheRef.current.keys().next().value;
        if (oldestKey) {
          resultsCacheRef.current.delete(oldestKey);
        }
      }
      setSearchResults(nextResults);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setSearchResults(EMPTY_RESULTS);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setSearchLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      latestRequestIdRef.current += 1;
      setSearchResults(EMPTY_RESULTS);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      void runSearch(searchQuery);
      searchDebounceRef.current = null;
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [runSearch, searchQuery]);

  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchOpen,
    setSearchOpen,
    searchRef,
    clearSearch,
  };
}
