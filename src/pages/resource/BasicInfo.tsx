import { useState } from 'react'
import { useFetcher, useOutletContext, type ActionFunctionArgs } from 'react-router-dom'
import styled from 'styled-components'
import {
  fetchResource,
  updateBasicInfo,
  updateResource,
  ResourceValidationError,
  type BasicInfoPayload,
  type Resource,
} from '../../api/resources'
import { Button, Input, Select } from '../../design-system'
import { CONTENT_WIDTH, FieldWrapper, FormShell, Lead } from '../components/PageLayout'
import { PRIORITY_OPTIONS } from '../../utils/basicInfoOptions'
import { getSubmitLabel } from '../../utils/submitLabel'

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
    if (formData.get('intent') === 'full-update') {
      const current = await fetchResource(params.resourceId ?? '')
      await updateResource(params.resourceId ?? '', {
        name: current.name,
        basicInfo: { ...payload, resourceName: current.basicInfo.resourceName },
        projectDetails: current.projectDetails,
      })
    } else {
      await updateBasicInfo(params.resourceId ?? '', payload)
    }
  } catch (error) {
    if (error instanceof ResourceValidationError) {
      return { ok: false as const, error: error.message }
    }
    throw error
  }

  return { ok: true as const, error: null }
}

function BasicInfo() {
  const resource = useOutletContext<Resource>()
  const fetcher = useFetcher<BasicInfoActionData>()
  const { basicInfo } = resource
  const error = fetcher.data?.error
  const isCompleted = resource.status === 'completed'
  const isSubmitting = fetcher.state !== 'idle'
  const fieldState = isSubmitting ? 'disabled' : 'normal'
  // I am usually using react-hook-form for this kind of form, but I wanted to keep it simple and minimal here
  const [isDirty, setIsDirty] = useState(false)

  return (
    <FormShell>
      <fetcher.Form
        method="post"
        key={resource.updatedAt}
        onChange={() => setIsDirty(true)}
      >
        <FormFields>
          <input type="hidden" name="resourceName" value={basicInfo.resourceName} />
          {isCompleted ? <input type="hidden" name="intent" value="full-update" /> : null}
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
              defaultValue={basicInfo.owner}
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
              defaultValue={basicInfo.email}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              name="description"
              label="Description"
              defaultValue={basicInfo.description}
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
              defaultValue={basicInfo.priority}
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
            {isCompleted && isDirty ? (
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
