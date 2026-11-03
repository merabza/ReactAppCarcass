//ChangeRequiredPasswordPage.tsx

import React, { type FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as yup from "yup";

import RegTextControl from "../editorParts/RegTextControl";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useChangeRequiredPasswordMutation, useResendCodeMutation } from "../redux/api/authenticationApi";
import { useForman } from "../hooks/useForman";
import { clearAlert, EAlertKind } from "../redux/slices/alertSlice";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "./AlertMessages";
import { pendingStepPath } from "../redux/types/authenticationTypes";
import { codeSchema, passwordRulesHint, passwordSchema } from "./passwordRules";

import "./LoginPage.css";

//ავტორიზაციისას სერვერმა დაადგინა, რომ პაროლი მოქმედ წესებს არ აკმაყოფილებს: სისტემაში შესვლა ახალი პაროლის
//დაყენების გარეშე შეუძლებელია. თუ ელფოსტა ამავე სესიაში ახლახან არ დადასტურებულა, კოდიც არის საჭირო
const ChangeRequiredPasswordPage: FC = () => {
    const { appName } = useAppSelector((state) => state.appParametersState);
    const { user, pendingLogin } = useAppSelector((state) => state.userState);
    const [ApiMutationHaveErrors] = useAlert(EAlertKind.ApiMutation);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [changeRequiredPassword, { isLoading: changing }] = useChangeRequiredPasswordMutation();
    const [resendCode, { isLoading: resending, isSuccess: resent }] = useResendCodeMutation();
    const [resentMessageShown, setResentMessageShown] = useState(false);

    const codeRequired = !!pendingLogin && pendingLogin.codeRequired;

    useEffect(() => {
        if (user && user.token) {
            navigate("/");
            return;
        }
        if (pendingLogin && pendingLogin.nextStep !== "ChangePassword") {
            navigate(pendingStepPath(pendingLogin.nextStep));
        }
    }, [user, pendingLogin, navigate]);

    useEffect(() => {
        if (resent) setResentMessageShown(true);
    }, [resent]);

    type ChangePasswordData = yup.InferType<typeof changePasswordSchema>;

    const changePasswordSchema = yup.object().shape({
        code: codeRequired ? codeSchema.default("") : yup.string().default(""),
        newPassword: passwordSchema("ახალი პაროლი შევსებული უნდა იყოს").default(""),
        newPasswordConfirm: yup
            .string()
            .oneOf([yup.ref("newPassword"), undefined], "განმეორებითი პაროლი უნდა ემთხვეოდეს პაროლს")
            .default(""),
    });

    const [frm, changeField, getError, haveErrors, , , , , touchAllFields] =
        useForman<typeof changePasswordSchema, ChangePasswordData>(changePasswordSchema);

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));
        setResentMessageShown(false);
        if (haveErrors()) {
            touchAllFields();
            return;
        }
        if (!frm || !pendingLogin) return;
        changeRequiredPassword({
            pendingToken: pendingLogin.token,
            code: codeRequired ? frm.code : null,
            newPassword: frm.newPassword,
            newPasswordConfirm: frm.newPasswordConfirm,
        });
    }

    function handleResend(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));
        setResentMessageShown(false);
        if (!pendingLogin) return;
        resendCode({ pendingToken: pendingLogin.token });
    }

    function renderContent() {
        if (!pendingLogin || !frm) {
            return (
                <div>
                    <Alert variant="warning">
                        სესია არ მოიძებნა, ან ვადა გაუვიდა. გაიარეთ ავტორიზაცია თავიდან.
                    </Alert>
                    <Link to="/login">ავტორიზაცია</Link>
                </div>
            );
        }

        return (
            <Form name="form" onSubmit={handleSubmit}>
                <Alert variant="warning">
                    თქვენი პაროლი უსაფრთხოების მოქმედ წესებს აღარ აკმაყოფილებს. სისტემაში შესასვლელად აუცილებელია
                    ახალი პაროლის დაყენება. {passwordRulesHint}.
                </Alert>
                {codeRequired && (
                    <Alert variant="info">
                        მისამართზე <strong>{pendingLogin.email}</strong> გაიგზავნა 6-ნიშნა კოდი. შეიყვანეთ კოდი
                        და ახალი პაროლი.
                    </Alert>
                )}
                {!!ApiMutationHaveErrors && <AlertMessages alertKind={EAlertKind.ApiMutation} />}
                {resentMessageShown && <Alert variant="success">კოდი ხელახლა გაიგზავნა.</Alert>}

                {codeRequired && (
                    <RegTextControl
                        controlId="code"
                        label="კოდი"
                        value={frm.code}
                        getError={getError}
                        onChangeValue={changeField}
                    />
                )}
                <RegTextControl
                    controlId="newPassword"
                    label="ახალი პაროლი"
                    value={frm.newPassword}
                    getError={getError}
                    onChangeValue={changeField}
                />
                <RegTextControl
                    controlId="newPasswordConfirm"
                    label="ახალი პაროლი განმეორებით"
                    value={frm.newPasswordConfirm}
                    getError={getError}
                    onChangeValue={changeField}
                />

                <Button type="submit" className="fadeIn fourth">
                    <FontAwesomeIcon icon="key" /> პაროლის შეცვლა
                    {changing && (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    )}
                </Button>
                {codeRequired && (
                    <div>
                        <Button variant="link" onClick={handleResend} disabled={resending}>
                            კოდის ხელახლა გაგზავნა
                        </Button>
                    </div>
                )}
                <Link to="/login">ავტორიზაცია სხვა მომხმარებლით</Link>
            </Form>
        );
    }

    return (
        <div id="LoginPage">
            <div className="login-wrapper fadeInDown">
                <div id="formContent">
                    <h2>პაროლის შეცვლა - {appName}</h2>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ChangeRequiredPasswordPage;
