import { useEffect } from 'react';
import { Alert, AlertColor, AlertTitle, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CachedIcon from '@mui/icons-material/Cached';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type AlertComponentProps = {
  title?: string;
  text?: string;
  isOpen?: boolean;
  severity?: AlertColor;
  containerStyle?: SxProps<Theme>;
  contentStyle?: SxProps<Theme>;
  onClose?: () => void;
  timeout?: number;
};

const severityMap = {
  error: <ErrorOutline color="error" />,
  warning: <WarningAmberIcon color="warning" />,
  info: <CachedIcon color="info" />,
  success: <CheckCircleOutline color="success" />,
};

const AlertComponent = ({
  title,
  text,
  isOpen,
  severity,
  containerStyle,
  contentStyle,
  onClose,
  timeout = 6000,
}: AlertComponentProps) => {
  useEffect(() => {
    if (!isOpen || !onClose || timeout <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, timeout);

    return () => window.clearTimeout(timer);
  }, [isOpen, onClose, timeout]);

  return (
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: '1150',
          pointerEvents: 'none',
          ...containerStyle,
        }}
      >
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
            pointerEvents: 'auto',
            ...contentStyle,
          }}
        >
          {title ? <AlertTitle>{title}</AlertTitle> : null}
          {text || null}
        </Alert>
      </Box>
    </Slide>
  );
};
export default AlertComponent;
