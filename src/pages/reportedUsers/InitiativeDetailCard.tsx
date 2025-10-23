import { Box, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { ReactNode } from 'react';

interface Props {
    titleBox: string;
    children?: ReactNode;
}

export default function InitiativeDetailCard({ titleBox, children }: Props) {
    return (
        <Box py={3} px={4} sx={{ backgroundColor: theme.palette.background.paper }}>
            <Box mb={2}>
                <Typography variant="body1" fontWeight={theme.typography.fontWeightBold}>
                    {titleBox}
                </Typography>
            </Box>
            <Box>
                {children}
            </Box>
        </Box>
    );
}
