//MasterDataFilterComboBox.tsx

import { type FC, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
// import type { ILookup } from "../redux/types/masterdataTypes";
import FilterButton from "./FilterButton";
import type { IDropdownOption } from "./InlineDropdownListEditor";

interface IMasterDataFilterType {
    type: number;
    display: string | null;
}

interface IFilterOptionValue {
    type: number;
    id: number | null;
    display: string;
}

export const MasterDataFilterOptionType = {
    All: { type: 0, display: "(ყველა)" } as IMasterDataFilterType,
    Empty: { type: 1, display: "(ცარიელი)" } as IMasterDataFilterType,
    SomeValue: { type: 2, display: null } as IMasterDataFilterType,
} as const;

type MasterDataFilterComboBoxProps = {
    controlId?: string;
    dropdownOptions: IDropdownOption[];
    isNullable?: boolean | undefined;
    onChangeValue: (newValue: number | null | undefined) => void;
};

const MasterDataFilterComboBox: FC<MasterDataFilterComboBoxProps> = (props) => {
    const { controlId, dropdownOptions, isNullable, onChangeValue } = props;
    // console.log("MasterDataFilterComboBox props=", props);

    const defaultValue = JSON.stringify({
        type: MasterDataFilterOptionType.All.type,
        id: null,
        display: MasterDataFilterOptionType.All.display,
    } as IFilterOptionValue);

    const emptyValue = JSON.stringify({
        type: MasterDataFilterOptionType.Empty.type,
        id: null,
        display: MasterDataFilterOptionType.Empty.display,
    } as IFilterOptionValue);

    const [curValue, setCurValue] = useState<string>(defaultValue);

    const dropdownOptionsSorted = dropdownOptions
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label));

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        e.preventDefault();
        const newValue = e.target.value; // === "" ? undefined : e.target.value;
        setCurValue(newValue);

        const newOptionValue = newValue
            ? (JSON.parse(newValue) as IFilterOptionValue)
            : null;

        let returnValue: any = undefined;
        if (newOptionValue) {
            if (newOptionValue.type === 1) returnValue = null;
            if (newOptionValue.type > 1) returnValue = newOptionValue.id;
        }
        onChangeValue(returnValue);
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
                        key={MasterDataFilterOptionType.All.display}
                        value={defaultValue}
                    >
                        {MasterDataFilterOptionType.All.display}
                    </option>
                    {isNullable && (
                        <option
                            key={MasterDataFilterOptionType.Empty.display}
                            value={JSON.stringify({
                                type: MasterDataFilterOptionType.Empty.type,
                                id: null,
                                display:
                                    MasterDataFilterOptionType.Empty.display,
                            } as IFilterOptionValue)}
                        >
                            {MasterDataFilterOptionType.Empty.display}
                        </option>
                    )}
                    {dropdownOptionsSorted &&
                        dropdownOptionsSorted.map((mdItm) => (
                            <option
                                key={mdItm.value}
                                value={JSON.stringify({
                                    type: MasterDataFilterOptionType.SomeValue
                                        .type,
                                    id: mdItm.value,
                                    display: mdItm.label,
                                } as IFilterOptionValue)}
                            >
                                {mdItm.label}
                            </option>
                        ))}
                </Form.Select>
            </Col>
            <Col sm="1">
                <FilterButton onButtonClick={handleButtonClick}></FilterButton>
            </Col>
        </Form.Group>
    );
};

export default MasterDataFilterComboBox;
