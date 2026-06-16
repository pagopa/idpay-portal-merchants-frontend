import { Box, Button } from "@mui/material";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { ReactNode } from "react";
import ModalComponent from "../../components/modal/ModalComponent";
import useScopedTranslation from "../../hooks/useScopedTranslation";

export type EditModalProps = {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onSave?: () => void
    title?: string
    desciption?: string
    children?: ReactNode
}

export const EditModal = ({ isOpen, setIsOpen, onSave, title, desciption, children }: EditModalProps) => {
    const { t } = useScopedTranslation();
    return <ModalComponent open={isOpen} onClose={() => setIsOpen(false)}>
        <Box display="flex" flexDirection="column" rowGap="2rem">
            <TitleBox
                title={title && t(title)}
                subTitle={ desciption && t(desciption)}
                variantTitle="h4"
                variantSubTitle="body1"
            />
            {children}
            <Box display="flex" gap="1rem" justifyContent="flex-end">
                <Button
                    variant="outlined"
                    sx={{ gridArea: 'cancelBtn', justifySelf: 'end' }}
                    onClick={() => setIsOpen(false)}
                    data-testid="cancel-button-test"
                >
                    {t('actions.cancel')}
                </Button>
                <Button
                    variant="contained"
                    sx={{ gridArea: 'exitBtn', justifySelf: 'end' }}
                    data-testid="exit-button-test"
                    onClick={onSave}
                >
                    {t('actions.save')}
                </Button>
            </Box>
        </Box>
    </ModalComponent>;
};