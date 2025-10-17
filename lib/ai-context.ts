/**
 * AI Context Awareness System
 *
 * This system tracks relationships between entities across the platform:
 * - Files mentioned in calls/meetings
 * - Tasks created from action items
 * - People mentioned in discussions
 * - Cross-references between different content types
 */

export type EntityType = 'file' | 'task' | 'call' | 'meeting' | 'message' | 'note'

export interface Entity {
  id: string
  type: EntityType
  title: string
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface EntityReference {
  id: string
  sourceEntity: Entity
  targetEntity: Entity
  context: string // What was said about the entity
  timestamp: Date
  speaker?: string
  confidence: number // AI confidence score 0-100
}

export interface AIInsight {
  id: string
  entityId: string
  entityType: EntityType
  insightType: 'summary' | 'action' | 'decision' | 'question' | 'risk'
  text: string
  confidence: number
  timestamp: Date
  relatedEntities?: string[]
}

export interface ContextGraph {
  entities: Map<string, Entity>
  references: EntityReference[]
  insights: AIInsight[]
}

class AIContextManager {
  private graph: ContextGraph = {
    entities: new Map(),
    references: [],
    insights: []
  }

  /**
   * Register a new entity in the context graph
   */
  registerEntity(entity: Entity): void {
    this.graph.entities.set(entity.id, entity)
    this.saveToStorage()
  }

  /**
   * Create a reference from one entity to another
   */
  createReference(reference: Omit<EntityReference, 'id'>): EntityReference {
    const newReference: EntityReference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...reference
    }
    this.graph.references.push(newReference)
    this.saveToStorage()
    return newReference
  }

  /**
   * Add an AI-generated insight for an entity
   */
  addInsight(insight: Omit<AIInsight, 'id'>): AIInsight {
    const newInsight: AIInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...insight
    }
    this.graph.insights.push(newInsight)
    this.saveToStorage()
    return newInsight
  }

  /**
   * Get all references where this entity is mentioned
   */
  getReferencesForEntity(entityId: string): EntityReference[] {
    return this.graph.references.filter(
      ref => ref.targetEntity.id === entityId || ref.sourceEntity.id === entityId
    )
  }

  /**
   * Get all references from a specific source (e.g., all mentions in a meeting)
   */
  getReferencesFromSource(sourceId: string): EntityReference[] {
    return this.graph.references.filter(ref => ref.sourceEntity.id === sourceId)
  }

  /**
   * Find all meetings/calls where an entity was discussed
   */
  getMeetingReferencesForEntity(entityId: string): EntityReference[] {
    return this.graph.references.filter(
      ref =>
        ref.targetEntity.id === entityId &&
        (ref.sourceEntity.type === 'meeting' || ref.sourceEntity.type === 'call')
    )
  }

  /**
   * Find all tasks related to an entity
   */
  getTasksForEntity(entityId: string): EntityReference[] {
    return this.graph.references.filter(
      ref => ref.targetEntity.id === entityId && ref.sourceEntity.type === 'task'
    ).concat(
      this.graph.references.filter(
        ref => ref.sourceEntity.id === entityId && ref.targetEntity.type === 'task'
      )
    )
  }

  /**
   * Get AI insights for an entity
   */
  getInsightsForEntity(entityId: string): AIInsight[] {
    return this.graph.insights
      .filter(insight =>
        insight.entityId === entityId ||
        insight.relatedEntities?.includes(entityId)
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get entities that are frequently mentioned together
   */
  getRelatedEntities(entityId: string, limit: number = 5): Entity[] {
    const refs = this.getReferencesForEntity(entityId)
    const relatedIds = new Set<string>()

    refs.forEach(ref => {
      if (ref.sourceEntity.id !== entityId) {
        relatedIds.add(ref.sourceEntity.id)
      }
      if (ref.targetEntity.id !== entityId) {
        relatedIds.add(ref.targetEntity.id)
      }
    })

    const relatedEntities = Array.from(relatedIds)
      .map(id => this.graph.entities.get(id))
      .filter((e): e is Entity => e !== undefined)
      .slice(0, limit)

    return relatedEntities
  }

  /**
   * Get timeline of all activity related to an entity
   */
  getEntityTimeline(entityId: string): (EntityReference | AIInsight)[] {
    const references = this.getReferencesForEntity(entityId)
    const insights = this.getInsightsForEntity(entityId)

    return [...references, ...insights]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Search entities by text
   */
  searchEntities(query: string, types?: EntityType[]): Entity[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.graph.entities.values())
      .filter(entity => {
        const matchesQuery = entity.title.toLowerCase().includes(lowerQuery)
        const matchesType = !types || types.includes(entity.type)
        return matchesQuery && matchesType
      })
  }

  /**
   * Get recent activity across the platform
   */
  getRecentActivity(limit: number = 10): EntityReference[] {
    return this.graph.references
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Calculate "importance score" for an entity based on references and insights
   */
  getEntityImportanceScore(entityId: string): number {
    const references = this.getReferencesForEntity(entityId)
    const insights = this.getInsightsForEntity(entityId)

    // Weight recent activity more heavily
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    const referenceScore = references.reduce((score, ref) => {
      const age = (now - ref.timestamp.getTime()) / dayMs
      const recencyMultiplier = Math.max(0, 1 - (age / 30)) // Decay over 30 days
      return score + (ref.confidence / 100) * recencyMultiplier
    }, 0)

    const insightScore = insights.reduce((score, insight) => {
      const age = (now - insight.timestamp.getTime()) / dayMs
      const recencyMultiplier = Math.max(0, 1 - (age / 30))
      const typeMultiplier = insight.insightType === 'risk' ? 2 : 1
      return score + (insight.confidence / 100) * recencyMultiplier * typeMultiplier
    }, 0)

    return Math.min(100, (referenceScore + insightScore) * 10)
  }

  /**
   * Save context graph to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        entities: Array.from(this.graph.entities.entries()),
        references: this.graph.references,
        insights: this.graph.insights
      }
      localStorage.setItem('ai-context-graph', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save context graph:', error)
    }
  }

  /**
   * Load context graph from localStorage
   */
  loadFromStorage(): void {
    try {
      const data = localStorage.getItem('ai-context-graph')
      if (data) {
        const parsed = JSON.parse(data)
        this.graph.entities = new Map(parsed.entities)
        this.graph.references = parsed.references.map((ref: EntityReference) => ({
          ...ref,
          timestamp: new Date(ref.timestamp)
        }))
        this.graph.insights = parsed.insights.map((insight: AIInsight) => ({
          ...insight,
          timestamp: new Date(insight.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load context graph:', error)
    }
  }

  /**
   * Initialize with sample data for demo
   */
  initializeSampleData(): void {
    // Register sample entities
    const q4Report: Entity = {
      id: 'file_1',
      type: 'file',
      title: 'Q4 Sales Report.pdf',
      createdAt: new Date('2025-01-15')
    }

    const meeting: Entity = {
      id: 'meeting_1',
      type: 'meeting',
      title: 'Q4 Planning Strategy Call',
      createdAt: new Date('2025-01-17')
    }

    const task: Entity = {
      id: 'task_1',
      type: 'task',
      title: 'Review Q4 sales analysis',
      createdAt: new Date('2025-01-17')
    }

    this.registerEntity(q4Report)
    this.registerEntity(meeting)
    this.registerEntity(task)

    // Create references
    this.createReference({
      sourceEntity: meeting,
      targetEntity: q4Report,
      context: 'Sarah mentioned the revenue forecast needs to be updated based on this report',
      timestamp: new Date('2025-01-17T14:23:00'),
      speaker: 'Sarah Chen',
      confidence: 95
    })

    this.createReference({
      sourceEntity: task,
      targetEntity: q4Report,
      context: 'Task created to review the report findings',
      timestamp: new Date('2025-01-17T14:30:00'),
      confidence: 100
    })

    // Add insights
    this.addInsight({
      entityId: 'file_1',
      entityType: 'file',
      insightType: 'summary',
      text: '23% YoY growth - highest in the East region',
      confidence: 92,
      timestamp: new Date('2025-01-15'),
      relatedEntities: ['meeting_1']
    })

    this.addInsight({
      entityId: 'file_1',
      entityType: 'file',
      insightType: 'action',
      text: 'Recommended action: Increase Q1 budget by 15%',
      confidence: 88,
      timestamp: new Date('2025-01-15')
    })
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.graph = {
      entities: new Map(),
      references: [],
      insights: []
    }
    localStorage.removeItem('ai-context-graph')
  }

  /**
   * Get statistics about the context graph
   */
  getStats() {
    return {
      totalEntities: this.graph.entities.size,
      totalReferences: this.graph.references.length,
      totalInsights: this.graph.insights.length,
      entitiesByType: {
        file: Array.from(this.graph.entities.values()).filter(e => e.type === 'file').length,
        task: Array.from(this.graph.entities.values()).filter(e => e.type === 'task').length,
        call: Array.from(this.graph.entities.values()).filter(e => e.type === 'call').length,
        meeting: Array.from(this.graph.entities.values()).filter(e => e.type === 'meeting').length,
        message: Array.from(this.graph.entities.values()).filter(e => e.type === 'message').length,
        note: Array.from(this.graph.entities.values()).filter(e => e.type === 'note').length
      }
    }
  }
}

// Export singleton instance
export const aiContext = new AIContextManager()

// Initialize on first load
if (typeof window !== 'undefined') {
  aiContext.loadFromStorage()

  // Initialize sample data if empty
  if (aiContext.getStats().totalEntities === 0) {
    aiContext.initializeSampleData()
  }
}
