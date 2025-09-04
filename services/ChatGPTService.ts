import { ChatGPTResponse, Message } from '../types/voice-chat';

interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ChatGPTService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-5'; // You can change to 'gpt-4' for better quality
  private systemPrompt = `You are an field inspector assistant for HOA community and you are supporting to register violations. Parse the message bellow to identify the addres and the violation details and parse the result in json format with the attributes address and violationDescription.`;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    if (model) {
      this.model = model;
    }
  }

  /**
   * Send a message to ChatGPT and get a response
   */
  async sendMessage(
    userMessage: string, 
    conversationHistory: Message[] = []
  ): Promise<ChatGPTResponse> {
    try {
      const messages = this.buildMessageHistory(userMessage, conversationHistory);
      
      console.log('messages', messages);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          //max_tokens: 500, // Limit response length for voice conversations
          max_completion_tokens: 500, // Limit response length for voice conversations
          temperature: 1,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ChatGPT API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data: OpenAIChatResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from ChatGPT');
      }

      const assistantMessage = data.choices[0].message.content;
      
      return {
        message: assistantMessage.trim(),
        usage: data.usage,
      };
    } catch (error) {
      console.error('ChatGPT error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get ChatGPT response: ${error.message}`);
      }
      
      throw new Error('Failed to get ChatGPT response: Unknown error');
    }
  }

  /**
   * Build the message history for the API call
   */
  private buildMessageHistory(
    currentMessage: string, 
    conversationHistory: Message[]
  ): OpenAIChatMessage[] {
    const messages: OpenAIChatMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt,
      }
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    
    for (const message of recentHistory) {
      messages.push({
        role: message.type === 'user' ? 'user' : 'assistant',
        content: message.content,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    return messages;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }

  /**
   * Set a custom system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Change the model being used
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Estimate the cost of a conversation (approximate)
   */
  estimateTokenCost(messages: Message[]): { inputTokens: number; estimatedCost: number } {
    // Rough estimation: ~4 characters per token
    const totalCharacters = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = Math.ceil(totalCharacters / 4);
    
    // GPT-3.5-turbo pricing (as of last update): $0.002 per 1K tokens
    const costPer1kTokens = this.model.includes('gpt-4') ? 0.03 : 0.002;
    const estimatedCost = (estimatedTokens / 1000) * costPer1kTokens;
    
    return {
      inputTokens: estimatedTokens,
      estimatedCost,
    };
  }
}
