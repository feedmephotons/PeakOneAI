import { gemini, GEMINI_MODEL } from '@/lib/gemini'
import { browserManager } from './browser-manager'
import type {
  TaskPlan,
  BrowserAction,
  PageAnalysis,
  AgentSession,
  AgentTask
} from './types'

interface PlanContext {
  objective: string
  currentUrl?: string
  pageAnalysis?: PageAnalysis
  previousActions?: BrowserAction[]
  previousResults?: unknown[]
}

export class TaskPlanner {
  async createPlan(context: PlanContext): Promise<TaskPlan> {
    const prompt = this.buildPlanningPrompt(context)

    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.4,
          maxOutputTokens: 4000
        }
      })

      const responseText = response.text || ''

      // Extract JSON from response
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                        responseText.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        const plan = JSON.parse(jsonStr) as TaskPlan
        return plan
      }

      throw new Error('Failed to parse plan from AI response')
    } catch (error) {
      console.error('Plan parsing error:', error)
      // Return a basic plan
      return {
        objective: context.objective,
        estimatedSteps: 1,
        tasks: [{
          description: 'Analyze the page and determine next steps',
          actions: [],
          expectedOutcome: 'Understanding of current page state'
        }]
      }
    }
  }

  async generateActionsForTask(
    sessionId: string,
    taskDescription: string,
    pageAnalysis: PageAnalysis
  ): Promise<BrowserAction[]> {
    const prompt = `You are a browser automation AI. Generate specific browser actions to accomplish the following task.

TASK: ${taskDescription}

CURRENT PAGE:
- URL: ${pageAnalysis.url}
- Title: ${pageAnalysis.title}

AVAILABLE INTERACTIVE ELEMENTS:
${JSON.stringify(pageAnalysis.elements.filter(e => e.isVisible).slice(0, 30), null, 2)}

AVAILABLE FORMS:
${JSON.stringify(pageAnalysis.forms, null, 2)}

NAVIGATION LINKS:
${JSON.stringify(pageAnalysis.navigation.slice(0, 20), null, 2)}

Generate a JSON array of browser actions. Each action should have:
- id: unique string identifier
- type: one of 'navigate', 'click', 'type', 'scroll', 'wait', 'screenshot', 'extract', 'hover', 'select', 'press_key'
- selector: { type: 'css'|'xpath'|'text'|'aria'|'id', value: string } (for actions that need element targeting)
- value: string (for navigate, type, select actions)
- description: brief description of what this action does
- options: optional { delay?: number, waitFor?: 'load'|'networkidle'|number, key?: string, scrollAmount?: number }

Return ONLY a JSON array of actions, wrapped in \`\`\`json markers.

Example:
\`\`\`json
[
  {
    "id": "action-1",
    "type": "click",
    "selector": { "type": "css", "value": "#search-input" },
    "description": "Click on search input field"
  },
  {
    "id": "action-2",
    "type": "type",
    "selector": { "type": "css", "value": "#search-input" },
    "value": "search term",
    "description": "Type search query",
    "options": { "delay": 50 }
  }
]
\`\`\``

    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.3,
          maxOutputTokens: 4000
        }
      })

      const responseText = response.text || ''
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)

      if (jsonMatch) {
        const actions = JSON.parse(jsonMatch[1]) as BrowserAction[]
        return actions.map((action, index) => ({
          ...action,
          id: action.id || `action-${index}`
        }))
      }
      throw new Error('No actions found in response')
    } catch (error) {
      console.error('Action generation error:', error)
      return []
    }
  }

  async analyzeAndPlanNextStep(
    sessionId: string,
    session: AgentSession,
    currentTask: AgentTask,
    lastResult: unknown
  ): Promise<{
    shouldContinue: boolean
    nextActions?: BrowserAction[]
    isTaskComplete?: boolean
    reasoning: string
  }> {
    // Get current page state
    const pageAnalysis = await browserManager.analyzePage(sessionId)
    const currentUrl = await browserManager.getCurrentUrl(sessionId)

    const prompt = `You are a browser automation AI analyzing the current state to determine next steps.

OBJECTIVE: ${session.objective}
CURRENT TASK: ${currentTask.description}

PREVIOUS ACTIONS TAKEN:
${JSON.stringify(currentTask.actions, null, 2)}

LAST ACTION RESULT:
${JSON.stringify(lastResult, null, 2)}

CURRENT PAGE STATE:
- URL: ${currentUrl}
- Title: ${pageAnalysis.title}
- Visible Elements: ${pageAnalysis.elements.filter(e => e.isVisible).length}
- Forms: ${pageAnalysis.forms.length}
- Navigation Links: ${pageAnalysis.navigation.length}

CONTENT SUMMARY:
- Headings: ${pageAnalysis.content.headings.map(h => h.text).join(', ')}
- Paragraphs: ${pageAnalysis.content.paragraphs.length}

Analyze the current state and determine:
1. Is the current task complete?
2. Should we continue with more actions?
3. What specific actions should we take next?

Return a JSON response:
\`\`\`json
{
  "shouldContinue": boolean,
  "isTaskComplete": boolean,
  "reasoning": "explanation of current state and decision",
  "nextActions": [
    // Array of browser actions if shouldContinue is true
  ]
}
\`\`\``

    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.3,
          maxOutputTokens: 2000
        }
      })

      const responseText = response.text || ''
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.error('Analysis error:', error)
      return {
        shouldContinue: false,
        isTaskComplete: true,
        reasoning: 'Unable to analyze page state'
      }
    }
  }

  async extractData(
    sessionId: string,
    extractionGoal: string
  ): Promise<Record<string, unknown>> {
    const pageAnalysis = await browserManager.analyzePage(sessionId)

    const prompt = `You are a data extraction AI. Extract the requested information from the current page.

EXTRACTION GOAL: ${extractionGoal}

PAGE CONTENT:
- URL: ${pageAnalysis.url}
- Title: ${pageAnalysis.title}

HEADINGS:
${pageAnalysis.content.headings.map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}

PARAGRAPHS:
${pageAnalysis.content.paragraphs.slice(0, 10).join('\n\n')}

TABLES:
${JSON.stringify(pageAnalysis.content.tables, null, 2)}

LISTS:
${JSON.stringify(pageAnalysis.content.lists, null, 2)}

Extract the requested data and return it as a structured JSON object.
Return ONLY the JSON wrapped in \`\`\`json markers.`

    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.2,
          maxOutputTokens: 4000
        }
      })

      const responseText = response.text || ''
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.error('Extraction error:', error)
      return { error: 'Failed to extract data', raw: pageAnalysis.content }
    }
  }

  async interpretScreenshot(
    screenshot: string,
    question: string
  ): Promise<string> {
    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: question },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: screenshot
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0.3,
          maxOutputTokens: 2000
        }
      })

      return response.text || 'Unable to interpret screenshot'
    } catch (error) {
      console.error('Screenshot interpretation error:', error)
      return 'Failed to interpret screenshot'
    }
  }

  private buildPlanningPrompt(context: PlanContext): string {
    let prompt = `You are an expert browser automation AI. Create a detailed execution plan for the following objective.

OBJECTIVE: ${context.objective}

`

    if (context.currentUrl) {
      prompt += `CURRENT URL: ${context.currentUrl}\n\n`
    }

    if (context.pageAnalysis) {
      prompt += `CURRENT PAGE ANALYSIS:
- Title: ${context.pageAnalysis.title}
- Visible Interactive Elements: ${context.pageAnalysis.elements.filter(e => e.isVisible).length}
- Forms: ${context.pageAnalysis.forms.length}
- Navigation Links: ${context.pageAnalysis.navigation.length}

Available Elements (sample):
${JSON.stringify(context.pageAnalysis.elements.filter(e => e.isVisible).slice(0, 15), null, 2)}

`
    }

    if (context.previousActions && context.previousActions.length > 0) {
      prompt += `PREVIOUS ACTIONS:
${JSON.stringify(context.previousActions, null, 2)}

PREVIOUS RESULTS:
${JSON.stringify(context.previousResults, null, 2)}

`
    }

    prompt += `Create an execution plan with specific tasks. Each task should describe what needs to be done and what outcome is expected.

Return your response as JSON with this structure:
\`\`\`json
{
  "objective": "restated objective",
  "estimatedSteps": number,
  "tasks": [
    {
      "description": "what this task accomplishes",
      "actions": [
        {
          "type": "action type",
          "description": "what this action does"
        }
      ],
      "expectedOutcome": "what should happen after this task"
    }
  ],
  "fallbackStrategies": ["alternative approaches if primary plan fails"]
}
\`\`\`

Be specific and practical. Focus on actions that can be reliably automated.`

    return prompt
  }
}

export const taskPlanner = new TaskPlanner()
export default taskPlanner
