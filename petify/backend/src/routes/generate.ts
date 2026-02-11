import { Router, Request, Response } from 'express';
import { aiService } from '../services/ai.service.js';
import { storageService } from '../services/storage.service.js';
import { approvalService } from '../services/approval.service.js';
import { submitCheckpoint, generateCheckpointId } from '../utils/checkpoint.js';
import { AIGenerationRequest } from '../types/index.js';

const router = Router();

/**
 * POST /generate
 * Generates AI artwork from uploaded pet photo
 * Requires approval before proceeding with AI generation
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { imageUrl, style, prompt } = req.body;

    // Validate request
    if (!imageUrl || !style) {
      return res.status(400).json({
        error: 'Missing required fields: imageUrl and style are required'
      });
    }

    console.log(`[Generate Route] AI generation requested for style: ${style}`);

    // Create checkpoint for approval
    const checkpointId = generateCheckpointId('ai_generation');
    
    const request: AIGenerationRequest = {
      imageUrl,
      style,
      prompt
    };

    // Submit checkpoint (non-blocking)
    await submitCheckpoint({
      checkpointId,
      summary: `AI image generation with ${style} style`,
      agentName: 'PetifyAgent',
      context: `Requesting approval to generate AI artwork using ${style} style. This will consume OpenAI API credits.`,
      metadata: {
        style,
        imageUrl,
        estimatedCost: '$0.02-0.04'
      }
    });

    // Wait for approval
    console.log(`[Generate Route] Waiting for approval: ${checkpointId}`);
    const approvalResult = await approvalService.waitForApproval(
      checkpointId,
      'ai_generation',
      request
    );

    if (!approvalResult.approved) {
      if (approvalResult.needsRevision) {
        return res.status(400).json({
          error: 'Generation requires revision',
          instructions: approvalResult.instructions,
          checkpointId
        });
      }
    }

    console.log(`[Generate Route] Approval received, proceeding with generation`);

    // Generate AI artwork with retry
    const result = await aiService.generateWithRetry(request);

    // Download and store the generated image
    const filename = `generated-${Date.now()}.png`;
    await storageService.downloadImage(result.generatedImageUrl, filename);

    const localUrl = storageService.getPublicUrl(filename, 'generated');

    console.log(`[Generate Route] AI generation completed: ${filename}`);

    res.json({
      success: true,
      result: {
        generatedImageUrl: localUrl,
        originalUrl: result.generatedImageUrl,
        prompt: result.prompt,
        style: result.style,
        filename,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('[Generate Route] Error generating artwork:', error);
    res.status(500).json({
      error: 'AI generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /generate/styles
 * Returns available art styles
 */
router.get('/styles', (req: Request, res: Response) => {
  const styles = [
    { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing watercolor painting', category: 'artistic' },
    { id: 'oil_painting', name: 'Oil Painting', description: 'Classical oil painting style', category: 'artistic' },
    { id: 'cartoon', name: 'Cartoon', description: 'Cute cartoon style', category: 'artistic' },
    { id: 'pop_art', name: 'Pop Art', description: 'Bold pop art style', category: 'artistic' },
    { id: 'sketch', name: 'Sketch', description: 'Pencil sketch drawing', category: 'artistic' },
    { id: 'digital_art', name: 'Digital Art', description: 'Modern digital artwork', category: 'artistic' },
    { id: 'christmas', name: 'Christmas', description: 'Festive Christmas theme', category: 'holiday' },
    { id: 'halloween', name: 'Halloween', description: 'Spooky Halloween theme', category: 'holiday' },
    { id: 'birthday', name: 'Birthday', description: 'Birthday celebration theme', category: 'event' },
    { id: 'valentines', name: "Valentine's Day", description: 'Romantic Valentine theme', category: 'event' }
  ];

  res.json({ styles });
});

export default router;
