import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { type ResourcePage } from '../../api/resources'

function Pagination({
  pagination,
  searchParams,
}: {
  pagination: ResourcePage['pagination']
  searchParams: URLSearchParams
}) {
  const pageLink = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    return `?${next.toString()}`
  }

  return (
    <Pager>
      {pagination.page > 1 ? (
        <PagerLink to={pageLink(pagination.page - 1)}>← Prev</PagerLink>
      ) : (
        <PagerDisabled>← Prev</PagerDisabled>
      )}
      <PagerInfo>
        Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
      </PagerInfo>
      {pagination.page < pagination.totalPages ? (
        <PagerLink to={pageLink(pagination.page + 1)}>Next →</PagerLink>
      ) : (
        <PagerDisabled>Next →</PagerDisabled>
      )}
    </Pager>
  )
}

const Pager = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const PagerLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
`

const PagerDisabled = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.5;
  font-weight: 600;
`

const PagerInfo = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
`

export default Pagination
