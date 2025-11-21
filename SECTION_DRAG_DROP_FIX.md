# Section Widget Drag & Drop Fix

## Problem
Widgets could not be dragged and dropped inside Section containers. The drag-and-drop functionality only worked for the top-level canvas.

## Solution Implemented

### 1. **Added Drop Target State**
```typescript
const [dropTargetSection, setDropTargetSection] = React.useState<string | null>(null);
```
Tracks which section is currently being hovered over during a drag operation for visual feedback.

### 2. **Created Nested Widget Drop Handler**
```typescript
const handleDropInSection = (sectionId: string, e: React.DragEvent) => {
  // Stops propagation to prevent dropping on both section and canvas
  // Recursively finds the section and adds the widget to its children array
}
```
- Prevents event bubbling to parent canvas
- Recursively searches for the target section
- Adds new widget to section's children array
- Updates history for undo/redo support
- Shows success toast notification

### 3. **Updated Section Widget Rendering**
The section widget now has:

#### Drop Event Handlers
```typescript
onDragOver={(e) => {
  e.stopPropagation();
  e.preventDefault();
  setDropTargetSection(widget.id);
}}
onDragLeave={(e) => {
  e.stopPropagation();
  setDropTargetSection(null);
}}
onDrop={(e) => handleDropInSection(widget.id, e)}
```

#### Visual Feedback
- **Blue ring highlight** when dragging over (ring-4 ring-blue-400)
- **Border changes** from dashed gray to solid blue
- **Empty state message** when section has no children: "Empty section - Drop widgets here"
- **Layout icon** added to section header for better visual identification

#### Better Child Widget Display
```typescript
{widget.children && widget.children.length > 0 ? (
  <div className="space-y-2">
    {widget.children.map(child => renderWidget(child))}
  </div>
) : (
  <div className="text-center py-8 text-gray-300 text-sm">
    Empty section - Drop widgets here
  </div>
)}
```

### 4. **Recursive Widget Operations**
All widget operations now work recursively to support nested structures:

#### Delete Widget
```typescript
const deleteFromWidgets = (widgets: Widget[]): Widget[] => {
  return widgets.filter(w => w.id !== widgetId).map(w => ({
    ...w,
    children: w.children ? deleteFromWidgets(w.children) : undefined
  }));
};
```
Deletes widgets at any nesting level.

#### Update Widget Properties
```typescript
const updateInWidgets = (widgets: Widget[]): Widget[] => {
  return widgets.map(w => {
    if (w.id === widgetId) {
      return { ...w, props: { ...w.props, [property]: value } };
    }
    if (w.children) {
      return { ...w, children: updateInWidgets(w.children) };
    }
    return w;
  });
};
```
Updates properties for nested widgets.

#### Duplicate Widget
```typescript
const duplicateWithNewIds = (w: Widget): Widget => ({
  ...w,
  id: generateId(),
  children: w.children?.map(child => duplicateWithNewIds(child))
});
```
Duplicates widgets and all their children with new unique IDs.

#### Find Widget by ID
```typescript
const findWidgetById = (widgets: Widget[], id: string): Widget | null => {
  for (const widget of widgets) {
    if (widget.id === id) return widget;
    if (widget.children) {
      const found = findWidgetById(widget.children, id);
      if (found) return found;
    }
  }
  return null;
};
```
Searches for widgets at any nesting level for selection and property updates.

### 5. **Improved User Experience**

#### Visual Indicators
- **Hover State**: Section border turns blue when hovering with a dragged widget
- **Ring Effect**: Blue ring appears around section during drag-over
- **Empty State**: Clear message when section is empty
- **Icon**: Layout icon in section header

#### Feedback Messages
- "Widget Added to Section" toast when successfully dropped
- Section shows column count in header
- Clear visual separation between nested widgets with `space-y-2`

## Features Now Supported

### ✅ Nested Structure
- Drag widgets into sections
- Sections can contain multiple widgets
- Visual separation between child widgets

### ✅ Full CRUD Operations on Nested Widgets
- **Create**: Drop widgets into sections
- **Read**: View nested widgets in canvas
- **Update**: Edit properties of nested widgets
- **Delete**: Remove nested widgets

### ✅ Visual Feedback
- Highlighted section when dragging over
- Empty state for empty sections
- Clear section labeling with column info

### ✅ History Support
- Undo/redo works with nested widgets
- All section operations are recorded

## Technical Details

### Event Propagation
Used `e.stopPropagation()` throughout to ensure:
- Section drops don't also trigger canvas drops
- Child widget clicks don't select parent section
- Proper event handling at each nesting level

### State Management
- `dropTargetSection` tracks current hover target
- Recursive updates maintain immutability
- History properly captures nested state

### Type Safety
- Full TypeScript support maintained
- All recursive functions properly typed
- Widget interface supports optional children

## Future Enhancements (Potential)
- Drag widgets between sections
- Drag widgets out of sections back to canvas
- Column-based layout inside sections (grid display)
- Section templates/presets
- Section collapse/expand
- Maximum nesting depth limits
- Section background patterns

## Testing
✅ TypeScript compilation successful  
✅ Drag widget into section working  
✅ Visual feedback displaying correctly  
✅ Nested widget selection working  
✅ Nested widget property editing working  
✅ Nested widget deletion working  
✅ Nested widget duplication working  
✅ Undo/redo with nested widgets working  

## Usage

1. **Add a Section**: Drag a "Section" widget from the left panel onto the canvas
2. **Add Widgets to Section**: Drag any widget (heading, text, button, etc.) onto the section
   - Section will highlight with blue border when hovering
   - Widget will be added inside the section
3. **Edit Nested Widgets**: Click any widget inside the section to edit its properties
4. **Multiple Widgets**: Add multiple widgets to the same section for rich layouts

## Conclusion
The section widget now fully supports drag-and-drop functionality with proper visual feedback, nested operations, and complete state management. Users can create complex page layouts with sections containing multiple widgets.
