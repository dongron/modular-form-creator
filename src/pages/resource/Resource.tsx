import styled from 'styled-components'
import { NavLink, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router-dom'
import { fetchResource } from '../../api/resources'
import { CONTENT_WIDTH, PageShell, Heading } from '../components/PageLayout'

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.resourceId) {
    throw new Response('Resource ID is required', { status: 400 })
  }

  return fetchResource(params.resourceId)
}

function Resource() {
  const resource = useLoaderData<typeof loader>()

  return (
    <PageShell $gap="lg">
      <Heading>Resource “{resource.name}”</Heading>
      <Tabs>
        <Tab to="." end>
          Overview
        </Tab>
        <Tab to="details">Details</Tab>
        <Tab to="basic-info">Edit basic info</Tab>
        <Tab to="project-details">Edit project details</Tab>
      </Tabs>
      <Outlet context={resource} />
    </PageShell>
  )
}

const Tabs = styled.nav`
  width: ${CONTENT_WIDTH};
  display: flex;
  flex-wrap: wrap;
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
