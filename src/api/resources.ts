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

export type BasicInfoPayload = {
  resourceName: string
  owner: string
  email: string
  description: string
  priority: string
}

export type ProjectDetailsPayload = {
  projectName: string
  budget: string
  category: string
  options: string[]
}

export type FullUpdatePayload = {
  name: string
  basicInfo: BasicInfoPayload
  projectDetails: ProjectDetailsPayload
}
export class ResourceValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResourceValidationError'
  }
}

async function parseValidationMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await res.json()
    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
    ) {
      return body.message
    }
  } catch {
    // Keep the safe fallback when the API returns an invalid validation body.
  }
  return fallback
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

export async function fetchResource(resourceId: string | number): Promise<Resource> {
  const res = await fetch(`${API_URL}/${resourceId}`)
  if (!res.ok) {
    throw new Response(`Failed to load resource (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}

export async function deleteResource(resourceId: string | number): Promise<void> {
  const res = await fetch(`${API_URL}/${resourceId}`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Response(`Failed to delete resource (${res.status})`, {
      status: res.status,
    })
  }
}

export async function provisionResource(resourceId: string | number): Promise<Resource> {
  const res = await fetch(`${API_URL}/${resourceId}/provisioning`, {
    method: 'PATCH',
  })
  if (!res.ok) {
    throw new Response(`Failed to provision resource (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}

export async function updateBasicInfo(
  resourceId: string | number,
  data: BasicInfoPayload,
): Promise<Resource> {
  const res = await fetch(`${API_URL}/${resourceId}/basic-info`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 400) {
    throw new ResourceValidationError(
      await parseValidationMessage(res, 'Basic info is invalid'),
    )
  }

  if (!res.ok) {
    throw new Response(`Failed to update basic info (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}

export async function updateProjectDetails(
  resourceId: string | number,
  data: ProjectDetailsPayload,
): Promise<Resource> {
  const res = await fetch(`${API_URL}/${resourceId}/project-details`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 400) {
    throw new ResourceValidationError(
      await parseValidationMessage(res, 'Project details are invalid'),
    )
  }

  if (!res.ok) {
    throw new Response(`Failed to update project details (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}

export async function updateResource(
  resourceId: string | number,
  data: FullUpdatePayload,
): Promise<Resource> {
  const res = await fetch(`${API_URL}/${resourceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 400) {
    throw new ResourceValidationError(
      await parseValidationMessage(res, 'Resource update is invalid'),
    )
  }

  if (!res.ok) {
    throw new Response(`Failed to update resource (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}

export async function createResource(data: { resourceName: string }): Promise<Resource> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 400) {
    throw new ResourceValidationError(
      await parseValidationMessage(res, 'Resource name is invalid'),
    )
  }

  if (!res.ok) {
    throw new Response(`Failed to create resource (${res.status})`, {
      status: res.status,
    })
  }
  return res.json() as Promise<Resource>
}
