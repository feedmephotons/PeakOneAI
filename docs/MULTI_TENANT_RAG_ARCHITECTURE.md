# Multi-Tenant RAG Architecture for Peak AI

## Overview
This document outlines the architecture for implementing Gemini's RAG (Retrieval-Augmented Generation) with proper multi-tenancy support.

## Multi-Tenancy Model

### Tenant Isolation Strategy
```
Organization (Tenant)
  ├── Users (Members)
  ├── RAG Corpus (Isolated per tenant)
  │   ├── Files
  │   ├── Meeting Transcripts
  │   ├── Task Descriptions
  │   ├── Messages
  │   └── Notes
  ├── AI Context Graph (Tenant-specific)
  ├── Embeddings (Namespace per tenant)
  └── Chat History (User-specific within tenant)
```

### Data Model

```typescript
// Core Multi-Tenant Schema
interface Organization {
  id: string                    // org_xxx
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  settings: {
    ragEnabled: boolean
    ragCorpusLimit: number      // Based on plan
    maxUsers: number
  }
}

interface User {
  id: string                    // user_xxx
  organizationId: string        // FK to Organization
  email: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  createdAt: Date
}

// All entities now include organizationId
interface TenantEntity {
  id: string
  organizationId: string        // Tenant isolation
  type: EntityType
  // ... other fields
}
```

## Gemini RAG Integration

### RAG Corpus Management

**Google Cloud Vertex AI RAG Engine provides:**
- Automatic chunking and embedding
- Semantic search across documents
- Integration with Gemini models
- Scalable vector storage

**Implementation Approach:**

```typescript
// Per-tenant RAG Corpus
interface RAGCorpus {
  corpusId: string              // Format: "corpus_{organizationId}"
  organizationId: string
  displayName: string
  documents: RAGDocument[]
  createdAt: Date
  lastUpdated: Date
  stats: {
    totalDocuments: number
    totalChunks: number
    storageUsed: number        // in bytes
  }
}

interface RAGDocument {
  documentId: string
  corpusId: string
  sourceType: 'file' | 'meeting' | 'task' | 'message' | 'note'
  sourceId: string             // ID of the original entity
  content: string
  metadata: {
    title: string
    createdBy: string
    createdAt: Date
    tags: string[]
  }
  chunks: number               // Number of chunks created
  lastSynced: Date
}
```

### RAG Workflow

```
1. Content Creation
   ↓
2. Auto-sync to RAG Corpus (per tenant)
   - File uploaded → Extract text → Add to corpus
   - Meeting ends → Transcript → Add to corpus
   - Task created → Description → Add to corpus
   ↓
3. User asks question via Peak AI
   ↓
4. Retrieve relevant chunks (tenant-isolated)
   ↓
5. Augment Gemini prompt with context
   ↓
6. Generate response with citations
```

## Security & Isolation

### Row-Level Security (RLS)
```sql
-- All queries must filter by organizationId
-- Enforced at database level with Supabase RLS policies

CREATE POLICY "Users can only access their org data"
  ON entities
  FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

### RAG Corpus Namespacing
- Each organization has isolated RAG corpus in Vertex AI
- Corpus ID: `corpus_{organizationId}`
- No cross-tenant data leakage possible

### API Key Management
```typescript
// Per-tenant API keys stored encrypted
interface TenantAPIKeys {
  organizationId: string
  geminiApiKey?: string        // Optional: Bring your own key
  encryptedAt: Date
}
```

## Implementation Phases

### Phase 1: Multi-Tenant Foundation
1. Add `organizationId` to all existing entities
2. Update AI context system with tenant filtering
3. Implement tenant selection/switching UI
4. Add RLS policies to Supabase

### Phase 2: RAG Infrastructure
1. Set up Google Cloud Vertex AI project
2. Create RAG corpus management API routes
3. Implement document ingestion pipeline
4. Build auto-sync for new content

### Phase 3: RAG-Powered Chat
1. Enhance Peak AI assistant with RAG retrieval
2. Add citation links in responses
3. Implement relevance scoring
4. Add chat history per user per tenant

### Phase 4: Advanced Features
1. Hybrid search (keyword + semantic)
2. Custom embeddings for domain-specific content
3. RAG analytics dashboard
4. Document version control in RAG

## Cost Optimization

### Tiered Plans
```typescript
const PLAN_LIMITS = {
  free: {
    ragDocuments: 100,
    ragQueries: 50,           // per month
    storageGB: 1
  },
  pro: {
    ragDocuments: 10000,
    ragQueries: 1000,
    storageGB: 50
  },
  enterprise: {
    ragDocuments: Infinity,
    ragQueries: Infinity,
    storageGB: Infinity
  }
}
```

### Smart Caching
- Cache frequently accessed chunks
- Deduplicate similar queries
- Batch document ingestion

## Privacy & Compliance

### Data Retention
- 30-day soft delete for tenant data
- Full purge after retention period
- Export functionality before deletion

### Audit Logging
```typescript
interface AuditLog {
  id: string
  organizationId: string
  userId: string
  action: 'rag_query' | 'doc_add' | 'doc_delete'
  metadata: Record<string, unknown>
  timestamp: Date
}
```

## Example: RAG Query Flow

```typescript
// User asks: "What did we discuss in the Q4 planning meeting?"

// 1. Identify tenant
const organizationId = getCurrentUserOrg()

// 2. Query RAG corpus (tenant-isolated)
const relevantChunks = await retrieveFromRAG({
  corpusId: `corpus_${organizationId}`,
  query: "Q4 planning meeting discussion",
  topK: 5
})

// 3. Augment prompt
const prompt = `
You are Peak AI assistant for ${orgName}.

Context from organization knowledge base:
${relevantChunks.map(c => c.content).join('\n\n')}

User question: What did we discuss in the Q4 planning meeting?

Provide a comprehensive answer with specific details from the context.
Cite sources using [source: meeting_name].
`

// 4. Generate response
const response = await gemini.generateContent(prompt)

// 5. Return with citations
return {
  answer: response.text,
  sources: relevantChunks.map(c => c.metadata)
}
```

## Migration Strategy

### Existing Single-Tenant → Multi-Tenant

```typescript
// 1. Create default organization for existing data
const defaultOrg = {
  id: 'org_default',
  name: 'Default Organization'
}

// 2. Migrate all entities
await db.entities.updateMany({
  where: { organizationId: null },
  data: { organizationId: 'org_default' }
})

// 3. Assign all users to default org
await db.users.updateMany({
  where: { organizationId: null },
  data: { organizationId: 'org_default' }
})
```

## Monitoring & Analytics

### Key Metrics
- RAG query latency per tenant
- Document ingestion rate
- Storage usage per tenant
- Query success rate
- Cost per tenant per month

### Alerts
- Approaching plan limits
- Unusually high query volume
- Failed document syncs
- API errors

## Next Steps

1. Review and approve architecture
2. Set up Google Cloud project & enable Vertex AI
3. Implement tenant model in Supabase
4. Build RAG API routes
5. Update AI context system
6. Enhance Peak AI assistant
7. Test with sample tenant data
8. Deploy to staging
9. Monitor and optimize
10. Production rollout
