import styled from 'styled-components'

function Resources() {
  return (
    <PageShell>
      <Heading>Resources</Heading>
      <Lead>Helpful links and materials will live here.</Lead>
    </PageShell>
  )
}

const PageShell = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Lead = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export default Resources
