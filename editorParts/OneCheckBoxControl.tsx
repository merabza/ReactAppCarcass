//OneCheckBoxControl.tsx

import type { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";
import type { fnChangeField, fnGetError } from "../hooks/useForman";

type OneCheckBoxControlProps = {
    controlId: string;
    label: string;
    value: boolean;
    getError: fnGetError;
    onChangeValue: fnChangeField;
};

const OneCheckBoxControl: FC<OneCheckBoxControlProps> = (props) => {
    //onChange=handleChange
    const { controlId, label, value, getError, onChangeValue } = props;

    const error = getError(controlId);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { id, checked } = e.target;
        onChangeValue(id, checked);
    }

    return (
        <Form.Group className="mb-1" as={Row} controlId={controlId}>
            <Form.Label column sm="4" className="text-right">
                {label}
            </Form.Label>
            <Col sm="6">
                <Form.Check
                    type="checkbox"
                    checked={value}
                    onChange={handleChange}
                    className={!!error ? "is-invalid" : undefined}
                />
                <Form.Control.Feedback type="invalid">
                    {error}
                </Form.Control.Feedback>
            </Col>
        </Form.Group>
    );
};

export default OneCheckBoxControl;
