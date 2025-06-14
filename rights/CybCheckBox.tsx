//CybCheckBox.tsx

import React, { useRef, useEffect, useState, type FC } from "react";

type CybCheckBoxProps = {
    checked: boolean;
    labelSelected: boolean;
    labelText: string;
    onLabelClick: () => void;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        usedSpace: boolean
    ) => void;
};

const CybCheckBox: FC<CybCheckBoxProps> = (props) => {
    const { checked, labelSelected, labelText, onLabelClick, onChange } = props;

    const [usedSpace, setUsedSpace] = useState(false);
    const cbRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (labelSelected && cbRef.current) cbRef.current.focus();
    }, [labelSelected]);

    const onClick = (): void => {
        // console.log("CybCheckBox label onClick");
        onLabelClick();
        if (cbRef.current) cbRef.current.focus();
    };

    const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        // console.log(
        //   "CybCheckBox input onChange e.target.checked=",
        //   e.target.checked
        // );
        //e.preventDefault();
        onChange(e, usedSpace);
        setUsedSpace(false);
    };

    const onKeyPress = (): void => {
        //e.preventDefault();
        // console.log("CybCheckBox input onKeyPress e.charCode=", e.charCode);
        setUsedSpace(true);
    };

    return (
        <div className="form-check">
            <input
                ref={cbRef}
                type="checkbox"
                checked={checked}
                onChange={onCheckboxChange}
                onKeyPress={onKeyPress}
            />
            <label
                title=""
                className={
                    "form-check-label" + (labelSelected ? " backLigth" : "")
                }
                onClick={onClick}
            >
                {labelText}
            </label>
        </div>
    );
};

export default CybCheckBox;
