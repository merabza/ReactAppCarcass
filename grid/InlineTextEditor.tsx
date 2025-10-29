//InlineTextEditor.tsx

import React, { useState, useEffect, type FC } from "react";
import { Form } from "react-bootstrap";

type InlineTextEditorProps = {
    value: string | null | undefined;
    onSave: (value: string) => void;
    onCancel: () => void;
    placeholder?: string;
};

const InlineTextEditor: FC<InlineTextEditorProps> = ({
    value,
    onSave,
    onCancel,
    placeholder = "",
}) => {
    const [editValue, setEditValue] = useState<string>(value ?? "");

    useEffect(() => {
        setEditValue(value ?? "");
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSave(editValue);
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    const handleBlur = () => {
        onSave(editValue);
    };

    return (
        <Form.Control
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoFocus
            size="sm"
        />
    );
};

export default InlineTextEditor;