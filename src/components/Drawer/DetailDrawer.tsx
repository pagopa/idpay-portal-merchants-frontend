import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, ButtonProps, Divider, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type DetailDrawerProps = {
  isOpen: boolean;
  setIsOpen: (props?: any) => void;
  title?: string;
  children?: React.ReactNode;
  buttons?: Array<(ButtonProps & { dataTestId?: string }) | never>;
};

export default function DetailDrawer({
  isOpen,
  setIsOpen,
  title,
  children,
  buttons,
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
          <Typography variant="h6">{title}</Typography>
          <IconButton data-testid="close-button" onClick={setIsOpen} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box
          sx={{
            pt:'1.5rem',
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
            flexDirection: 'column',
            padding: '1.5rem',
            rowGap: '1rem',
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
