/**
 * CodeInput — three-layer syntax-highlighted editor
 *
 * Stack: gutter (line numbers) | pre (highlighted, pointer-events:none) | textarea (transparent)
 * The textarea captures all input; the pre mirrors its scroll so they stay in sync.
 */
import { useRef, useCallback } from 'react'
import type { ReviewFocus, ModelStatus, ReviewStatus } from '../types'
import styles from './CodeInput.module.css'

// ─── Syntax highlighting ─────────────────────────────────────────────────────
// GitHub dark token colours (from the design mockup)
const C = { comment: '#8b949e', string: '#a5d6ff', number: '#79c0ff', keyword: '#ff7b72', fn: '#d2a8ff' }

const KEYWORDS = new Set([
  'function','const','let','var','return','for','if','else','new','await','async',
  'of','in','class','import','export','from','try','catch','throw','while','break',
  'continue','typeof','this','null','true','false','undefined','void','delete',
  'instanceof','switch','case','default','do','extends','super','yield','static',
  'get','set','type','interface','enum','implements','namespace','declare','readonly','abstract',
])

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function span(color: string, text: string) { return `<span style="color:${color}">${esc(text)}</span>` }

function highlight(code: string): string {
  const re = /(\/\/.*$|\/\*[\s\S]*?\*\/)|(["'`](?:[^"'`\\]|\\.)*["'`])|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/gm
  let out = '', last = 0, m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    out += esc(code.slice(last, m.index))
    const tok = m[0]
    if      (m[1]) out += span(C.comment, tok)
    else if (m[2]) out += span(C.string, tok)
    else if (m[3]) out += span(C.number, tok)
    else if (m[4]) {
      if (KEYWORDS.has(tok)) out += span(C.keyword, tok)
      else if (code.slice(m.index + tok.length).trimStart().startsWith('(')) out += span(C.fn, tok)
      else out += esc(tok)
    }
    last = m.index + tok.length
  }
  return out + esc(code.slice(last))
}

// ─── Focus tabs ──────────────────────────────────────────────────────────────
const TABS: { id: ReviewFocus; label: string }[] = [
  { id: 'general',       label: 'General'       },
  { id: 'performance',   label: 'Performance'   },
  { id: 'security',      label: 'Security'      },
  { id: 'accessibility', label: 'Accessibility' },
]

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  code: string
  focus: ReviewFocus
  modelStatus: ModelStatus
  reviewStatus: ReviewStatus
  onCodeChange: (code: string) => void
  onFocusChange: (focus: ReviewFocus) => void
  onReview: () => void
}

export function CodeInput({ code, focus, modelStatus, reviewStatus, onCodeChange, onFocusChange, onReview }: Props) {
  const taRef     = useRef<HTMLTextAreaElement>(null)
  const preRef    = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const syncScroll = useCallback(() => {
    const ta = taRef.current
    if (!ta) return
    if (preRef.current)    { preRef.current.scrollTop    = ta.scrollTop;    preRef.current.scrollLeft    = ta.scrollLeft }
    if (gutterRef.current) { gutterRef.current.scrollTop = ta.scrollTop }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta = e.currentTarget
    const { selectionStart: s, selectionEnd: end } = ta
    const next = code.slice(0, s) + '  ' + code.slice(end)
    onCodeChange(next)
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2 })
  }, [code, onCodeChange])

  const lineCount = code.split('\n').length
  const disabled  = modelStatus !== 'ready' || reviewStatus === 'reviewing'

  return (
    <section className={styles.panel} aria-label="Code input">
      {/* panel header */}
      <div className={styles.panelHeader}>
        <span className={styles.fileName}>review.js</span>
        <span className={styles.langBadge}>JavaScript</span>
      </div>

      {/* editor */}
      <div className={styles.editorWrap}>
        <div ref={gutterRef} className={styles.gutter} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1} className={styles.lineNum}>{i + 1}</span>
          ))}
        </div>
        <div className={styles.codeArea}>
          <pre
            ref={preRef}
            className={styles.highlight}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlight(code) + '\n' }}
          />
          <textarea
            ref={taRef}
            className={styles.textarea}
            value={code}
            onChange={e => onCodeChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-label="Code to review"
          />
        </div>
      </div>

      {/* focus tabs */}
      <div className={styles.focusSection}>
        <div className={styles.focusLabel}>Review focus</div>
        <div className={styles.tabs} role="tablist" aria-label="Review focus">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={focus === id}
              className={`${styles.tab} ${focus === id ? styles.tabActive : ''}`}
              onClick={() => onFocusChange(id)}
              disabled={reviewStatus === 'reviewing'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* review button */}
      <div className={styles.buttonWrap}>
        <button
          className={styles.button}
          onClick={onReview}
          disabled={disabled}
          aria-busy={reviewStatus === 'reviewing'}
        >
          {reviewStatus === 'reviewing' ? 'Reviewing…' : 'Review'}
        </button>
      </div>
    </section>
  )
}
