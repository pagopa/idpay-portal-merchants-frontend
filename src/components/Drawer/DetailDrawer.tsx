import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean;
  toggleDrawer: (isOpen: boolean) => void;
  children?: React.ReactNode;
};

export default function DetailDrawer({ open, toggleDrawer, children }: Props) {

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => toggleDrawer(false)}
      data-testid="detail-drawer"
    >
      <Box display= 'flex' flexDirection= 'row' justifyContent="flex-end" p={'1.5rem'} pb={0}>
        <IconButton data-testid="open-detail-button" onClick={() => toggleDrawer(false)} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      {children}
    </Drawer>
  );
}
