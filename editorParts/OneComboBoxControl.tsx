//OneComboBoxControl.tsx

import { Form, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BsComboBox from "../masterdata/BsComboBox";
import type { FC } from "react";
import type { fnChangeField, fnGetError } from "../hooks/useForman";

type OneComboBoxControlProps = {
    controlId: string;
    label?: string;
    value?: number | undefined | null;
    dataMember?: Array<any>;
    valueMember: string;
    displayMember: string;
    secondDisplayMember?: string;
    firstItem?: { id: number; name: string } | undefined;
    firstItemIsSelectable?: boolean;
    sortByDisplayMember?: boolean;
    onTrashButtonClick?: () => void;
    getError?: fnGetError | undefined;
    onChangeValue: fnChangeField;
};

const OneComboBoxControl: FC<OneComboBoxControlProps> = (props) => {
    const {
        controlId,
        label,
        value,
        dataMember,
        valueMember,
        displayMember,
        secondDisplayMember,
        firstItem,
        firstItemIsSelectable,
        sortByDisplayMember,
        onTrashButtonClick,
        getError,
        onChangeValue,
    } = props;

    //console.log("OneComboBoxControl props=", props);
    //console.log("OneComboBoxControl sortByDisplayMember=", sortByDisplayMember);
    // console.log("OneComboBoxControl dataMember=", dataMember);

    const error = getError && getError(controlId);
    return (
        <Form.Group
            key={controlId}
            className="mb-1"
            as={Row}
            controlId={controlId}
        >
            {label && (
                <Form.Label column sm="4" className="text-right">
                    {label}
                </Form.Label>
            )}
            <Col sm="6">
                <BsComboBox
                    name={controlId}
                    dataMember={dataMember}
                    valueMember={valueMember}
                    displayMember={displayMember}
                    secondDisplayMember={secondDisplayMember}
                    value={value}
                    error={error}
                    onChangeValue={onChangeValue}
                    firstItem={firstItem}
                    firstItemIsSelectable={!!firstItemIsSelectable}
                    sortByDisplayMember={sortByDisplayMember}
                />
                <Form.Control.Feedback type="invalid">
                    {error}
                </Form.Control.Feedback>
            </Col>
            {!!onTrashButtonClick && (
                <Col sm="2">
                    <Button
                        variant="danger"
                        onClick={(e) => {
                            e.preventDefault();
                            onTrashButtonClick();
                        }}
                    >
                        <FontAwesomeIcon icon="trash" />
                    </Button>
                </Col>
            )}
        </Form.Group>
    );
};

export default OneComboBoxControl;
