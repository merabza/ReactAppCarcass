# InlineDropdownListEditor Component

## Overview

The `InlineDropdownListEditor` component provides inline dropdown/select functionality for GridView cells, allowing users to choose from predefined options during inline editing.

## Features

- **Predefined Options**: Select from a list of predefined options
- **Flexible Value Types**: Supports any data type for option values (string, number, boolean, etc.)
- **Nullable Support**: Optional empty/null value selection
- **Disabled Options**: Support for disabled options in the dropdown
- **Keyboard Navigation**: Standard dropdown keyboard navigation
- **Auto-save**: Saves automatically when selection changes or focus is lost

## Usage

### Basic Implementation

```typescript
import InlineDropdownListEditor, { type IDropdownOption } from "./InlineDropdownListEditor";

// Define dropdown options
const statusOptions: IDropdownOption[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended", disabled: true },
];

// Use in column definition
const column: IGridColumn = {
    // ... other properties
    typeName: "String",
    editable: true,
    dropdownOptions: statusOptions,
};
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `any` | Yes | - | Current selected value |
| `options` | `IDropdownOption[]` | Yes | - | Array of dropdown options |
| `onSave` | `(value: any) => void` | Yes | - | Callback when value is saved |
| `onCancel` | `() => void` | Yes | - | Callback when editing is cancelled |
| `allowEmpty` | `boolean` | No | `true` | Whether to show empty/null option |
| `emptyLabel` | `string` | No | `"None"` | Label for the empty option |

### IDropdownOption Interface

```typescript
export interface IDropdownOption {
    value: any;           // The actual value (can be any type)
    label: string;        // Display text for the option
    disabled?: boolean;   // Whether the option is disabled
}
```

## GridView Integration

### Column Configuration

To use dropdown editing in GridView, add the `dropdownOptions` property to your column definition:

```typescript
const columns: IGridColumn[] = [
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
        lookupColumnPart: null,
        editable: true,
        dropdownOptions: [
            { value: "draft", label: "Draft" },
            { value: "review", label: "Under Review" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
        ],
    },
];
```

### Priority Logic

The GridView component uses the following priority for determining the editor type:

1. **Dropdown Options**: If `dropdownOptions` is provided and not empty, uses `InlineDropdownListEditor`
2. **Data Type**: Falls back to type-specific editors based on `typeName`

This means dropdown options take precedence over the column's `typeName`.

## Examples

### Status Dropdown

```typescript
const statusOptions: IDropdownOption[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending Review" },
];
```

### Priority Levels (with numbers)

```typescript
const priorityOptions: IDropdownOption[] = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
];
```

### Category with Disabled Options

```typescript
const categoryOptions: IDropdownOption[] = [
    { value: "general", label: "General" },
    { value: "urgent", label: "Urgent" },
    { value: "archived", label: "Archived", disabled: true },
    { value: "deleted", label: "Deleted", disabled: true },
];
```

### Nullable Dropdown (Department)

```typescript
// Column configuration
{
    caption: "Department",
    fieldName: "department",
    nullable: true,  // Allows null values
    editable: true,
    dropdownOptions: [
        { value: "IT", label: "Information Technology" },
        { value: "HR", label: "Human Resources" },
        { value: "Finance", label: "Finance" },
    ],
}

// This will show "None" option at the top when allowEmpty=true
```

## Keyboard Controls

- **Arrow Up/Down**: Navigate through options
- **Enter**: Select current option and save
- **Escape**: Cancel editing without saving
- **Tab**: (Browser default) Move to next element and save

## Value Handling

The component automatically handles value conversion:

- **String values**: Stored and compared as strings
- **Number values**: Converted to/from strings for display but maintained as numbers
- **Boolean values**: Converted to/from strings but maintained as booleans
- **Null values**: Handled via empty option when `allowEmpty=true`

## Integration with Existing Data

When integrating with existing data sources:

1. Ensure option values match your data format
2. Consider data type consistency (string vs number vs boolean)
3. Handle null values appropriately with `allowEmpty` setting
4. Use meaningful labels for better user experience

## Best Practices

1. **Consistent Value Types**: Keep option values consistent with your data model
2. **Meaningful Labels**: Use clear, descriptive labels for options
3. **Logical Ordering**: Order options logically (alphabetically, by priority, etc.)
4. **Disabled States**: Use disabled options for deprecated but existing values
5. **Nullable Handling**: Set `allowEmpty` appropriately based on your data requirements