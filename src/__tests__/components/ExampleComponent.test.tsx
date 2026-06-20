import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'

test('renders example component', () => {
  // This is a placeholder test - replace with actual component
  render(<div data-testid="example">Hello World</div>)
  const element = screen.getByTestId('example')
  // Use Vitest's built-in matchers instead of jest-dom
  expect(element).not.toBeNull()
  expect(element.textContent).toBe('Hello World')
})