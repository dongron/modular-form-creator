import styled from 'styled-components'
import { type Theme } from '../../design-system/theme/theme'

export const CONTENT_WIDTH = 'min(48rem, 100%)'

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  width: ${CONTENT_WIDTH};
`

export const HeaderCopy = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const FieldWrapper = styled.div`
  width: ${CONTENT_WIDTH};

  > * {
    width: 100%;
  }
`

export const FormShell = styled.div`
  width: ${CONTENT_WIDTH};
`

export const PageShell = styled.main<{
  $centered?: boolean
  $gap?: keyof Theme['spacing']
}>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ $centered }) => $centered && 'justify-content: center;'}
  gap: ${({ theme, $gap = 'md' }) => theme.spacing[$gap]};
  padding: ${({ theme }) => theme.spacing.xl};
`

export const Heading = styled.h1`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

export const Lead = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.inkMuted};
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
`
