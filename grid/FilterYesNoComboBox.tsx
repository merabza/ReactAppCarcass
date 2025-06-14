//FilterYesNoComboBox.tsx

import { type FC, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import FilterButton from "./FilterButton";

interface IYesNoOptionValue {
    type: number;
    id: boolean | null | undefined;
    display: string;
}

export const YesNoFilterOption = {
    All: { type: 0, display: "(ყველა)", id: undefined } as IYesNoOptionValue,
    Empty: { type: 1, display: "(ცარიელი)", id: null } as IYesNoOptionValue,
    YesValue: { type: 2, display: "დიახ", id: true } as IYesNoOptionValue,
    NoValue: { type: 2, display: "არა", id: false } as IYesNoOptionValue,
} as const;

type FilterYesNoComboBoxProps = {
    controlId?: string;
    isNullable?: boolean | undefined;
    onChangeValue: (newValue: boolean | null | undefined) => void;
};

const FilterYesNoComboBox: FC<FilterYesNoComboBoxProps> = (props) => {
    const { controlId, isNullable, onChangeValue } = props;
    // console.log("FilterYesNoComboBox props=", props);

    const defaultValue = JSON.stringify(YesNoFilterOption.All);
    const emptyValue = JSON.stringify(YesNoFilterOption.Empty);
    const yesValue = JSON.stringify(YesNoFilterOption.YesValue);
    const noValue = JSON.stringify(YesNoFilterOption.NoValue);

    const [curValue, setCurValue] = useState<string>(defaultValue);

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        e.preventDefault();
        const newValue = e.target.value; // === "" ? undefined : e.target.value;
        setCurValue(newValue);

        const newOptionValue = newValue
            ? (JSON.parse(newValue) as IYesNoOptionValue)
            : null;

        // let returnValue: any = undefined;
        // if (newOptionValue) {
        //   if (newOptionValue.type === 1) returnValue = null;
        //   if (newOptionValue.type > 1) returnValue = newOptionValue.id;
        // }
        onChangeValue(newOptionValue?.id);
    }

    function handleButtonClick() {
        if (curValue === defaultValue && isNullable) {
            setCurValue(emptyValue);
            onChangeValue(null);
        } else {
            setCurValue(defaultValue);
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
                <Form.Select value={curValue} onChange={handleChange}>
                    <option
                        key={YesNoFilterOption.All.display}
                        value={defaultValue}
                    >
                        {YesNoFilterOption.All.display}
                    </option>
                    {isNullable && (
                        <option
                            key={YesNoFilterOption.Empty.display}
                            value={emptyValue}
                        >
                            {YesNoFilterOption.Empty.display}
                        </option>
                    )}
                    <option
                        key={YesNoFilterOption.YesValue.display}
                        value={yesValue}
                    >
                        {YesNoFilterOption.YesValue.display}
                    </option>
                    <option
                        key={YesNoFilterOption.NoValue.display}
                        value={noValue}
                    >
                        {YesNoFilterOption.NoValue.display}
                    </option>
                </Form.Select>
            </Col>
            <Col sm="1">
                <FilterButton onButtonClick={handleButtonClick}></FilterButton>
            </Col>
        </Form.Group>
    );
};

export default FilterYesNoComboBox;
