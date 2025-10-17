import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import routes from './routes';
import UpcomingInitiative from './pages/upcomingInitiative/upcomingInitiative';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: routes.UPCOMING, element: <UpcomingInitiative /> },
      { path: '*', element: <Navigate to={routes.UPCOMING} replace /> },
    ],
  },
]);
