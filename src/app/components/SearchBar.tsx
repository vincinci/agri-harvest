'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

interface SearchResult {
  id: number
  name: string
  category: string
  price: number
  image: string
}

interface SearchBarProps {
  onSearch: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  showSuggestions?: boolean
  className?: string
}

export default function SearchBar({ 
  onSearch, 
  onResultSelect,
  placeholder = "Search vegetables...", 
  showSuggestions = true,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (searchQuery: string) => {
        clearTimeout(timeoutId)
        if (searchQuery.trim().length === 0) {
          setSuggestions([])
          setLoading(false)
          return
        }
        
        setLoading(true)
        timeoutId = setTimeout(async () => {
          try {
            const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
            const result = await response.json()
            
            if (result.success) {
              setSuggestions(result.data.slice(0, 5)) // Show top 5 results
            }
          } catch (error) {
            console.error('Search error:', error)
          } finally {
            setLoading(false)
          }
        }, 300)
      }
    })(),
    []
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Trigger search callback for live results
    onSearch(value)
    
    if (showSuggestions) {
      debouncedSearch(value)
    }
  }

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      
      // Perform search
      onSearch(searchQuery.trim())
      setIsOpen(false)
      
      // Clear suggestions
      setSuggestions([])
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchResult) => {
    setQuery(suggestion.name)
    handleSearch(suggestion.name)
    
    if (onResultSelect) {
      onResultSelect(suggestion)
    }
  }

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    handleSearch(search)
  }

  // Clear input
  const clearInput = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors bg-white text-black placeholder-gray-500"
        />
        
        {/* Clear button */}
        {query && (
          <motion.button
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4 text-gray-400" />
          </motion.button>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && showSuggestions && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Recent Searches</span>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      onClick={() => handleRecentSearchClick(search)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {suggestions.length > 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Products</span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-2xl">{suggestion.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {suggestion.category}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        {suggestion.price.toLocaleString()} RWF
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && !loading && (
              <div className="p-4 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm text-gray-500">No products found for "{query}"</p>
                <button
                  onClick={() => handleSearch()}
                  className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Search anyway
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 