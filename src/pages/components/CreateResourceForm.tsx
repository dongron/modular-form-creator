import { useEffect, useRef } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Input } from '../../design-system'
import { type ResourcesActionData } from '../Resources'

// in progress, direct useActionData, useNavigation will be removed from here
function CreateResourceForm() {
  const actionData = useActionData() as ResourcesActionData | undefined
  const navigation = useNavigation()
  const formRef = useRef<HTMLFormElement>(null)

  const isSubmitting = navigation.state === 'submitting'

  useEffect(() => {
    if (actionData?.ok && navigation.state === 'idle') {
      formRef.current?.reset()
    }
  }, [actionData, navigation.state])

  return (
    <CreateForm method="post" ref={formRef}>
      <input type="hidden" name="intent" value="create" />
      <Input
        name="resourceName"
        label="New resource"
        placeholder="Resource name"
        error={actionData?.error ?? undefined}
        state={isSubmitting ? 'disabled' : 'normal'}
      />
      <Button type="submit" state={isSubmitting ? 'disabled' : 'normal'}>
        {isSubmitting ? 'Adding…' : 'Add resource'}
      </Button>
    </CreateForm>
  )
}

const CreateForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: min(28rem, 100%);
`

export default CreateResourceForm
