//ForgotPasswordPage.tsx

import React, { type FC, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as yup from "yup";

import RegTextControl from "../editorParts/RegTextControl";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useForgotPasswordMutation } from "../redux/api/authenticationApi";
import { useForman } from "../hooks/useForman";
import { clearAlert, EAlertKind } from "../redux/slices/alertSlice";
import { logout } from "../redux/slices/userSlice";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "./AlertMessages";

import "./LoginPage.css";

//დავიწყებული პაროლის აღდგენის დაწყება: მომხმარებლის სახელით, ან ელფოსტით კოდი და ბმული იგზავნება
const ForgotPasswordPage: FC = () => {
    const { appName } = useAppSelector((state) => state.appParametersState);
    const [ApiMutationHaveErrors] = useAlert(EAlertKind.ApiMutation);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [forgotPassword, { isLoading: sending, isSuccess: sent }] = useForgotPasswordMutation();

    useEffect(() => {
        dispatch(logout());
    }, [dispatch]);

    type ForgotPasswordData = yup.InferType<typeof forgotPasswordSchema>;

    const forgotPasswordSchema = yup.object().shape({
        userNameOrEmail: yup
            .string()
            .required("მომხმარებლის სახელი, ან ელფოსტის მისამართი შევსებული უნდა იყოს")
            .default(""),
    });

    const [frm, changeField, getError, haveErrors, , , , , touchAllFields] =
        useForman<typeof forgotPasswordSchema, ForgotPasswordData>(forgotPasswordSchema);

    //კოდი გაგზავნილია (ან ასეთი მომხმარებელი არ არსებობს, რასაც სერვერი განზრახ არ ამხელს):
    //გადავდივართ კოდის და ახალი პაროლის შეყვანის გვერდზე
    useEffect(() => {
        if (sent && frm) {
            navigate("/reset-password", { state: { userNameOrEmail: frm.userNameOrEmail } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sent]);

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));
        if (haveErrors()) {
            touchAllFields();
            return;
        }
        if (!frm) return;
        forgotPassword({ userNameOrEmail: frm.userNameOrEmail });
    }

    if (!frm) return <div></div>;

    return (
        <div id="LoginPage">
            <div className="login-wrapper fadeInDown">
                <div id="formContent">
                    <h2>პაროლის აღდგენა - {appName}</h2>
                    <Form name="form" onSubmit={handleSubmit}>
                        {!!ApiMutationHaveErrors && <AlertMessages alertKind={EAlertKind.ApiMutation} />}

                        <RegTextControl
                            controlId="userNameOrEmail"
                            label="მომხმარებლის სახელი, ან ელფოსტა"
                            value={frm.userNameOrEmail}
                            getError={getError}
                            onChangeValue={changeField}
                        />

                        <Button type="submit" className="fadeIn fourth">
                            <FontAwesomeIcon icon="paper-plane" /> კოდის გაგზავნა
                            {sending && (
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            )}
                        </Button>
                        <div>
                            <Link to="/reset-password">კოდი უკვე მაქვს</Link>
                        </div>
                        <Link to="/login">ავტორიზაცია</Link>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
