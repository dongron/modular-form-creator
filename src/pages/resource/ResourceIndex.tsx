import { useState } from 'react'
import {
  redirect,
  useFetcher,
  useOutletContext,
  type ActionFunctionArgs,
} from 'react-router-dom'
import styled from 'styled-components'
import { deleteResource, provisionResource, type Resource } from '../../api/resources'
import {
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../../utils/resourceCompletion'
import { Badge, Button } from '../../design-system'
import ResourceSummaryCards from '../components/ResourceSummaryCards'
import DeleteConfirmDrawer from '../components/DeleteConfirmDrawer'
import { CONTENT_WIDTH } from '../components/PageLayout'
import { getStatusBadgeVariant } from '../../utils/statusBadge'

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'delete') {
    await deleteResource(Number(params.resourceId))
    return redirect('/resources')
  }

  if (intent === 'provision') {
    await provisionResource(params.resourceId ?? '')
    return { ok: true as const }
  }

  throw new Response('Unsupported intent', { status: 400 })
}

function ResourceIndex() {
  const resource = useOutletContext<Resource>()
  const fetcher = useFetcher()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const basicDone = isBasicInfoComplete(resource.basicInfo)
  const projectDone = isProjectDetailsComplete(resource.projectDetails)
  const completeCount = Number(basicDone) + Number(projectDone)
  const isCompleted = resource.status === 'completed'
  const isBusy = fetcher.state !== 'idle'
  const canProvision = !isCompleted && basicDone && projectDone

  return (
    <>
      <SummaryStatus>
        <Badge variant={getStatusBadgeVariant(resource.status)}>{resource.status}</Badge>
        <CompletionText>{completeCount} of 2 modules complete</CompletionText>
      </SummaryStatus>
      <ResourceSummaryCards resource={resource} />
      <Actions>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="provision" />
          <Button
            type="submit"
            variant="primary"
            state={canProvision && !isBusy ? 'normal' : 'disabled'}
          >
            {isCompleted ? 'Resource completed' : 'Mark as complete'}
          </Button>
        </fetcher.Form>
        <Button
          type="button"
          variant="secondary"
          state={isBusy ? 'disabled' : 'normal'}
          onClick={() => setIsConfirmOpen(true)}
        >
          Delete
        </Button>
      </Actions>
      <DeleteConfirmDrawer
        resourceName={resource.name}
        resourceId={resource.resourceId}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        fetcher={fetcher}
        isSubmitting={isBusy}
      />
    </>
  )
}

const SummaryStatus = styled.div`
  width: ${CONTENT_WIDTH};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const CompletionText = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Actions = styled.div`
  width: ${CONTENT_WIDTH};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

export default ResourceIndex
