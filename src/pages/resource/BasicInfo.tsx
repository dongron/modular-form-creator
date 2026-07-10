import { useParams } from 'react-router-dom'
import { PageShell, Heading, Lead } from '../components/PageLayout'

function BasicInfo() {
  const { resourceId } = useParams<{ resourceId: string }>()

  return (
    <PageShell $centered>
      <Heading>Basic info</Heading>
      <Lead>Basic info for resource “{resourceId}”.</Lead>
    </PageShell>
  )
}

export default BasicInfo
