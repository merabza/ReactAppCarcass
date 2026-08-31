# GridView Inline Editing Feature

## Overview

The GridView component now supports inline row editing functionality, allowing users to edit cell values directly within the grid without needing to navigate to a separate edit form.

## Features

- **Click-to-edit**: Click on any editable cell to start editing
- **Multiple data types**: Supports String, Integer, Decimal, Boolean, and Date types
- **Keyboard navigation**: Use Enter to save, Escape to cancel
- **Visual feedback**: Hover effects and editing state indicators
- **Async operations**: Supports async save operations with error handling
- **Configurable**: Enable/disable editing per column or for the entire grid

## Usage

### Basic Setup

```typescript
import GridView from "./GridView";
import type { IGridColumn, IRowsData } from "./GridViewTypes";

// Define columns with editable property
const columns: IGridColumn[] = [
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
        lookupColumnPart: null,
        editable: true, // Enable editing for this column
    },
    // ... other columns
];

// Handle inline edit operations
const handleInlineEdit = async (row: any, fieldName: string, newValue: any): Promise<boolean> => {
    try {
        // Your API call or data update logic here
        const response = await updateRecord(row.id, { [fieldName]: newValue });
        
        // Update local state if needed
        updateLocalData(row.id, fieldName, newValue);
        
        return true; // Return true on success
    } catch (error) {
        console.error('Update failed:', error);
        return false; // Return false on failure
    }
};

// Optional: Handle edit lifecycle events
const handleEditStart = (row: any) => {
    console.log('Started editing:', row);
};

const handleEditCancel = (row: any) => {
    console.log('Cancelled editing:', row);
};

// Render GridView with inline editing enabled
<GridView
    // ... other props
    allowInlineEdit={true}
    onInlineEdit={handleInlineEdit}
    onInlineEditStart={handleEditStart}
    onInlineEditCancel={handleEditCancel}
/>
```

### New Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `allowInlineEdit` | `boolean` | No | Enable/disable inline editing globally |
| `onInlineEdit` | `(row: any, fieldName: string, newValue: any) => Promise<boolean>` | No | Callback for saving edit changes |
| `onInlineEditStart` | `(row: any) => void` | No | Callback when editing starts |
| `onInlineEditCancel` | `(row: any) => void` | No | Callback when editing is cancelled |

### Column Configuration

Add the `editable` property to `IGridColumn` interface:

```typescript
export interface IGridColumn {
    // ... existing properties
    editable?: boolean; // Set to false to disable editing for specific columns
}
```

### Supported Data Types

The inline editor automatically selects the appropriate input control based on the column's `typeName`:

- **String**: Text input
- **Integer/Decimal/Double/Float**: Number input
- **Boolean**: Yes/No dropdown
- **DateTime/Date**: Date picker
- **Default**: Text input for unknown types

### Keyboard Controls

- **Enter**: Save changes and exit edit mode
- **Escape**: Cancel changes and exit edit mode
- **Tab**: (Future enhancement) Move to next editable cell

### CSS Classes

The component uses the following CSS classes for styling:

- `.grid-cell-editable`: Applied to cells that can be edited
- `.grid-cell-editing`: Applied to the currently editing cell
- `.grid-cell-editable:hover`: Hover state for editable cells

### Example Implementation

See `GridViewInlineEditExample.tsx` for a complete working example.

## Technical Details

### State Management

The component maintains two key state variables:
- `editingRow`: The currently editing row object
- `editingCell`: The currently editing cell field name

### Edit Flow

1. User clicks on an editable cell
2. `startCellEdit()` is called, setting the editing state
3. Inline editor component is rendered for the cell
4. User makes changes and presses Enter or clicks away
5. `saveCellEdit()` is called with the new value
6. `onInlineEdit` callback is invoked
7. On success, editing state is cleared; on failure, edit mode continues

### Error Handling

- If `onInlineEdit` returns `false`, the edit mode continues
- If `onInlineEdit` throws an error, it's logged and edit mode continues
- User can always cancel with Escape key

### Accessibility

- Focus management: Editors auto-focus when activated
- Keyboard navigation: Enter/Escape keys work as expected
- Visual indicators: Clear hover and editing states

## Limitations

- Only one cell can be edited at a time
- Key columns (isKey: true) cannot be edited
- Requires async save callback to be provided
- Limited to basic data types (custom controls need additional work)

## Future Enhancements

- Tab navigation between editable cells
- Batch editing mode
- Validation support
- Custom editor components
- Undo/redo functionality