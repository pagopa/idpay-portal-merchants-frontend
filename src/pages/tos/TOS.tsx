// import { useState } from 'react';
// import routes from '../../routes';
// import { ENV } from '../../utils/env';
// import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';
// import OneTrustContentWrapper from '../components/OneTrustContentWrapper';
import { Box, Button, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import tosHTML from './tosHTML.json';

declare const OneTrust: any;

const TOS = () => {
  const { t } = useTranslation();
  // const htmlSanificato = DOMPurify.sanitize(tosHTML.html);

  //   const [contentLoaded, setContentLoaded] = useState(false);
  //   useOneTrustNotice(ENV.ONE_TRUST.TOS_JSON_URL, contentLoaded, setContentLoaded, routes.TOS);
  //   return <OneTrustContentWrapper idSelector={ENV.ONE_TRUST.TOS_ID} />;
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
              title={t('pages.tosStatic.title')}
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
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tosHTML.html) }}
                ></div>
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
export default TOS;
