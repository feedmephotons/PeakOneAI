export interface SearchQuery {
  text: string
  fields?: string[]
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  priority?: string
  status?: string
  operators?: {
    and?: string[]
    or?: string[]
    not?: string[]
  }
}

export interface SavedSearch {
  id: string
  name: string
  query: SearchQuery
  entityType: 'task' | 'file' | 'message' | 'all'
  createdAt: Date
  lastUsed?: Date
}

export interface SearchableItem {
  id: string
  title: string
  description?: string
  tags?: string[]
  createdAt: Date
  updatedAt?: Date
  priority?: string
  status?: string
  [key: string]: unknown
}

class AdvancedSearchManager {
  private savedSearchesKey = 'saved_searches'
  private recentSearchesKey = 'recent_searches'
  private maxRecentSearches = 10

  // Parse search query with operators
  parseQuery(queryString: string): SearchQuery {
    const query: SearchQuery = {
      text: '',
      operators: { and: [], or: [], not: [] }
    }

    // Extract operators
    const andMatch = queryString.match(/AND\s+(\w+)/gi)
    const orMatch = queryString.match(/OR\s+(\w+)/gi)
    const notMatch = queryString.match(/NOT\s+(\w+)/gi)

    if (andMatch) {
      query.operators!.and = andMatch.map(m => m.replace(/AND\s+/i, ''))
      queryString = queryString.replace(/AND\s+\w+/gi, '')
    }

    if (orMatch) {
      query.operators!.or = orMatch.map(m => m.replace(/OR\s+/i, ''))
      queryString = queryString.replace(/OR\s+\w+/gi, '')
    }

    if (notMatch) {
      query.operators!.not = notMatch.map(m => m.replace(/NOT\s+/i, ''))
      queryString = queryString.replace(/NOT\s+\w+/gi, '')
    }

    // Extract tags
    const tagMatch = queryString.match(/#(\w+)/g)
    if (tagMatch) {
      query.tags = tagMatch.map(t => t.substring(1))
      queryString = queryString.replace(/#\w+/g, '')
    }

    // Extract priority filter
    const priorityMatch = queryString.match(/priority:(\w+)/i)
    if (priorityMatch) {
      query.priority = priorityMatch[1].toUpperCase()
      queryString = queryString.replace(/priority:\w+/i, '')
    }

    // Extract status filter
    const statusMatch = queryString.match(/status:(\w+)/i)
    if (statusMatch) {
      query.status = statusMatch[1].toUpperCase()
      queryString = queryString.replace(/status:\w+/i, '')
    }

    // Extract date range
    const dateFromMatch = queryString.match(/from:(\d{4}-\d{2}-\d{2})/i)
    if (dateFromMatch) {
      query.dateFrom = new Date(dateFromMatch[1])
      queryString = queryString.replace(/from:\d{4}-\d{2}-\d{2}/i, '')
    }

    const dateToMatch = queryString.match(/to:(\d{4}-\d{2}-\d{2})/i)
    if (dateToMatch) {
      query.dateTo = new Date(dateToMatch[1])
      queryString = queryString.replace(/to:\d{4}-\d{2}-\d{2}/i, '')
    }

    query.text = queryString.trim()
    return query
  }

  // Search items with advanced query
  search<T extends SearchableItem>(items: T[], query: SearchQuery): T[] {
    return items.filter(item => {
      // Text search
      const textMatch = !query.text ||
        item.title.toLowerCase().includes(query.text.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.text.toLowerCase())

      // Tag filter
      const tagMatch = !query.tags?.length ||
        query.tags.some(tag => item.tags?.includes(tag))

      // Priority filter
      const priorityMatch = !query.priority || item.priority === query.priority

      // Status filter
      const statusMatch = !query.status || item.status === query.status

      // Date range filter
      const dateFromMatch = !query.dateFrom ||
        new Date(item.createdAt) >= query.dateFrom
      const dateToMatch = !query.dateTo ||
        new Date(item.createdAt) <= query.dateTo

      // AND operator (all terms must match)
      const andMatch = !query.operators?.and?.length ||
        query.operators.and.every(term =>
          item.title.toLowerCase().includes(term.toLowerCase()) ||
          item.description?.toLowerCase().includes(term.toLowerCase())
        )

      // OR operator (at least one term must match)
      const orMatch = !query.operators?.or?.length ||
        query.operators.or.some(term =>
          item.title.toLowerCase().includes(term.toLowerCase()) ||
          item.description?.toLowerCase().includes(term.toLowerCase())
        )

      // NOT operator (terms must not match)
      const notMatch = !query.operators?.not?.length ||
        query.operators.not.every(term =>
          !item.title.toLowerCase().includes(term.toLowerCase()) &&
          !item.description?.toLowerCase().includes(term.toLowerCase())
        )

      return textMatch && tagMatch && priorityMatch && statusMatch &&
             dateFromMatch && dateToMatch && andMatch && orMatch && notMatch
    })
  }

  // Saved searches
  getSavedSearches(): SavedSearch[] {
    const saved = localStorage.getItem(this.savedSearchesKey)
    if (!saved) return []

    return JSON.parse(saved).map((s: SavedSearch) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      lastUsed: s.lastUsed ? new Date(s.lastUsed) : undefined,
      query: {
        ...s.query,
        dateFrom: s.query.dateFrom ? new Date(s.query.dateFrom) : undefined,
        dateTo: s.query.dateTo ? new Date(s.query.dateTo) : undefined
      }
    }))
  }

  saveSearch(name: string, query: SearchQuery, entityType: SavedSearch['entityType']): SavedSearch {
    const searches = this.getSavedSearches()
    const newSearch: SavedSearch = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      query,
      entityType,
      createdAt: new Date()
    }

    searches.push(newSearch)
    localStorage.setItem(this.savedSearchesKey, JSON.stringify(searches))
    return newSearch
  }

  updateSearchUsage(searchId: string): void {
    const searches = this.getSavedSearches()
    const search = searches.find(s => s.id === searchId)

    if (search) {
      search.lastUsed = new Date()
      localStorage.setItem(this.savedSearchesKey, JSON.stringify(searches))
    }
  }

  deleteSavedSearch(searchId: string): boolean {
    const searches = this.getSavedSearches()
    const filtered = searches.filter(s => s.id !== searchId)

    if (filtered.length === searches.length) return false

    localStorage.setItem(this.savedSearchesKey, JSON.stringify(filtered))
    return true
  }

  // Recent searches
  getRecentSearches(): string[] {
    const recent = localStorage.getItem(this.recentSearchesKey)
    return recent ? JSON.parse(recent) : []
  }

  addRecentSearch(queryString: string): void {
    if (!queryString.trim()) return

    let recent = this.getRecentSearches()

    // Remove if already exists
    recent = recent.filter(q => q !== queryString)

    // Add to beginning
    recent.unshift(queryString)

    // Limit to max
    recent = recent.slice(0, this.maxRecentSearches)

    localStorage.setItem(this.recentSearchesKey, JSON.stringify(recent))
  }

  clearRecentSearches(): void {
    localStorage.removeItem(this.recentSearchesKey)
  }

  // Search suggestions
  getSuggestions(partial: string, items: SearchableItem[]): string[] {
    const suggestions = new Set<string>()

    // Add matching titles
    items.forEach(item => {
      if (item.title.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.add(item.title)
      }
    })

    // Add matching tags
    items.forEach(item => {
      item.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.add(`#${tag}`)
        }
      })
    })

    return Array.from(suggestions).slice(0, 5)
  }
}

export const advancedSearch = new AdvancedSearchManager()
