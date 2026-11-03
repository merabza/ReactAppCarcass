//ResetPasswordPage.tsx

import React, { type FC, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as yup from "yup";

import RegTextControl from "../editorParts/RegTextControl";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useResetPasswordMutation } from "../redux/api/authenticationApi";
import { useForman } from "../hooks/useForman";
import { clearAlert, EAlertKind } from "../redux/slices/alertSlice";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "./AlertMessages";
import { codeSchema, passwordRulesHint, passwordSchema } from "./passwordRules";

import "./LoginPage.css";

//ახალი პაროლის დაყენება დავიწყებულის ნაცვლად:
//  ელფოსტიდან მოსული ბმულით (?userId=...&token=...), ან ელფოსტაზე მისული კოდით
const ResetPasswordPage: FC = () => {
    const [searchParams] = useSearchParams();
    const linkUserId = Number(searchParams.get("userId"));
    const linkToken = searchParams.get("token");
    const isLinkFlow = linkUserId > 0 && !!linkToken;
    const { state } = useLocation();

    const { appName } = useAppSelector((state) => state.appParametersState);
    const { user } = useAppSelector((state) => state.userState);
    const [ApiMutationHaveErrors] = useAlert(EAlertKind.ApiMutation);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

    //წარმატებული აღდგენის შემდეგ მომხმარებელი უკვე ავტორიზებულია
    useEffect(() => {
        if (user && user.token) navigate("/");
    }, [user, navigate]);

    type ResetPasswordData = yup.InferType<typeof resetPasswordSchema>;

    const resetPasswordSchema = yup.object().shape({
        userNameOrEmail: isLinkFlow
            ? yup.string().default("")
            : yup
                  .string()
                  .required("მომხმარებლის სახელი, ან ელფოსტის მისამართი შევსებული უნდა იყოს")
                  .default((state?.userNameOrEmail as string | undefined) ?? ""),
        code: isLinkFlow ? yup.string().default("") : codeSchema.default(""),
        newPassword: passwordSchema("ახალი პაროლი შევსებული უნდა იყოს").default(""),
        newPasswordConfirm: yup
            .string()
            .oneOf([yup.ref("newPassword"), undefined], "განმეორებითი პაროლი უნდა ემთხვეოდეს პაროლს")
            .default(""),
    });

    const [frm, changeField, getError, haveErrors, , , , , touchAllFields] =
        useForman<typeof resetPasswordSchema, ResetPasswordData>(resetPasswordSchema);

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));
        if (haveErrors()) {
            touchAllFields();
            return;
        }
        if (!frm) return;
        resetPassword({
            userId: isLinkFlow ? linkUserId : null,
            token: isLinkFlow ? linkToken : null,
            userNameOrEmail: isLinkFlow ? null : frm.userNameOrEmail,
            code: isLinkFlow ? null : frm.code,
            newPassword: frm.newPassword,
            newPasswordConfirm: frm.newPasswordConfirm,
        });
    }

    if (!frm) return <div></div>;

    return (
        <div id="LoginPage">
            <div className="login-wrapper fadeInDown">
                <div id="formContent">
                    <h2>ახალი პაროლი - {appName}</h2>
                    <Form name="form" onSubmit={handleSubmit}>
                        <Alert variant="info">
                            {isLinkFlow
                                ? "შეიყვანეთ ახალი პაროლი."
                                : "შეიყვანეთ ელფოსტაზე მისული 6-ნიშნა კოდი და ახალი პაროლი."}{" "}
                            {passwordRulesHint}.
                        </Alert>
                        {!!ApiMutationHaveErrors && <AlertMessages alertKind={EAlertKind.ApiMutation} />}

                        {!isLinkFlow && (
                            <RegTextControl
                                controlId="userNameOrEmail"
                                label="მომხმარებლის სახელი, ან ელფოსტა"
                                value={frm.userNameOrEmail}
                                getError={getError}
                                onChangeValue={changeField}
                            />
                        )}
                        {!isLinkFlow && (
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
                            <FontAwesomeIcon icon="key" /> პაროლის დაყენება
                            {resetting && (
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            )}
                        </Button>
                        <div>
                            <Link to="/forgot-password">კოდის თავიდან მოთხოვნა</Link>
                        </div>
                        <Link to="/login">ავტორიზაცია</Link>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
