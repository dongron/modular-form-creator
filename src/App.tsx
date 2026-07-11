import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Resources, {
  action as resourcesAction,
  loader as resourcesLoader,
} from './pages/Resources'
import Resource, { loader as resourceLoader } from './pages/resource/Resource'
import ResourceIndex from './pages/resource/ResourceIndex'
import BasicInfo from './pages/resource/BasicInfo'
import ProjectDetails from './pages/resource/ProjectDetails'
import ResourceDetails from './pages/resource/ResourceDetails'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/resources',
        element: <Resources />,
        loader: resourcesLoader,
        action: resourcesAction,
      },
      {
        path: '/resources/:resourceId',
        element: <Resource />,
        loader: resourceLoader,
        children: [
          { index: true, element: <ResourceIndex /> },
          { path: 'basic-info', element: <BasicInfo /> },
          { path: 'project-details', element: <ProjectDetails /> },
          { path: 'details', element: <ResourceDetails /> },
        ],
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
