/**
 * Gemini Computer Use Client
 * Uses the official Gemini 2.5 Computer Use Preview model for browser automation
 */

import { GoogleGenAI, Type } from '@google/genai'

// Initialize Gemini client
const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

// The correct model for Computer Use
export const COMPUTER_USE_MODEL = 'gemini-2.5-computer-use-preview-10-2025'

// Screen dimensions (recommended by Google)
export const SCREEN_WIDTH = 1440
export const SCREEN_HEIGHT = 900

// Safety decision types
export type SafetyDecision = 'regular' | 'require_confirmation' | 'block'

// Function call from the model
export interface ComputerUseAction {
  name: string
  args: Record<string, unknown>
  safetyDecision?: {
    decision: SafetyDecision
    explanation: string
  }
}

// Response from the model
export interface ComputerUseResponse {
  text?: string
  actions: ComputerUseAction[]
  isComplete: boolean
  requiresConfirmation: boolean
  confirmationExplanation?: string
}

// Conversation history item
export interface ConversationItem {
  role: 'user' | 'model'
  parts: Array<{
    text?: string
    inlineData?: {
      mimeType: string
      data: string // base64
    }
    functionCall?: {
      name: string
      args: Record<string, unknown>
    }
    functionResponse?: {
      name: string
      response: Record<string, unknown>
    }
  }>
}

/**
 * Computer Use Agent Client
 * Manages the conversation with the Gemini Computer Use model
 */
export class ComputerUseClient {
  private conversationHistory: ConversationItem[] = []
  private excludedFunctions: string[] = []

  constructor(excludedFunctions: string[] = []) {
    this.excludedFunctions = excludedFunctions
  }

  /**
   * Initialize a new session with a goal and initial screenshot
   */
  async initializeSession(
    goal: string,
    screenshotBase64: string,
    currentUrl?: string
  ): Promise<ComputerUseResponse> {
    // Reset conversation history
    this.conversationHistory = []

    // Create initial user message with goal and screenshot
    const userContent: ConversationItem = {
      role: 'user',
      parts: [
        { text: goal },
        {
          inlineData: {
            mimeType: 'image/png',
            data: screenshotBase64,
          },
        },
      ],
    }

    if (currentUrl) {
      userContent.parts.unshift({ text: `Current URL: ${currentUrl}` })
    }

    this.conversationHistory.push(userContent)

    return this.generateResponse()
  }

  /**
   * Send action results back to the model
   */
  async sendActionResults(
    actionResults: Array<{
      name: string
      screenshotBase64: string
      currentUrl: string
      error?: string
      safetyAcknowledged?: boolean
    }>
  ): Promise<ComputerUseResponse> {
    // Create function response parts
    const functionResponseParts = actionResults.map((result) => ({
      functionResponse: {
        name: result.name,
        response: {
          url: result.currentUrl,
          ...(result.error ? { error: result.error } : {}),
          ...(result.safetyAcknowledged ? { safety_acknowledgement: 'true' } : {}),
        },
      },
      // Include screenshot in the response
      inlineData: {
        mimeType: 'image/png',
        data: result.screenshotBase64,
      },
    }))

    // Add to conversation as user turn (function responses come from user)
    this.conversationHistory.push({
      role: 'user',
      parts: functionResponseParts as ConversationItem['parts'],
    })

    return this.generateResponse()
  }

  /**
   * Generate response from the model
   */
  private async generateResponse(): Promise<ComputerUseResponse> {
    try {
      const response = await genai.models.generateContent({
        model: COMPUTER_USE_MODEL,
        contents: this.conversationHistory.map((item) => ({
          role: item.role,
          parts: item.parts,
        })),
        config: {
          tools: [
            {
              // @ts-expect-error - computerUse is a valid tool type for this model
              computerUse: {
                environment: 'ENVIRONMENT_BROWSER',
                ...(this.excludedFunctions.length > 0
                  ? { excludedPredefinedFunctions: this.excludedFunctions }
                  : {}),
              },
            },
          ],
        },
      })

      // Parse the response
      const candidate = response.candidates?.[0]
      if (!candidate) {
        throw new Error('No response candidate from model')
      }

      // Add model response to history
      this.conversationHistory.push({
        role: 'model',
        parts: candidate.content?.parts?.map((part: { text?: string; functionCall?: { name: string; args: Record<string, unknown> } }) => ({
          ...(part.text ? { text: part.text } : {}),
          ...(part.functionCall
            ? {
                functionCall: {
                  name: part.functionCall.name,
                  args: part.functionCall.args,
                },
              }
            : {}),
        })) || [],
      })

      // Extract actions and text from response
      const actions: ComputerUseAction[] = []
      let textResponse = ''
      let requiresConfirmation = false
      let confirmationExplanation = ''

      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          textResponse += part.text
        }
        if (part.functionCall) {
          const action: ComputerUseAction = {
            name: part.functionCall.name,
            args: part.functionCall.args as Record<string, unknown>,
          }

          // Check for safety decision in args
          if (part.functionCall.args?.safety_decision) {
            const safetyDecision = part.functionCall.args.safety_decision as {
              decision: string
              explanation: string
            }
            action.safetyDecision = {
              decision: safetyDecision.decision as SafetyDecision,
              explanation: safetyDecision.explanation,
            }

            if (safetyDecision.decision === 'require_confirmation') {
              requiresConfirmation = true
              confirmationExplanation = safetyDecision.explanation
            }
          }

          actions.push(action)
        }
      }

      // Determine if the task is complete (no more actions)
      const isComplete = actions.length === 0 && textResponse.length > 0

      return {
        text: textResponse || undefined,
        actions,
        isComplete,
        requiresConfirmation,
        confirmationExplanation: confirmationExplanation || undefined,
      }
    } catch (error) {
      console.error('Computer Use model error:', error)
      throw error
    }
  }

  /**
   * Get conversation history for debugging/logging
   */
  getConversationHistory(): ConversationItem[] {
    return [...this.conversationHistory]
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = []
  }
}

/**
 * Convert normalized coordinates (0-999) to actual pixel coordinates
 */
export function denormalizeCoordinates(
  x: number,
  y: number,
  screenWidth: number = SCREEN_WIDTH,
  screenHeight: number = SCREEN_HEIGHT
): { x: number; y: number } {
  return {
    x: Math.round((x / 1000) * screenWidth),
    y: Math.round((y / 1000) * screenHeight),
  }
}

/**
 * Create a new Computer Use client instance
 */
export function createComputerUseClient(
  excludedFunctions: string[] = []
): ComputerUseClient {
  return new ComputerUseClient(excludedFunctions)
}

export default ComputerUseClient
