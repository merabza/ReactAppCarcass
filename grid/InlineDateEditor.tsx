//InlineDateEditor.tsx

import React, { useState, useEffect, type FC } from "react";
import { Form } from "react-bootstrap";

type InlineDateEditorProps = {
    value: Date | string | null | undefined;
    onSave: (value: string | null) => void;
    onCancel: () => void;
};

const InlineDateEditor: FC<InlineDateEditorProps> = ({
    value,
    onSave,
    onCancel,
}) => {
    const [editValue, setEditValue] = useState<string>("");

    useEffect(() => {
        if (value) {
            let dateStr = "";
            if (value instanceof Date) {
                dateStr = value.toISOString().split('T')[0];
            } else if (typeof value === 'string') {
                // Try to parse the date string
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    dateStr = date.toISOString().split('T')[0];
                } else {
                    dateStr = value;
                }
            }
            setEditValue(dateStr);
        } else {
            setEditValue("");
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSave(editValue || null);
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    const handleBlur = () => {
        onSave(editValue || null);
    };

    return (
        <Form.Control
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
            size="sm"
        />
    );
};

export default InlineDateEditor;