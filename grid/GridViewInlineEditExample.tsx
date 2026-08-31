//GridViewInlineEditExample.tsx

import { useState, type FC } from "react";
import GridView from "./GridView";
import type { IGridColumn, IRowsData, IDropdownOption } from "./GridViewTypes";

// Example usage of GridView with inline editing
const GridViewInlineEditExample: FC = () => {
    const [sampleData, setSampleData] = useState<IRowsData>({
        allRowsCount: 3,
        offset: 0,
        rows: [
            { id: 1, name: "John Doe", age: 30, isActive: true, joinDate: "2023-01-15", department: "IT", status: "active" },
            { id: 2, name: "Jane Smith", age: 25, isActive: false, joinDate: "2023-06-10", department: "HR", status: "inactive" },
            { id: 3, name: "Bob Johnson", age: 35, isActive: true, joinDate: "2022-12-01", department: "Finance", status: "pending" },
        ],
    });

    // Define dropdown options
    const departmentOptions: IDropdownOption[] = [
        { value: "IT", label: "Information Technology" },
        { value: "HR", label: "Human Resources" },
        { value: "Finance", label: "Finance" },
        { value: "Marketing", label: "Marketing" },
        { value: "Sales", label: "Sales" },
    ];

    const statusOptions: IDropdownOption[] = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "suspended", label: "Suspended", disabled: true },
    ];

    const columns: IGridColumn[] = [
        {
            caption: "ID",
            visible: true,
            sortable: true,
            nullable: false,
            fieldName: "id",
            isKey: true,
            control: null,
            changingFieldName: "",
            typeName: "Integer",
            // lookupColumnPart: null,
            editable: false, // Key columns shouldn't be editable
        },
        {
            caption: "Name",
            visible: true,
            sortable: true,
            nullable: false,
            fieldName: "name",
            isKey: false,
            control: null,
            changingFieldName: "",
            typeName: "String",
            // lookupColumnPart: null,
            editable: true,
        },
        {
            caption: "Age",
            visible: true,
            sortable: true,
            nullable: false,
            fieldName: "age",
            isKey: false,
            control: null,
            changingFieldName: "",
            typeName: "Integer",
            // lookupColumnPart: null,
            editable: true,
        },
        {
            caption: "Active",
            visible: true,
            sortable: true,
            nullable: false,
            fieldName: "isActive",
            isKey: false,
            control: null,
            changingFieldName: "",
            typeName: "Boolean",
            // lookupColumnPart: null,
            editable: true,
        },
        {
            caption: "Join Date",
            visible: true,
            sortable: true,
            nullable: false,
            fieldName: "joinDate",
            isKey: false,
            control: null,
            changingFieldName: "",
            typeName: "Date",
            // lookupColumnPart: null,
            editable: true,
        },
        {
            caption: "Department",
            visible: true,
            sortable: true,
            nullable: false,
            fieldName: "department",
            isKey: false,
            control: null,
            changingFieldName: "",
            typeName: "String",
            // lookupColumnPart: null,
            editable: true,
            dropdownOptions: departmentOptions,
        },
        {
            caption: "Status",
            visible: true,
            sortable: true,
            nullable: true,
            fieldName: "status",
            isKey: false,
            control: null,
            changingFieldName: "",
            typeName: "String",
            // lookupColumnPart: null,
            editable: true,
            dropdownOptions: statusOptions,
        },
    ];

    const handleInlineEdit = async (row: any, fieldName: string, newValue: any): Promise<boolean> => {
        try {
            // Simulate API call
            console.log(`Saving: ${fieldName} = ${newValue} for row ${row.id}`);
            
            // Update local data
            setSampleData(prevData => ({
                ...prevData,
                rows: prevData.rows.map(r => 
                    r.id === row.id 
                        ? { ...r, [fieldName]: newValue }
                        : r
                )
            }));

            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return true; // Success
        } catch (error) {
            console.error('Error updating data:', error);
            return false; // Failure
        }
    };

    const handleInlineEditStart = (row: any) => {
        console.log('Started editing row:', row.id);
    };

    const handleInlineEditCancel = (row: any) => {
        console.log('Cancelled editing row:', row.id);
    };

    return (
        <div>
            <h2>GridView with Inline Editing Example</h2>
            <p>Click on any cell (except ID) to edit inline. Press Enter to save, Escape to cancel.</p>
            <GridView
                gridHeader="Sample Data with Inline Edit"
                columns={columns}
                rowsData={sampleData}
                showCountColumn={true}
                loading={false}
                readOnly={false}
                allowInlineEdit={true}
                onInlineEdit={handleInlineEdit}
                onInlineEditStart={handleInlineEditStart}
                onInlineEditCancel={handleInlineEditCancel}
            />
        </div>
    );
};

export default GridViewInlineEditExample;