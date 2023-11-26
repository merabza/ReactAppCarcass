//OneNumberControl.tsx

import { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { fnChangeField, fnGetError } from "../hooks/useForman";

type OneNumberControlProps = {
  controlId: string;
  label: string;
  value: number;
  getError: fnGetError;
  onChangeValue: fnChangeField;
  minv?: number;
  stepv?: number;
};

const OneNumberControl: FC<OneNumberControlProps> = (props) => {
  const { controlId, label, value, getError, onChangeValue, minv, stepv } =
    props;

  console.log("OneNumberControl props=", props);

  const error = getError(controlId);

  const min = !minv && minv !== 0 ? 1 : minv;
  const step = !stepv && stepv !== 0 ? 1 : stepv;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    onChangeValue(id, value);
  }

  return (
    <Form.Group className="mb-1" as={Row} controlId={controlId}>
      <Form.Label column sm="4" className="text-right">
        {label}
      </Form.Label>
      <Col sm="6">
        <Form.Control
          type="number"
          placeholder={label}
          min={min}
          step={step}
          value={value}
          onChange={handleChange}
          autoComplete="off"
          className={!!error ? "is-invalid" : undefined}
        />
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </Col>
    </Form.Group>
  );
};

export default OneNumberControl;
