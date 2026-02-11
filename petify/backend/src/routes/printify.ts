import { Router, Request, Response } from 'express';
import { printifyService } from '../services/printify.service.js';
import { approvalService } from '../services/approval.service.js';
import { submitCheckpoint, generateCheckpointId } from '../utils/checkpoint.js';
import { PrintifyProductRequest } from '../types/index.js';

const router = Router();

/**
 * POST /printify/create
 * Creates a Printify product with generated artwork
 * Requires approval before proceeding
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { imageUrl, title, description, variants } = req.body;

    // Validate request
    if (!imageUrl || !title) {
      return res.status(400).json({
        error: 'Missing required fields: imageUrl and title are required'
      });
    }

    console.log(`[Printify Route] Product creation requested: ${title}`);

    // Create checkpoint for approval
    const checkpointId = generateCheckpointId('printify_creation');
    
    const request: PrintifyProductRequest = {
      imageUrl,
      title,
      description: description || `Custom pet artwork: ${title}`,
      variants
    };

    // Submit checkpoint (non-blocking)
    await submitCheckpoint({
      checkpointId,
      summary: `Create Printify product: ${title}`,
      agentName: 'PetifyAgent',
      context: `Requesting approval to create a Printify product. This will create a real product in the Printify catalog.`,
      metadata: {
        title,
        imageUrl,
        productType: 'Custom Pet Artwork T-Shirt'
      }
    });

    // Wait for approval
    console.log(`[Printify Route] Waiting for approval: ${checkpointId}`);
    const approvalResult = await approvalService.waitForApproval(
      checkpointId,
      'printify_creation',
      request
    );

    if (!approvalResult.approved) {
      if (approvalResult.needsRevision) {
        return res.status(400).json({
          error: 'Product creation requires revision',
          instructions: approvalResult.instructions,
          checkpointId
        });
      }
    }

    console.log(`[Printify Route] Approval received, creating product`);

    // Create the product
    const result = await printifyService.createProduct(request);

    console.log(`[Printify Route] Product created: ${result.productId}`);

    res.json({
      success: true,
      product: result
    });
  } catch (error) {
    console.error('[Printify Route] Error creating product:', error);
    res.status(500).json({
      error: 'Product creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /printify/publish/:productId
 * Publishes a Printify product to Shopify
 */
router.post('/publish/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    console.log(`[Printify Route] Publishing product: ${productId}`);

    await printifyService.publishToShopify(productId);

    res.json({
      success: true,
      message: `Product ${productId} published to Shopify`
    });
  } catch (error) {
    console.error('[Printify Route] Error publishing product:', error);
    res.status(500).json({
      error: 'Product publish failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
