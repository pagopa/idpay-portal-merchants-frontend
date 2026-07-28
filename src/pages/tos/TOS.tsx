import { useState } from 'react';
import routes from '../../routes';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';
import { ENV } from '../../utils/env';
import OneTrustContentWrapper from '../components/OneTrustContentWrapper';

const TOS = () => {
  const [contentLoaded, setContentLoaded] = useState(false);

  useOneTrustNotice(ENV.ONE_TRUST.TOS_JSON_URL, contentLoaded, setContentLoaded, routes.TOS);

  return <OneTrustContentWrapper idSelector={ENV.ONE_TRUST.TOS_ID} />;
};
export default TOS;
