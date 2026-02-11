// Approval System Types
export interface CheckpointSubmission {
  checkpointId: string;
  summary: string;
  agentName: string;
  context: string;
  metadata?: Record<string, any>;
}

export interface ApprovalDecision {
  decision: 'approved' | 'revise' | 'stopped';
  checkpointId: string;
  instructions?: string;
}

export type ApprovalDecisionType = 'approved' | 'revise' | 'stopped';

// Pending Operation Types
export interface PendingOperation {
  id: string;
  type: 'ai_generation' | 'printify_creation' | 'deployment' | 'phase_completion';
  data: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  createdAt: Date;
}

// AI Generation Types
export interface AIGenerationRequest {
  imageUrl: string;
  style: string;
  prompt?: string;
}

export interface AIGenerationResponse {
  generatedImageUrl: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

// Printify Types
export interface PrintifyProductRequest {
  imageUrl: string;
  title: string;
  description: string;
  variants?: any[];
}

export interface PrintifyProductResponse {
  productId: string;
  variants: any[];
  previewUrl: string;
}

// Upload Types
export interface UploadedFile {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

// Art Style Types
export type ArtStyle = 
  | 'watercolor'
  | 'oil_painting'
  | 'cartoon'
  | 'pop_art'
  | 'sketch'
  | 'digital_art'
  | 'christmas'
  | 'halloween'
  | 'birthday'
  | 'valentines';

export interface StyleOption {
  id: ArtStyle;
  name: string;
  description: string;
  category: 'artistic' | 'holiday' | 'event';
}
