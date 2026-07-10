import { useParams } from 'react-router-dom'
import { PageShell, Heading, Lead } from '../components/PageLayout'

function ResourceDetails() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell $centered>
      <Heading>Resource details</Heading>
      <Lead>Full details for resource “{resourceId}”.</Lead>
    </PageShell>
  )
}

export default ResourceDetails
