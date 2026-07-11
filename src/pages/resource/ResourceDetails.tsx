import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/resources'
import { Badge, Card, type BadgeVariant } from '../../design-system'
import { CONTENT_WIDTH } from '../components/PageLayout'

const statusVariant: Record<string, BadgeVariant> = {
  draft: 'neutral',
  completed: 'success',
}

function ResourceDetails() {
  const resource = useOutletContext<Resource>()
  const { basicInfo, projectDetails } = resource
  const isBasicInfoComplete = Boolean(
    basicInfo.resourceName &&
    basicInfo.owner &&
    basicInfo.email &&
    basicInfo.description &&
    basicInfo.priority,
  )
  const isProjectDetailsComplete = Boolean(
    projectDetails.projectName &&
    projectDetails.budget &&
    projectDetails.category &&
    projectDetails.options.length > 0,
  )

  return (
    <>
      <SummaryStatus>
        <StatusLabel>Resource status</StatusLabel>
        <Badge variant={statusVariant[resource.status] ?? 'neutral'}>
          {resource.status}
        </Badge>
      </SummaryStatus>
      <SummaryCards>
        <Card>
          <CardHeader>
            <CardTitle>Basic info</CardTitle>
            <Badge variant={isBasicInfoComplete ? 'success' : 'warning'}>
              {isBasicInfoComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          </CardHeader>
          <DetailsList>
            <DetailItem>
              <DetailTerm>Resource name</DetailTerm>
              <DetailValue>{basicInfo.resourceName || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Owner</DetailTerm>
              <DetailValue>{basicInfo.owner || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Email</DetailTerm>
              <DetailValue>{basicInfo.email || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Description</DetailTerm>
              <DetailValue>{basicInfo.description || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Priority</DetailTerm>
              <DetailValue>{basicInfo.priority || 'Not provided'}</DetailValue>
            </DetailItem>
          </DetailsList>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <Badge variant={isProjectDetailsComplete ? 'success' : 'warning'}>
              {isProjectDetailsComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          </CardHeader>
          <DetailsList>
            <DetailItem>
              <DetailTerm>Project name</DetailTerm>
              <DetailValue>{projectDetails.projectName || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Budget</DetailTerm>
              <DetailValue>{projectDetails.budget || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Category</DetailTerm>
              <DetailValue>{projectDetails.category || 'Not provided'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailTerm>Options</DetailTerm>
              <DetailValue>
                {projectDetails.options.length > 0 ? (
                  <OptionsList>
                    {projectDetails.options.map((option, index) => (
                      <li key={`${option}-${index}`}>{option}</li>
                    ))}
                  </OptionsList>
                ) : (
                  'None selected'
                )}
              </DetailValue>
            </DetailItem>
          </DetailsList>
        </Card>
      </SummaryCards>
    </>
  )
}

const SummaryStatus = styled.div`
  width: ${CONTENT_WIDTH};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const StatusLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const SummaryCards = styled.div`
  width: ${CONTENT_WIDTH};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  align-items: start;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

const CardTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const DetailsList = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`

const DetailItem = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: ${({ theme }) => theme.spacing.sm};
`

const DetailTerm = styled.dt`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const DetailValue = styled.dd`
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const OptionsList = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  padding: 0;
  list-style-position: inside;
`

export default ResourceDetails
