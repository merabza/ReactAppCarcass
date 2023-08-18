//OneStrongLabel.tsx

import { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";

interface OneStrongLabelProps {
  controlId: string;
  label: string;
}

const OneStrongLabel: FC<OneStrongLabelProps> = (props) => {
  const { controlId, label } = props;

  return (
    <Form.Group className="mb-1" as={Row} controlId={controlId}>
      <Col sm="10">
        <strong>{label}</strong>
      </Col>
    </Form.Group>
  );
};

export default OneStrongLabel;
