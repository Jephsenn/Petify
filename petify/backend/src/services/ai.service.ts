import axios from 'axios';
import { AIGenerationRequest, AIGenerationResponse } from '../types/index.js';

/**
 * AI Service for generating custom pet artwork
 * Uses OpenAI DALL-E API (can be swapped with Stability AI or other providers)
 */
class AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = 'https://api.openai.com/v1/images/generations';
    
    if (!this.apiKey) {
      console.warn('[AI Service] Warning: OPENAI_API_KEY not set. AI generation will not work.');
    }
  }

  /**
   * Generates AI artwork from a pet photo
   * @param request - The AI generation request
   * @returns The generated image URL and metadata
   */
  async generateArtwork(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`[AI Service] Generating artwork with style: ${request.style}`);

    try {
      // Build the prompt based on style
      const prompt = this.buildPrompt(request);

      // Call OpenAI DALL-E API
      const response = await axios.post(
        this.apiUrl,
        {
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const generatedImageUrl = response.data.data[0].url;

      console.log(`[AI Service] Image generated successfully`);

      return {
        generatedImageUrl,
        prompt,
        style: request.style,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[AI Service] Error generating artwork:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Builds a prompt based on the selected style
   */
  private buildPrompt(request: AIGenerationRequest): string {
    const basePrompt = request.prompt || 'A pet portrait';
    
    const stylePrompts: Record<string, string> = {
      watercolor: `${basePrompt} in beautiful watercolor painting style with soft colors and flowing brush strokes`,
      oil_painting: `${basePrompt} as a classical oil painting with rich textures and vibrant colors`,
      cartoon: `${basePrompt} in cute cartoon style with bold outlines and bright colors`,
      pop_art: `${basePrompt} in Andy Warhol pop art style with bold colors and graphic design`,
      sketch: `${basePrompt} as a detailed pencil sketch with fine lines and shading`,
      digital_art: `${basePrompt} as modern digital art with vibrant colors and smooth gradients`,
      christmas: `${basePrompt} with Christmas theme, Santa hat, snowflakes, festive decorations`,
      halloween: `${basePrompt} with Halloween theme, pumpkins, spooky atmosphere, autumn colors`,
      birthday: `${basePrompt} with birthday celebration theme, party hat, balloons, confetti`,
      valentines: `${basePrompt} with Valentine's Day theme, hearts, romantic colors, love theme`
    };

    return stylePrompts[request.style] || basePrompt;
  }

  /**
   * Retries AI generation with exponential backoff
   */
  async generateWithRetry(request: AIGenerationRequest, maxRetries: number = 3): Promise<AIGenerationResponse> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI Service] Generation attempt ${attempt}/${maxRetries}`);
        return await this.generateArtwork(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`[AI Service] Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`[AI Service] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('AI generation failed after retries');
  }
}

export const aiService = new AIService();
