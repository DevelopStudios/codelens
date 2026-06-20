export type ReviewFocus = 'general' | 'performance' | 'security' | 'accessibility'

export type ModelStatus = 'checking' | 'loading' | 'ready' | 'error' | 'unsupported'

export type ReviewStatus = 'idle' | 'reviewing' | 'complete' | 'error'

// Main thread → Worker
export type WorkerInMessage =
  | { type: 'INIT'; modelId: string }
  | { type: 'REVIEW'; code: string; focus: ReviewFocus; systemPrompt: string }
  | { type: 'ABORT' }

// Worker → Main thread
export type WorkerOutMessage =
  | { type: 'MODEL_PROGRESS'; progress: number }
  | { type: 'MODEL_READY' }
  | { type: 'MODEL_ERROR'; message: string }
  | { type: 'TOKEN'; text: string }
  | { type: 'REVIEW_DONE' }
  | { type: 'REVIEW_ERROR'; message: string }
  | { type: 'WEBGPU_UNSUPPORTED' }
