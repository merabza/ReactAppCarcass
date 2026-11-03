//ConfirmEmailPage.tsx

import React, { type FC, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as yup from "yup";

import RegTextControl from "../editorParts/RegTextControl";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    useConfirmEmailLinkMutation,
    useConfirmEmailMutation,
    useResendCodeMutation,
} from "../redux/api/authenticationApi";
import { useForman } from "../hooks/useForman";
import { clearAlert, EAlertKind } from "../redux/slices/alertSlice";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "./AlertMessages";
import { pendingStepPath } from "../redux/types/authenticationTypes";
import { codeSchema } from "./passwordRules";

import "./LoginPage.css";

//ელფოსტის დადასტურება: ან კოდის შეყვანით (დროებითი ტოკენი localStorage-შია),
//ან ელფოსტიდან მოსული ბმულით (?userId=...&token=...)
const ConfirmEmailPage: FC = () => {
    const [searchParams] = useSearchParams();
    const linkUserId = Number(searchParams.get("userId"));
    const linkToken = searchParams.get("token");
    const isLinkFlow = linkUserId > 0 && !!linkToken;

    const { appName } = useAppSelector((state) => state.appParametersState);
    const { user, pendingLogin } = useAppSelector((state) => state.userState);
    const [ApiMutationHaveErrors] = useAlert(EAlertKind.ApiMutation);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [confirmEmail, { isLoading: confirming }] = useConfirmEmailMutation();
    const [confirmEmailLink, { isLoading: confirmingLink, data: linkData, isError: linkFailed }] =
        useConfirmEmailLinkMutation();
    const [resendCode, { isLoading: resending, isSuccess: resent }] = useResendCodeMutation();
    const [resentMessageShown, setResentMessageShown] = useState(false);

    //ბმულის ნაკადი: გვერდის გახსნისთანავე ვაგზავნით ბმულის მონაცემებს.
    //თუ ავტორიზაცია ამავე ბრაუზერში დაიწყო, დროებით ტოკენსაც ვურთავთ, რომ შესვლა ავტომატურად დასრულდეს
    useEffect(() => {
        if (!isLinkFlow) return;
        dispatch(clearAlert(EAlertKind.ApiMutation));
        confirmEmailLink({
            userId: linkUserId,
            token: linkToken,
            pendingToken: pendingLogin && pendingLogin.userId === linkUserId ? pendingLogin.token : null,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLinkFlow, linkUserId, linkToken]);

    //სრული ავტორიზაციის შემდეგ მთავარ გვერდზე, პაროლის ცვლილების მოთხოვნისას შესაბამის გვერდზე.
    //ბმულის ნაკადში ჯერ სერვერის პასუხს ველოდებით: ბრაუზერში შეიძლება სხვა მომხმარებელი იყოს შესული
    useEffect(() => {
        if (isLinkFlow && !linkData) return;
        if (user && user.token) {
            navigate("/");
            return;
        }
        if (pendingLogin && pendingLogin.nextStep !== "ConfirmEmail") {
            navigate(pendingStepPath(pendingLogin.nextStep));
        }
    }, [isLinkFlow, linkData, user, pendingLogin, navigate]);

    useEffect(() => {
        if (resent) setResentMessageShown(true);
    }, [resent]);

    type ConfirmEmailData = yup.InferType<typeof confirmEmailSchema>;

    const confirmEmailSchema = yup.object().shape({
        code: codeSchema.default(""),
    });

    const [frm, changeField, getError, haveErrors, , , , , touchAllFields] =
        useForman<typeof confirmEmailSchema, ConfirmEmailData>(confirmEmailSchema);

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));
        setResentMessageShown(false);
        if (haveErrors()) {
            touchAllFields();
            return;
        }
        if (!frm || !pendingLogin) return;
        confirmEmail({ pendingToken: pendingLogin.token, code: frm.code });
    }

    function handleResend(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));
        setResentMessageShown(false);
        if (!pendingLogin) return;
        resendCode({ pendingToken: pendingLogin.token });
    }

    function renderContent() {
        if (isLinkFlow) {
            if (confirmingLink || (!linkData && !linkFailed)) {
                return (
                    <Alert variant="info">
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> ელფოსტა
                        მოწმდება...
                    </Alert>
                );
            }
            if (linkFailed) {
                return (
                    <div>
                        <AlertMessages alertKind={EAlertKind.ApiMutation} />
                        <Link to="/login">ავტორიზაცია</Link>
                    </div>
                );
            }
            if (linkData && linkData.nextStep === "EmailConfirmedLoginRequired") {
                return (
                    <div>
                        <Alert variant="success">
                            ელფოსტის მისამართი დადასტურდა. ახლა შეგიძლიათ გაიაროთ ავტორიზაცია.
                        </Alert>
                        <Link to="/login">ავტორიზაცია</Link>
                    </div>
                );
            }
            //სხვა შემთხვევაში ავტორიზაცია დასრულდა და ზემოთ არსებული ეფექტი გადაგვიყვანს
            return <div />;
        }

        if (!pendingLogin || !frm) {
            return (
                <div>
                    <Alert variant="warning">
                        დადასტურების სესია არ მოიძებნა, ან ვადა გაუვიდა. გაიარეთ ავტორიზაცია თავიდან.
                    </Alert>
                    <Link to="/login">ავტორიზაცია</Link>
                </div>
            );
        }

        return (
            <Form name="form" onSubmit={handleSubmit}>
                <Alert variant="info">
                    მისამართზე <strong>{pendingLogin.email}</strong> გაიგზავნა 6-ნიშნა კოდი და ბმული. შეიყვანეთ
                    კოდი, ან გახსენით წერილში მოსული ბმული.
                </Alert>
                {!!ApiMutationHaveErrors && <AlertMessages alertKind={EAlertKind.ApiMutation} />}
                {resentMessageShown && <Alert variant="success">კოდი ხელახლა გაიგზავნა.</Alert>}

                <RegTextControl
                    controlId="code"
                    label="კოდი"
                    value={frm.code}
                    getError={getError}
                    onChangeValue={changeField}
                />

                <Button type="submit" className="fadeIn fourth">
                    <FontAwesomeIcon icon="check" /> დადასტურება
                    {confirming && (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    )}
                </Button>
                <div>
                    <Button variant="link" onClick={handleResend} disabled={resending}>
                        კოდის ხელახლა გაგზავნა
                    </Button>
                </div>
                <Link to="/login">ავტორიზაცია სხვა მომხმარებლით</Link>
            </Form>
        );
    }

    return (
        <div id="LoginPage">
            <div className="login-wrapper fadeInDown">
                <div id="formContent">
                    <h2>ელფოსტის დადასტურება - {appName}</h2>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmailPage;
