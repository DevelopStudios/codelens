import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import ErrorHandling from '../../components/ErrorHandling'

// Mock component for testing
const MockErrorHandlingComponent: React.FC<{ isLoading: boolean; error: string | null; networkError: boolean }> = ({ isLoading, error, networkError }) => {
  return <ErrorHandling isLoading={isLoading} error={error} networkError={networkError} />
}

test('shows loading error message', () => {
  render(<MockErrorHandlingComponent isLoading={false} error="Failed to load model" networkError={false} />)
  expect(screen.getByText('Failed to load model')).toBeInTheDocument()
})

test('shows network error when API call fails', () => {
  render(<MockErrorHandlingComponent isLoading={false} error={null} networkError={true} />)
  expect(screen.getByText('Network error: Please check your connection')).toBeInTheDocument()
})

test('handles timeout errors', () => {
  render(<MockErrorHandlingComponent isLoading={false} error="Inference timed out after 60 s. Try again." networkError={false} />)
  expect(screen.getByText('Inference timed out after 60 s. Try again.')).toBeInTheDocument()
})

test('clears error when code changes', () => {
  const { rerender } = render(<MockErrorHandlingComponent isLoading={false} error="Failed to load model" networkError={false} />)
  expect(screen.getByText('Failed to load model')).toBeInTheDocument()

  // Simulate error cleared — rerender so the original banner unmounts
  rerender(<MockErrorHandlingComponent isLoading={false} error={null} networkError={false} />)
  expect(screen.queryByText('Failed to load model')).not.toBeInTheDocument()
})