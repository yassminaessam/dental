# Widget Rearrangement Feature - Drag & Drop Implementation

## Overview
Implemented comprehensive drag-and-drop functionality allowing users to rearrange widgets anywhere on the page - within sections, between sections, and between canvas and sections.

## Features Implemented

### 1. **Drag Existing Widgets**
All widgets on the canvas are now draggable:
- Click and hold on any widget to start dragging
- Widget becomes semi-transparent (50% opacity) while dragging
- Cursor changes to "move" cursor to indicate draggability
- Visual feedback shows which widget is being dragged

### 2. **Visual Drop Zones**
Intelligent drop zones appear when dragging:

#### Between Widgets
```
┌─────────────────┐
│   Widget 1      │
└─────────────────┘
     [Drop here]     ← Drop zone appears on hover
┌─────────────────┐
│   Widget 2      │
└─────────────────┘
```

#### Drop Zone States
- **Default**: Small 2px height, invisible
- **Hover**: 8px height with blue dashed border
- **Active**: 16px height with solid blue border and "Drop here" text

### 3. **Multi-Container Support**
Widgets can be moved between different containers:

#### Canvas to Canvas
- Rearrange order of widgets on main canvas
- Drop between any two widgets
- Drop at the beginning or end

#### Canvas to Section
- Drag any widget from canvas into a section
- Widget is removed from canvas
- Widget appears in section with column layout

#### Section to Canvas  
- Drag widget out of section back to canvas
- Widget maintains all properties
- Section updates automatically

#### Section to Section
- Move widgets between different sections
- Supports nested layouts
- Column layouts adjust automatically

#### Within Section
- Rearrange widgets inside same section
- Column grid automatically adjusts
- Visual feedback for drop position

### 4. **Smart State Management**

#### State Variables
```typescript
const [draggedWidget, setDraggedWidget] = React.useState<WidgetDefinition | null>(null);
// For new widgets from library

const [draggedExistingWidget, setDraggedExistingWidget] = React.useState<Widget | null>(null);
// For existing widgets being moved

const [dropTargetIndex, setDropTargetIndex] = React.useState<number | null>(null);
// Track where widget will be dropped

const [dropTargetSection, setDropTargetSection] = React.useState<string | null>(null);
// Track which section is target
```

#### Drag States
- **New Widget**: Dragging from library palette
- **Existing Widget**: Dragging from canvas or section
- **Both handled separately** with different logic

### 5. **Helper Functions**

#### Remove Widget
```typescript
const removeWidgetById = (widgets: Widget[], id: string): Widget[]
```
- Recursively searches and removes widget
- Works at any nesting level
- Returns new tree without the widget

#### Insert at Position
```typescript
const insertWidgetAtPosition = (widgets: Widget[], widget: Widget, index: number): Widget[]
```
- Inserts widget at specific index in canvas
- Uses splice for precise positioning
- Maintains widget order

#### Insert in Section
```typescript
const insertWidgetInSection = (widgets: Widget[], sectionId: string, widget: Widget, index: number | null): Widget[]
```
- Recursively finds target section
- Adds widget to section's children
- Supports positional insertion or append

### 6. **Event Handlers**

#### Drag Start
```typescript
const handleExistingWidgetDragStart = (widget: Widget, e: React.DragEvent) => {
  e.stopPropagation();
  setDraggedExistingWidget(widget);
  setDraggedWidget(null);
}
```
- Tracks which widget is being dragged
- Clears library widget state
- Prevents event bubbling

#### Drop on Canvas
```typescript
const handleDrop = (e: React.DragEvent) => {
  // Handle new widget from library
  if (draggedWidget) { ... }
  
  // Handle existing widget being moved
  else if (draggedExistingWidget) {
    // Remove from source
    let widgetsWithoutDragged = removeWidgetById(canvasWidgets, draggedExistingWidget.id);
    
    // Add to target position
    if (dropTargetIndex !== null) {
      updatedWidgets = insertWidgetAtPosition(widgetsWithoutDragged, draggedExistingWidget, dropTargetIndex);
    }
  }
}
```

#### Drop in Section
```typescript
const handleDropInSection = (sectionId: string, e: React.DragEvent) => {
  // Remove from current location
  let widgetsWithoutDragged = removeWidgetById(canvasWidgets, draggedExistingWidget.id);
  
  // Add to section
  updatedWidgets = insertWidgetInSection(widgetsWithoutDragged, sectionId, draggedExistingWidget, null);
}
```

### 7. **Visual Feedback**

#### Dragging Widget
- **Opacity**: 50% while dragging
- **Border**: Blue border color
- **Cursor**: Changes to "move"
- **z-index**: Stays visible above other elements

#### Drop Zones
- **Idle**: Nearly invisible (2px height)
- **Hover**: Expands with blue dashed border
- **Target**: Solid blue background with "Drop here" text
- **Smooth transitions**: CSS transitions for all state changes

#### Selected vs Dragging
```typescript
className={`relative group cursor-move border-2 transition-all ${
  isDragging ? 'opacity-50 border-blue-400' : 
  isSelected ? 'border-blue-500 bg-blue-50/50' : 
  'border-transparent hover:border-blue-300'
}`}
```

### 8. **Toast Notifications**

#### Different Messages
- **"Widget Added"**: New widget from library
- **"Widget Moved"**: Rearranged on canvas
- **"Widget Moved to Section"**: Moved into section
- **Success feedback**: Clear user confirmation

## Use Cases

### 1. Reorder Content
```
Before:
1. Heading
2. Image
3. Text

Drag Image to top:
1. Image
2. Heading
3. Text
```

### 2. Organize in Sections
```
Canvas:
- Card 1
- Card 2
- Card 3

Drag all into Section (3 columns):
Section
├─ Card 1  ├─ Card 2  ├─ Card 3
```

### 3. Rearrange Section Content
```
Section (2 columns):
Before: Text | Image
After:  Image | Text (swapped)
```

### 4. Extract from Section
```
Before:
Section
├─ Widget A
└─ Widget B

After (drag Widget A out):
Canvas: Widget A
Section: Widget B
```

## Technical Implementation

### Recursive Operations
All operations work recursively to handle nested structures:

```typescript
// Remove works at any level
canvasWidgets
├─ Widget A
├─ Section
│  ├─ Widget B  ← Can remove from here
│  └─ Widget C
└─ Widget D
```

### Immutability
All state updates are immutable:
```typescript
// Never mutates original array
const updatedWidgets = removeWidgetById(canvasWidgets, id);
// Returns new array
```

### Event Propagation
Properly handles event bubbling:
```typescript
e.stopPropagation(); // Prevents parent handlers
e.preventDefault();  // Prevents default drag behavior
```

## History & Undo/Redo

### Full Integration
- Every move is recorded in history
- Undo reverts to previous state
- Redo replays forward
- Works with all rearrangement operations

### Example
```
1. Add Widget A     [History: [[],[A]]]
2. Add Widget B     [History: [[],[A],[A,B]]]
3. Move A after B   [History: [[],[A],[A,B],[B,A]]]
4. Undo             Current: [A,B]
5. Redo             Current: [B,A]
```

## Performance

### Optimizations
- **Minimal re-renders**: Only affected widgets update
- **Efficient searches**: Early termination in recursion
- **State batching**: Multiple state updates batched
- **CSS transitions**: GPU-accelerated animations

### Scalability
- Works with any number of widgets
- Handles deep nesting (sections in sections)
- No performance degradation with complex layouts

## Browser Compatibility

### HTML5 Drag & Drop API
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ All modern browsers

### Fallbacks
- Graceful degradation for old browsers
- Manual copy/paste as alternative

## User Experience

### Intuitive Interaction
- **Grab and drag**: Natural gesture
- **Visual feedback**: Clear where it will drop
- **Instant results**: No loading states
- **Forgiving**: Can't break the layout

### Accessibility
- Keyboard shortcuts can be added
- Screen reader announcements possible
- High contrast drop zones

## Testing Checklist

✅ Drag widget on canvas  
✅ Drop between widgets  
✅ Drop at start of list  
✅ Drop at end of list  
✅ Drag into empty section  
✅ Drag into section with items  
✅ Drag out of section to canvas  
✅ Drag between two sections  
✅ Rearrange within section  
✅ Undo/redo after move  
✅ Visual feedback working  
✅ No TypeScript errors  
✅ No console errors  
✅ History tracking correct  

## Future Enhancements (Potential)

### Advanced Features
- **Multi-select**: Drag multiple widgets at once
- **Keyboard shortcuts**: Arrow keys to reorder
- **Snap to grid**: Align widgets precisely
- **Group operations**: Move groups of widgets
- **Copy while dragging**: Hold modifier key to duplicate

### Visual Improvements
- **Drag preview**: Show widget preview while dragging
- **Animated transitions**: Smooth widget movements
- **Collision detection**: Prevent invalid drops
- **Drop shadows**: 3D effect while dragging

### Column-Specific
- **Column targeting**: Drop in specific column
- **Column reorder**: Rearrange columns themselves
- **Responsive preview**: See how it looks on mobile

## Documentation

### User Guide
1. **To rearrange a widget**:
   - Click and hold the widget
   - Drag to desired position
   - Blue drop zones appear
   - Release to drop

2. **To move to section**:
   - Drag widget over section
   - Section highlights in blue
   - Release to drop inside

3. **To move out of section**:
   - Drag widget from section
   - Drag to canvas area
   - Release outside section

### Tips
- Drop zones appear only when dragging
- Hover over drop zone to highlight it
- Section border turns blue when it's target
- Use undo if you make a mistake

## Conclusion
The widget rearrangement feature provides a powerful, intuitive way to organize page content. With support for multiple containers, visual feedback, and full history integration, users can easily create complex layouts by simply dragging and dropping widgets where they want them.
