import type { Resource } from '../api/resources'

// Mirrors the backend completion rules in
// backend/src/modules/resources/resource.service.ts so the UI reflects exactly
// when a resource can be provisioned.
export function isBasicInfoComplete(basicInfo: Resource['basicInfo']): boolean {
  return Boolean(
    basicInfo.resourceName &&
    basicInfo.owner &&
    basicInfo.email &&
    basicInfo.description &&
    basicInfo.priority,
  )
}

export function isProjectDetailsComplete(
  projectDetails: Resource['projectDetails'],
): boolean {
  return Boolean(
    projectDetails.projectName &&
    projectDetails.budget &&
    projectDetails.category &&
    projectDetails.options.length > 0,
  )
}
