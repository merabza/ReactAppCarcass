//RegTextControl.tsx

import React, { FC } from "react";
import { Form } from "react-bootstrap";
import { fnChangeField, fnGetError } from "../hooks/useForman";

type RegTextControlProps = {
  controlId: string;
  label: string;
  value?: string | null;
  getError: fnGetError;
  onChangeValue: fnChangeField;
};

const RegTextControl: FC<RegTextControlProps> = (props) => {
  const { controlId, label, value, getError, onChangeValue } = props;
  const error = getError(controlId);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    onChangeValue(id, value);
  }

  return (
    <Form.Group className="mb-0" controlId={controlId}>
      <Form.Control
        type={
          controlId.toLowerCase().includes("password") ? "password" : "text"
        }
        placeholder={label}
        value={value ? value : ""}
        onChange={handleChange}
        className={`${!!getError("username") ? "is-invalid" : ""} h-100`}
      />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
};

export default RegTextControl;
