'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Eye } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  quantity: number
}

interface SearchResultsPopupProps {
  searchQuery: string
  isVisible: boolean
  onClose: () => void
  onProductSelect?: (product: Product) => void
  onAddToCart?: (product: Product) => void
}

export default function SearchResultsPopup({ 
  searchQuery, 
  isVisible, 
  onClose, 
  onProductSelect,
  onAddToCart
}: SearchResultsPopupProps) {
  const [products, setProducts] = useState<Product[]>([])

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setProducts([])
        return
      }

      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
        const result = await response.json()
        
        if (result.success) {
          setProducts(result.data.slice(0, 6)) // Show max 6 products
        }
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    }

    if (isVisible && searchQuery) {
      fetchSearchResults()
    }
  }, [searchQuery, isVisible])

  // Function to highlight search terms
  const highlightSearchTerms = (text: string) => {
    if (!searchQuery) return text
    
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0)
    let highlightedText = text
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<span class="bg-yellow-200 text-yellow-800 px-1 rounded font-semibold">$1</span>')
    })
    
    return highlightedText
  }

  if (!isVisible || !searchQuery.trim()) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Results Only */}
        <div className="p-6 max-h-80 overflow-y-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-28 h-28 bg-gray-100 rounded-lg p-1">
                        {product.image.startsWith('http') ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="text-3xl">{product.image}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-semibold text-gray-900 text-sm leading-tight"
                        dangerouslySetInnerHTML={{ __html: highlightSearchTerms(product.name) }}
                      />
                      <p 
                        className="text-xs text-gray-600 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightSearchTerms(product.description) }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-green-600">
                          {product.price.toLocaleString()} RWF
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {product.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.quantity} kg available
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    {onProductSelect && (
                      <button
                        onClick={() => onProductSelect(product)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    )}
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔍</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h4>
              <p className="text-gray-600">
                Try searching with different keywords like "fresh", "cucumber", or "pepper"
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 