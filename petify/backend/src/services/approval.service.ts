import { PendingOperation, ApprovalDecision } from '../types/index.js';

/**
 * In-memory storage for pending operations
 * Maps checkpointId to the pending operation details
 */
class ApprovalService {
  private pendingOperations: Map<string, PendingOperation> = new Map();

  /**
   * Stores a pending operation awaiting approval
   */
  addPendingOperation(operation: PendingOperation): void {
    console.log(`[Approval] Adding pending operation: ${operation.id} (${operation.type})`);
    this.pendingOperations.set(operation.id, operation);
  }

  /**
   * Retrieves a pending operation by checkpoint ID
   */
  getPendingOperation(checkpointId: string): PendingOperation | undefined {
    return this.pendingOperations.get(checkpointId);
  }

  /**
   * Removes a pending operation after it's been processed
   */
  removePendingOperation(checkpointId: string): boolean {
    console.log(`[Approval] Removing pending operation: ${checkpointId}`);
    return this.pendingOperations.delete(checkpointId);
  }

  /**
   * Handles an approval decision from the approval bot
   */
  async handleApprovalDecision(decision: ApprovalDecision): Promise<void> {
    const { checkpointId, decision: decisionType, instructions } = decision;
    
    console.log(`[Approval] Received decision for ${checkpointId}: ${decisionType}`);
    if (instructions) {
      console.log(`[Approval] Instructions: ${instructions}`);
    }

    const operation = this.getPendingOperation(checkpointId);
    
    if (!operation) {
      console.warn(`[Approval] No pending operation found for checkpoint: ${checkpointId}`);
      return;
    }

    try {
      switch (decisionType) {
        case 'approved':
          console.log(`[Approval] Operation approved: ${checkpointId}`);
          operation.resolve({ approved: true, instructions });
          this.removePendingOperation(checkpointId);
          break;

        case 'revise':
          console.log(`[Approval] Operation needs revision: ${checkpointId}`);
          operation.resolve({ 
            approved: false, 
            needsRevision: true, 
            instructions 
          });
          // Don't remove yet - may need to resubmit
          break;

        case 'stopped':
          console.log(`[Approval] Operation stopped: ${checkpointId}`);
          operation.reject(new Error(`Operation stopped by approval system: ${instructions || 'No reason provided'}`));
          this.removePendingOperation(checkpointId);
          break;

        default:
          console.warn(`[Approval] Unknown decision type: ${decisionType}`);
      }
    } catch (error) {
      console.error(`[Approval] Error handling decision for ${checkpointId}:`, error);
      operation.reject(error);
      this.removePendingOperation(checkpointId);
    }
  }

  /**
   * Creates a promise that waits for approval
   */
  async waitForApproval(checkpointId: string, type: PendingOperation['type'], data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const operation: PendingOperation = {
        id: checkpointId,
        type,
        data,
        resolve,
        reject,
        createdAt: new Date()
      };

      this.addPendingOperation(operation);

      // Set a timeout to prevent hanging indefinitely (30 minutes)
      setTimeout(() => {
        if (this.getPendingOperation(checkpointId)) {
          console.warn(`[Approval] Operation timeout for ${checkpointId}`);
          this.removePendingOperation(checkpointId);
          reject(new Error(`Approval timeout for checkpoint ${checkpointId}`));
        }
      }, 30 * 60 * 1000);
    });
  }

  /**
   * Gets all pending operations (for debugging)
   */
  getAllPendingOperations(): PendingOperation[] {
    return Array.from(this.pendingOperations.values());
  }

  /**
   * Clears all pending operations (use with caution)
   */
  clearAll(): void {
    console.log('[Approval] Clearing all pending operations');
    this.pendingOperations.clear();
  }
}

// Export singleton instance
export const approvalService = new ApprovalService();
