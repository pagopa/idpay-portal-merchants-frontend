import { Alert, AlertTitle, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { CheckCircleOutline } from '@mui/icons-material';
import { useAlert } from '../../hooks/useAlert';

const severityMap = {
    error: {color: '#FF5C5C', icon: <ErrorOutline />},
    warning: {color: undefined, icon: undefined},
    info: {color: undefined, icon: undefined},
    success: {color: '#6CC66A', icon: <CheckCircleOutline />}
};

const AlertComponent = (sx: SxProps<Theme>) => {
    const {alert} = useAlert();
    const {title, text, isOpen, severity} = alert;

    return <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Box sx={{
            display: 'flex',
            height: '100%',
            alignItems:'flex-end',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: '128px',
            zIndex: '1300' }}>
            <Alert
                data-testid="alert"
                severity={severity}
                icon={severity && severityMap[severity].icon}
                sx={{
                    ...sx,
                    position: 'absolute',
                    bottom: '-108px',
                    backgroundColor: 'white',
                    width: 'auto',
                    maxWidth: '400px',
                    minWidth: '300px',
                    zIndex: 1300,
                    boxShadow: 3,
                    borderRadius: 1,
                    '& .MuiAlert-icon': {
                        color: severity && severityMap[severity].color,
                    },
                }}>
                <AlertTitle>{title}</AlertTitle>
                {text}
            </Alert>
        </Box>
    </Slide>;
};
export default AlertComponent;