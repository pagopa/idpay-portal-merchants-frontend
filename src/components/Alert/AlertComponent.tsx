import { Alert, AlertTitle, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';

interface AlertProps {
    isOpen?: boolean;
    title: string;
    message: string;
    sx?: SxProps<Theme>;
}

const AlertComponent = ({ isOpen, title, message, sx }: AlertProps) => (
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit >
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
                severity='error'
                icon={<ErrorOutline />}
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
                        color: '#FF5C5C',
                    },
                }}
            >
                <AlertTitle>{title}</AlertTitle>
                {message}
            </Alert>
        </Box>
    </Slide>
);

export default AlertComponent;