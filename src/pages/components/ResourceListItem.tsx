import { Link, useFetcher } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Card, IconButton } from '../../design-system'
import { type Resource } from '../../api/resources'
import { formatCreatedAt } from '../../utils/date'
import { getStatusBadgeVariant } from '../../utils/statusBadge'

function ResourceListItem({ resource }: { resource: Resource }) {
  const fetcher = useFetcher()
  const isDeleting = fetcher.state !== 'idle'

  return (
    <ListItem $dimmed={isDeleting}>
      <Card>
        <CardRow>
          <ResourceLink to={`/resources/${resource.resourceId}`}>
            <ResourceName>{resource.name}</ResourceName>
            <ResourceDate dateTime={resource.createdAt}>
              {formatCreatedAt(resource.createdAt)}
            </ResourceDate>
          </ResourceLink>
          <Badge variant={getStatusBadgeVariant(resource.status)}>
            {resource.status}
          </Badge>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="resourceId" value={resource.resourceId} />
            <IconButton
              type="submit"
              variant="ghost"
              size="small"
              state={isDeleting ? 'disabled' : 'normal'}
              aria-label={`Delete ${resource.name}`}
            >
              ✕
            </IconButton>
          </fetcher.Form>
        </CardRow>
      </Card>
    </ListItem>
  )
}

const ListItem = styled.li<{ $dimmed: boolean }>`
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
  transition: opacity 0.15s ease;
`

const CardRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ResourceLink = styled(Link)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.inkStrong};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ResourceName = styled.span`
  font-weight: 600;
`

const ResourceDate = styled.time`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export default ResourceListItem
