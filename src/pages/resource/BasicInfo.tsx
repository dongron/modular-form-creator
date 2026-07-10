import styled from 'styled-components'
import { useParams } from 'react-router-dom'

function BasicInfo() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell>
      <Heading>Basic info</Heading>
      <Lead>Basic info for resource “{resourceId}”.</Lead>
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

export default BasicInfo
