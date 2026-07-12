import { useFetcher, useOutletContext, type ActionFunctionArgs } from 'react-router-dom'
import styled from 'styled-components'
import {
  updateBasicInfo,
  ResourceValidationError,
  type BasicInfoPayload,
  type Resource,
} from '../../api/resources'
import { Button, Input, Select } from '../../design-system'
import { CONTENT_WIDTH, FieldWrapper, FormShell, Lead } from '../components/PageLayout'

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

const priorityOptions = [
  { value: '', label: 'Select priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function BasicInfo() {
  const resource = useOutletContext<Resource>()
  const fetcher = useFetcher<BasicInfoActionData>()
  const { basicInfo } = resource
  const error = fetcher.data?.error
  const isCompleted = resource.status === 'completed'
  const isSubmitting = fetcher.state !== 'idle'
  const fieldState = isCompleted ? 'locked' : isSubmitting ? 'disabled' : 'normal'

  return (
    <FormShell>
      {/* Remount the form when a save changes updatedAt so uncontrolled inputs
          pick up the server-trimmed values from the revalidated loader data. */}
      <fetcher.Form method="post" key={resource.updatedAt}>
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
              options={priorityOptions}
              required
              state={fieldState}
            />
          </FieldWrapper>
          <FieldWrapper>
            {error ? <ErrorText role="alert">{error}</ErrorText> : null}
            {isCompleted ? (
              <Lead>Completed resources can no longer be edited here.</Lead>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              state={isCompleted || isSubmitting ? 'disabled' : 'normal'}
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

export default BasicInfo
