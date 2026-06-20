import { render, screen, fireEvent } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import CodeInput from '../../components/CodeInput'

// Mock component for testing
const MockCodeInputComponent: React.FC<{ code: string; onCodeChange: (code: string) => void }> = ({ code, onCodeChange }) => {
  return <CodeInput code={code} onCodeChange={onCodeChange} />
}

test('renders code input area', () => {
  render(<MockCodeInputComponent code="" onCodeChange={() => {}} />)
  const codeArea = screen.getByRole('textbox', { name: /code input/i })
  expect(codeArea).toBeInTheDocument()
})

test('accepts code input', () => {
  const onCodeChange = vi.fn()
  render(<MockCodeInputComponent code="" onCodeChange={onCodeChange} />)
  const codeArea = screen.getByRole('textbox', { name: /code input/i })
  // fireEvent.change drives React's synthetic onChange; setting .value directly
  // and dispatching a raw event bypasses React's value tracker.
  fireEvent.change(codeArea, { target: { value: 'console.log("Hello World");' } })
  expect(onCodeChange).toHaveBeenCalledWith('console.log("Hello World");')
})

test('clears code input with clear button', () => {
  const onCodeChange = vi.fn()
  render(<MockCodeInputComponent code="console.log('Hello');" onCodeChange={onCodeChange} />)
  const clearButton = screen.getByRole('button', { name: /clear code/i })
  clearButton.click()
  expect(onCodeChange).toHaveBeenCalledWith('')
})

test('preserves code when component re-renders', () => {
  const onCodeChange = vi.fn()
  const { rerender } = render(<MockCodeInputComponent code="console.log('Hello');" onCodeChange={onCodeChange} />)
  const codeArea = screen.getByRole('textbox', { name: /code input/i })
  expect(codeArea).toHaveValue("console.log('Hello');")

  rerender(<MockCodeInputComponent code="console.log('World');" onCodeChange={onCodeChange} />)
  expect(codeArea).toHaveValue("console.log('World');")
})