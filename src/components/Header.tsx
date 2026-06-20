import type { ModelStatus } from '../types'
import styles from './Header.module.css'

interface Props {
  modelStatus: ModelStatus
  modelProgress: number
}

function StatusChip({ modelStatus, modelProgress }: Props) {
  if (modelStatus === 'checking' || modelStatus === 'loading') {
    return (
      <span className={`${styles.chip} ${styles.loading}`}>
        <span className={styles.spinner}>⟳</span>
        Loading model {modelProgress > 0 ? `${modelProgress}%` : '…'}
      </span>
    )
  }
  if (modelStatus === 'ready') {
    return (
      <span className={`${styles.chip} ${styles.ready}`}>
        <span className={styles.dot}>●</span>Model ready
      </span>
    )
  }
  if (modelStatus === 'unsupported') {
    return (
      <span className={`${styles.chip} ${styles.unsupported}`}>
        ⚠ WebGPU not supported
      </span>
    )
  }
  return (
    <span className={`${styles.chip} ${styles.errored}`}>
      ✕ Load failed
    </span>
  )
}

export function Header({ modelStatus, modelProgress }: Props) {
  const showProgress = modelStatus === 'checking' || modelStatus === 'loading'

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.4" stroke="#58a6ff" strokeWidth="1.6" />
            <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="#58a6ff" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className={styles.name}>
            Code<span className={styles.accent}>Lens</span>
          </span>
        </div>
        <StatusChip modelStatus={modelStatus} modelProgress={modelProgress} />
      </header>

      {showProgress && (
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={modelProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Model loading progress"
        >
          <div className={styles.progressFill} style={{ width: `${modelProgress}%` }} />
        </div>
      )}
    </>
  )
}
