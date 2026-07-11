import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { createRoutesStub } from 'react-router-dom'
import type { ActionFunction, LoaderFunction } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { theme } from '../design-system/theme/theme'

const HydrateFallback = () => null

function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

// Renders a component that has no dependency on router context.
export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: ThemeWrapper, ...options })
}

type StubRouteObject = Parameters<typeof createRoutesStub>[0][number]

type RouterStubOptions = {
  path?: string
  action?: ActionFunction
  loader?: LoaderFunction
  children?: StubRouteObject[]
  initialEntries?: string[]
}

// Renders `ui` inside a React Router stub so router hooks (Form, useFetcher,
// useActionData, useNavigation, Link) work, wrapped in the styled-components theme.
export function renderWithRouter(
  ui: ReactElement,
  {
    path = '/',
    action,
    loader,
    children,
    initialEntries = [path],
  }: RouterStubOptions = {},
) {
  const Stub = createRoutesStub([
    {
      path,
      Component: () => ui,
      action,
      loader,
      children,
      // Route stubs treat loader tests as initial hydration until data resolves.
      HydrateFallback: loader ? HydrateFallback : undefined,
    },
  ])

  return render(
    <ThemeWrapper>
      <Stub initialEntries={initialEntries} />
    </ThemeWrapper>,
  )
}
