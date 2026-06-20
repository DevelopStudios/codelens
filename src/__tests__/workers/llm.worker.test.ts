import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock @mlc-ai/web-llm ──────────────────────────────────────────────────
// vi.hoisted runs before imports so the vi.mock factory below can reference
// these without a temporal-dead-zone error.
const { mockReload, mockCreate, MLCEngineMock, getProgressCb } = vi.hoisted(() => {
  let progressCb: ((report: { progress: number }) => void) | undefined
  const mockReload = vi.fn()
  const mockCreate = vi.fn()
  // Regular function (not arrow) so `new MLCEngine(...)` assigns to `this`.
  const MLCEngineMock = vi.fn(function (
    this: { reload: typeof mockReload; chat: { completions: { create: typeof mockCreate } } },
    opts: { initProgressCallback?: (r: { progress: number }) => void },
  ) {
    progressCb = opts?.initProgressCallback
    this.reload = mockReload
    this.chat = { completions: { create: mockCreate } }
  })
  return { mockReload, mockCreate, MLCEngineMock, getProgressCb: () => progressCb }
})

vi.mock('@mlc-ai/web-llm', () => ({ MLCEngine: MLCEngineMock }))

// Build an async-iterable stream from a list of streaming chunks.
function streamOf(chunks: Array<{ choices: Array<{ delta: { content?: string } }> }>) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk
    },
  }
}

// Wait for the next microtask flush so async handlers settle.
const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('llm.worker.ts', () => {
  let worker: typeof import('../../workers/llm.worker')
  let postSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.resetModules()
    MLCEngineMock.mockClear()
    mockReload.mockReset().mockResolvedValue(undefined)
    mockCreate.mockReset()
    ;(navigator as unknown as { gpu?: unknown }).gpu = {}

    // Capture everything the worker sends out.
    postSpy = vi.spyOn(self, 'postMessage').mockImplementation(() => {})

    // Fresh module each test so module-level `engine` state resets.
    worker = await import('../../workers/llm.worker')
  })

  afterEach(() => {
    postSpy.mockRestore()
  })

  test('INIT reports WEBGPU_UNSUPPORTED when WebGPU is unavailable', async () => {
    delete (navigator as unknown as { gpu?: unknown }).gpu

    await worker.handleMessage({ type: 'INIT' })

    expect(postSpy).toHaveBeenCalledWith({ type: 'WEBGPU_UNSUPPORTED' })
    expect(MLCEngineMock).not.toHaveBeenCalled()
  })

  test('INIT loads the model and reports progress then ready', async () => {
    // The engine fires its progress callback while reloading.
    mockReload.mockImplementation(async () => {
      getProgressCb()?.({ progress: 0.5 })
    })

    await worker.handleMessage({ type: 'INIT' })

    expect(MLCEngineMock).toHaveBeenCalledTimes(1)
    expect(mockReload).toHaveBeenCalledWith('Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC')
    expect(postSpy).toHaveBeenCalledWith({ type: 'MODEL_PROGRESS', progress: 50 })
    expect(postSpy).toHaveBeenCalledWith({ type: 'MODEL_READY' })
  })

  test('INIT reports MODEL_ERROR when loading fails', async () => {
    mockReload.mockRejectedValue(new Error('Failed to load model'))

    await worker.handleMessage({ type: 'INIT' })

    expect(postSpy).toHaveBeenCalledWith({ type: 'MODEL_ERROR', message: 'Failed to load model' })
  })

  test('REVIEW streams tokens and finishes with REVIEW_DONE', async () => {
    mockCreate.mockResolvedValue(streamOf([{ choices: [{ delta: { content: 'Hello' } }] }]))

    await worker.handleMessage({ type: 'INIT' })
    await worker.handleMessage({
      type: 'REVIEW',
      code: 'const x = 1;',
      focus: 'general',
      systemPrompt: 'You are a senior software engineer',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      messages: [
        { role: 'system', content: 'You are a senior software engineer' },
        { role: 'user', content: 'Review this code:\n\n```\nconst x = 1;\n```' },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      stream: true,
    })
    expect(postSpy).toHaveBeenCalledWith({ type: 'TOKEN', text: 'Hello' })
    expect(postSpy).toHaveBeenCalledWith({ type: 'REVIEW_DONE' })
  })

  test('REVIEW before the engine is ready reports REVIEW_ERROR', async () => {
    // No INIT → engine is still null.
    await worker.handleMessage({
      type: 'REVIEW',
      code: 'const x = 1;',
      focus: 'general',
      systemPrompt: 'prompt',
    })

    expect(postSpy).toHaveBeenCalledWith({ type: 'REVIEW_ERROR', message: 'Engine not ready.' })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  test('ABORT during streaming stops tokens and suppresses REVIEW_DONE', async () => {
    // Stream that triggers an abort after the first chunk is consumed.
    const abortingStream = {
      [Symbol.asyncIterator]() {
        const chunks = [
          { choices: [{ delta: { content: 'A' } }] },
          { choices: [{ delta: { content: 'B' } }] },
        ]
        let i = 0
        return {
          next: async () => {
            if (i === 1) worker.handleMessage({ type: 'ABORT' })
            if (i >= chunks.length) return { done: true, value: undefined }
            return { done: false, value: chunks[i++] }
          },
        }
      },
    }
    mockCreate.mockResolvedValue(abortingStream)

    await worker.handleMessage({ type: 'INIT' })
    await worker.handleMessage({
      type: 'REVIEW',
      code: 'const x = 1;',
      focus: 'general',
      systemPrompt: 'prompt',
    })

    expect(postSpy).toHaveBeenCalledWith({ type: 'TOKEN', text: 'A' })
    expect(postSpy).not.toHaveBeenCalledWith({ type: 'TOKEN', text: 'B' })
    expect(postSpy).not.toHaveBeenCalledWith({ type: 'REVIEW_DONE' })
  })

  test('REVIEW reports REVIEW_ERROR when streaming throws', async () => {
    mockCreate.mockRejectedValue(new Error('Streaming failed'))

    await worker.handleMessage({ type: 'INIT' })
    await worker.handleMessage({
      type: 'REVIEW',
      code: 'const x = 1;',
      focus: 'general',
      systemPrompt: 'prompt',
    })
    await flush()

    expect(postSpy).toHaveBeenCalledWith({ type: 'REVIEW_ERROR', message: 'Streaming failed' })
  })
})
