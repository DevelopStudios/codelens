import styles from './ErrorBanner.module.css'

interface Props {
  modelStatus: 'error' | 'unsupported'
  message: string | null
}

export function ErrorBanner({ modelStatus, message }: Props) {
  if (modelStatus === 'unsupported') {
    return (
      <div className={styles.banner} role="alert">
        <strong>WebGPU not supported</strong>
        <p>
          CodeLens requires WebGPU to run the model in-browser. Try Chrome 113+, Edge 113+,
          or Chrome Canary. Safari and Firefox do not yet support WebGPU by default.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.banner} role="alert">
      <strong>Model failed to load</strong>
      {message && <p>{message}</p>}
      <p>Reload the page to try again. If the problem persists, your GPU may not have enough VRAM (need ~2 GB).</p>
    </div>
  )
}
