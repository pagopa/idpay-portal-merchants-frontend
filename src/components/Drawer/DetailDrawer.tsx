import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, ButtonProps, Grid, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type DetailDrawerProps = {
  isOpen: boolean;
  setIsOpen: (props?: any) => void;
  title?: string;
  children?: React.ReactNode;
  buttons?: Array<ButtonProps & { dataTestId?: string } | never>;
};

export default function DetailDrawer({ isOpen, setIsOpen, title, children, buttons }: DetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={isOpen}
      data-testid="detail-drawer"
    >
      <Box sx={{ width: 375, padding: '1.5rem', overflowY: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
        <Box display='flex' flexDirection='row' justifyContent="flex-end">
          <IconButton data-testid="close-button" onClick={setIsOpen} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid item xs={12} pb="1.5rem" bgcolor="white">
          <Typography variant="h6">{title}</Typography>
        </Grid>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            rowGap: "1rem",
            overflowY: "auto",
            height: "100%"
          }}
          data-testid="item-test"
        >
          {children}
        </Box>
        {buttons && !!buttons.length && <Box
          sx={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            paddingTop: "1.5rem",
            rowGap: "1rem",
            backgroundColor: "white"
          }}
          data-testid="buttons-box"
        >
          {buttons.map(({ title, dataTestId, ...rest }, index) =>
            <Button {...rest} key={`${title}-${index}`} data-testid={dataTestId}>{title}</Button>
          )}
        </Box>}
      </Box>
    </Drawer>
  );
}
