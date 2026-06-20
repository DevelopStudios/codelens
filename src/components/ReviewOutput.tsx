import { useEffect, useRef } from 'react'
import type { ReviewStatus } from '../types'
import styles from './ReviewOutput.module.css'

// ─── Inline markdown renderer ─────────────────────────────────────────────────
const CURSOR = <span className={styles.cursor} aria-hidden="true" />

function renderInline(text: string, key?: string): React.ReactNode {
  // Split on **bold** and `code` spans
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <span key={key}>
      {parts.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`') && p.length > 1)
          return <code key={i} className={styles.inlineCode}>{p.slice(1, -1)}</code>
        if (p.startsWith('**') && p.endsWith('**') && p.length > 3)
          return <strong key={i} className={styles.bold}>{p.slice(2, -2)}</strong>
        return p
      })}
    </span>
  )
}

// ─── Block parser ─────────────────────────────────────────────────────────────
type Block =
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }

function parseBlocks(raw: string): Block[] {
  const lines = raw.split('\n')
  const blocks: Block[] = []
  let list: string[] | null = null

  const flushList = () => {
    if (list) { blocks.push({ t: 'ul', items: list }); list = null }
  }

  for (const line of lines) {
    if (line.startsWith('## ')) { flushList(); blocks.push({ t: 'h2', text: line.slice(3) }) }
    else if (line.startsWith('### ')){ flushList(); blocks.push({ t: 'h3', text: line.slice(4) }) }
    else if (line.startsWith('- ')) { (list ??= []).push(line.slice(2)) }
    else if (line.trim() === '') { flushList() }
    else { flushList(); blocks.push({ t: 'p', text: line }) }
  }
  flushList()
  return blocks
}

function renderBlocks(blocks: Block[], showCursor: boolean): React.ReactNode {
  return blocks.map((b, i) => {
    const isLast = i === blocks.length - 1

    if (b.t === 'h2') return (
      <h2 key={i} className={styles.h2}>
        {renderInline(b.text)}{isLast && showCursor && CURSOR}
      </h2>
    )
    if (b.t === 'h3') return (
      <h3 key={i} className={styles.h3}>
        {renderInline(b.text)}{isLast && showCursor && CURSOR}
      </h3>
    )
    if (b.t === 'p') return (
      <p key={i} className={styles.para}>
        {renderInline(b.text)}{isLast && showCursor && CURSOR}
      </p>
    )
    if (b.t === 'ul') return (
      <ul key={i} className={styles.list}>
        {b.items.map((item, j) => {
          const isLastItem = isLast && j === b.items.length - 1
          return (
            <li key={j} className={styles.listItem}>
              <span className={styles.bullet} aria-hidden="true" />
              <span>{renderInline(item)}{isLastItem && showCursor && CURSOR}</span>
            </li>
          )
        })}
      </ul>
    )
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  reviewStatus: ReviewStatus
  streamedText: string
  focus: string
  error: string | null
}

export function ReviewOutput({ reviewStatus, streamedText, focus, error }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (reviewStatus === 'reviewing' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [streamedText, reviewStatus])

  const showCursor = reviewStatus === 'reviewing'
  const isEmpty = !streamedText && reviewStatus !== 'reviewing'

  const focusLabels: Record<string, string> = {
    general: 'General', performance: 'Performance',
    security: 'Security', accessibility: 'Accessibility',
  }

  return (
    <section className={styles.panel} aria-label="Review output" aria-live="polite">
      {/* panel header */}
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Review</span>
        <span className={styles.focusTag}>@ {focusLabels[focus] ?? focus}</span>
      </div>

      <div ref={scrollRef} className={styles.body}>
        {error && reviewStatus === 'error' ? (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        ) : isEmpty ? (
          <div className={styles.ghost}>Your review will appear here.</div>
        ) : (
          <div className={styles.content}>
            {renderBlocks(parseBlocks(streamedText), showCursor)}
          </div>
        )}
      </div>
    </section>
  )
}