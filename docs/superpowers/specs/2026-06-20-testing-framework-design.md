# Testing Framework Design

## Overview

This document describes the implementation of a unit testing framework for the React/Vite project using Vitest and React Testing Library. The goal is to establish a robust, fast, and maintainable testing environment for components and utilities.

## Architecture

The testing architecture consists of:
- **Test Runner**: Vitest (native Vite integration)
- **Testing Library**: React Testing Library (component testing)
- **Assertion Library**: Expect (built into Vitest)
- **Mocking**: Vitest's built-in mocking capabilities
- **Coverage**: Istanbul coverage reporting

## Project Structure

Add a test directory structure:
```
src/
├── __tests__/
│   ├── components/
│   ├── utilities/
│   └── utils/
```

This keeps tests organized alongside the code they test, following the convention of placing test files in a __tests__ directory parallel to the source code.

## Package Dependencies

Add these dev dependencies:

```json
"devDependencies": {
  "vitest": "^2.0.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/user-event": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@types/testing-library__jest-dom": "^6.0.0"
}
```

Note: @types/react and @types/react-dom are already installed as dependencies.

## Configuration Files

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'clover']
    },
    setupFiles: ['src/__tests__/setup.ts']
  }
})
```

### src/__tests__/setup.ts

```ts
import '@testing-library/jest-dom'
```

This file imports the DOM assertions from @testing-library/jest-dom, which provides useful matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

## Package.json Scripts

Add these test scripts to package.json:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage"
}
```

These scripts provide:
- `npm test`: Run tests once
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests and generate coverage reports

## Test File Examples

### Component Test (src/__tests__/components/MyComponent.test.tsx)

```tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

test('renders MyComponent with correct text', () => {
  render(<MyComponent />)
  const linkElement = screen.getByText(/hello world/i)
  expect(linkElement).toBeInTheDocument()
})
```

### Utility Test (src/__tests__/utilities/formatDate.test.ts)

```ts
import { formatDate } from '@/utilities/formatDate'

test('formats date correctly', () => {
  const date = new Date('2023-01-01')
  expect(formatDate(date)).toBe('01/01/2023')
})
```

## Coverage Reporting

The coverage configuration will generate reports in HTML, text, and clover formats in the coverage/ directory. The HTML report provides a detailed browser-based view of code coverage, showing which lines are covered and which are not.

## Usage

1. Install dependencies: `npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @types/testing-library__jest-dom`
2. Create the configuration files (vitest.config.ts and setup.ts)
3. Create the __tests__ directory structure
4. Write tests for components and utilities
5. Run tests with `npm test`
6. Generate coverage reports with `npm run test:coverage`

## Benefits

- **Speed**: Vitest runs tests in parallel and doesn't require a browser
- **Integration**: Native Vite integration with zero configuration
- **TypeScript**: Excellent TypeScript support out of the box
- **Modern API**: Clean, intuitive API for component testing
- **Coverage**: Comprehensive coverage reporting with multiple formats

This design provides a complete, modern unit testing solution for the React/Vite project without CI integration as requested.