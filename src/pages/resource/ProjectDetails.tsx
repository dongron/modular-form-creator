import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/resources'
import { IconButton, Input } from '../../design-system'
import { FieldWrapper } from '../components/PageLayout'

function ProjectDetails() {
  const { projectDetails } = useOutletContext<Resource>()

  return (
    <>
      <FieldWrapper>
        <Input
          label="Project name"
          defaultValue={projectDetails.projectName}
          state="locked"
        />
      </FieldWrapper>
      <FieldWrapper>
        <Input label="Budget" defaultValue={projectDetails.budget} state="locked" />
      </FieldWrapper>
      <FieldWrapper>
        <Input label="Category" defaultValue={projectDetails.category} state="locked" />
      </FieldWrapper>
      <FieldWrapper>
        <OptionsGroup>
          <OptionsLegend>Options</OptionsLegend>
          <OptionsList>
            {projectDetails.options.map((option, index) => (
              <OptionRow key={`${option}-${index}`}>
                <Input
                  aria-label={`Option ${index + 1}`}
                  defaultValue={option}
                  state="locked"
                />
                <IconButton
                  type="button"
                  variant="ghost"
                  size="small"
                  state="disabled"
                  aria-label={`Delete option ${index + 1}`}
                >
                  ✕
                </IconButton>
              </OptionRow>
            ))}
          </OptionsList>
          <IconButton
            type="button"
            variant="solid"
            size="small"
            state="disabled"
            aria-label="Add option"
          >
            +
          </IconButton>
        </OptionsGroup>
      </FieldWrapper>
    </>
  )
}

const OptionsGroup = styled.fieldset`
  min-width: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  padding: 0;
  border: 0;
`

const OptionsLegend = styled.legend`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  padding: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const OptionsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`

const OptionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

export default ProjectDetails
