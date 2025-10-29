//InlineDropdownListEditor.tsx

import React, { useState, useEffect, type FC } from "react";
import { Form } from "react-bootstrap";

export interface IDropdownOption {
    value: any;
    label: string;
    disabled?: boolean;
}

type InlineDropdownListEditorProps = {
    value: any;
    options: IDropdownOption[];
    onSave: (value: any) => void;
    onCancel: () => void;
    allowEmpty?: boolean;
    emptyLabel?: string;
};

const InlineDropdownListEditor: FC<InlineDropdownListEditorProps> = ({
    value,
    options,
    onSave,
    onCancel,
    allowEmpty = true,
    emptyLabel = "None",
}) => {
    const [editValue, setEditValue] = useState<string>(
        value !== null && value !== undefined ? value.toString() : ""
    );

    useEffect(() => {
        setEditValue(value !== null && value !== undefined ? value.toString() : "");
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    const handleSave = () => {
        if (editValue === "") {
            onSave(null);
        } else {
            // Find the option to get the correct typed value
            const selectedOption = options.find(opt => opt.value.toString() === editValue);
            onSave(selectedOption ? selectedOption.value : editValue);
        }
    };

    const handleBlur = () => {
        handleSave();
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEditValue(e.target.value);
    };

    return (
        <Form.Select
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
            size="sm"
        >
            {allowEmpty && (
                <option value="">{emptyLabel}</option>
            )}
            {options.map((option, index) => (
                <option 
                    key={`${option.value}_${index}`} 
                    value={option.value.toString()}
                    disabled={option.disabled}
                >
                    {option.label}
                </option>
            ))}
        </Form.Select>
    );
};

export default InlineDropdownListEditor;