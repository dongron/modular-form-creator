import styled from 'styled-components'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { PageShell, Heading } from '../components/PageLayout'

function Resource() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell $gap="lg">
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
