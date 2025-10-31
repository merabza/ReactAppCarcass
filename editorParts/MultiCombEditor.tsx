//MultiCombEditor.tsx

import { useState, type FC } from "react";
import type { fnChangeField, fnGetError } from "../hooks/useForman";
import OneComboBoxControl from "./OneComboBoxControl";
import OneStrongLabel from "./OneStrongLabel";
import OnePlusButton from "./OnePlusButton";
import OneSwitchWithStrongLabel from "./OneSwitchWithStrongLabel";

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
    withShowHideSwitch?: boolean;
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
        withShowHideSwitch,
        getError,
        onChangeValue,
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
