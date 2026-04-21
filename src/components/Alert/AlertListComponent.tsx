import { Alert, AlertColor, AlertTitle, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CachedIcon from '@mui/icons-material/Cached';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type AlertProps = {
  title?: string;
  text?: string;
  isOpen?: boolean;
  severity?: AlertColor;
  onClose?: () => void;
};

type Props = {
  alertList: Array<AlertProps>;
  containerStyle?: SxProps<Theme>;
  contentStyle?: SxProps<Theme>;
};

const severityMap = {
  error: <ErrorOutline color="error" />,
  warning: <WarningAmberIcon color="warning" />,
  info: <CachedIcon color="info" />,
  success: <CheckCircleOutline color="success" />,
};

const AlertsCmp = (alertList: Array<AlertProps>) =>
  alertList.map(({ title, text, isOpen, severity, onClose }, index) => (
    <Slide key={`${title}-${index}`} direction="left" in={isOpen} mountOnEnter unmountOnExit>
      <Alert
        onClose={onClose}
        data-testid="alert"
        severity={severity}
        icon={severity && severityMap[severity]}
        sx={{
          backgroundColor: 'white',
          width: 'auto',
          maxWidth: '400px',
          minWidth: '300px',
          boxShadow: 3,
          borderRadius: 1,
        }}
      >
        <AlertTitle>{title}</AlertTitle>
        {text}
      </Alert>
    </Slide>
  ));

const AlertListComponent = ({ alertList, containerStyle, contentStyle }: Props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      position: 'sticky',
      bottom: '128px',
      zIndex: '1150',
      height: '100%',
      ...containerStyle,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '1rem',
        position: 'absolute',
        bottom: '-108px',
        width: 'fit-content',
        ...contentStyle,
      }}
    >
      {AlertsCmp(alertList)}
    </Box>
  </Box>
);

export default AlertListComponent;
