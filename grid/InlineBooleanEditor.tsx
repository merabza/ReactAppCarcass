//InlineBooleanEditor.tsx

import React, { useState, useEffect, type FC } from "react";
import { Form } from "react-bootstrap";

type InlineBooleanEditorProps = {
    value: boolean | null | undefined;
    onSave: (value: boolean | null) => void;
    onCancel: () => void;
};

const InlineBooleanEditor: FC<InlineBooleanEditorProps> = ({
    value,
    onSave,
    onCancel,
}) => {
    const [editValue, setEditValue] = useState<boolean>(
        value ?? false
    );

    useEffect(() => {
        setEditValue(value ?? false);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        } else if (e.key === " ") {
            e.preventDefault();
            const newValue = !editValue;
            setEditValue(newValue);
        }
    };

    const handleSave = () => {
        onSave(editValue);
    };

    const handleBlur = () => {
        handleSave();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.checked);
    };

    return (
        <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'left', justifyContent: 'left' }}>
            <Form.Check
                type="checkbox"
                checked={editValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus
            />
        </div>
    );
};

export default InlineBooleanEditor;