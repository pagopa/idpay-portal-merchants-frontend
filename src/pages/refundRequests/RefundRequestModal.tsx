import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type Props = {
    isOpen: boolean;
    setIsOpen: () => void;
    title: string;
    description: string;
    descriptionTwo?: string;
    warning?: string;
    cancelBtn?: string;
    confirmBtn?: {
        text: string;
        onConfirm: () => void;
    };
};

export const RefundRequestsModal = ({ isOpen, setIsOpen, title, description, descriptionTwo, warning, cancelBtn, confirmBtn }: Props) => (
    <Dialog data-testid="refund-requests-modal-test" open={isOpen} onClose={setIsOpen} PaperProps={{ style: { minWidth: 600, minHeight: 354 } }}>
        <DialogTitle
            sx={{
                fontFamily: '"Titillium Web", sans-serif',
                fontWeight: 700,
                fontStyle: 'bold',
                fontSize: '24px',
                lineHeight: '32px',
                letterSpacing: '0px',
                mt: 2,
            }}
        >
            {title}
        </DialogTitle>
        <DialogContent sx={{display: "flex", flexDirection: "column", rowGap: "1rem"}}>
            <Typography>{description}</Typography>
            {descriptionTwo && <Typography>{descriptionTwo}</Typography>}
            {warning && <Alert
                icon={<WarningAmberIcon />}
                severity="warning"
                sx={{
                    backgroundColor: "rgba(255, 203, 70, 0.1)",
                    '& .MuiAlert-icon': {
                        color: '#000000ff',
                    },
                }}
            > {warning}
            </Alert>}
        </DialogContent>
        <DialogActions sx={{ mb: 3, mr: 3 }}>
            {cancelBtn && <Button variant="outlined" onClick={setIsOpen}>
                {cancelBtn}
            </Button>}
            {confirmBtn && <Button variant="contained" color="primary" onClick={confirmBtn.onConfirm}>
                {confirmBtn.text}
            </Button>}
        </DialogActions>
    </Dialog>
);