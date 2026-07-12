import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createResource,
  fetchResource,
  updateBasicInfo,
  updateProjectDetails,
  updateResource,
  ResourceValidationError,
  type BasicInfoPayload,
  type FullUpdatePayload,
  type ProjectDetailsPayload,
  type Resource,
} from './resources'

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

describe('updateBasicInfo', () => {
  const payload: BasicInfoPayload = {
    resourceName: 'Project Atlas',
    owner: 'Ada Lovelace',
    email: 'ada@example.com',
    description: 'Updated description.',
    priority: 'high',
  }

  it('patches the basic info module and returns the updated resource', async () => {
    const updatedResource: Resource = {
      ...createdResource,
      basicInfo: { ...payload },
    }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedResource), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(updateBasicInfo(7, payload)).resolves.toEqual(updatedResource)
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/7/basic-info', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('throws the API validation message when the update returns 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ message: 'email must be a valid email format' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
    )

    let rejected: unknown
    try {
      await updateBasicInfo(7, payload)
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({ message: 'email must be a valid email format' })
  })

  it('falls back to a safe message when the 400 body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('not-json', { status: 400 })),
    )

    let rejected: unknown
    try {
      await updateBasicInfo(7, payload)
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({ message: 'Basic info is invalid' })
  })

  it.each([404, 500])(
    'throws a route response when the API returns %i',
    async (status) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))

      await expect(updateBasicInfo(7, payload)).rejects.toMatchObject({ status })
    },
  )
})

describe('updateProjectDetails', () => {
  const payload: ProjectDetailsPayload = {
    projectName: 'Atlas Platform',
    budget: '100000',
    category: 'external',
    options: ['FE devs', 'Designer'],
  }

  it('patches the project details module and returns the updated resource', async () => {
    const updatedResource: Resource = {
      ...createdResource,
      projectDetails: { ...payload },
    }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedResource), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(updateProjectDetails(7, payload)).resolves.toEqual(updatedResource)
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/7/project-details', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('throws the API validation message when the update returns 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Project Details can be updated only after Basic Info is completed.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    let rejected: unknown
    try {
      await updateProjectDetails(7, payload)
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({
      message: 'Project Details can be updated only after Basic Info is completed.',
    })
  })

  it('falls back to a safe message when the 400 body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('not-json', { status: 400 })),
    )

    let rejected: unknown
    try {
      await updateProjectDetails(7, payload)
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({ message: 'Project details are invalid' })
  })

  it.each([404, 500])(
    'throws a route response when the API returns %i',
    async (status) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))

      await expect(updateProjectDetails(7, payload)).rejects.toMatchObject({ status })
    },
  )
})

describe('updateResource', () => {
  const payload: FullUpdatePayload = {
    name: 'Project Atlas',
    basicInfo: {
      resourceName: 'Project Atlas',
      owner: 'Ada Lovelace',
      email: 'ada@example.com',
      description: 'Updated description.',
      priority: 'high',
    },
    projectDetails: {
      projectName: 'Atlas Platform',
      budget: '100000',
      category: 'external',
      options: ['FE devs', 'Designer'],
    },
  }

  it('puts the full resource payload and returns the updated resource', async () => {
    const updatedResource: Resource = {
      ...createdResource,
      status: 'completed',
      basicInfo: { ...payload.basicInfo },
      projectDetails: { ...payload.projectDetails },
    }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedResource), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(updateResource(7, payload)).resolves.toEqual(updatedResource)
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/7', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('throws the API validation message when the update returns 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'resourceName is locked after creation and cannot be changed',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    let rejected: unknown
    try {
      await updateResource(7, payload)
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({
      message: 'resourceName is locked after creation and cannot be changed',
    })
  })

  it('falls back to a safe message when the 400 body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('not-json', { status: 400 })),
    )

    let rejected: unknown
    try {
      await updateResource(7, payload)
    } catch (error) {
      rejected = error
    }

    expect(rejected).toBeInstanceOf(ResourceValidationError)
    expect(rejected).toMatchObject({ message: 'Resource update is invalid' })
  })

  it.each([404, 500])(
    'throws a route response when the API returns %i',
    async (status) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))

      await expect(updateResource(7, payload)).rejects.toMatchObject({ status })
    },
  )
})

describe('fetchResource', () => {
  it('gets one resource by ID and returns it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createdResource), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchResource(7)).resolves.toEqual(createdResource)
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/7')
  })

  it.each([400, 404])(
    'throws a route response when the API returns %i',
    async (status) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))

      await expect(fetchResource(7)).rejects.toMatchObject({ status })
    },
  )
})
