import { useEffect, useRef, useCallback, useState } from 'react'
import type { ReviewFocus, ModelStatus, ReviewStatus, WorkerOutMessage } from '../types'

const INFERENCE_TIMEOUT_MS = 60_000

// Per-focus system prompts
const SYSTEM_PROMPTS: Record<ReviewFocus, string> = {
  general: `You are a senior software engineer doing a code review. Analyze the code for:
- Correctness: bugs, off-by-one errors, unhandled edge cases
- Code quality: naming, readability, unnecessary complexity
- Maintainability: coupling, cohesion, technical debt

Use markdown: ## for headings, - for bullets, \`backticks\` for inline code, **bold** for key findings. Be concise and actionable. No preamble.`,

  performance: `You are a performance engineer doing a code review. Analyze strictly for performance:
- Algorithmic complexity: hidden O(n²) loops, unnecessary iteration
- I/O patterns: N+1 queries, missing batching, serial vs parallel
- Memory: excessive allocation, GC pressure, unbounded growth
- Unnecessary work: redundant calls, missing memoisation

Use markdown. Lead with highest-impact findings. No preamble.`,

  security: `You are a security engineer doing a code review. Analyze for vulnerabilities:
- Injection: SQL injection, XSS, command injection — show the exact attack vector
- Input validation: missing checks, type confusion
- Data exposure: SELECT *, sensitive fields in logs, over-permissive responses
- Auth / authz: missing checks, insecure defaults

Use markdown. Rate each finding high / medium / low. Mark release blockers explicitly. No preamble.`,

  accessibility: `You are an accessibility engineer doing a code review. Analyze for a11y issues:
- ARIA: missing roles, labels, live regions for dynamic content
- Keyboard: focus management, tab order, keyboard traps
- Semantics: non-semantic elements used for interaction, missing alt text
- Error states: errors not surfaced to assistive technology

Use markdown. Reference WCAG 2.1 success criteria where applicable. No preamble.`,
}

export interface UseCodeReviewReturn {
  modelStatus: ModelStatus
  modelProgress: number
  reviewStatus: ReviewStatus
  streamedText: string
  error: string | null
  startReview: () => void
  abortReview: () => void
}

export function useCodeReview(code: string, focus: ReviewFocus): UseCodeReviewReturn {
  const workerRef = useRef<Worker | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusRef = useRef(focus)
  const codeRef = useRef(code)

  useEffect(() => { focusRef.current = focus }, [focus])
  useEffect(() => { codeRef.current = code }, [code])

  const [modelStatus, setModelStatus] = useState<ModelStatus>('checking')
  const [modelProgress, setModelProgress] = useState(0)
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle')
  const [streamedText, setStreamedText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const clearTimeout_ = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const resetTimeout = useCallback(() => {
    clearTimeout_()
    timeoutRef.current = setTimeout(() => {
      setReviewStatus('error')
      setError('Inference timed out after 60 s. Try again.')
      workerRef.current?.postMessage({ type: 'ABORT' })
    }, INFERENCE_TIMEOUT_MS)
  }, [clearTimeout_])

  // Spawn worker once on mount
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/llm.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data
      switch (msg.type) {
        case 'WEBGPU_UNSUPPORTED':
          setModelStatus('unsupported')
          break
        case 'MODEL_PROGRESS':
          setModelStatus('loading')
          setModelProgress(msg.progress)
          break
        case 'MODEL_READY':
          setModelStatus('ready')
          setModelProgress(100)
          break
        case 'MODEL_ERROR':
          setModelStatus('error')
          setError(msg.message)
          break
        case 'TOKEN':
          resetTimeout()
          setStreamedText(prev => prev + msg.text)
          break
        case 'REVIEW_DONE':
          clearTimeout_()
          setReviewStatus('complete')
          break
        case 'REVIEW_ERROR':
          clearTimeout_()
          setReviewStatus('error')
          setError(msg.message)
          break
      }
    }

    worker.onerror = (e) => {
      setModelStatus('error')
      setError(`Worker crashed: ${e.message}`)
    }

    workerRef.current = worker
    worker.postMessage({ type: 'INIT', modelId: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC' })

    return () => {
      clearTimeout_()
      worker.postMessage({ type: 'ABORT' })
      worker.terminate()
    }
  }, [clearTimeout_, resetTimeout])

  const startReview = useCallback(() => {
    if (modelStatus !== 'ready') return
    if (reviewStatus === 'reviewing') return
    if (!codeRef.current.trim()) return

    setReviewStatus('reviewing')
    setStreamedText('')
    setError(null)
    resetTimeout()

    workerRef.current?.postMessage({
      type: 'REVIEW',
      code: codeRef.current,
      focus: focusRef.current,
      systemPrompt: SYSTEM_PROMPTS[focusRef.current],
    })
  }, [modelStatus, reviewStatus, resetTimeout])

  const abortReview = useCallback(() => {
    clearTimeout_()
    workerRef.current?.postMessage({ type: 'ABORT' })
    setReviewStatus('idle')
  }, [clearTimeout_])

  return { modelStatus, modelProgress, reviewStatus, streamedText, error, startReview, abortReview }
}