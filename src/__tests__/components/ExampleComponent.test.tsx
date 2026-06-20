import { render, screen } from '@testing-library/react'
test('renders example component', () => {
    // This is a placeholder test - replace with actual component
    render(<div data-testid="example">Hello World</div>)
    const element = screen.getByTestId('example')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello World')
})