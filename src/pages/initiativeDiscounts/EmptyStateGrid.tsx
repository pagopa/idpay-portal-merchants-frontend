import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import EmptyList from '../components/EmptyList';

type Props = {
    message: string;
};

export default function EmptyStateGrid({ message }: Props) {
    const { t } = useTranslation();
    return (
        <Box sx={{ mt: 2 }}>
            <EmptyList message={t(message)} />
        </Box>
    );
}
