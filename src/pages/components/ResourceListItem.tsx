import { useEffect, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Card, IconButton } from '../../design-system'
import { type Resource } from '../../api/resources'
import { formatCreatedAt } from '../../utils/date'
import { getStatusBadgeVariant } from '../../utils/statusBadge'
import DeleteConfirmDrawer from './DeleteConfirmDrawer'

function ResourceListItem({ resource }: { resource: Resource }) {
  const fetcher = useFetcher()
  const isDeleting = fetcher.state !== 'idle'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const previousFetcherStateRef = useRef(fetcher.state)

  useEffect(() => {
    const hasStartedSubmitting =
      previousFetcherStateRef.current === 'idle' && fetcher.state === 'submitting'

    previousFetcherStateRef.current = fetcher.state

    if (hasStartedSubmitting) {
      setIsConfirmOpen(false)
    }
  }, [fetcher.state])

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
          <IconButton
            type="button"
            variant="ghost"
            size="small"
            state={isDeleting ? 'disabled' : 'normal'}
            aria-label={`Delete ${resource.name}`}
            onClick={() => setIsConfirmOpen(true)}
          >
            ✕
          </IconButton>
        </CardRow>
      </Card>
      <DeleteConfirmDrawer
        resourceName={resource.name}
        resourceId={resource.resourceId}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        fetcher={fetcher}
        isSubmitting={isDeleting}
      />
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
