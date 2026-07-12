import { useState } from 'react'
import styled from 'styled-components'
import {
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import {
  fetchResource,
  ResourceValidationError,
  updateResource,
  type BasicInfoPayload,
  type FullUpdatePayload,
  type ProjectDetailsPayload,
  type Resource as ResourceModel,
} from '../../api/resources'
import { Button } from '../../design-system'
import {
  CONTENT_WIDTH,
  PageShell,
  PageHeader,
  HeaderCopy,
  Heading,
} from '../components/PageLayout'

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.resourceId) {
    throw new Response('Resource ID is required', { status: 400 })
  }

  return fetchResource(params.resourceId)
}

type CompletedUpdateRequest = {
  payload: FullUpdatePayload
  draftVersion: number
}

export type ResourceActionData = {
  ok: boolean
  error: string | null
  draftVersion: number
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { payload, draftVersion } = (await request.json()) as CompletedUpdateRequest

  try {
    await updateResource(params.resourceId ?? '', payload)
  } catch (error) {
    if (error instanceof ResourceValidationError) {
      return { ok: false as const, error: error.message, draftVersion }
    }
    throw error
  }

  return { ok: true as const, error: null, draftVersion }
}

export type ResourceOutletContext = {
  resource: ResourceModel
  hasCompletedEdits: boolean
  updateCompletedBasicInfo: (patch: Partial<BasicInfoPayload>) => void
  updateCompletedProjectDetails: (patch: Partial<ProjectDetailsPayload>) => void
  submitCompletedChanges: () => void
  isSubmittingCompletedChanges: boolean
  completedChangesError: string | null
}

type CompletedDraft = {
  resourceKey: string
  payload: FullUpdatePayload
  version: number
}

function createFullUpdatePayload(resource: ResourceModel): FullUpdatePayload {
  return {
    name: resource.name,
    basicInfo: { ...resource.basicInfo },
    projectDetails: { ...resource.projectDetails },
  }
}

function Resource() {
  const resource = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { resourceId } = useParams<{ resourceId: string }>()
  const completedChangesFetcher = useFetcher<ResourceActionData>()
  const [completedDraft, setCompletedDraft] = useState<CompletedDraft | null>(null)
  const lastSavedDraftVersion = completedChangesFetcher.data?.ok
    ? completedChangesFetcher.data.draftVersion
    : -1
  const currentDraft =
    completedDraft?.resourceKey === resource._id &&
    completedDraft.version > lastSavedDraftVersion
      ? completedDraft
      : null
  const hasCompletedEdits = resource.status === 'completed' && currentDraft !== null
  const displayedResource = currentDraft
    ? { ...resource, ...currentDraft.payload }
    : resource

  const mergeCompletedDraft = (
    merge: (payload: FullUpdatePayload) => FullUpdatePayload,
  ) => {
    setCompletedDraft((current) => {
      const canReuseDraft =
        current?.resourceKey === resource._id && current.version > lastSavedDraftVersion
      const payload = canReuseDraft ? current.payload : createFullUpdatePayload(resource)

      return {
        resourceKey: resource._id,
        version: current?.resourceKey === resource._id ? current.version + 1 : 1,
        payload: merge(payload),
      }
    })
  }

  const updateCompletedBasicInfo = (patch: Partial<BasicInfoPayload>) =>
    mergeCompletedDraft((payload) => ({
      ...payload,
      basicInfo: { ...payload.basicInfo, ...patch },
    }))

  const updateCompletedProjectDetails = (patch: Partial<ProjectDetailsPayload>) =>
    mergeCompletedDraft((payload) => ({
      ...payload,
      projectDetails: { ...payload.projectDetails, ...patch },
    }))

  const submitCompletedChanges = () => {
    if (!resourceId) return

    completedChangesFetcher.submit(
      {
        payload: currentDraft?.payload ?? createFullUpdatePayload(resource),
        draftVersion: currentDraft?.version ?? lastSavedDraftVersion,
      },
      {
        method: 'post',
        encType: 'application/json',
        action: `/resources/${resourceId}`,
      },
    )
  }

  return (
    <PageShell $gap="lg">
      <PageHeader>
        <Button type="button" variant="secondary" onClick={() => navigate('/resources')}>
          Back
        </Button>
        <HeaderCopy>
          <Heading>{resource.name}</Heading>
        </HeaderCopy>
        <div></div>
      </PageHeader>
      <Tabs>
        <Tab to="." end>
          Overview
        </Tab>
        <Tab to="details">Details</Tab>
        <Tab to="basic-info">Edit basic info</Tab>
        <Tab to="project-details">Edit project details</Tab>
      </Tabs>
      <Outlet
        context={
          {
            resource: displayedResource,
            hasCompletedEdits,
            updateCompletedBasicInfo,
            updateCompletedProjectDetails,
            submitCompletedChanges,
            isSubmittingCompletedChanges: completedChangesFetcher.state !== 'idle',
            completedChangesError: completedChangesFetcher.data?.error ?? null,
          } satisfies ResourceOutletContext
        }
      />
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
