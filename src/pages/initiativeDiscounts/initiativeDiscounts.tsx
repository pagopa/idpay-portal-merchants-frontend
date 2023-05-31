import { matchPath } from 'react-router-dom';
import ROUTES from '../../routes';

interface MatchParams {
  id: string;
}

const InitiativeDiscounts = () => {
  const match = matchPath(location.pathname, {
    path: [ROUTES.DISCOUNTS],
    exact: true,
    strict: false,
  });

  const { id } = (match?.params as MatchParams) || {};

  return <div>{`initiative discounts ${id}`}</div>;
};

export default InitiativeDiscounts;
