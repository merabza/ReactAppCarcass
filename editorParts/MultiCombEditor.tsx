//MultiCombEditor.tsx

import type { FC } from "react";
import type { fnChangeField, fnGetError } from "../hooks/useForman";
import OneComboBoxControl from "./OneComboBoxControl";
import OneStrongLabel from "./OneStrongLabel";
import OnePlusButton from "./OnePlusButton";

export type fnTrashButtonClick = (index: number) => void;
export type fnPlusButtonClick = () => void;

type MultiCombEditorProps = {
    controlGroupId: string;
    label: string;
    IntValueList: number[];
    dataMember?: Array<any>;
    firstItem?: { id: number; name: string } | undefined;
    valueMember: string;
    displayMember: string;
    getError: fnGetError;
    onChangeValue: fnChangeField;
    onTrashButtonClick: fnTrashButtonClick;
    onPlusButtonClick: fnPlusButtonClick;
};

const MultiCombEditor: FC<MultiCombEditorProps> = (props) => {
    const {
        controlGroupId,
        label,
        IntValueList,
        dataMember,
        firstItem,
        valueMember,
        displayMember,
        getError,
        onChangeValue,
        onTrashButtonClick,
        onPlusButtonClick,
    } = props;
    //console.log("MultiCombEditor props=", props);

    return (
        <div>
            <OneStrongLabel controlId="MultiCombEditorLabel" label={label} />

            {IntValueList &&
                IntValueList.map((item, index) => {
                    return (
                        <OneComboBoxControl
                            key={index}
                            controlId={`${controlGroupId}[${index}]`}
                            label={`${index + 1}`}
                            value={item}
                            dataMember={dataMember}
                            firstItem={firstItem}
                            valueMember={valueMember}
                            displayMember={displayMember}
                            sortByDisplayMember={true}
                            getError={getError}
                            onChangeValue={onChangeValue}
                            onTrashButtonClick={() => {
                                onTrashButtonClick(index);
                            }}
                        />
                    );
                })}

            <OnePlusButton onClick={onPlusButtonClick} />
        </div>
    );
};

export default MultiCombEditor;
