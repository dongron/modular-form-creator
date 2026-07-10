import { useEffect, useRef } from 'react'
import { Form, type SetURLSearchParams, type SubmitFunction } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Input, Select } from '../../design-system'
import {
  STATUS_OPTIONS,
  SORT_ORDER_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../../utils/resourceFilters'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback'
import { CONTENT_WIDTH } from './PageLayout'

type ResourceFiltersProps = {
  searchParams: URLSearchParams
  setSearchParams: SetURLSearchParams
  submit: SubmitFunction
}

function ResourceFilters({
  searchParams,
  setSearchParams,
  submit,
}: ResourceFiltersProps) {
  const filterFormRef = useRef<HTMLFormElement>(null)

  const [handleNameChange, cancelNameChange] = useDebouncedCallback(() => {
    submit(filterFormRef.current, {
      replace: searchParams.get('name') !== null,
    })
  }, 400)

  useEffect(() => {
    const input = filterFormRef.current?.elements.namedItem('name')
    if (input instanceof HTMLInputElement && document.activeElement !== input) {
      input.value = searchParams.get('name') ?? ''
    }
  }, [searchParams])

  const applyFilters = (event: { currentTarget: { form: HTMLFormElement | null } }) =>
    submit(event.currentTarget.form)

  const resetFilters = () => {
    cancelNameChange()
    setSearchParams({})
  }

  return (
    <FilterForm method="get" ref={filterFormRef}>
      <FilterName>
        <Input
          name="name"
          label="Name"
          placeholder="Search by name"
          defaultValue={searchParams.get('name') ?? ''}
          onChange={handleNameChange}
        />
      </FilterName>
      <Select
        key={`status-${searchParams.get('status') ?? ''}`}
        name="status"
        label="Status"
        defaultValue={searchParams.get('status') ?? ''}
        onChange={applyFilters}
        options={STATUS_OPTIONS}
      />
      <Select
        key={`sortOrder-${searchParams.get('sortOrder') ?? ''}`}
        name="sortOrder"
        label="Sort"
        defaultValue={searchParams.get('sortOrder') ?? 'desc'}
        onChange={applyFilters}
        options={SORT_ORDER_OPTIONS}
      />
      <Select
        key={`pageSize-${searchParams.get('pageSize') ?? ''}`}
        name="pageSize"
        label="Per page"
        defaultValue={searchParams.get('pageSize') ?? '10'}
        onChange={applyFilters}
        options={PAGE_SIZE_OPTIONS}
      />
      <Button type="button" variant="ghost" onClick={resetFilters}>
        Reset
      </Button>
    </FilterForm>
  )
}

const FilterForm = styled(Form)`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  width: ${CONTENT_WIDTH};

  > * {
    flex: 1 1 8rem;
  }

  > button {
    flex: 0 0 auto;
  }
`

const FilterName = styled.div`
  flex: 2 1 12rem;
`

export default ResourceFilters
