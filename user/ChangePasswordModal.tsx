//ChangePasswordModal.tsx

import { type FC, useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import * as yup from "yup";

import { useForman } from "../hooks/useForman";
import { type IChangePasswordModel, useChangePasswordMutation } from "../redux/api/userRightsApi";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearAllAlerts } from "../redux/slices/alertSlice";
// import { setPasswordChanged } from "../redux/slices/userSlice";

type ChangePasswordModalProps = {
    show: boolean;
    onHide: () => void;
};

const ChangePasswordModal: FC<ChangePasswordModalProps> = (props) => {
    const { show, onHide } = props;

    const { user } = useAppSelector((state) => state.userState);
    const dispatch = useAppDispatch();
    const [errorMessage, setErrorMessage] = useState<string>("");

    // useEffect(() => {
    //     if (passwordChanged) {
    //         dispatch(clearAllAlerts());
    //         onHide();
    //     }
    // }, [passwordChanged, onHide, dispatch]);

    useEffect(() => {
        if (show) {
            setErrorMessage("");
            clearToDefaults();
            // dispatch(setPasswordChanged(false));
        }
    }, [show]);

    type ChangePasswordData = yup.InferType<typeof changePasswordSchema>;

    const changePasswordSchema = yup.object().shape({
        oldPassword: yup.string().required("ძველი პაროლი შევსებული უნდა იყოს"),
        newPassword: yup.string().required("პაროლი შევსებული უნდა იყოს"),
        newPasswordConfirm: yup
            .string()
            .oneOf(
                [yup.ref("newPassword"), undefined],
                "განმეორებითი პაროლი უნდა ემთხვეოდეს პაროლს"
            ),
    });

    const [
        frm,
        changeField,
        getError,
        haveErrors,
        clearToDefaults,
        // eslint-disable-next-line
        //setFormData,
    ] = useForman<typeof changePasswordSchema, ChangePasswordData>(changePasswordSchema);

    const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        //console.log("ChangePasswordModal handleChange e.target=", e.target);
        const { id, value } = e.target;
        changeField(id, value);
    }

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        if (haveErrors()) return;
        if (user === null) return;

        setErrorMessage("");
        try {
            await changePassword({
                ...frm,
                userName: user.userName,
                userid: user.userId,
            } as IChangePasswordModel).unwrap();
            // Additional success handling could go here
            onHide();
        } catch (error) {
            // Error handling if needed
            console.error("Password change failed:", error);
            setErrorMessage("პაროლის შეცვლა ვერ მოხერხდა");
            clearToDefaults();
        }
    }

    //console.log("ChangePasswordModal getError(confirmPassword)=", getError("confirmPassword"));

    function getOneTextControl(id: string, label: string, type: string, value: string | undefined) {
        const error = getError(id);
        return (
            <Form.Group className="mb-0" controlId={id}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                    type={type}
                    value={value}
                    onChange={handleChange}
                    className={!!error ? "is-invalid" : undefined}
                />
                <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            </Form.Group>
        );
    }

    if (!frm) return <div>ფორმის მონაცემები არ არის</div>;

    function handleClose() {
        clearToDefaults();
        setErrorMessage("");
        dispatch(clearAllAlerts());
        onHide();
    }

    return (
        <Modal show={show} size="sm" aria-labelledby="contained-modal-title-vcenter" centered onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title
                    id="contained-modal-title-vcenter"
                >
                    პაროლის შეცვლა
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && (
                    <Alert variant="danger" className="mb-3">
                        {errorMessage}
                    </Alert>
                )}
                <Form>
                    {getOneTextControl(
                        "oldPassword",
                        "ძველი პაროლი",
                        "password",
                        frm?.oldPassword ?? ""
                    )}
                    {getOneTextControl(
                        "newPassword",
                        "ახალი პაროლი",
                        "password",
                        frm?.newPassword ?? ""
                    )}
                    {getOneTextControl(
                        "newPasswordConfirm",
                        "ახალი პაროლი განმეორებით",
                        "password",
                        frm?.newPasswordConfirm ?? ""
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    {" "}
                    შეცვლა
                    {changingPassword && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    {" "}
                    არა
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChangePasswordModal;
