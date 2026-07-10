import { useParams } from 'react-router-dom'
import { PageShell, Heading, Lead } from '../components/PageLayout'

function ProjectDetails() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell $centered>
      <Heading>Project details</Heading>
      <Lead>Project details for resource “{resourceId}”.</Lead>
    </PageShell>
  )
}

export default ProjectDetails
