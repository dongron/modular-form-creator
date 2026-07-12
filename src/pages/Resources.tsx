import { useEffect, useRef, useState } from 'react'
import {
  useFetcher,
  useLoaderData,
  useSearchParams,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import styled from 'styled-components'
import {
  createResource,
  deleteResource,
  fetchResources,
  ResourceValidationError,
} from '../api/resources'
import { Button, Drawer } from '../design-system'
import { parseResourceFilters } from '../utils/resourceFilters'
import ResourceListItem from './components/ResourceListItem'
import ResourceFilters from './components/ResourceFilters'
import Pagination from './components/Pagination'
import CreateResourceForm from './components/CreateResourceForm'
import {
  PageShell,
  PageHeader,
  HeaderCopy,
  Heading,
  Lead,
  CONTENT_WIDTH,
} from './components/PageLayout'

export type ResourcesActionData = { ok: boolean; error: string | null }

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams
  return fetchResources(parseResourceFilters(searchParams))
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  if (formData.get('intent') === 'delete') {
    await deleteResource(Number(formData.get('resourceId')))
    return { ok: true as const, error: null }
  }

  const resourceName = String(formData.get('resourceName') ?? '').trim()

  if (!resourceName) {
    return { ok: false as const, error: 'Resource name is required' }
  }

  try {
    await createResource({ resourceName })
  } catch (error) {
    if (error instanceof ResourceValidationError) {
      return { ok: false as const, error: error.message }
    }
    throw error
  }

  return { ok: true as const, error: null }
}

function Resources() {
  const { items, pagination } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  // used only for onChange in debounced search
  const submit = useSubmit()
  const createFetcher = useFetcher<ResourcesActionData>()
  const createFormRef = useRef<HTMLFormElement>(null)
  const previousCreateStateRef = useRef(createFetcher.state)
  const lastPageRef = useRef(pagination.page)
  const isCreating = createFetcher.state !== 'idle'

  useEffect(() => {
    if (lastPageRef.current !== pagination.page) {
      lastPageRef.current = pagination.page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pagination.page])

  useEffect(() => {
    const hasFinished =
      previousCreateStateRef.current !== 'idle' && createFetcher.state === 'idle'

    previousCreateStateRef.current = createFetcher.state

    if (hasFinished && createFetcher.data?.ok) {
      createFormRef.current?.reset()
      setIsCreateDrawerOpen(false)
    }
  }, [createFetcher.data, createFetcher.state])

  return (
    <PageShell>
      <PageHeader>
        <HeaderCopy>
          <Heading>Resources</Heading>
          <Lead>Create, track and complete resources through the module workflow.</Lead>
        </HeaderCopy>
        <Button type="button" onClick={() => setIsCreateDrawerOpen(true)}>
          Create Resource
        </Button>
      </PageHeader>

      <ResourceFilters
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        submit={submit}
      />

      {items.length === 0 ? (
        <Lead>No resources match your filters.</Lead>
      ) : (
        <ResourceList>
          {items.map((resource) => (
            <ResourceListItem key={resource._id} resource={resource} />
          ))}
        </ResourceList>
      )}

      <Pagination pagination={pagination} searchParams={searchParams} />

      <Drawer
        title="Create Resource"
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      >
        <CreateResourceForm
          createFetcher={createFetcher}
          formRef={createFormRef}
          error={createFetcher.data?.error ?? undefined}
          isSubmitting={isCreating}
        />
      </Drawer>
    </PageShell>
  )
}

const ResourceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: ${CONTENT_WIDTH};
`

export default Resources
