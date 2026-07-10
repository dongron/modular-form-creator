import { useEffect, useRef } from 'react'
import {
  useLoaderData,
  useSearchParams,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import styled from 'styled-components'
import { createResource, deleteResource, fetchResources } from '../api/resources'
import { parseResourceFilters } from '../utils/resourceFilters'
import ResourceListItem from './components/ResourceListItem'
import ResourceFilters from './components/ResourceFilters'
import Pagination from './components/Pagination'
import CreateResourceForm from './components/CreateResourceForm'
import { PageShell, Heading, Lead, CONTENT_WIDTH } from './components/PageLayout'

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

  await createResource({ resourceName })
  return { ok: true as const, error: null }
}

function Resources() {
  const { items, pagination } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()
  const lastPageRef = useRef(pagination.page)

  useEffect(() => {
    if (lastPageRef.current !== pagination.page) {
      lastPageRef.current = pagination.page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pagination.page])

  return (
    <PageShell>
      <Heading>Resources</Heading>
      <Lead>Helpful links and materials will live here.</Lead>

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

      <CreateResourceForm />
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
