// import { useState } from 'react';
// import { ENV } from '../../utils/env';
// import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';

import { Button, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import DOMPurify from 'dompurify';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import privacyHTML from './privacyHTML.json';

// import routes from '../../routes';
// import OneTrustContentWrapper from '../components/OneTrustContentWrapper';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  //   const [contentLoaded, setContentLoaded] = useState(false);
  //   useOneTrustNotice(
  //     ENV.ONE_TRUST.PRIVACY_POLICY_JSON_URL,
  //     contentLoaded,
  //     setContentLoaded,
  //     routes.PRIVACY_POLICY
  //   );
  //   return <OneTrustContentWrapper idSelector={ENV.ONE_TRUST.PRIVACY_POLICY_ID} />;
  return (
    <>
      {/* <Grid sx={{ px: 3, py: 3 }}>
      <div id={idSelector} className="otnotice"></div>
    </Grid> */}
      <Box sx={{ width: '100%' }}>
        <Box>
          <Box mt={2} sx={{ display: 'grid', gridColumn: 'span 8' }}>
            <BreadcrumbsBox backLabel={t('commons.backBtn')} items={[]} />
            <TitleBox
              title={t('pages.privacyPolicyStatic.title')}
              mbTitle={2}
              mtTitle={2}
              variantTitle="h4"
            />
          </Box>
        </Box>

        <Paper elevation={1} square={true} sx={{ mt: 2 }}>
          <Box px={4} pt={2} pb={4}>
            <Grid container>
              <Grid item xs={12}>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(privacyHTML.html),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            data-testid="back-stores-button"
            variant="outlined"
            onClick={() => history.back()}
          >
            {t('commons.backBtn')}
          </Button>
        </Box>
      </Box>
    </>
  );
};
export default PrivacyPolicy;
