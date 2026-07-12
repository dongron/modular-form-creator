import { useState } from 'react'
import { useFetcher, useOutletContext, type ActionFunctionArgs } from 'react-router-dom'
import styled from 'styled-components'
import {
  updateProjectDetails,
  ResourceValidationError,
  type ProjectDetailsPayload,
  type Resource,
} from '../../api/resources'
import { Button, CheckboxGroup, Input, Select } from '../../design-system'
import { CONTENT_WIDTH, FieldWrapper, FormShell, Lead } from '../components/PageLayout'
import { isBasicInfoComplete } from '../../utils/resourceCompletion'
import { CATEGORY_OPTIONS, OPTION_CHOICES } from '../../utils/projectDetailsOptions'

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
  const resource = useOutletContext<Resource>()
  const fetcher = useFetcher<ProjectDetailsActionData>()
  const { projectDetails } = resource
  const error = fetcher.data?.error
  const isCompleted = resource.status === 'completed'
  const isSubmitting = fetcher.state !== 'idle'
  const isBasicInfoIncomplete = !isCompleted && !isBasicInfoComplete(resource.basicInfo)
  const isLocked = isCompleted || isBasicInfoIncomplete
  const fieldState = isLocked ? 'locked' : isSubmitting ? 'disabled' : 'normal'
  const [options, setOptions] = useState<string[]>(projectDetails.options)

  return (
    <FormShell>
      {/* Remount the form when a save changes updatedAt so uncontrolled inputs
          pick up the server-trimmed values from the revalidated loader data. */}
      <fetcher.Form method="post" key={resource.updatedAt}>
        <FormFields>
          <FieldWrapper>
            <Input
              name="projectName"
              label="Project name"
              defaultValue={projectDetails.projectName}
              maxLength={255}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              name="budget"
              label="Budget"
              defaultValue={projectDetails.budget}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              name="category"
              label="Category"
              defaultValue={projectDetails.category}
              options={CATEGORY_OPTIONS}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <CheckboxGroup
              label="Options"
              options={OPTION_CHOICES}
              value={options}
              onChange={setOptions}
              disabled={isLocked || isSubmitting}
            />
            {options.map((option) => (
              <input key={option} type="hidden" name="options" value={option} />
            ))}
          </FieldWrapper>
          <FieldWrapper>
            {error ? <ErrorText role="alert">{error}</ErrorText> : null}
            {isCompleted ? (
              <Lead>Completed resources can no longer be edited here.</Lead>
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
              {isSubmitting ? 'Saving…' : 'Save changes'}
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
