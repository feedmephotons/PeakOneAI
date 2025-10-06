export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface TaggedItem {
  itemId: string
  itemType: 'task' | 'file' | 'message' | 'event' | 'contact'
  tagIds: string[]
}

export const TAG_COLORS = [
  { name: 'Red', value: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100', dark: 'text-red-600' },
  { name: 'Orange', value: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100', dark: 'text-orange-600' },
  { name: 'Yellow', value: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-100', dark: 'text-yellow-600' },
  { name: 'Green', value: 'bg-green-500', text: 'text-green-500', light: 'bg-green-100', dark: 'text-green-600' },
  { name: 'Blue', value: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100', dark: 'text-blue-600' },
  { name: 'Purple', value: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100', dark: 'text-purple-600' },
  { name: 'Pink', value: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-100', dark: 'text-pink-600' },
  { name: 'Gray', value: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-100', dark: 'text-gray-600' },
  { name: 'Indigo', value: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-100', dark: 'text-indigo-600' },
  { name: 'Teal', value: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-100', dark: 'text-teal-600' },
]

class TagManager {
  private storageKey = 'user_tags'
  private mappingKey = 'item_tags_mapping'

  getTags(): Tag[] {
    const tags = localStorage.getItem(this.storageKey)
    if (!tags) return []

    return JSON.parse(tags).map((tag: Tag) => ({
      ...tag,
      createdAt: new Date(tag.createdAt)
    }))
  }

  getTag(id: string): Tag | undefined {
    return this.getTags().find(tag => tag.id === id)
  }

  createTag(name: string, color: string): Tag {
    const tags = this.getTags()
    const newTag: Tag = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      color,
      createdAt: new Date()
    }

    tags.push(newTag)
    localStorage.setItem(this.storageKey, JSON.stringify(tags))
    return newTag
  }

  updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>): Tag | undefined {
    const tags = this.getTags()
    const index = tags.findIndex(tag => tag.id === id)

    if (index === -1) return undefined

    tags[index] = { ...tags[index], ...updates }
    localStorage.setItem(this.storageKey, JSON.stringify(tags))
    return tags[index]
  }

  deleteTag(id: string): boolean {
    const tags = this.getTags()
    const filtered = tags.filter(tag => tag.id !== id)

    if (filtered.length === tags.length) return false

    localStorage.setItem(this.storageKey, JSON.stringify(filtered))

    // Remove tag from all items
    const mappings = this.getAllMappings()
    mappings.forEach(mapping => {
      mapping.tagIds = mapping.tagIds.filter(tagId => tagId !== id)
    })
    localStorage.setItem(this.mappingKey, JSON.stringify(mappings))

    return true
  }

  // Item tagging methods
  private getAllMappings(): TaggedItem[] {
    const mappings = localStorage.getItem(this.mappingKey)
    return mappings ? JSON.parse(mappings) : []
  }

  getItemTags(itemId: string, itemType: TaggedItem['itemType']): Tag[] {
    const mappings = this.getAllMappings()
    const mapping = mappings.find(m => m.itemId === itemId && m.itemType === itemType)

    if (!mapping) return []

    const tags = this.getTags()
    return mapping.tagIds.map(id => tags.find(tag => tag.id === id)).filter(Boolean) as Tag[]
  }

  tagItem(itemId: string, itemType: TaggedItem['itemType'], tagId: string): void {
    const mappings = this.getAllMappings()
    const existingIndex = mappings.findIndex(m => m.itemId === itemId && m.itemType === itemType)

    if (existingIndex >= 0) {
      if (!mappings[existingIndex].tagIds.includes(tagId)) {
        mappings[existingIndex].tagIds.push(tagId)
      }
    } else {
      mappings.push({
        itemId,
        itemType,
        tagIds: [tagId]
      })
    }

    localStorage.setItem(this.mappingKey, JSON.stringify(mappings))
  }

  untagItem(itemId: string, itemType: TaggedItem['itemType'], tagId: string): void {
    const mappings = this.getAllMappings()
    const mapping = mappings.find(m => m.itemId === itemId && m.itemType === itemType)

    if (mapping) {
      mapping.tagIds = mapping.tagIds.filter(id => id !== tagId)
      localStorage.setItem(this.mappingKey, JSON.stringify(mappings))
    }
  }

  setItemTags(itemId: string, itemType: TaggedItem['itemType'], tagIds: string[]): void {
    const mappings = this.getAllMappings()
    const existingIndex = mappings.findIndex(m => m.itemId === itemId && m.itemType === itemType)

    if (existingIndex >= 0) {
      mappings[existingIndex].tagIds = tagIds
    } else {
      mappings.push({
        itemId,
        itemType,
        tagIds
      })
    }

    localStorage.setItem(this.mappingKey, JSON.stringify(mappings))
  }

  getItemsByTag(tagId: string, itemType?: TaggedItem['itemType']): TaggedItem[] {
    const mappings = this.getAllMappings()
    return mappings.filter(mapping =>
      mapping.tagIds.includes(tagId) &&
      (itemType ? mapping.itemType === itemType : true)
    )
  }

  searchTags(query: string): Tag[] {
    const tags = this.getTags()
    const lowerQuery = query.toLowerCase()
    return tags.filter(tag => tag.name.toLowerCase().includes(lowerQuery))
  }
}

export const tagManager = new TagManager()
