import { Box, Typography, Button, Modal, Fade, Divider } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { useState } from 'react';

export const InitiativeOverviewInfo = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Box pt={2}>
      <Divider />
      <Box display="flex" pt={4} justifyContent={'space-between'}>
        <Typography
          variant="button"
          sx={{
            fontWeight: theme.typography.fontWeightBold,
            color: theme.palette.text.primary,
          }}
        >
          {t('pages.initiativeOverview.info.title').toUpperCase()}
        </Typography>
        <Button
          variant="text"
          onClick={() => setOpen(true)}
          data-testid="open-modal"
          sx={{
            minWidth: 'max-content',
            maxHeight: 'fit-content',
            textDecoration: 'underline',
            p: 0,
          }}
        >
          {t('pages.initiativeOverview.info.button')}
        </Button>
      </Box>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={open} data-testid="fade-test">
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              borderRadius: '4px',
              boxShadow: 24,
              px: 4,
              pt: 4,
              pb: 2
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.palette.text.primary,
                }}
              >
                {t('pages.initiativeOverview.info.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary }} mt={2} mb={3}>
                <Trans i18nKey="pages.initiativeOverview.info.description" />
              </Typography>
            </Box>
            <Box display="flex" justifyContent={'flex-end'}>
              <Button variant="contained" onClick={() => setOpen(false)}>
                {t('commons.closeBtn')}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};
