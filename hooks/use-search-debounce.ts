import { useState, useEffect } from 'react'

/**
 * Hook personnalisé pour gérer la recherche avec debounce
 * @param initialValue - Valeur initiale du terme de recherche
 * @param delay - Délai de debounce en millisecondes (défaut: 300ms)
 * @returns Objet contenant searchTerm, debouncedSearchTerm et setSearchTerm
 */
export function useSearchDebounce(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchTerm, delay])

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm
  }
}
