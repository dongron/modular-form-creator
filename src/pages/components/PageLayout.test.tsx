import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test/render'
import {
  CONTENT_WIDTH,
  FieldWrapper,
  FormShell,
  HeaderCopy,
  Heading,
  Lead,
  PageHeader,
  PageShell,
} from './PageLayout'

describe('PageLayout primitives', () => {
  it('renders PageShell as a <main> with its children', () => {
    renderWithTheme(
      <PageShell $centered $gap="lg">
        <Heading>Resources</Heading>
        <Lead>Manage your resources</Lead>
      </PageShell>,
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Resources' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Manage your resources')).toBeInTheDocument()
  })

  it('exposes a content width token', () => {
    expect(CONTENT_WIDTH).toBe('min(48rem, 100%)')
  })

  it('renders a shared wrapper for a form field', () => {
    renderWithTheme(
      <FieldWrapper>
        <input aria-label="Resource name" />
      </FieldWrapper>,
    )

    expect(screen.getByLabelText('Resource name')).toBeInTheDocument()
    expect(screen.getByLabelText('Resource name')).toHaveStyle({ width: '100%' })
  })

  it('renders a shared wrapper for a form at content width', () => {
    renderWithTheme(
      <FormShell>
        <form aria-label="Example form">
          <input aria-label="Resource name" />
        </form>
      </FormShell>,
    )

    expect(screen.getByRole('form', { name: 'Example form' })).toBeInTheDocument()

    const wrapperClass = screen
      .getByRole('form', { name: 'Example form' })
      .parentElement?.className.split(' ')
      .pop()
    const emittedCss = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n')
    expect(emittedCss).toContain(`.${wrapperClass}{width:${CONTENT_WIDTH}`)
  })

  it('renders page header content and actions', () => {
    renderWithTheme(
      <PageHeader>
        <HeaderCopy>
          <Heading>Resources</Heading>
          <Lead>Manage your resources</Lead>
        </HeaderCopy>
        <button type="button">Create Resource</button>
      </PageHeader>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Resources' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Manage your resources')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Resource' })).toBeInTheDocument()
  })
})
