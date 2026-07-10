import { useParams } from 'react-router-dom'
import { PageShell, Heading, Lead } from '../components/PageLayout'

function ResourceIndex() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell $centered>
      <Heading>Overview</Heading>
      <Lead>Overview for resource “{resourceId}”.</Lead>
    </PageShell>
  )
}

export default ResourceIndex
