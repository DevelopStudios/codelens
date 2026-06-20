import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import ModelLoading from '../../components/ModelLoading'
import CodeInput from '../../components/CodeInput'
import ReviewFocusTabs from '../../components/ReviewFocusTabs'
import ReviewFunctionality from '../../components/ReviewFunctionality'
import ErrorBanner from '../../components/ErrorBanner'

// Test ModelLoading accessibility
test('ModelLoading has proper ARIA labels', () => {
  render(<ModelLoading isLoading={true} progress={50} error={null} />)
  const loadingText = screen.getByText('Loading model... 50%')
  expect(loadingText).toHaveAttribute('aria-live', 'polite')
  const progressBar = screen.getByRole('progressbar')
  expect(progressBar).toHaveAttribute('aria-label', 'Model loading progress')
  expect(progressBar).toHaveAttribute('aria-valuenow', '50')
  expect(progressBar).toHaveAttribute('aria-valuemin', '0')
  expect(progressBar).toHaveAttribute('aria-valuemax', '100')
})

test('CodeInput has proper accessible name', () => {
  render(<CodeInput code="" onCodeChange={() => {}} />)
  const codeArea = screen.getByRole('textbox', { name: /code input/i })
  expect(codeArea).toHaveAttribute('aria-label', 'Code input area')
  expect(codeArea).toHaveAttribute('aria-describedby', 'code-input-instructions')
})

test('CodeInput clear button has accessible name', () => {
  render(<CodeInput code="console.log('Hello');" onCodeChange={() => {}} />)
  const clearButton = screen.getByRole('button', { name: /clear code/i })
  expect(clearButton).toHaveAttribute('aria-label', 'Clear code input')
})

test('ReviewFocusTabs have proper tab roles and labels', () => {
  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'security', label: 'Security' },
    { id: 'maintainability', label: 'Maintainability' }
  ]
  render(<ReviewFocusTabs activeTab="performance" onTabChange={() => {}} tabs={tabs} />)
  tabs.forEach(tab => {
    const tabElement = screen.getByRole('tab', { name: tab.label })
    expect(tabElement).toHaveAttribute('role', 'tab')
    expect(tabElement).toHaveAttribute('aria-selected', tab.id === 'performance' ? 'true' : 'false')
    expect(tabElement).toHaveAttribute('id', expect.stringContaining(tab.id))
  })

  // Active tab should have aria-selected="true"
  const activeTab = screen.getByRole('tab', { name: 'Performance' })
  expect(activeTab).toHaveAttribute('aria-selected', 'true')
})

test('ReviewFunctionality has proper region roles', () => {
  render(<ReviewFunctionality code="console.log('Hello');" activeTab="performance" isGenerating={false} reviewStatus="complete" streamedText="Review results" error={null} onGenerateReview={() => {}} />)
  const reviewOutput = screen.getByRole('region', { name: /review output/i })
  expect(reviewOutput).toHaveAttribute('aria-live', 'polite')
})

test('Generate button has proper role and label', () => {
  render(<ReviewFunctionality code="console.log('Hello');" activeTab="performance" isGenerating={false} reviewStatus="idle" streamedText="" error={null} onGenerateReview={() => {}} />)
  const generateButton = screen.getByRole('button', { name: /generate code review/i })
  expect(generateButton).toHaveAttribute('aria-label', 'Generate code review')
  expect(generateButton).toHaveAttribute('aria-disabled', 'false')
})

test('Error messages have proper ARIA attributes', () => {
  render(<ModelLoading isLoading={false} progress={0} error="Failed to load model" />)
  const errorText = screen.getByText('Failed to load model')
  expect(errorText).toHaveAttribute('role', 'alert')
  expect(errorText).toHaveAttribute('aria-live', 'assertive')
})

test('Progress bar has descriptive text', () => {
  render(<ModelLoading isLoading={true} progress={50} error={null} />)
  const progressBar = screen.getByRole('progressbar')
  const progressText = screen.getByText('Model loading progress: 50%')
  expect(progressText).toBeInTheDocument()
  expect(progressBar).toHaveAttribute('aria-labelledby', 'progress-label')
})

test('All interactive elements are focusable', () => {
  render(
    <>
      <ModelLoading isLoading={true} progress={50} error={null} />
      <CodeInput code="const x = 1;" onCodeChange={() => {}} />
      <ReviewFocusTabs activeTab="performance" onTabChange={() => {}} tabs={[{ id: 'performance', label: 'Performance' }]} />
      <ReviewFunctionality code="console.log('Hello');" activeTab="performance" isGenerating={false} reviewStatus="idle" streamedText="" error={null} onGenerateReview={() => {}} />
    </>
  )

  // Genuinely interactive controls — the progressbar is a status role, not a
  // focusable element. CodeInput needs non-empty code for the Clear button.
  const interactiveElements = [
    screen.getByRole('textbox', { name: /code input/i }),
    screen.getByRole('button', { name: /clear code/i }),
    screen.getByRole('tab', { name: 'Performance' }),
    screen.getByRole('button', { name: /generate code review/i })
  ]

  interactiveElements.forEach(element => {
    element.focus()
    expect(element).toHaveFocus()
  })
})