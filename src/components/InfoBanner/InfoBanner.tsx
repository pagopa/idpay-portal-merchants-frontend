import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, Paper, Typography } from "@mui/material";
import { theme } from '@pagopa/mui-italia';

type Props = {
    severity: "warning" | "info" | "error" | "success"
    description?: string
    button?: {
        title?: string
        onClick?: () => void
    }
};

export const InfoBanner = ({ severity, description, button }: Props) => {
    const severityMap = {
        error: <ErrorIcon sx={{ color: theme.palette.error[850] }} />,
        warning: <WarningIcon sx={{ color: theme.palette.warning[850] }} />,
        info: <InfoIcon sx={{ color: theme.palette.info[850] }} />,
        success: <CheckCircleIcon sx={{ color: theme.palette.success[850] }} />,
    };
    return <Paper
        variant="outlined"
        sx={{
            backgroundColor: theme.palette[severity][100],
            borderColor: theme.palette[severity].main,
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem"
        }}>
        <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center" columnGap="0.5rem">
                {severityMap[severity]}
                <Typography variant="body1" color={theme.palette[severity][850]}>{description}</Typography>
            </Box>
            {button && <Button sx={{ color: theme.palette[severity][850], padding: 0 }} onClick={button?.onClick} variant="text">{button?.title}</Button>}
        </Box>
    </Paper>;
};