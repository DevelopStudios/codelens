import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom'
import ReviewFocusTabs from '../../components/ReviewFocusTabs'

// Mock component for testing
const MockReviewFocusTabsComponent: React.FC<{ activeTab: string; onTabChange: (tab: string) => void; tabs: { id: string; label: string }[] }> = ({ activeTab, onTabChange, tabs }) => {
  return <ReviewFocusTabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
}

test('renders tab list with proper roles', () => {
  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'security', label: 'Security' },
    { id: 'maintainability', label: 'Maintainability' }
  ]
  render(<MockReviewFocusTabsComponent activeTab="performance" onTabChange={() => {}} tabs={tabs} />)

  // Check tablist role
  const tabList = screen.getByRole('tablist', { name: /review focus/i })
  expect(tabList).toBeInTheDocument()

  // Check each tab
  tabs.forEach(tab => {
    const tabElement = screen.getByRole('tab', { name: tab.label })
    expect(tabElement).toBeInTheDocument()
    expect(tabElement).toHaveAttribute('id', expect.stringContaining(tab.id))
  })
})

test('updates active tab correctly', () => {
  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'security', label: 'Security' },
    { id: 'maintainability', label: 'Maintainability' }
  ]
  render(<MockReviewFocusTabsComponent activeTab="performance" onTabChange={() => {}} tabs={tabs} />)

  // Check active tab has aria-selected="true"
  const activeTab = screen.getByRole('tab', { name: 'Performance' })
  expect(activeTab).toHaveAttribute('aria-selected', 'true')

  // Check other tabs have aria-selected="false"
  const otherTabs = screen.getAllByRole('tab').filter(tab => tab.textContent !== 'Performance')
  otherTabs.forEach(tab => {
    expect(tab).toHaveAttribute('aria-selected', 'false')
  })
})

test('calls onTabChange when tab is clicked', () => {
  const onTabChange = vi.fn()
  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'security', label: 'Security' }
  ]
  render(<ReviewFocusTabs activeTab="performance" onTabChange={onTabChange} tabs={tabs} />)

  const securityTab = screen.getByRole('tab', { name: 'Security' })
  securityTab.click()
  expect(onTabChange).toHaveBeenCalledWith('security')
})