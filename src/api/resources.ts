export type Resource = {
  _id: string
  resourceId: number
  name: string
  status: string
  basicInfo: {
    resourceName: string
    owner: string
    email: string
    description: string
    priority: string
  }
  projectDetails: {
    projectName: string
    budget: string
    category: string
    options: string[]
  }
  createdAt: string
  updatedAt: string
}

const API_URL = '/api/resources'

export type ResourcePage = {
  items: Resource[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export type ResourceFilters = {
  page?: number
  pageSize?: number
  status?: 'draft' | 'completed'
  name?: string
  sortOrder?: 'asc' | 'desc'
}

export class ResourceValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResourceValidationError'
  }
}

export async function fetchResources(
  filters: ResourceFilters = {},
): Promise<ResourcePage> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const res = await fetch(`${API_URL}?${params}`)
  if (!res.ok) {
    throw new Response(`Failed to load resources (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<ResourcePage>
}

export async function deleteResource(resourceId: number): Promise<void> {
  const res = await fetch(`${API_URL}/${resourceId}`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Response(`Failed to delete resource (${res.status})`, {
      status: res.status,
    })
  }
}

export async function createResource(data: { resourceName: string }): Promise<Resource> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 400) {
    let message = 'Resource name is invalid'

    try {
      const body: unknown = await res.json()
      if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        message = body.message
      }
    } catch {
      // Keep the safe fallback when the API returns an invalid validation body.
    }

    throw new ResourceValidationError(message)
  }

  if (!res.ok) {
    throw new Response(`Failed to create resource (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}
