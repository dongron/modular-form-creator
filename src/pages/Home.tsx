import styled from 'styled-components'

function Home() {
  return (
    <AppShell>
      <Message>Good luck!</Message>
    </AppShell>
  )
}

const AppShell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Message = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

export default Home
