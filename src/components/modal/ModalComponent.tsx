import { Modal, Box } from "@mui/material";
import React, {FC, useEffect} from "react";

interface ModalComponentProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const ModalComponent: FC<ModalComponentProps> = ({ open, onClose, children, style }) => {
    useEffect(() => {

    },[]);

    const handleClose = () => {
        onClose();
    };

    return (
      <Modal open={open} onClose={handleClose}>
        <Box sx={style ? style : {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}>{children}</Box>
      </Modal>
    );
  };
export default ModalComponent;
