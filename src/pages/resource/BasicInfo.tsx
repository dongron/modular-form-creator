import { useFetcher, useOutletContext, type ActionFunctionArgs } from 'react-router-dom'
import styled from 'styled-components'
import {
  updateBasicInfo,
  ResourceValidationError,
  type BasicInfoPayload,
} from '../../api/resources'
import { Button, Input, Select } from '../../design-system'
import { CONTENT_WIDTH, FieldWrapper, FormShell, Lead } from '../components/PageLayout'
import { PRIORITY_OPTIONS } from '../../utils/basicInfoOptions'
import { getSubmitLabel } from '../../utils/submitLabel'
import type { ResourceOutletContext } from './Resource'

export type BasicInfoActionData = { ok: boolean; error: string | null }

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const payload: BasicInfoPayload = {
    resourceName: String(formData.get('resourceName') ?? ''),
    owner: String(formData.get('owner') ?? ''),
    email: String(formData.get('email') ?? ''),
    description: String(formData.get('description') ?? ''),
    priority: String(formData.get('priority') ?? ''),
  }

  try {
    await updateBasicInfo(params.resourceId ?? '', payload)
  } catch (error) {
    if (error instanceof ResourceValidationError) {
      return { ok: false as const, error: error.message }
    }
    throw error
  }

  return { ok: true as const, error: null }
}

function BasicInfo() {
  const {
    resource,
    hasCompletedEdits,
    updateCompletedBasicInfo,
    submitCompletedChanges,
    isSubmittingCompletedChanges,
    completedChangesError,
  } = useOutletContext<ResourceOutletContext>()
  const fetcher = useFetcher<BasicInfoActionData>()
  const { basicInfo } = resource
  const isCompleted = resource.status === 'completed'
  const isSubmitting = isCompleted
    ? isSubmittingCompletedChanges
    : fetcher.state !== 'idle'
  const error = isCompleted ? completedChangesError : fetcher.data?.error
  const fieldState = isSubmitting ? 'disabled' : 'normal'

  return (
    <FormShell>
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
          <input type="hidden" name="resourceName" value={basicInfo.resourceName} />
          <FieldWrapper>
            <Input
              label="Resource name"
              defaultValue={basicInfo.resourceName}
              helperText="Resource names cannot be changed after creation."
              state="locked"
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              name="owner"
              label="Owner"
              defaultValue={isCompleted ? undefined : basicInfo.owner}
              value={isCompleted ? basicInfo.owner : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedBasicInfo({ owner: event.currentTarget.value })
                  : undefined
              }
              maxLength={255}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              name="email"
              label="Email"
              type="email"
              defaultValue={isCompleted ? undefined : basicInfo.email}
              value={isCompleted ? basicInfo.email : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedBasicInfo({ email: event.currentTarget.value })
                  : undefined
              }
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              name="description"
              label="Description"
              defaultValue={isCompleted ? undefined : basicInfo.description}
              value={isCompleted ? basicInfo.description : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedBasicInfo({ description: event.currentTarget.value })
                  : undefined
              }
              multiline
              maxLength={1000}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              name="priority"
              label="Priority"
              defaultValue={isCompleted ? undefined : basicInfo.priority}
              value={isCompleted ? basicInfo.priority : undefined}
              onChange={
                isCompleted
                  ? (event) =>
                      updateCompletedBasicInfo({ priority: event.currentTarget.value })
                  : undefined
              }
              options={PRIORITY_OPTIONS}
              required
              state={fieldState}
            />
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
            <Button
              type="submit"
              variant="primary"
              state={isSubmitting ? 'disabled' : 'normal'}
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

export default BasicInfo
