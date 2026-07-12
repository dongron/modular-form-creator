import type { FetcherWithComponents } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Drawer } from '../../design-system'

export type DeleteConfirmDrawerProps = {
  resourceName: string
  resourceId: number
  isOpen: boolean
  onClose: () => void
  fetcher: Pick<FetcherWithComponents<unknown>, 'Form'>
  isSubmitting?: boolean
}

function DeleteConfirmDrawer({
  resourceName,
  resourceId,
  isOpen,
  onClose,
  fetcher,
  isSubmitting = false,
}: DeleteConfirmDrawerProps) {
  return (
    <Drawer title="Delete resource" isOpen={isOpen} onClose={onClose}>
      <p>Delete "{resourceName}"? This can't be undone.</p>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="resourceId" value={resourceId} />
        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            state={isSubmitting ? 'disabled' : 'normal'}
          >
            Delete
          </Button>
        </Actions>
      </fetcher.Form>
    </Drawer>
  )
}

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`

export default DeleteConfirmDrawer
