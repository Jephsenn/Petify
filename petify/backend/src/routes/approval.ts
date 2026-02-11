import { Router, Request, Response } from 'express';
import { approvalService } from '../services/approval.service.js';
import { ApprovalDecision } from '../types/index.js';

const router = Router();

/**
 * POST /approval
 * Receives approval decisions from the approval bot
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const decision: ApprovalDecision = req.body;
    
    console.log('[Approval Route] Received approval decision:', decision);

    // Validate required fields
    if (!decision.checkpointId || !decision.decision) {
      return res.status(400).json({
        error: 'Missing required fields: checkpointId and decision are required'
      });
    }

    // Validate decision type
    if (!['approved', 'revise', 'stopped'].includes(decision.decision)) {
      return res.status(400).json({
        error: 'Invalid decision type. Must be: approved, revise, or stopped'
      });
    }

    // Handle the approval decision
    await approvalService.handleApprovalDecision(decision);

    res.json({
      success: true,
      message: `Decision ${decision.decision} processed for checkpoint ${decision.checkpointId}`
    });
  } catch (error) {
    console.error('[Approval Route] Error processing approval decision:', error);
    res.status(500).json({
      error: 'Internal server error processing approval decision',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /approval/pending
 * Lists all pending operations (for debugging/monitoring)
 */
router.get('/pending', (req: Request, res: Response) => {
  try {
    const pending = approvalService.getAllPendingOperations();
    res.json({
      count: pending.length,
      operations: pending.map(op => ({
        id: op.id,
        type: op.type,
        createdAt: op.createdAt,
        dataPreview: JSON.stringify(op.data).substring(0, 100)
      }))
    });
  } catch (error) {
    console.error('[Approval Route] Error getting pending operations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
