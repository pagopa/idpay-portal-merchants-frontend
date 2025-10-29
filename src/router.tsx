import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import UpcomingInitiative from './pages/upcomingInitiative/upcomingInitiative';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Navigate to="iniziativa-in-arrivo" replace /> },
        { path: 'iniziativa-in-arrivo', element: <UpcomingInitiative /> },
        { path: '*', element: <Navigate to="iniziativa-in-arrivo" replace /> },
      ],
    },
  ],
  {
    basename: '/portale-esercenti-in-arrivo',
  }
);
