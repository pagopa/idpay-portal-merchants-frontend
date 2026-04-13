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
};

const severityMap = {
    error: <ErrorOutline color='error' /> ,
    warning: <WarningAmberIcon color='warning' />,
    info: <CachedIcon color='info'/>,
    success: <CheckCircleOutline color='success' />
};

const AlertComponent = ({title, text, isOpen, severity, containerStyle, contentStyle, onClose}: AlertComponentProps) =>

    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Box sx={{
            display: 'flex',
            height: '100%',
            alignItems:'flex-end',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: '128px',
            zIndex: '1150',
            ...containerStyle
            }}>
            <Alert
                onClose={onClose}
                data-testid="alert"
                severity={severity}
                icon={severity && severityMap[severity]}
                sx={{
                    position: 'absolute',
                    bottom: '-108px',
                    backgroundColor: 'white',
                    width: 'auto',
                    maxWidth: '400px',
                    minWidth: '300px',
                    boxShadow: 3,
                    borderRadius: 1,
                    ...contentStyle,
                }}>
                <AlertTitle>{title}</AlertTitle>
                {text}
            </Alert>
        </Box>
    </Slide>;
export default AlertComponent;
