import type { Ref } from 'react'
import type { FetcherWithComponents } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Input } from '../../design-system'

type CreateResourceFormProps = {
  createFetcher: Pick<FetcherWithComponents<unknown>, 'Form'>
  formRef: Ref<HTMLFormElement>
  error?: string
  isSubmitting?: boolean
}

function CreateResourceForm({
  createFetcher,
  formRef,
  error,
  isSubmitting = false,
}: CreateResourceFormProps) {
  return (
    <createFetcher.Form method="post" ref={formRef}>
      <FormFields>
        <input type="hidden" name="intent" value="create" />
        <Input
          name="resourceName"
          label="Resource name"
          placeholder="Enter resource name"
          helperText="Resource names cannot be changed after creation."
          error={error}
          maxLength={255}
          required
          state={isSubmitting ? 'disabled' : 'normal'}
        />
        <Button type="submit" fullWidth state={isSubmitting ? 'disabled' : 'normal'}>
          {isSubmitting ? 'Creating…' : 'Create Resource'}
        </Button>
      </FormFields>
    </createFetcher.Form>
  )
}

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`

export default CreateResourceForm
