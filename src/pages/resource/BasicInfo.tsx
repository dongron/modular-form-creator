import { useOutletContext } from 'react-router-dom'
import type { Resource } from '../../api/resources'
import { Input } from '../../design-system'
import { FieldWrapper } from '../components/PageLayout'

function BasicInfo() {
  const { basicInfo } = useOutletContext<Resource>()

  return (
    <>
      <FieldWrapper>
        <Input
          label="Resource name"
          defaultValue={basicInfo.resourceName}
          state="locked"
        />
      </FieldWrapper>
      <FieldWrapper>
        <Input label="Owner" defaultValue={basicInfo.owner} state="locked" />
      </FieldWrapper>
      <FieldWrapper>
        <Input label="Email" type="email" defaultValue={basicInfo.email} state="locked" />
      </FieldWrapper>
      <FieldWrapper>
        <Input
          label="Description"
          defaultValue={basicInfo.description}
          multiline
          state="locked"
        />
      </FieldWrapper>
      <FieldWrapper>
        <Input label="Priority" defaultValue={basicInfo.priority} state="locked" />
      </FieldWrapper>
    </>
  )
}

export default BasicInfo
