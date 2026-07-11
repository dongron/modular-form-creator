import styled from 'styled-components'
import {
  NavLink,
  Outlet,
  useLoaderData,
  useParams,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import { fetchResource } from '../../api/resources'
import { PageShell, Heading } from '../components/PageLayout'

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.resourceId) {
    throw new Response('Resource ID is required', { status: 400 })
  }

  return fetchResource(params.resourceId)
}

function Resource() {
  const { resourceId } = useParams<{ resourceId: string }>()
  const resource = useLoaderData<typeof loader>()

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
      <Outlet context={resource} />
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
