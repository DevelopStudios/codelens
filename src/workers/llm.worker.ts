import { MLCEngine } from '@mlc-ai/web-llm'
import type { WorkerInMessage, WorkerOutMessage } from '../types'

const MODEL_ID = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'

let engine: MLCEngine | null = null
let abortController: AbortController | null = null

function send(msg: WorkerOutMessage) {
  self.postMessage(msg)
}

export async function init() {
  if (!('gpu' in navigator)) {
    send({ type: 'WEBGPU_UNSUPPORTED' })
    return
  }

  try {
    engine = new MLCEngine({
      initProgressCallback: (report) => {
        send({
          type: 'MODEL_PROGRESS',
          progress: Math.round(report.progress * 100),
        })
      },
    })
    await engine.reload(MODEL_ID)
    send({ type: 'MODEL_READY' })
  } catch (err) {
    send({
      type: 'MODEL_ERROR',
      message: err instanceof Error ? err.message : String(err),
    })
  }
}

export async function review(code: string, systemPrompt: string) {
  if (!engine) {
    send({ type: 'REVIEW_ERROR', message: 'Engine not ready.' })
    return
  }

  abortController = new AbortController()
  const { signal } = abortController

  try {
    const stream = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review this code:\n\n\`\`\`\n${code}\n\`\`\`` },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      stream: true,
    })

    for await (const chunk of stream) {
      if (signal.aborted) break
      const text = chunk.choices[0]?.delta?.content
      if (text) send({ type: 'TOKEN', text })
    }

    if (!signal.aborted) send({ type: 'REVIEW_DONE' })
  } catch (err) {
    if (signal.aborted) return
    send({
      type: 'REVIEW_ERROR',
      message: err instanceof Error ? err.message : String(err),
    })
  } finally {
    abortController = null
  }
}

// Exported so it can be driven directly in tests without spawning a real
// Worker. Returns the in-flight promise for INIT/REVIEW so callers can await.
export function handleMessage(msg: WorkerInMessage): void | Promise<void> {
  if (msg.type === 'INIT') return init()
  if (msg.type === 'REVIEW') return review(msg.code, msg.systemPrompt)
  if (msg.type === 'ABORT') abortController?.abort()
}

self.addEventListener('message', (e: MessageEvent<WorkerInMessage>) => {
  void handleMessage(e.data)
})