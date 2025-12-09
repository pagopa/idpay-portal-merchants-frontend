import { Box, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import tosHTML from './tosHTML.json';

declare const OneTrust: any;

const TOS = () => {
  const { t } = useTranslation();

  return (

    <Box sx={{ width: '100%', padding: '0 20px' }}>
      <Box>
        <Box mt={2} sx={{ display: 'grid', gridColumn: 'span 8' }}>
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
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>

  );
};
export default TOS;
