import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, ButtonProps, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '@pagopa/mui-italia/theme';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

const ellipsisSx = {
  display: 'block',
  maxWidth: 'calc(100% - 1rem)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxHeight: '7rem',
};

export type DetailDrawerProps = {
  isOpen: boolean;
  setIsOpen: (props?: any) => void;
  title?: string;
  children?: React.ReactNode;
  buttons?: Array<(ButtonProps & { dataTestId?: string }) | never>;
  buttonsLayout?: 'column' | 'row';
};

export default function DetailDrawer({
  isOpen,
  setIsOpen,
  title,
  children,
  buttons,
  buttonsLayout = 'column',
}: DetailDrawerProps) {
  return (
    <Drawer anchor="right" open={isOpen} data-testid="detail-drawer">
      <Box
        sx={{
          width: 375,
          padding: '1rem',
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          pb="1.5rem"
          bgcolor="white"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          columnGap="0.5rem"
        >
          <Tooltip title={title?.trim() === '' || !title ? MISSING_DATA_PLACEHOLDER : title}>
            <Typography fontWeight={theme.typography.fontWeightMedium} variant="h6" sx={ellipsisSx}>
              {title?.trim() === '' || !title ? MISSING_DATA_PLACEHOLDER : title}
            </Typography>
          </Tooltip>

          <IconButton
            data-testid="close-button"
            onClick={setIsOpen}
            sx={{ color: 'text.secondary', flexShrink: 0 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box
          sx={{
            pt: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            rowGap: '1rem',
          }}
          data-testid="item-test"
        >
          {children}
        </Box>
      </Box>
      {buttons && !!buttons.length && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            display: 'flex',
            flexDirection: buttonsLayout,
            justifyContent: buttonsLayout === 'row' ? 'flex-end' : 'initial',
            padding: '1.5rem',
            rowGap: '1rem',
            columnGap: '1rem',
            backgroundColor: 'white',
          }}
          data-testid="buttons-box"
        >
          {buttons.map(({ title, dataTestId, ...rest }, index) => (
            <Button {...rest} key={`${title}-${index}`} data-testid={dataTestId}>
              {title}
            </Button>
          ))}
        </Box>
      )}
    </Drawer>
  );
}
