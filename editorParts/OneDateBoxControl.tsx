//OneDateBoxControl.tsx

import { Form, Row, Col } from "react-bootstrap";
import moment from "moment";
import { FC } from "react";
import { fnChangeField, fnGetError } from "../hooks/useForman";

type OneDateBoxControlProps = {
  controlId: string;
  label: string;
  value: Date;
  showDate: boolean;
  showTime: boolean;
  getError: fnGetError;
  onChangeValue: fnChangeField;
};

const OneDateBoxControl: FC<OneDateBoxControlProps> = (props) => {
  const {
    controlId,
    label,
    value,
    showDate,
    showTime,
    getError,
    onChangeValue,
  } = props;

  //console.log("OneDateBoxControl props=", props);

  const error = getError(controlId);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    onChangeValue(id, value);
  }

  const strFormat = `${showDate ? "YYYY-MM-DD" : ""}${
    showTime ? "THH:mm:ss" : ""
  }`;

  const showValue = moment(value).format(strFormat);
  const inputType = `${showDate ? "date" : ""}${showTime ? "time" : ""}`;

  return (
    <Form.Group className="mb-1" as={Row} controlId={controlId}>
      <Form.Label column sm="4" className="text-right">
        {label}
      </Form.Label>
      <Col sm="6">
        <Form.Control
          type={inputType}
          value={showValue}
          onChange={handleChange}
          className={!!error ? "is-invalid" : undefined}
        />
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </Col>
    </Form.Group>
  );
};

export default OneDateBoxControl;
