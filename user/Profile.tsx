import { Form, Row, Col, Alert } from "react-bootstrap";
import * as yup from "yup";

import OneSaveCancelButtons from "../editorParts/OneSaveCancelButtons";
import OneTextControl from "../editorParts/OneTextControl";
import OneErrorRow from "../editorParts/OneErrorRow";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useChangeProfileMutation } from "../redux/api/userRightsApi";
import { FC, useEffect } from "react";
import { clearAllAlerts } from "../redux/slices/alertSlice";
import { useForman } from "../hooks/useForman";

const Profile: FC = () => {
  const { user } = useAppSelector((state) => state.userState);
  const dispatch = useAppDispatch();

  type ProfileModel = yup.InferType<typeof profileModelSchema>;

  const profileModelSchema = yup.object().shape({
    firstName: yup
      .string()
      .required("სახელი შევსებული უნდა იყოს")
      .max(50, "სახელის სიგრძე არ შეიძლება იყოს 50 სიმბოლოზე მეტი"),
    lastName: yup
      .string()
      .required("გვარი შევსებული უნდა იყოს")
      .max(100, "გვარის სიგრძე არ შეიძლება იყოს 100 სიმბოლოზე მეტი"),
  });

  const [frm, changeField, getError, getAllErrors, , setFormData] = useForman<
    typeof profileModelSchema,
    ProfileModel
  >(profileModelSchema);

  const [changeProfile, { isLoading: changingProfile }] =
    useChangeProfileMutation();

  useEffect(() => {
    if (user)
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
      } as ProfileModel);
  }, [user]);

  //9. შეცდომების შესახებ ინფორმაცია გამოიყენება საბმიტის ფუნქციაში
  const allErrors = getAllErrors();
  const haveErrors = allErrors !== "";

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    dispatch(clearAllAlerts());
    if (haveErrors) return;
    //console.log("Profile handleSubmit user=", user);
    if (user?.userId)
      changeProfile({
        ...frm,
        email: user.email,
        userName: user.userName,
        userid: user.userId,
      });
  }

  if (!user?.userId)
    return (
      <Alert variant="danger">შეცდომა! პროფაილის რედაქტირება შეუძლებელია</Alert>
    );

  return (
    <Row id="MdItemEdit">
      <Col md="6">
        <Form onSubmit={handleSubmit}>
          <OneTextControl
            controlId="firstName"
            label="სახელი"
            value={frm.firstName}
            getError={getError}
            onChangeValue={changeField}
          />
          <OneTextControl
            controlId="lastName"
            label="გვარი"
            value={frm.lastName}
            getError={getError}
            onChangeValue={changeField}
          />
          <OneSaveCancelButtons
            curIdVal={user.userId}
            haveErrors={haveErrors}
            savingNow={changingProfile}
            allowEdit
          />
          <OneErrorRow allErrors={allErrors} />
        </Form>
      </Col>
    </Row>
  );
};

export default Profile;
