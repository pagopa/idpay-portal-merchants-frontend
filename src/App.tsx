import {
  ErrorBoundary,
} from '@pagopa/selfcare-common-frontend';
import { Route, Switch } from 'react-router-dom';
import routes from './routes';
import UpcomingInitiative from './pages/upcomingInitiative/upcomingInitiative';

const App = () => (
  <ErrorBoundary>
    <Switch>
      <Route path={routes.UPCOMING}>
        <UpcomingInitiative />
      </Route>
      <Route path="*">
        <UpcomingInitiative />
      </Route>
    </Switch>
  </ErrorBoundary>
);

export default App;
