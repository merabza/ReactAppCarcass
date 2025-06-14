//MessageBox.tsx

import { type FC, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";

type MessageBoxProps = {
    title: string;
    text: string;
    primaryButtonText: string;
    secondaryButtonText?: string;
    show: boolean;
    onClosed: () => void;
    onConfirmed: () => void;
};

const MessageBox: FC<MessageBoxProps> = (props) => {
    const {
        title,
        text,
        primaryButtonText,
        secondaryButtonText,
        show,
        onClosed,
        onConfirmed,
    } = props;

    const [showMsg, setShowMsg] = useState(false);

    useEffect(() => {
        setShowMsg(show);
    }, [show]);

    function handleClose() {
        setShowMsg(false);
        onClosed();
    }

    function handleConfirmed() {
        setShowMsg(false);
        onConfirmed();
    }

    return (
        <Modal show={showMsg} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{text}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleConfirmed}>
                    {primaryButtonText}
                </Button>
                {secondaryButtonText && (
                    <Button variant="secondary" onClick={handleClose}>
                        {secondaryButtonText}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default MessageBox;
