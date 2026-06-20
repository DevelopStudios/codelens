import { useState } from 'react'
import type { ReviewFocus } from './types'
import { useCodeReview } from './hooks/useCodeReview'
import { Header } from './components/Header'
import { CodeInput } from './components/CodeInput'
import { ReviewOutput } from './components/ReviewOutput'
import { ErrorBanner } from './components/ErrorBanner'
import styles from './App.module.css'

const DEFAULT_CODE = `function fetchUsers(ids) {
  const results = [];
  for (var i = 0; i <= ids.length; i++) {
    const user = db.query("SELECT * FROM users WHERE id = " + ids[i]);
    results.push(user);
  }
  return results;
}`

export default function App() {
  const [code,  setCode]  = useState(DEFAULT_CODE)
  const [focus, setFocus] = useState<ReviewFocus>('general')

  const {
    modelStatus,
    modelProgress,
    reviewStatus,
    streamedText,
    error,
    startReview,
  } = useCodeReview(code, focus)

  const fatalError = modelStatus === 'error' || modelStatus === 'unsupported'

  return (
    <div className={styles.app}>
      <Header modelStatus={modelStatus} modelProgress={modelProgress} />

      {fatalError ? (
        <ErrorBanner
          modelStatus={modelStatus as 'error' | 'unsupported'}
          message={error}
        />
      ) : (
        <main className={styles.body}>
          <CodeInput
            code={code}
            focus={focus}
            modelStatus={modelStatus}
            reviewStatus={reviewStatus}
            onCodeChange={setCode}
            onFocusChange={setFocus}
            onReview={startReview}
          />
          <ReviewOutput
            reviewStatus={reviewStatus}
            streamedText={streamedText}
            focus={focus}
            error={error}
          />
        </main>
      )}
    </div>
  )
}
