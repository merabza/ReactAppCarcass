//GridTableBody.tsx

import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IGridColumn, IGridScrollTo } from "./GridViewTypes";
import React from "react";
import InlineDropdownListEditor from "./InlineDropdownListEditor";
import InlineTextEditor from "./InlineTextEditor";
import InlineNumberEditor from "./InlineNumberEditor";
import InlineBooleanEditor from "./InlineBooleanEditor";
import InlineDateEditor from "./InlineDateEditor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type GridTableBodyProps = {
    rows: any[];
    columns: IGridColumn[];
    offset: number;
    rowsCountPerPage: number;
    curscrollTo?: IGridScrollTo;
    keyCol: IGridColumn;
    editorLink?: string;
    allowInlineEdit?: boolean;
    readOnly?: boolean;
    showCountColumn: boolean;
    allowUpdate?: boolean;
    allowDelete?: boolean;
    backLigth?: (node: HTMLElement | HTMLLIElement | null) => void;
    onInlineEditStart?: (row: any) => void;
    onInlineEditCancel?: (row: any) => void;
    onRowClick?: (row: any, index: number) => void;
    onInlineEdit?: (row: any, fieldName: string, newValue: any) => Promise<boolean>;
};

const GridTableBody: FC<GridTableBodyProps> = (props) => {
    const {
        rows,
        columns,
        offset,
        rowsCountPerPage,
        curscrollTo,
        keyCol,
        editorLink,
        allowInlineEdit,
        readOnly,
        showCountColumn,
        allowUpdate,
        allowDelete,
        backLigth,
        onInlineEditStart,
        onInlineEditCancel,
        onRowClick,
        onInlineEdit,
    } = props;

    const [editingRow, setEditingRow] = useState<any | null>(null); //რედაქტირების რეჟიმში მყოფი სტრიქონი
    const [editingCell, setEditingCell] = useState<string | null>(null); //რედაქტირების რეჟიმში მყოფი უჯრა

    // Handle global escape key to cancel editing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && editingRow) {
                cancelCellEdit();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [editingRow]);

    function cancelCellEdit() {
        if (editingRow) {
            onInlineEditCancel?.(editingRow);
        }
        setEditingRow(null);
        setEditingCell(null);
    }

    // Inline editing functions
    function startCellEdit(row: any, fieldName: string) {
        if (!allowInlineEdit || readOnly) return;

        const keyCol = columns.find((f) => f.isKey);
        if (!keyCol) return;

        setEditingRow(row);
        setEditingCell(fieldName);
        onInlineEditStart?.(row);
    }

    function isEditing(row: any, fieldName: string): boolean {
        if (!editingRow || !editingCell) return false;

        const keyCol = columns.find((f) => f.isKey);
        if (!keyCol) return false;

        return editingRow[keyCol.fieldName] === row[keyCol.fieldName] && editingCell === fieldName;
    }

    function renderInlineEditor(col: IGridColumn, value: any) {
        const handleSave = (newValue: any) => saveCellEdit(newValue);
        const handleCancel = () => cancelCellEdit();

        // If column has dropdown options, use dropdown editor regardless of type
        if (col.dropdownOptions && col.dropdownOptions.length > 0) {
            return (
                <InlineDropdownListEditor
                    value={value}
                    options={col.dropdownOptions}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    allowEmpty={col.nullable}
                    emptyLabel={col.nullable ? "None" : "Select..."}
                />
            );
        }

        switch (col.typeName) {
            case "String":
                return (
                    <InlineTextEditor
                        value={value}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        placeholder={col.caption}
                    />
                );
            case "Integer":
            case "Decimal":
            case "Double":
            case "Float":
                return (
                    <InlineNumberEditor value={value} onSave={handleSave} onCancel={handleCancel} />
                );
            case "Boolean":
                return (
                    <InlineBooleanEditor
                        value={value}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                );
            case "DateTime":
            case "Date":
                return (
                    <InlineDateEditor value={value} onSave={handleSave} onCancel={handleCancel} />
                );
            default:
                return (
                    <InlineTextEditor
                        value={value?.toString() ?? ""}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        placeholder={col.caption}
                    />
                );
        }
    }

    async function saveCellEdit(newValue: any) {
        if (!editingRow || !editingCell || !onInlineEdit) {
            cancelCellEdit();
            return;
        }

        try {
            const success = await onInlineEdit(editingRow, editingCell, newValue);
            if (success) {
                // Update local data if needed
                editingRow[editingCell] = newValue;
                setEditingRow(null);
                setEditingCell(null);
            }
        } catch (error) {
            console.error("Error saving inline edit:", error);
            // Keep editing mode on error
        }
    }

    return (
        <tbody>
            {rows.map((row, i) => {
                // console.log("GridView row=", row);
                // console.log("GridView keyCol=", keyCol);
                // console.log(
                //     "GridView row[keyCol.fieldName]=",
                //     row[keyCol.fieldName]
                // );
                const index = offset + i + 1;
                const bl = curscrollTo ? curscrollTo.value === row[curscrollTo.idFieldName] : false;
                // console.log("GridView curscrollTo=", curscrollTo);
                // console.log("GridView bl=", bl);
                return (
                    <tr
                        key={row[keyCol.fieldName]}
                        ref={bl ? backLigth : null}
                        onClick={() => {
                            // Don't trigger row click if inline editing is active
                            if (
                                !editingRow ||
                                editingRow[keyCol.fieldName] !== row[keyCol.fieldName]
                            ) {
                                onRowClick?.(row, index);
                            }
                        }}
                        style={{
                            cursor:
                                onRowClick &&
                                (!editingRow ||
                                    editingRow[keyCol.fieldName] !== row[keyCol.fieldName])
                                    ? "pointer"
                                    : "default",
                        }}
                    >
                        {!!showCountColumn && (
                            <td className={bl ? "backLigth" : undefined}>{index}</td>
                        )}
                        {columns
                            .filter((col) => col.visible)
                            .map((col) => {
                                const fieldName = col.fieldName ? col.fieldName : "";
                                const value = fieldName ? row[fieldName] : "";

                                const displayValue =
                                    col.dropdownOptions && col.dropdownOptions.length > 0
                                        ? col.dropdownOptions.find((opt) => opt.value === value)
                                              ?.label ?? value
                                        : value;

                                const changingFieldName = col.changingFieldName
                                    ? col.changingFieldName
                                    : "";
                                const changing = changingFieldName ? row[changingFieldName] : false;

                                // Check if this cell is being edited
                                const isEditingThisCell = isEditing(row, fieldName);
                                const canEditThisColumn =
                                    allowInlineEdit &&
                                    !readOnly &&
                                    col.editable !== false &&
                                    !col.isKey;

                                return (
                                    <td
                                        key={col.fieldName}
                                        className={`${bl ? "backLigth" : ""} ${
                                            canEditThisColumn && !isEditingThisCell
                                                ? "grid-cell-editable"
                                                : ""
                                        } ${isEditingThisCell ? "grid-cell-editing" : ""}`.trim()}
                                        onClick={(e) => {
                                            if (canEditThisColumn && !isEditingThisCell) {
                                                e.stopPropagation();
                                                startCellEdit(row, fieldName);
                                            }
                                        }}
                                    >
                                        {isEditingThisCell ? (
                                            renderInlineEditor(col, value)
                                        ) : col.control && React.isValidElement(col.control) ? (
                                            React.cloneElement(
                                                col.control as React.ReactElement<any>,
                                                {
                                                    value,
                                                    index,
                                                    offset: offset,
                                                    showRows: rowsCountPerPage,
                                                    changing,
                                                    record: row,
                                                },
                                                null
                                            )
                                        ) : (
                                            // ) : col.lookupColumnPart ? (
                                            //   <LookupColumn
                                            //     lookupTable={col.lookupColumnPart}
                                            //     value={value}
                                            //   ></LookupColumn>
                                            <span
                                                style={{
                                                    display: "block",
                                                    minHeight: "20px",
                                                    padding: canEditThisColumn ? "2px 4px" : "0",
                                                }}
                                            >
                                                {displayValue}
                                            </span>
                                        )}
                                    </td>
                                );
                            })}

                        {!readOnly && (allowUpdate || allowDelete) && !!editorLink && (
                            <td width="50px">
                                <div className="btn-toolbar pull-right">
                                    <Link
                                        to={`${editorLink}/${row[keyCol.fieldName]}`}
                                        className="btn btn-primary"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FontAwesomeIcon icon="edit" />
                                    </Link>
                                </div>
                            </td>
                        )}
                    </tr>
                );
            })}
        </tbody>
    );
};
export default GridTableBody;
