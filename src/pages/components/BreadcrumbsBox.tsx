import { Box, Breadcrumbs, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useHistory } from 'react-router-dom';

interface Props {
  backLabel: string;
  items: Array<string | undefined>;
}

const BreadcrumbsBox = ({ backLabel, items }: Props) => {
  const history = useHistory();
  return (
    <Box sx={{ display: 'grid', gridColumn: 'span 12', maxWidth: '100%', minWidth: 0 }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          maxWidth: '100%',
          minWidth: 0,
          '& .MuiBreadcrumbs-li': {
            minWidth: 0,
          },
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
            maxWidth: '100%',
            minWidth: 0,
          },
        }}
      >
        <Box onClick={() => history.goBack()} sx={{ display: 'inline-flex', cursor: 'pointer' }}>
          <ButtonNaked
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'primary.main', fontSize: '1rem', marginBottom: '3px' }}
            weight="default"
            data-testid="back-btn-test"
          >
            {backLabel}
          </ButtonNaked>
        </Box>
        {items.map((label, index) => (
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: index === items.length - 1 ? 'min(55vw, calc(95vw - 300px))' : '25vw',
              minWidth: '0',
              whiteSpace: 'nowrap',
            }}
            color="text.primary"
            variant="body2"
            key={index}
          >
            {label}
          </Typography>
        ))}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsBox;
