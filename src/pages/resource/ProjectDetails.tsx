import { useState } from 'react'
import { useFetcher, useOutletContext, type ActionFunctionArgs } from 'react-router-dom'
import styled from 'styled-components'
import {
  updateProjectDetails,
  ResourceValidationError,
  type ProjectDetailsPayload,
} from '../../api/resources'
import { Button, CheckboxGroup, Input, Select } from '../../design-system'
import { CONTENT_WIDTH, FieldWrapper, FormShell, Lead } from '../components/PageLayout'
import { isBasicInfoComplete } from '../../utils/resourceCompletion'
import { CATEGORY_OPTIONS, OPTION_CHOICES } from '../../utils/projectDetailsOptions'
import { getSubmitLabel } from '../../utils/submitLabel'
import type { ResourceOutletContext } from './Resource'

export type ProjectDetailsActionData = { ok: boolean; error: string | null }

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const payload: ProjectDetailsPayload = {
    projectName: String(formData.get('projectName') ?? ''),
    budget: String(formData.get('budget') ?? ''),
    category: String(formData.get('category') ?? ''),
    options: formData.getAll('options').map(String),
  }

  try {
    await updateProjectDetails(params.resourceId ?? '', payload)
  } catch (error) {
    if (error instanceof ResourceValidationError) {
      return { ok: false as const, error: error.message }
    }
    throw error
  }

  return { ok: true as const, error: null }
}

function ProjectDetails() {
  const {
    resource,
    hasCompletedEdits,
    updateCompletedProjectDetails,
    submitCompletedChanges,
    isSubmittingCompletedChanges,
    completedChangesError,
  } = useOutletContext<ResourceOutletContext>()
  const fetcher = useFetcher<ProjectDetailsActionData>()
  const { projectDetails } = resource
  const isCompleted = resource.status === 'completed'
  const isSubmitting = isCompleted
    ? isSubmittingCompletedChanges
    : fetcher.state !== 'idle'
  const error = isCompleted ? completedChangesError : fetcher.data?.error
  const isBasicInfoIncomplete = !isCompleted && !isBasicInfoComplete(resource.basicInfo)
  const isLocked = isBasicInfoIncomplete
  const fieldState = isLocked ? 'locked' : isSubmitting ? 'disabled' : 'normal'
  const [options, setOptions] = useState<string[]>(projectDetails.options)
  const selectedOptions = isCompleted ? projectDetails.options : options

  return (
    <FormShell>
      {/* Remount the form when a save changes updatedAt so uncontrolled inputs
          pick up the server-trimmed values from the revalidated loader data. */}
      <fetcher.Form
        method="post"
        key={resource.updatedAt}
        onSubmit={(event) => {
          if (isCompleted) {
            event.preventDefault()
            submitCompletedChanges()
          }
        }}
      >
        <FormFields>
          <FieldWrapper>
            <Input
              name="projectName"
              label="Project name"
              defaultValue={isCompleted ? undefined : projectDetails.projectName}
              value={isCompleted ? projectDetails.projectName : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedProjectDetails({
                        projectName: event.currentTarget.value,
                      })
                  : undefined
              }
              maxLength={255}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              name="budget"
              label="Budget"
              defaultValue={isCompleted ? undefined : projectDetails.budget}
              value={isCompleted ? projectDetails.budget : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedProjectDetails({ budget: event.currentTarget.value })
                  : undefined
              }
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              name="category"
              label="Category"
              defaultValue={isCompleted ? undefined : projectDetails.category}
              value={isCompleted ? projectDetails.category : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedProjectDetails({
                        category: event.currentTarget.value,
                      })
                  : undefined
              }
              options={CATEGORY_OPTIONS}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <CheckboxGroup
              label="Options"
              options={OPTION_CHOICES}
              value={selectedOptions}
              onChange={(nextOptions) => {
                if (isCompleted) {
                  updateCompletedProjectDetails({ options: nextOptions })
                } else {
                  setOptions(nextOptions)
                }
              }}
              disabled={isLocked || isSubmitting}
            />
            {selectedOptions.map((option) => (
              <input key={option} type="hidden" name="options" value={option} />
            ))}
          </FieldWrapper>
          <FieldWrapper>
            {error ? <ErrorText role="alert">{error}</ErrorText> : null}
            {isCompleted ? (
              <Lead>
                This resource is completed. Changes are kept locally until you submit
                them.
              </Lead>
            ) : null}
            {isCompleted && hasCompletedEdits ? (
              <Lead>You have unsaved local changes - they are lost on refresh.</Lead>
            ) : null}
            {isBasicInfoIncomplete ? (
              <Lead>
                Basic Info must be completed before Project Details can be edited.
              </Lead>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              state={isLocked || isSubmitting ? 'disabled' : 'normal'}
            >
              {getSubmitLabel(isSubmitting, isCompleted)}
            </Button>
          </FieldWrapper>
        </FormFields>
      </fetcher.Form>
    </FormShell>
  )
}

const FormFields = styled.div`
  width: ${CONTENT_WIDTH};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const ErrorText = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.warning};
`

export default ProjectDetails
