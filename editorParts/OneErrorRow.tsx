//OneErrorRow.tsx

import { FC } from 'react';
import { Alert, Row, Col } from 'react-bootstrap';

type OneErrorRowProps = {
    allErrors: string;
};

const OneErrorRow: FC<OneErrorRowProps> = ({ allErrors }) => {

  const haveErrors = (allErrors !== "");

  if ( haveErrors ) {
    return (
      <Row>
        <Col sm="12">
          <Alert variant="danger">{allErrors}</Alert>
        </Col>
      </Row>
    );
  }
  return (<div />);
}

export default OneErrorRow;
