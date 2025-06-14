//FilterTextBox.tsx

import { type FC, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import FilterButton from "./FilterButton";

type FilterTextBoxProps = {
    controlId?: string;
    isNullable?: boolean | undefined;
    onChangeValue: (newValue: string | null | undefined) => void;
};

const FilterTextBox: FC<FilterTextBoxProps> = (props) => {
    const { controlId, isNullable, onChangeValue } = props;
    // console.log("FilterTextBox props=", props);

    const [curValue, setCurValue] = useState<string | null | undefined>(
        undefined
    );

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        const newValue = e.target.value; // === "" ? undefined : e.target.value;
        setCurValue(newValue);
        onChangeValue(newValue);
    }

    function handleButtonClick() {
        if (curValue === undefined && isNullable) {
            setCurValue(null);
            onChangeValue(null);
        } else {
            setCurValue(undefined);
            onChangeValue(undefined);
        }
    }

    return (
        <Form.Group
            key={controlId}
            className="mb-1"
            as={Row}
            controlId={controlId}
        >
            <Col sm="8">
                <Form.Control
                    type="text"
                    value={curValue ?? ""}
                    onChange={handleChange}
                    autoComplete="off"
                />
            </Col>
            <Col sm="1">
                <FilterButton onButtonClick={handleButtonClick}></FilterButton>
            </Col>
        </Form.Group>
    );
};

export default FilterTextBox;
