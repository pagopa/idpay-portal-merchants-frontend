import { Box, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { theme } from '@pagopa/mui-italia/theme';
import { ButtonNaked } from '@pagopa/mui-italia';
import { ReactNode } from 'react';

interface Props {
  titleBox: string;
  children?: ReactNode;
  onEdit?: () => void;
  editDisabled?: boolean;
}

export default function InitiativeDetailCard({
  titleBox,
  children,
  onEdit,
  editDisabled,
}: Props) {
  return (
    <Box
      py={3}
      px={4}
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxSizing: 'border-box',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="body1"
          fontWeight={theme.typography.fontWeightBold}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {titleBox}
        </Typography>
        {onEdit && (
          <ButtonNaked
            aria-label="Modifica dati punto vendita"
            data-testid="edit-point-of-sale-button"
            onClick={onEdit}
            disabled={editDisabled}
            size="medium"
            startIcon={<Edit />}
            color="primary"
          >
            Modifica
          </ButtonNaked>
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}
