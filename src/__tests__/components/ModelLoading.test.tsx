import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import ModelLoading from '../../components/ModelLoading'

// Mock component that wraps ModelLoading with state
const MockModelLoadingComponent = ({ isLoading, progress, error }: { isLoading: boolean, progress: number, error: string | null }) => {
  return <ModelLoading isLoading={isLoading} progress={progress} error={error} />
}

test('renders loading state with progress bar', () => {
  render(<MockModelLoadingComponent isLoading={true} progress={0} error={null} />)

  // Check loading indicator is visible
  expect(screen.getByText('Loading model... 0%')).toBeInTheDocument()

  // Check progress bar is present and has correct attributes
  const progressBar = screen.getByRole('progressbar')
  expect(progressBar).toBeInTheDocument()
  expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  expect(progressBar).toHaveAttribute('aria-valuemin', '0')
  expect(progressBar).toHaveAttribute('aria-valuemax', '100')
})

test('updates progress bar as loading progresses', () => {
  const { rerender } = render(<MockModelLoadingComponent isLoading={true} progress={0} error={null} />)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

  // Simulate progress update — rerender so we read the updated node
  rerender(<MockModelLoadingComponent isLoading={true} progress={50} error={null} />)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
})

test('shows error message when model loading fails', () => {
  render(<MockModelLoadingComponent isLoading={false} progress={0} error="Failed to load model" />)
  expect(screen.getByText('Failed to load model')).toBeInTheDocument()
})

test('hides loading indicators when model is loaded', () => {
  render(<MockModelLoadingComponent isLoading={false} progress={100} error={null} />)
  expect(screen.queryByText('Loading model... 100%')).not.toBeInTheDocument()
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
})