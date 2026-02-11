import axios from 'axios';
import { CheckpointSubmission } from '../types/index.js';

const APPROVAL_BOT_URL = process.env.APPROVAL_BOT_URL || 'http://localhost:3000';

/**
 * Submits a checkpoint to the approval bot (non-blocking)
 * @param checkpoint - The checkpoint submission data
 */
export async function submitCheckpoint(checkpoint: CheckpointSubmission): Promise<void> {
  try {
    console.log(`[Checkpoint] Submitting checkpoint: ${checkpoint.checkpointId}`);
    console.log(`[Checkpoint] Summary: ${checkpoint.summary}`);
    
    // Non-blocking submission
    axios.post(`${APPROVAL_BOT_URL}/checkpoint`, checkpoint, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      // Log error but don't throw - checkpoint submission is non-blocking
      console.error(`[Checkpoint] Failed to submit checkpoint ${checkpoint.checkpointId}:`, error.message);
    });
    
    console.log(`[Checkpoint] Checkpoint submitted (non-blocking): ${checkpoint.checkpointId}`);
  } catch (error) {
    console.error('[Checkpoint] Error in submitCheckpoint:', error);
    // Don't throw - checkpoint submission should not block operations
  }
}

/**
 * Creates a unique checkpoint ID
 */
export function generateCheckpointId(prefix: string = 'checkpoint'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}
