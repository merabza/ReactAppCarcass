//OneEditDeleteButtons.tsx

import { Form, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";

type OneEditDeleteButtonsProps = {
  controlId: string;
  label: string;
  onEditClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDeleteClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const OneEditDeleteButtons: FC<OneEditDeleteButtonsProps> = (props) => {
  const { controlId, label, onEditClick, onDeleteClick } = props;

  return (
    <Form.Group className="mb-1" as={Row} controlId={controlId}>
      <Form.Label column sm="10">
        {label}
      </Form.Label>
      <Col sm="2">
        <Button className="mr-1" onClick={onEditClick}>
          <FontAwesomeIcon icon="edit" />
        </Button>
        <Button variant="danger" onClick={onDeleteClick}>
          <FontAwesomeIcon icon="trash" />
        </Button>
      </Col>
    </Form.Group>
  );
};

export default OneEditDeleteButtons;
