# Website Builder - Icon Selection Fix

## Problem
In the website builder (تحرير الموقع), when selecting an Icon widget and trying to change the icon from the Icon Library in the Properties panel, the icon did not update.

## Root Cause
The issue was caused by a **race condition in React state updates** when updating multiple widget properties:

1. When selecting an icon from Icon Library, `IconPicker` component calls `onChange(iconName, '')`
2. The `PropertyEditor` component received this callback and called `handleUpdate` twice:
   - First call: `handleUpdate('name', iconName)` 
   - Second call: `handleUpdate('uploadedIcon', '')`
3. Each `handleUpdate` triggered a separate call to `onUpdate` which updated the `canvasWidgets` state
4. **The problem:** When React batched these state updates, the second update was using stale closure data from before the first update completed
5. This caused the icon `name` property to either not persist or be overwritten

## Solution
Implemented a **batch update mechanism** to update multiple widget properties atomically:

### Changes Made:

#### 1. Added Batch Update Function (`website-edit/page.tsx`)
```typescript
// New function to update multiple properties at once
const handleUpdateProperties = (widgetId: string, updates: Record<string, any>) => {
  const updateInWidgets = (widgets: Widget[]): Widget[] => {
    return widgets.map(w => {
      if (w.id === widgetId) {
        // Apply all updates at once
        return { ...w, props: { ...w.props, ...updates } };
      }
      if (w.children) {
        return { ...w, children: updateInWidgets(w.children) };
      }
      return w;
    });
  };
  
  const updatedWidgets = updateInWidgets(canvasWidgets);
  setCanvasWidgets(updatedWidgets);
  
  // Update selected widget if it's being edited
  if (selectedWidget && selectedWidget.id === widgetId) {
    const updated = findWidgetById(updatedWidgets, widgetId);
    if (updated) setSelectedWidget(updated);
  }
};
```

#### 2. Updated PropertyEditor Interface (`PropertyEditor.tsx`)
```typescript
interface PropertyEditorProps {
  widget: Widget;
  onUpdate: (widgetId: string, property: string, value: any) => void;
  onUpdateMultiple?: (widgetId: string, updates: Record<string, any>) => void; // NEW
  onDelete: (widgetId: string) => void;
  onDuplicate: (widget: Widget) => void;
}
```

#### 3. Added Batch Update Handler in PropertyEditor
```typescript
const handleUpdateMultiple = (updates: Record<string, any>) => {
  if (onUpdateMultiple) {
    onUpdateMultiple(widget.id, updates);
  } else {
    // Fallback to individual updates if batch update not available
    Object.entries(updates).forEach(([property, value]) => {
      onUpdate(widget.id, property, value);
    });
  }
};
```

#### 4. Updated Icon Property Rendering
**Before:**
```typescript
onChange={(iconName, uploadedUrl) => {
  handleUpdate('name', iconName);           // First state update
  handleUpdate('uploadedIcon', uploadedUrl || ''); // Second state update - race condition!
}}
```

**After:**
```typescript
onChange={(iconName, uploadedUrl) => {
  // Batch update both icon properties together
  handleUpdateMultiple({
    name: iconName,
    uploadedIcon: uploadedUrl || ''
  });
}}
```

#### 5. Passed Batch Update Function to PropertyEditor
```typescript
<PropertyEditor
  widget={selectedWidget}
  onUpdate={handleUpdateProperty}
  onUpdateMultiple={handleUpdateProperties}  // NEW - batch update support
  onDelete={handleDeleteWidget}
  onDuplicate={handleDuplicateWidget}
/>
```

## How It Works Now

1. User selects an icon from the Icon Library
2. `IconPicker` calls `onChange(iconName, '')`
3. `PropertyEditor` calls `handleUpdateMultiple({ name: iconName, uploadedIcon: '' })`
4. This triggers a **single state update** that applies both properties atomically
5. The widget's icon name and uploadedIcon are updated together in one operation
6. The UI reflects the change immediately without race conditions

## Benefits

1. ✅ **No Race Conditions:** Both properties update atomically in a single state update
2. ✅ **Better Performance:** One state update instead of two
3. ✅ **More Reliable:** Eliminates stale closure issues
4. ✅ **Backwards Compatible:** Falls back to individual updates if batch update not available
5. ✅ **Extensible:** Can be used for other multi-property updates in the future

## Testing

To verify the fix:
1. Go to "تحرير الموقع" (Website Builder)
2. Add an Icon widget to the canvas
3. Select the Icon widget
4. In the Properties panel, click on the Icon selector
5. Switch to the "Icon Library" tab
6. Select any icon (e.g., Home, User, Settings, Heart, etc.)
7. **Expected Result:** The icon in the widget should immediately update to the selected icon

## Files Modified

- `src/app/website-edit/page.tsx` - Added `handleUpdateProperties` function and passed it to PropertyEditor
- `src/components/website-builder/PropertyEditor.tsx` - Added `onUpdateMultiple` prop, `handleUpdateMultiple` function, and updated icon onChange handler

## Date
January 20, 2025
