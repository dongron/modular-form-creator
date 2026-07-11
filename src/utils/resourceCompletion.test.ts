import { describe, expect, it } from 'vitest'
import type { Resource } from '../api/resources'
import { isBasicInfoComplete, isProjectDetailsComplete } from './resourceCompletion'

const completeBasicInfo: Resource['basicInfo'] = {
  resourceName: 'Project Atlas',
  owner: 'Ada Lovelace',
  email: 'ada@example.com',
  description: 'A complete resource.',
  priority: 'high',
}

const completeProjectDetails: Resource['projectDetails'] = {
  projectName: 'Atlas Platform',
  budget: '100000',
  category: 'external',
  options: ['FE devs'],
}

describe('isBasicInfoComplete', () => {
  it('returns true when every field is filled', () => {
    expect(isBasicInfoComplete(completeBasicInfo)).toBe(true)
  })

  it('returns false when any field is empty', () => {
    expect(isBasicInfoComplete({ ...completeBasicInfo, owner: '' })).toBe(false)
    expect(isBasicInfoComplete({ ...completeBasicInfo, priority: '' })).toBe(false)
  })
})

describe('isProjectDetailsComplete', () => {
  it('returns true when every field is filled and at least one option exists', () => {
    expect(isProjectDetailsComplete(completeProjectDetails)).toBe(true)
  })

  it('returns false when a field is empty or there are no options', () => {
    expect(isProjectDetailsComplete({ ...completeProjectDetails, budget: '' })).toBe(
      false,
    )
    expect(isProjectDetailsComplete({ ...completeProjectDetails, options: [] })).toBe(
      false,
    )
  })
})
