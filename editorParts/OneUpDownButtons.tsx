//OneUpDownButtons.tsx

import React, { FC } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type OneUpDownButtonsProps = {
  controlId: string;
  label: string;
  enableUp: boolean;
  enableDown: boolean;
  onUpClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDownClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const OneUpDownButtons: FC<OneUpDownButtonsProps> = (props) => {
  const { controlId, label, enableUp, enableDown, onUpClick, onDownClick } =
    props;

  return (
    <Form.Group className="mb-1" as={Row} controlId={controlId}>
      <Form.Label column sm="6">
        {label}
      </Form.Label>
      <Col sm="1">
        <Button onClick={onDownClick} disabled={!enableDown}>
          <FontAwesomeIcon icon="arrow-down" />
        </Button>
      </Col>
      <Col sm="1">
        <Button onClick={onUpClick} disabled={!enableUp}>
          <FontAwesomeIcon icon="arrow-up" />
        </Button>
      </Col>
    </Form.Group>
  );
};

export default OneUpDownButtons;
