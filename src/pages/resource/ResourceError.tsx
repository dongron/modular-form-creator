import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import styled from 'styled-components'
import { PageShell, Heading, Lead } from '../components/PageLayout'

function ResourceError() {
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <PageShell $gap="lg">
      {isNotFound ? (
        <>
          <Heading>Resource not found</Heading>
          <Lead>This resource doesn't exist or may have been deleted.</Lead>
        </>
      ) : (
        <>
          <Heading>Something went wrong</Heading>
          <Lead>We couldn't load this resource. Please try again later.</Lead>
        </>
      )}
      <BackLink to="/resources">← Back to resources</BackLink>
    </PageShell>
  )
}

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
`

export default ResourceError
