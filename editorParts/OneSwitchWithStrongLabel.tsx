//OneSwitchWithStrongLabel.tsx

import type { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";

type OneSwitchWithStrongLabelProps = {
    controlId: string;
    label1: string;
    label2: string;
    value: boolean | undefined | null;
    onChangeValue: (value: boolean) => void;
};

const OneSwitchWithStrongLabel: FC<OneSwitchWithStrongLabelProps> = (props) => {
    //onChange=handleChange
    const { controlId, label1, label2, value, onChangeValue } = props;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { checked } = e.target;
        onChangeValue(checked);
    }

    return (
        <Form.Group className="mb-1" as={Row} controlId={controlId}>
            <Form.Label column sm="4" className="text-right">
                <strong>{label1}</strong>
            </Form.Label>
            <Col sm="6">
                <Form.Check
                    type="switch"
                    label={label2}
                    checked={value ?? false}
                    onChange={handleChange}
                />
            </Col>
        </Form.Group>
    );
};

export default OneSwitchWithStrongLabel;
