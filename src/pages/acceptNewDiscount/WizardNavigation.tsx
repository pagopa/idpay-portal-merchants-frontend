import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  handleBack: () => void;
  handleNext: () => void;
  disabledNext: boolean;
}

const WizardNavigation = ({ handleBack, handleNext, disabledNext }: Props) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ gridColumn: 'span 12', my: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          gridTemplateRows: 'auto',
          gridTemplateAreas: `"back . . continue"`,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ gridArea: 'back' }}>
          <Button variant="outlined" onClick={handleBack} data-testid="back-action-test">
            {t('commons.backBtn')}
          </Button>
        </Box>
        <Box sx={{ gridArea: 'continue', justifySelf: 'end' }}>
          <Button
            variant="contained"
            onClick={handleNext}
            data-testid="continue-action-test"
            disabled={disabledNext}
          >
            {t('commons.confirmBtn')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WizardNavigation;
