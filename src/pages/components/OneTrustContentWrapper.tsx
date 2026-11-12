import { Box, Grid, Link } from '@mui/material';
import routes from '../../routes';
import useScopedTranslation from '../../hooks/useScopedTranslation';

interface Props {
  idSelector: string;
  isContentLoaded: boolean;
}

const OneTrustContentWrapper = ({ idSelector, isContentLoaded }: Props) => {
  const { t } = useScopedTranslation();
  return (
    <>
      <Grid sx={{ px: 3, py: 3 }}>
        <div id={idSelector} className="otnotice"></div>
      </Grid>
      {isContentLoaded &&
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Link underline="hover" href={routes.HOME}>
            {t('pages.tos.backHome')}
          </Link>
        </Box>
      }
    </>
  );
};

export default OneTrustContentWrapper;
