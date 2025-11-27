import { Alert, AlertColor, AlertTitle, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { CheckCircleOutline } from '@mui/icons-material';

export type AlertComponentProps = {
    title?: string;
    text?: string;
    isOpen?: boolean;
    severity?: AlertColor;
    containerStyle?: SxProps<Theme>;
    contentStyle?: SxProps<Theme>;
};

const severityMap = {
    error: {color: '#FF5C5C', icon: <ErrorOutline />},
    warning: {color: undefined, icon: undefined},
    info: {color: undefined, icon: undefined},
    success: {color: '#6CC66A', icon: <CheckCircleOutline />}
};

const AlertComponent = ({title, text, isOpen, severity, containerStyle, contentStyle}: AlertComponentProps) => 
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Box sx={{
            display: 'flex',
            height: '100%',
            alignItems:'flex-end',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: '128px',
            zIndex: '1300',
            ...containerStyle
            }}>
            <Alert
                data-testid="alert"
                severity={severity}
                icon={severity && severityMap[severity].icon}
                sx={{
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
                    ...contentStyle,
                }}>
                <AlertTitle>{title}</AlertTitle>
                {text}
            </Alert>
        </Box>
    </Slide>;
export default AlertComponent;