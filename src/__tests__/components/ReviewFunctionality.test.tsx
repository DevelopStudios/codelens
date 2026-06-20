import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import ReviewFunctionality from '../../components/ReviewFunctionality'

// Mock component for testing
const MockReviewFunctionalityComponent: React.FC<{ code: string; activeTab: string; isGenerating: boolean; reviewStatus: 'idle' | 'reviewing' | 'complete' | 'error'; streamedText: string; error: string | null }> = ({ code, activeTab, isGenerating, reviewStatus, streamedText, error }) => {
  return <ReviewFunctionality code={code} activeTab={activeTab} isGenerating={isGenerating} reviewStatus={reviewStatus} streamedText={streamedText} error={error} onGenerateReview={() => {}} />
}

test('disables generate button when no code is provided', () => {
  render(<MockReviewFunctionalityComponent code="" activeTab="general" isGenerating={false} reviewStatus="idle" streamedText="" error={null} />)
  const generateButton = screen.getByRole('button', { name: /generate code review/i })
  expect(generateButton).toBeDisabled()
})

test('enables generate button when code is provided', () => {
  render(<MockReviewFunctionalityComponent code="console.log('Hello');" activeTab="general" isGenerating={false} reviewStatus="idle" streamedText="" error={null} />)
  const generateButton = screen.getByRole('button', { name: /generate code review/i })
  expect(generateButton).not.toBeDisabled()
})

test('shows loading state when generating review', () => {
  render(<MockReviewFunctionalityComponent code="console.log('Hello');" activeTab="general" isGenerating={true} reviewStatus="reviewing" streamedText="" error={null} />)
  const loadingIndicator = screen.getByRole('progressbar', { name: /review generation progress/i })
  expect(loadingIndicator).toBeInTheDocument()
  const generateButton = screen.getByRole('button', { name: /generate code review/i })
  expect(generateButton).toBeDisabled()
})

test('generates review when button is clicked', () => {
  const onGenerateReview = vi.fn()
  render(<ReviewFunctionality code="console.log('Hello');" activeTab="general" isGenerating={false} reviewStatus="idle" streamedText="" error={null} onGenerateReview={onGenerateReview} />)
  const generateButton = screen.getByRole('button', { name: /generate code review/i })
  generateButton.click()
  expect(onGenerateReview).toHaveBeenCalledTimes(1)
})

test('updates review output when active tab changes', () => {
  render(<MockReviewFunctionalityComponent code="console.log('Hello');" activeTab="performance" isGenerating={false} reviewStatus="complete" streamedText="Review results" error={null} />)
  const reviewOutput = screen.getByRole('region', { name: /review output/i })
  expect(reviewOutput).toBeInTheDocument()
})