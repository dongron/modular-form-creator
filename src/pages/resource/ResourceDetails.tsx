import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/resources'
import { Badge, type BadgeVariant } from '../../design-system'
import ResourceSummaryCards from '../components/ResourceSummaryCards'
import { CONTENT_WIDTH } from '../components/PageLayout'

const statusVariant: Record<string, BadgeVariant> = {
  draft: 'neutral',
  completed: 'success',
}

function ResourceDetails() {
  const resource = useOutletContext<Resource>()

  return (
    <>
      <SummaryStatus>
        <StatusLabel>Resource status</StatusLabel>
        <Badge variant={statusVariant[resource.status] ?? 'neutral'}>
          {resource.status}
        </Badge>
      </SummaryStatus>
      <ResourceSummaryCards resource={resource} />
    </>
  )
}

const SummaryStatus = styled.div`
  width: ${CONTENT_WIDTH};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const StatusLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`

export default ResourceDetails
