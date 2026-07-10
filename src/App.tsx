import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Resources from './pages/Resources'
import Resource from './pages/resource/Resource'
import ResourceIndex from './pages/resource/ResourceIndex'
import BasicInfo from './pages/resource/BasicInfo'
import ProjectDetails from './pages/resource/ProjectDetails'
import ResourceDetails from './pages/resource/ResourceDetails'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:resourceId" element={<Resource />}>
          <Route index element={<ResourceIndex />} />
          <Route path="basic-info" element={<BasicInfo />} />
          <Route path="project-details" element={<ProjectDetails />} />
          <Route path="details" element={<ResourceDetails />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
