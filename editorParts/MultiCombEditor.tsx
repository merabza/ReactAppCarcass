//MultiCombEditor.tsx

import { useState, type FC } from "react";
import type { fnGetError } from "../hooks/useForman";
import OneComboBoxControl from "./OneComboBoxControl";
import OneStrongLabel from "./OneStrongLabel";
import OnePlusButton from "./OnePlusButton";
import OneSwitchWithStrongLabel from "./OneSwitchWithStrongLabel";

export type fnTrashButtonClick = (index: number) => void;
export type fnPlusButtonClick = () => void;
export type fnChangeComboValue = (fieldPath: string, index: number, value: any) => void;

type MultiCombEditorProps = {
    controlGroupId: string;
    label: string;
    IntValueList: number[];
    dataMember?: Array<any>;
    firstItem?: { id: number; name: string } | undefined;
    valueMember: string;
    displayMember: string;
    withShowHideSwitch?: boolean;
    getError: fnGetError;
    onChangeComboValue: fnChangeComboValue;
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
        withShowHideSwitch,
        getError,
        onChangeComboValue,
        onTrashButtonClick,
        onPlusButtonClick,
    } = props;
    //console.log("MultiCombEditor props=", props);

    const [showHide, setShowHide] = useState(false);



    return (
        <div>
            {!!withShowHideSwitch && (
                <OneSwitchWithStrongLabel
                    controlId="custom-switch"
                    label1={label}
                    label2="ჩვენება/დამალვა"
                    value={showHide}
                    onChangeValue={setShowHide}
                />
            )}

            {!withShowHideSwitch && (
                <OneStrongLabel controlId="MultiCombEditorLabel" label={label} />
            )}

            {showHide && IntValueList &&
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
                            onChangeValue={(fieldPath, value) => {onChangeComboValue(fieldPath, index, value);}}
                            onTrashButtonClick={() => {
                                onTrashButtonClick(index);
                            }}
                        />
                    );
                })}

            {showHide && <OnePlusButton onClick={onPlusButtonClick} />}
        </div>
    );
};

export default MultiCombEditor;
