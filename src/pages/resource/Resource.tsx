import styled from 'styled-components'
import { NavLink, Outlet, useParams } from 'react-router-dom'

function Resource() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell>
      <Heading>Resource “{resourceId}”</Heading>
      <Tabs>
        <Tab to="." end>
          Overview
        </Tab>
        <Tab to="basic-info">Basic info</Tab>
        <Tab to="project-details">Project details</Tab>
        <Tab to="details">Details</Tab>
      </Tabs>
      <Outlet />
    </PageShell>
  )
}

const PageShell = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Tabs = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`

const Tab = styled(NavLink)`
  color: ${({ theme }) => theme.colors.inkMuted};
  text-decoration: none;
  font-weight: 600;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export default Resource
