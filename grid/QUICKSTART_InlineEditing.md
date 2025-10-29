# Quick Start Guide for GridView Inline Editing

## 1. Enable Inline Editing

Add these props to your existing GridView component:

```tsx
<GridView
    // ... your existing props
    allowInlineEdit={true}
    onInlineEdit={handleInlineEdit}
/>
```

## 2. Implement the Save Handler

```tsx
const handleInlineEdit = async (row: any, fieldName: string, newValue: any): Promise<boolean> => {
    try {
        // Example: Call your API
        await fetch(`/api/update/${row.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [fieldName]: newValue })
        });
        
        // Update your local state/data
        // This depends on your state management (Redux, useState, etc.)
        
        return true; // Success
    } catch (error) {
        console.error('Failed to update:', error);
        return false; // Failure - keeps edit mode active
    }
};
```

## 3. Configure Columns

Mark columns as editable:

```tsx
const columns: IGridColumn[] = [
    {
        // ... existing column properties
        editable: true, // Add this to enable editing
    },
    {
        // ... key column should not be editable
        isKey: true,
        editable: false, // Optional: explicitly disable
    }
];
```

## 4. Usage Instructions for End Users

- **Click** any editable cell to start editing
- **Enter** to save changes
- **Escape** to cancel changes
- **Click outside** the cell to save changes

## That's it

Your GridView now supports inline editing. See the full documentation in `README_InlineEditing.md` for advanced features and customization options.