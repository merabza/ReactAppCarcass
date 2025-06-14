//LoginPage.tsx

import React, { useState, useEffect, type FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Spinner, Form } from "react-bootstrap";
import * as yup from "yup";

import RegTextControl from "../editorParts/RegTextControl";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { logout } from "../redux/slices/userSlice";
import { useLoginMutation } from "../redux/api/authenticationApi";

import "./LoginPage.css";
import { useForman } from "../hooks/useForman";

const LoginPage: FC = () => {
    // console.log("LoginPage Start");

    const [submitted, setSubmitted] = useState(false);
    const { appName } = useAppSelector((state) => state.appParametersState);
    const { userValidationChecked, user } = useAppSelector(
        (state) => state.userState
    );

    // console.log("LoginPage appName=", appName);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    // 👇 API Login Mutation
    const [loginUser, { isLoading: loggingIn }] = useLoginMutation();
    const { state } = useLocation();

    useEffect(() => {
        if (!submitted) dispatch(logout());
        else {
            // console.log("LoginPage handleSubmit after loginUser user=", user);
            if (userValidationChecked && user && user.token) {
                const pathname = state?.from?.pathname || "/";
                // console.log(
                //   "LoginPage handleSubmit after loginUser pathname=",
                //   pathname
                // );
                navigate(pathname);
            }
        }
    }, [userValidationChecked, user, submitted, state]);

    useEffect(() => {
        if (!loggingIn && !user && submitted) setSubmitted(false);
    }, [loggingIn, user, submitted]);

    type LoginPageData = yup.InferType<typeof loginPageSchema>;

    const loginPageSchema = yup.object().shape({
        username: yup
            .string()
            .required("მომხმარებლის სახელი შევსებული უნდა იყოს"),
        password: yup.string().required("პაროლი შევსებული უნდა იყოს"),
    });

    const [
        frm,
        changeField,
        getError,
        haveErrors,
        //  // eslint-disable-next-line
        //  clearToDefaults,
        //  // eslint-disable-next-line
        //  setFormData,
    ] = useForman<typeof loginPageSchema, LoginPageData>(loginPageSchema);

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        if (haveErrors()) return;
        setSubmitted(true);

        const { username, password } = frm;
        frm.password = "";
        if (username && password) {
            loginUser({ username, password });
        }
    }

    return (
        <div id="LoginPage">
            <div className="login-wrapper fadeInDown">
                <div id="formContent">
                    <h2>{appName}</h2>
                    <Form name="form" onSubmit={handleSubmit}>
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

                        <Button type="submit" className="fadeIn fourth">
                            <FontAwesomeIcon icon="sign-in-alt" /> ავტორიზაცია
                            {loggingIn && (
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            )}
                        </Button>
                        <Link to="/registration">რეგისტრაცია</Link>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
