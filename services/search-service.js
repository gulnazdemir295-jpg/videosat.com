/**
 * Search Service
 * Global search functionality - products, users, orders, etc.
 */

class SearchService {
    constructor() {
        this.apiUrl = window.getAPIBaseURL ? window.getAPIBaseURL() : '/api';
        this.searchHistory = [];
        this.maxHistoryItems = 10;
        this.debounceTimeout = null;
        this.debounceDelay = 300;
        
        this.init();
    }

    /**
     * Initialize Search Service
     */
    init() {
        // Load search history from localStorage
        this.loadSearchHistory();
        
        console.log('✅ Search Service initialized');
    }

    /**
     * Search
     */
    async search(query, options = {}) {
        const {
            type = 'all', // 'all', 'products', 'users', 'orders', 'messages'
            limit = 20,
            offset = 0,
            filters = {}
        } = options;

        if (!query || query.trim().length === 0) {
            return { results: [], total: 0 };
        }

        const searchQuery = query.trim().toLowerCase();
        
        // Save to history
        this.addToHistory(searchQuery);

        try {
            const response = await fetch(`${this.apiUrl}/search?q=${encodeURIComponent(searchQuery)}&type=${type}&limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Search error:', error);
            
            // Fallback: Client-side search
            return this.clientSideSearch(searchQuery, type, limit, offset);
        }
    }

    /**
     * Client-side search (fallback)
     */
    clientSideSearch(query, type, limit, offset) {
        // This is a fallback - in production, backend should handle search
        const results = [];
        
        // Search in localStorage or in-memory data
        try {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (type === 'all' || type === 'products') {
                const productResults = products
                    .filter(p => 
                        p.name?.toLowerCase().includes(query) ||
                        p.description?.toLowerCase().includes(query) ||
                        p.category?.toLowerCase().includes(query)
                    )
                    .slice(offset, offset + limit);
                
                results.push(...productResults.map(p => ({
                    type: 'product',
                    id: p.id,
                    title: p.name,
                    description: p.description,
                    url: `/products/${p.id}`
                })));
            }
            
            if (type === 'all' || type === 'users') {
                const userResults = users
                    .filter(u => 
                        u.email?.toLowerCase().includes(query) ||
                        u.name?.toLowerCase().includes(query)
                    )
                    .slice(offset, offset + limit);
                
                results.push(...userResults.map(u => ({
                    type: 'user',
                    id: u.id,
                    title: u.name || u.email,
                    description: u.email,
                    url: `/users/${u.id}`
                })));
            }
        } catch (err) {
            console.error('Client-side search error:', err);
        }
        
        return {
            results,
            total: results.length,
            query
        };
    }

    /**
     * Debounced search
     */
    debouncedSearch(query, options, callback) {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(async () => {
            const results = await this.search(query, options);
            if (callback) {
                callback(results);
            }
        }, this.debounceDelay);
    }

    /**
     * Add to search history
     */
    addToHistory(query) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        
        // Add to beginning
        this.searchHistory.unshift(query);
        
        // Keep only last N items
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }
        
        // Save to localStorage
        this.saveSearchHistory();
    }

    /**
     * Get search history
     */
    getSearchHistory() {
        return [...this.searchHistory];
    }

    /**
     * Clear search history
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    /**
     * Save search history
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (err) {
            console.error('Save search history error:', err);
        }
    }

    /**
     * Load search history
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('searchHistory');
            if (stored) {
                this.searchHistory = JSON.parse(stored);
            }
        } catch (err) {
            console.error('Load search history error:', err);
        }
    }

    /**
     * Advanced search with filters
     */
    async advancedSearch(query, filters = {}) {
        const {
            type = 'all',
            category = null,
            minPrice = null,
            maxPrice = null,
            dateFrom = null,
            dateTo = null,
            sortBy = 'relevance', // 'relevance', 'date', 'price', 'name'
            sortOrder = 'desc', // 'asc', 'desc'
            limit = 20,
            offset = 0
        } = filters;

        const searchParams = new URLSearchParams({
            q: query,
            type,
            limit: limit.toString(),
            offset: offset.toString(),
            sortBy,
            sortOrder
        });

        if (category) searchParams.append('category', category);
        if (minPrice) searchParams.append('minPrice', minPrice);
        if (maxPrice) searchParams.append('maxPrice', maxPrice);
        if (dateFrom) searchParams.append('dateFrom', dateFrom);
        if (dateTo) searchParams.append('dateTo', dateTo);

        try {
            const response = await fetch(`${this.apiUrl}/search/advanced?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Advanced search failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Advanced search error:', error);
            return { results: [], total: 0 };
        }
    }

    /**
     * Get search suggestions
     */
    async getSuggestions(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const response = await fetch(`${this.apiUrl}/search/suggestions?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.suggestions || [];
        } catch (error) {
            console.error('Get suggestions error:', error);
            return [];
        }
    }

    /**
     * Highlight search terms
     */
    highlightText(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Export
const searchService = new SearchService();
window.searchService = searchService;

console.log('✅ Search Service initialized');

