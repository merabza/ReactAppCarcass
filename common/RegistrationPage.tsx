//RegistrationPage.tsx

import React, { type FC, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Spinner, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as yup from "yup"; // for everything // or //import { string, object } from 'yup'; // for only what you need

import RegTextControl from "../editorParts/RegTextControl";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/slices/userSlice";
import { type IRegistrationRequest, useRegistrationMutation } from "../redux/api/authenticationApi";
import { useForman } from "../hooks/useForman";
import { clearAlert, EAlertKind } from "../redux/slices/alertSlice";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "./AlertMessages";

const RegistrationPage: FC = () => {
    // console.log("RegistrationPage Start");

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.userState.user);
    const navigate = useNavigate();
    const [ApiMutationHaveErrors] = useAlert(EAlertKind.ApiMutation);

    // 👇 API Login Mutation
    const [userRegistration, { isLoading: registering }] = useRegistrationMutation();

    useEffect(() => {
        dispatch(logout());
    }, [dispatch]);

    type RegistrationPageData = yup.InferType<typeof registrationPageSchema>;

    const registrationPageSchema = yup.object().shape({
        email: yup
            .string()
            .email("ელფოსტის მისამართი არასწორია")
            .required("ელფოსტის მისამართი შევსებული უნდა იყოს")
            .default(""),
        firstName: yup
            .string()
            .required("სახელი შევსებული უნდა იყოს")
            .max(50, "სახელის სიგრძე არ შეიძლება იყოს 50 სიმბოლოზე მეტი")
            .default(""),
        lastName: yup
            .string()
            .required("გვარი შევსებული უნდა იყოს")
            .max(100, "გვარის სიგრძე არ შეიძლება იყოს 100 სიმბოლოზე მეტი")
            .default(""),
        username: yup
            .string()
            .required("მომხმარებლის სახელი შევსებული უნდა იყოს")
            .max(256, "მომხმარებლის სახელის სიგრძე არ შეიძლება იყოს 256 სიმბოლოზე მეტი")
            .default(""),
        password: yup.string().required("პაროლი შევსებული უნდა იყოს").default(""),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("password"), undefined], "განმეორებითი პაროლი უნდა ემთხვეოდეს პაროლს")
            .default(""),
    });

    const [
        frm,
        changeField,
        getError,
        haveErrors,
        clearToDefaults,
        setFormData,
        setSchema,
        curFormSet,
        touchAllFields,
    ] = useForman<typeof registrationPageSchema, RegistrationPageData>(registrationPageSchema);

    const appName = useAppSelector((state) => state.appParametersState.appName);

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        dispatch(clearAlert(EAlertKind.ApiMutation));

        if (haveErrors()) {
            touchAllFields();
            return;
        }
        try {
            await userRegistration({ ...frm } as IRegistrationRequest);
            if (user && user.token) {
                navigate("/");
            }
        } catch (error) {
            console.log("error=", error);
        }
    }

    if (!frm) return <div></div>;

    return (
        <div id="LoginPage">
            <div className="login-wrapper fadeInDown">
                <div id="formContent">
                    <h2>რეგისტრაცია - {appName}</h2>
                    <Form name="form" onSubmit={handleSubmit}>
                        {!!ApiMutationHaveErrors && (
                            <AlertMessages alertKind={EAlertKind.ApiMutation} />
                        )}

                        <RegTextControl
                            controlId="email"
                            label="ელფოსტის მისამართი"
                            value={frm.email}
                            getError={getError}
                            onChangeValue={changeField}
                        />
                        <RegTextControl
                            controlId="firstName"
                            label="სახელი"
                            value={frm.firstName}
                            getError={getError}
                            onChangeValue={changeField}
                        />
                        <RegTextControl
                            controlId="lastName"
                            label="გვარი"
                            value={frm.lastName}
                            getError={getError}
                            onChangeValue={changeField}
                        />
                        <RegTextControl
                            controlId="username"
                            label="მომხმარებელი"
                            value={frm.username}
                            getError={getError}
                            onChangeValue={changeField}
                        />
                        <RegTextControl
                            controlId="password"
                            label="პაროლი"
                            value={frm.password}
                            getError={getError}
                            onChangeValue={changeField}
                        />
                        <RegTextControl
                            controlId="confirmPassword"
                            label="პაროლი განმეორებით"
                            value={frm.confirmPassword}
                            getError={getError}
                            onChangeValue={changeField}
                        />
                        <Button type="submit" className="fadeIn fourth">
                            <FontAwesomeIcon icon="user-plus" /> რეგისტრაცია
                            {registering && (
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            )}
                        </Button>
                        <Link to="/login">ავტორიზაცია</Link>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
