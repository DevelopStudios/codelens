import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { useCodeReview } from '@/hooks/useCodeReview'

const MODEL_ID = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'

// The hook assigns its own handlers to worker.onmessage / worker.onerror, so
// we capture the constructed worker and invoke those handlers directly rather
// than relying on a real Worker runtime (jsdom has none).
class FakeWorker {
  onmessage: ((e: { data: unknown }) => void) | null = null
  onerror: ((e: { message: string }) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()

  constructor() {
    lastWorker = this
  }

  emit(data: unknown) {
    this.onmessage?.({ data })
  }

  crash(message: string) {
    this.onerror?.({ message })
  }
}

let lastWorker: FakeWorker

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('useCodeReview hook', () => {
  test('initial state is checking / idle', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    expect(result.current.modelStatus).toBe('checking')
    expect(result.current.modelProgress).toBe(0)
    expect(result.current.reviewStatus).toBe('idle')
    expect(result.current.streamedText).toBe('')
    expect(result.current.error).toBeNull()
  })

  test('spawns a worker and posts INIT with the model id', () => {
    renderHook(() => useCodeReview('const x = 1;', 'general'))

    expect(lastWorker.postMessage).toHaveBeenCalledWith({ type: 'INIT', modelId: MODEL_ID })
  })

  test('handles WEBGPU_UNSUPPORTED', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'WEBGPU_UNSUPPORTED' }))

    expect(result.current.modelStatus).toBe('unsupported')
  })

  test('handles MODEL_PROGRESS', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_PROGRESS', progress: 50 }))

    expect(result.current.modelStatus).toBe('loading')
    expect(result.current.modelProgress).toBe(50)
  })

  test('handles MODEL_READY', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))

    expect(result.current.modelStatus).toBe('ready')
    expect(result.current.modelProgress).toBe(100)
  })

  test('handles MODEL_ERROR', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_ERROR', message: 'Failed to load model' }))

    expect(result.current.modelStatus).toBe('error')
    expect(result.current.error).toBe('Failed to load model')
  })

  test('accumulates streamed tokens', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'TOKEN', text: 'Hello' }))
    act(() => lastWorker.emit({ type: 'TOKEN', text: ' world' }))

    expect(result.current.streamedText).toBe('Hello world')
  })

  test('handles REVIEW_DONE after a review starts', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())
    act(() => lastWorker.emit({ type: 'REVIEW_DONE' }))

    expect(result.current.reviewStatus).toBe('complete')
    expect(result.current.error).toBeNull()
  })

  test('handles REVIEW_ERROR', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())
    act(() => lastWorker.emit({ type: 'REVIEW_ERROR', message: 'Inference failed' }))

    expect(result.current.reviewStatus).toBe('error')
    expect(result.current.error).toBe('Inference failed')
  })

  test('handles a worker crash', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.crash('boom'))

    expect(result.current.modelStatus).toBe('error')
    expect(result.current.error).toBe('Worker crashed: boom')
  })

  test('startReview only posts REVIEW once the model is ready', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    // Not ready yet → no-op.
    act(() => result.current.startReview())
    expect(result.current.reviewStatus).toBe('idle')
    expect(lastWorker.postMessage).toHaveBeenCalledTimes(1) // INIT only

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())

    expect(result.current.reviewStatus).toBe('reviewing')
    expect(lastWorker.postMessage).toHaveBeenCalledTimes(2) // INIT + REVIEW
    expect(lastWorker.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'REVIEW', code: 'const x = 1;', focus: 'general' }),
    )
  })

  test('startReview is a no-op while a review is in progress', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())
    act(() => result.current.startReview())

    expect(result.current.reviewStatus).toBe('reviewing')
    expect(lastWorker.postMessage).toHaveBeenCalledTimes(2) // INIT + one REVIEW
  })

  test('startReview is a no-op when code is empty', () => {
    const { result } = renderHook(() => useCodeReview('   ', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())

    expect(result.current.reviewStatus).toBe('idle')
    expect(lastWorker.postMessage).toHaveBeenCalledTimes(1) // INIT only
  })

  test('abortReview resets to idle and posts ABORT', () => {
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())
    act(() => result.current.abortReview())

    expect(result.current.reviewStatus).toBe('idle')
    expect(lastWorker.postMessage).toHaveBeenCalledWith({ type: 'ABORT' })
  })

  test('a stalled review times out, errors, and posts ABORT', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCodeReview('const x = 1;', 'general'))

    act(() => lastWorker.emit({ type: 'MODEL_READY' }))
    act(() => result.current.startReview())
    act(() => vi.advanceTimersByTime(60_000))

    expect(result.current.reviewStatus).toBe('error')
    expect(result.current.error).toBe('Inference timed out after 60 s. Try again.')
    expect(lastWorker.postMessage).toHaveBeenCalledWith({ type: 'ABORT' })
  })

  test('unmount terminates the worker and posts ABORT', () => {
    const { unmount } = renderHook(() => useCodeReview('const x = 1;', 'general'))
    const worker = lastWorker

    unmount()

    expect(worker.terminate).toHaveBeenCalledTimes(1)
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'ABORT' })
  })
})
