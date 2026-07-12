import { useNavigate } from 'react-router-dom'
import { Button } from '../design-system'
import { PageShell, Heading } from './components/PageLayout'

function Home() {
  const navigate = useNavigate()

  return (
    <PageShell $centered $gap="lg">
      <Heading>Modular Form Creator</Heading>
      <Button type="button" onClick={() => navigate('/resources')}>
        View Resources
      </Button>
    </PageShell>
  )
}

export default Home
