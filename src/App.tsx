import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Resources, {
  action as resourcesAction,
  loader as resourcesLoader,
} from './pages/Resources'
import Resource, {
  action as resourceAction,
  loader as resourceLoader,
} from './pages/resource/Resource'
import ResourceIndex, {
  action as resourceIndexAction,
} from './pages/resource/ResourceIndex'
import BasicInfo, { action as basicInfoAction } from './pages/resource/BasicInfo'
import ProjectDetails, {
  action as projectDetailsAction,
} from './pages/resource/ProjectDetails'
import ResourceDetails from './pages/resource/ResourceDetails'
import ResourceError from './pages/resource/ResourceError'

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
        action: resourceAction,
        errorElement: <ResourceError />,
        children: [
          { index: true, element: <ResourceIndex />, action: resourceIndexAction },
          { path: 'basic-info', element: <BasicInfo />, action: basicInfoAction },
          {
            path: 'project-details',
            element: <ProjectDetails />,
            action: projectDetailsAction,
          },
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
