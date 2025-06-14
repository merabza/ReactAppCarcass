//OneTextControl.tsx

import type { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";
import type { fnChangeField, fnGetError } from "../hooks/useForman";

type OneTextControlProps = {
    controlId: string;
    label: string;
    value: string | null;
    getError: fnGetError;
    onChangeValue: fnChangeField;
};

const OneTextControl: FC<OneTextControlProps> = (props) => {
    //onChange=handleChange
    const { controlId, label, value, getError, onChangeValue } = props;
    const error = getError(controlId);

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
                    type="text"
                    placeholder={label}
                    value={value ?? ""}
                    onChange={handleChange}
                    autoComplete="off"
                    isInvalid={!!error}
                />
                <Form.Control.Feedback type="invalid">
                    {error}
                </Form.Control.Feedback>
            </Col>
        </Form.Group>
    );
};

export default OneTextControl;
