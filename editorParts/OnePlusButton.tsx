//OnePlusButton.tsx

import { Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";

type OnePlusButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const OnePlusButton: FC<OnePlusButtonProps> = (props) => {
  const { onClick } = props;

  return (
    <Row className="mb-1 mt-1">
      <Col sm="10" align="right">
        <Button
          onClick={(e) => {
            e.preventDefault();
            onClick(e);
          }}
        >
          <FontAwesomeIcon icon="plus" />
        </Button>
      </Col>
    </Row>
  );
};

export default OnePlusButton;
