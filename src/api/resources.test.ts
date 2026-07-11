import { afterEach, describe, expect, it, vi } from 'vitest'
import { createResource, ResourceValidationError, type Resource } from './resources'

const createdResource: Resource = {
  _id: 'resource-object-id',
  resourceId: 7,
  name: 'Project Atlas',
  status: 'draft',
  basicInfo: {
    resourceName: 'Project Atlas',
    owner: '',
    email: '',
    description: '',
    priority: '',
  },
  projectDetails: {
    projectName: '',
    budget: '',
    category: '',
    options: [],
  },
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createResource', () => {
  it('posts only the resource name and returns the created resource', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createdResource), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(createResource({ resourceName: 'Project Atlas' })).resolves.toEqual(
      createdResource,
    )
    expect(fetchMock).toHaveBeenCalledWith('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceName: 'Project Atlas' }),
    })
  })

  it('throws the API validation message when resource creation returns 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'resourceName must be unique' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    let rejected: unknown
    try {
      await createResource({ resourceName: 'Project Atlas' })
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({ message: 'resourceName must be unique' })
  })

  it('continues to throw a route response for non-validation failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    await expect(createResource({ resourceName: 'Project Atlas' })).rejects.toMatchObject(
      { status: 500 },
    )
  })
})
