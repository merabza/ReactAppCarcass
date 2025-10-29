//InlineNumberEditor.tsx

import React, { useState, useEffect, type FC } from "react";
import { Form } from "react-bootstrap";

type InlineNumberEditorProps = {
    value: number | null | undefined;
    onSave: (value: number | null) => void;
    onCancel: () => void;
    min?: number;
    step?: number;
};

const InlineNumberEditor: FC<InlineNumberEditorProps> = ({
    value,
    onSave,
    onCancel,
    min,
    step = 1,
}) => {
    const [editValue, setEditValue] = useState<string>(value?.toString() ?? "");

    useEffect(() => {
        setEditValue(value?.toString() ?? "");
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const numValue = editValue === "" ? null : parseFloat(editValue);
            onSave(numValue);
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    const handleBlur = () => {
        const numValue = editValue === "" ? null : parseFloat(editValue);
        onSave(numValue);
    };

    return (
        <Form.Control
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            min={min}
            step={step}
            autoFocus
            size="sm"
        />
    );
};

export default InlineNumberEditor;