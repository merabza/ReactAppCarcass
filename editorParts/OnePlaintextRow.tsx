//OnePlaintextRow.tsx

import { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";

interface OnePlaintextRowProps {
  controlId: string;
  label: string;
  text: string;
  color?: string | undefined;
}

const OnePlaintextRow: FC<OnePlaintextRowProps> = (props) => {
  const { controlId, label, text, color } = props;

  console.log("OnePlaintextRow props=", props);

  return (
    <Form.Group className="mb-1" as={Row} controlId={controlId}>
      <Form.Label column md="2">
        {label}
      </Form.Label>
      {!!color && (
        <Form.Label column md="8" style={{ color: `${color}` }}>
          {text}
        </Form.Label>
      )}
      {!color && (
        <Form.Label column md="8">
          {text}
        </Form.Label>
      )}

      {/* <Col md="8">
        {!!color && (
          <Form.Control
            plaintext
            readOnly
            defaultValue={text}
            style={{ color: `${color}` }}
          />
        )}
        {!color && <Form.Control plaintext readOnly defaultValue={text} />}
      </Col> */}
    </Form.Group>
  );
};

export default OnePlaintextRow;
