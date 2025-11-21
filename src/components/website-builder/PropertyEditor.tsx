'use client';

import * as React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Trash2, Copy, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Plus, Minus } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { IconPicker } from "./IconPicker";
import type { Widget, NavLink } from '@/types/website-builder';
import { DEFAULT_NAV_LINK, normalizeNavLinks } from '@/lib/website-builder';

interface PropertyEditorProps {
  widget: Widget;
  onUpdate: (widgetId: string, property: string, value: any) => void;
  onUpdateMultiple?: (widgetId: string, updates: Record<string, any>) => void;
  onDelete: (widgetId: string) => void;
  onDuplicate: (widget: Widget) => void;
}

export function PropertyEditor({ widget, onUpdate, onUpdateMultiple, onDelete, onDuplicate }: PropertyEditorProps) {
  const handleUpdate = (property: string, value: any) => {
    onUpdate(widget.id, property, value);
  };

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

  // Common property editors
  const renderColorPicker = (label: string, prop: string, value: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => handleUpdate(prop, e.target.value)}
          className="w-20 h-10 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => handleUpdate(prop, e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderTextInput = (label: string, prop: string, value: string, placeholder?: string, isTextarea?: boolean) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isTextarea ? (
        <Textarea
          value={value}
          onChange={(e) => handleUpdate(prop, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => handleUpdate(prop, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const renderTextarea = (label: string, prop: string, value: string, placeholder?: string) =>
    renderTextInput(label, prop, value, placeholder, true);

  const renderSelect = (label: string, prop: string, value: string, options: { value: string; label: string }[]) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(val) => handleUpdate(prop, val)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderSlider = (label: string, prop: string, value: number, min: number, max: number, step: number, unit?: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([val]) => handleUpdate(prop, val)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );

  type SwitchOptions = {
    description?: React.ReactNode;
    onChange?: (checked: boolean) => void;
  };

  const renderSwitch = (
    label: string,
    prop: string,
    value: boolean,
    options?: string | SwitchOptions
  ) => {
    const optionsObject =
      typeof options === 'object' && options !== null ? options : undefined;
    const description =
      typeof options === 'string' ? options : optionsObject?.description;
    const customOnChange = optionsObject?.onChange;

    return (
      <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
        <div className="flex-1">
          <Label className="cursor-pointer">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Switch
          checked={value}
          onCheckedChange={(checked) => {
            if (customOnChange) {
              customOnChange(checked);
            } else {
              handleUpdate(prop, checked);
            }
          }}
        />
      </div>
    );
  };

  const renderAlignment = (prop: string, value: string) => (
    <div className="space-y-2">
      <Label>Alignment</Label>
      <div className="flex gap-1">
        <Button
          variant={value === 'left' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => handleUpdate(prop, 'left')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={value === 'center' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => handleUpdate(prop, 'center')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={value === 'right' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => handleUpdate(prop, 'right')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Number input with spinner controls
  const renderNumberInput = (label: string, prop: string, value: number, unit?: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={value}
          onChange={(e) => handleUpdate(prop, parseInt(e.target.value) || 0)}
          className="flex-1"
        />
        {unit && <span className="text-xs text-muted-foreground w-6">{unit}</span>}
      </div>
    </div>
  );

  // Common position and size controls for all widgets
  const renderPositionAndSize = () => (
    <>
      <Separator className="my-4" />
      <h3 className="text-sm font-semibold mb-3 text-blue-700">Position & Size</h3>
      <div className="grid grid-cols-2 gap-3">
        {renderNumberInput('X Position', 'x', widget.props.x || 0, 'px')}
        {renderNumberInput('Y Position', 'y', widget.props.y || 0, 'px')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {renderTextInput('Width', 'width', widget.props.width || 'auto', '300px, 50%, auto')}
        {renderTextInput('Height', 'height', widget.props.height || 'auto', '200px, auto')}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Position values in pixels. Size can be px, %, rem, or 'auto'.
      </p>
    </>
  );

  // Widget-specific property editors
  const renderHeadingProperties = () => (
    <>
      {renderTextInput('Heading Text', 'text', widget.props.text, 'Enter heading text...')}
      {renderSelect('Heading Level', 'level', widget.props.level, [
        { value: 'h1', label: 'Heading 1' },
        { value: 'h2', label: 'Heading 2' },
        { value: 'h3', label: 'Heading 3' },
        { value: 'h4', label: 'Heading 4' },
        { value: 'h5', label: 'Heading 5' },
        { value: 'h6', label: 'Heading 6' }
      ])}
      {renderSelect('Font Size', 'fontSize', widget.props.fontSize, [
        { value: '1rem', label: 'Small (1rem)' },
        { value: '1.5rem', label: 'Medium (1.5rem)' },
        { value: '2rem', label: 'Large (2rem)' },
        { value: '2.5rem', label: 'Extra Large (2.5rem)' },
        { value: '3rem', label: 'Huge (3rem)' }
      ])}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderAlignment('textAlign', widget.props.textAlign || 'left')}
      {renderSelect('Font Weight', 'fontWeight', widget.props.fontWeight || 'bold', [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Bold' },
        { value: '600', label: 'Semi-bold' },
        { value: '800', label: 'Extra Bold' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderTextProperties = () => (
    <>
      {renderTextInput('Text Content', 'text', widget.props.text, 'Enter text content...', true)}
      {renderSelect('Font Size', 'fontSize', widget.props.fontSize, [
        { value: '0.75rem', label: 'Extra Small' },
        { value: '0.875rem', label: 'Small' },
        { value: '1rem', label: 'Normal' },
        { value: '1.125rem', label: 'Medium' },
        { value: '1.25rem', label: 'Large' }
      ])}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderAlignment('textAlign', widget.props.textAlign || 'left')}
      {renderSelect('Line Height', 'lineHeight', widget.props.lineHeight || '1.5', [
        { value: '1', label: 'Tight (1)' },
        { value: '1.25', label: 'Snug (1.25)' },
        { value: '1.5', label: 'Normal (1.5)' },
        { value: '1.75', label: 'Relaxed (1.75)' },
        { value: '2', label: 'Loose (2)' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderImageProperties = () => (
    <>
      <ImageUpload
        value={widget.props.uploadedUrl || widget.props.src}
        onChange={(url) => {
          handleUpdate('uploadedUrl', url);
          handleUpdate('src', url);
        }}
        label="Image Source"
      />
      {renderTextInput('Alt Text', 'alt', widget.props.alt, 'Image description...')}
      {renderSelect('Object Fit', 'objectFit', widget.props.objectFit || 'cover', [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
        { value: 'fill', label: 'Fill' },
        { value: 'none', label: 'None' },
        { value: 'scale-down', label: 'Scale Down' }
      ])}
      {renderSelect('Aspect Ratio', 'aspectRatio', widget.props.aspectRatio || 'auto', [
        { value: 'auto', label: 'Auto' },
        { value: '16/9', label: '16:9' },
        { value: '4/3', label: '4:3' },
        { value: '1/1', label: '1:1 (Square)' },
        { value: '3/4', label: '3:4' },
        { value: '9/16', label: '9:16' }
      ])}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0', '0px, 8px, 16px...')}
      {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0', '0px, 1px, 2px...')}
      {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e0e0e0')}
      {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'double', label: 'Double' }
      ])}
      {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'e.g., 0 2px 4px rgba(0,0,0,0.1)')}
      {renderSlider('Opacity', 'opacity', parseFloat(widget.props.opacity) || 1, 0, 1, 0.1)}
      {renderSelect('Filter', 'filter', widget.props.filter || 'none', [
        { value: 'none', label: 'None' },
        { value: 'grayscale(100%)', label: 'Grayscale' },
        { value: 'sepia(100%)', label: 'Sepia' },
        { value: 'blur(5px)', label: 'Blur' },
        { value: 'brightness(150%)', label: 'Bright' },
        { value: 'contrast(200%)', label: 'High Contrast' }
      ])}
      {renderSelect('Loading', 'loading', widget.props.loading || 'lazy', [
        { value: 'lazy', label: 'Lazy' },
        { value: 'eager', label: 'Eager' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderButtonProperties = () => (
    <>
      {renderTextInput('Button Text', 'text', widget.props.text, 'Enter button text...')}
      {renderTextInput('Link URL', 'link', widget.props.link, 'https://...')}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderSelect('Size', 'size', widget.props.size || 'medium', [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ])}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.375rem', '8px, 16px, 24px...')}
      {renderSwitch('Full Width', 'fullWidth', widget.props.fullWidth || false, 'Button spans full container width')}
      {renderPositionAndSize()}
    </>
  );

  const renderVideoProperties = () => (
    <>
      {renderTextInput('Video URL', 'src', widget.props.src, 'Enter video URL or embed code...')}
      {renderSwitch('Autoplay', 'autoplay', widget.props.autoplay, 'Start playing automatically')}
      {renderSwitch('Show Controls', 'controls', widget.props.controls !== false, 'Display video controls')}
      {renderSwitch('Loop', 'loop', widget.props.loop || false, 'Repeat video when finished')}
      {renderPositionAndSize()}
    </>
  );

  const renderSectionProperties = () => {
    const currentColumnCount = widget.children?.length || 0;
    
    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Background</h3>
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor)}
        {renderTextInput('Background Image URL', 'backgroundImage', widget.props.backgroundImage || '', 'https://...')}
        {renderSelect('Background Size', 'backgroundSize', widget.props.backgroundSize || 'cover', [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'auto', label: 'Auto' },
          { value: '100% 100%', label: 'Stretch' }
        ])}
        {renderSelect('Background Position', 'backgroundPosition', widget.props.backgroundPosition || 'center', [
          { value: 'center', label: 'Center' },
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
          { value: 'top left', label: 'Top Left' },
          { value: 'top right', label: 'Top Right' },
          { value: 'bottom left', label: 'Bottom Left' },
          { value: 'bottom right', label: 'Bottom Right' }
        ])}
        {renderSelect('Background Repeat', 'backgroundRepeat', widget.props.backgroundRepeat || 'no-repeat', [
          { value: 'no-repeat', label: 'No Repeat' },
          { value: 'repeat', label: 'Repeat' },
          { value: 'repeat-x', label: 'Repeat X' },
          { value: 'repeat-y', label: 'Repeat Y' }
        ])}
        
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout</h3>
        <div className="space-y-2">
          <Label>Number of Columns</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {
                const newValue = Math.max(1, currentColumnCount - 1);
                handleUpdate('columns', String(newValue));
              }}
              disabled={currentColumnCount <= 1}
            >
              -
            </Button>
            <Input
              type="number"
              min="1"
              max="100"
              value={currentColumnCount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                const clampedValue = Math.max(1, Math.min(100, value));
                handleUpdate('columns', String(clampedValue));
              }}
              className="text-center w-24"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {
                const newValue = Math.min(100, currentColumnCount + 1);
                handleUpdate('columns', String(newValue));
              }}
              disabled={currentColumnCount >= 100}
            >
              +
            </Button>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Current: {currentColumnCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Adding/removing columns will preserve existing content where possible
          </p>
        </div>
        
        {renderSelect('Column Gap', 'columnGap', widget.props.columnGap || '1rem', [
          { value: '0', label: 'No Gap' },
          { value: '0.5rem', label: 'Small (0.5rem)' },
          { value: '1rem', label: 'Medium (1rem)' },
          { value: '1.5rem', label: 'Large (1.5rem)' },
          { value: '2rem', label: 'Extra Large (2rem)' },
          { value: '3rem', label: 'Huge (3rem)' }
        ])}
        {renderTextInput('Padding', 'padding', widget.props.padding, '1rem, 2rem, 3rem...')}
        {renderTextInput('Margin', 'margin', widget.props.margin || '0', '0, 1rem 0, 2rem auto...')}
        {renderTextInput('Max Width', 'maxWidth', widget.props.maxWidth || '100%', '100%, 1200px, 80%...')}
        {renderTextInput('Min Height', 'minHeight', widget.props.minHeight || '100px', '100px, 200px, 50vh...')}
        {renderTextInput('Max Height', 'maxHeight', widget.props.maxHeight || 'none', 'none, 500px, 80vh...')}
        {renderSwitch('Center Content', 'centerContent', widget.props.centerContent || false, 'Horizontally center the content')}
        
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Border</h3>
        {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0', '0, 1px, 2px, 4px...')}
        {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' },
          { value: 'none', label: 'None' }
        ])}
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e0e0e0')}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0', '0, 8px, 16px, 1rem...')}
        
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Effects</h3>
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'none, 0 2px 4px rgba(0,0,0,0.1)...')}
        {renderSlider('Opacity', 'opacity', parseFloat(widget.props.opacity) || 1, 0, 1, 0.1)}
        {renderTextInput('Z-Index', 'zIndex', widget.props.zIndex || 'auto', 'auto, 0, 1, 10, 100...')}
        
        {renderPositionAndSize()}
      </>
    );
  };

  const renderDividerProperties = () => (
    <>
      {renderColorPicker('Color', 'color', widget.props.color)}
      {renderTextInput('Thickness', 'thickness', widget.props.thickness || '2px', '1px, 2px, 3px...')}
      {renderTextInput('Margin', 'margin', widget.props.margin, '1rem 0, 2rem 0...')}
      {renderSelect('Style', 'style', widget.props.style || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderAccordionProperties = () => (
    <>
      {renderTextInput('Title', 'title', widget.props.title, 'Accordion title...')}
      {renderTextInput('Content', 'content', widget.props.content, 'Accordion content...', true)}
      {renderSwitch('Default Open', 'defaultOpen', widget.props.defaultOpen || false, 'Start in expanded state')}
      {renderPositionAndSize()}
    </>
  );

  const renderFormProperties = () => (
    <>
      {renderTextInput('Form Title', 'title', widget.props.title || '', 'Contact Form')}
      {renderTextInput('Submit Text', 'submitText', widget.props.submitText, 'Submit, Send, Contact Us...')}
      {renderTextInput('Action URL', 'action', widget.props.action || '', 'Form submission URL')}
      <div className="space-y-2">
        <Label>Form Fields (comma-separated)</Label>
        <Input
          value={widget.props.fields?.join(', ') || ''}
          onChange={(e) => handleUpdate('fields', e.target.value.split(',').map(f => f.trim()))}
          placeholder="name, email, message"
        />
        <p className="text-xs text-muted-foreground">Example: name, email, phone, message</p>
      </div>
      {renderPositionAndSize()}
    </>
  );

  const renderCTAProperties = () => (
    <>
      {renderTextInput('Heading', 'heading', widget.props.heading, 'Call to action heading...')}
      {renderTextInput('Description', 'description', widget.props.description || '', 'Optional description...', true)}
      {renderTextInput('Button Text', 'buttonText', widget.props.buttonText, 'Get Started, Learn More...')}
      {renderTextInput('Button Link', 'link', widget.props.link, 'https://...')}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#0066cc')}
      {renderColorPicker('Text Color', 'color', widget.props.color || '#ffffff')}
      {renderPositionAndSize()}
    </>
  );

  const renderCardProperties = () => (
    <>
      {renderTextInput('Title', 'title', widget.props.title, 'Card title...')}
      {renderTextInput('Content', 'content', widget.props.content, 'Card content...', true)}
      {renderTextInput('Image URL', 'image', widget.props.image || '', 'Optional image URL')}
      {renderTextInput('Link URL', 'link', widget.props.link || '', 'Optional link')}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.5rem', '8px, 16px...')}
      {renderPositionAndSize()}
    </>
  );

  const renderAlertProperties = () => (
    <>
      {renderSelect('Alert Type', 'type', widget.props.type, [
        { value: 'info', label: 'Info' },
        { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' }
      ])}
      {renderTextInput('Message', 'message', widget.props.message, 'Alert message...', true)}
      {renderSwitch('Dismissible', 'dismissible', widget.props.dismissible || false, 'Can be closed by user')}
      {renderPositionAndSize()}
    </>
  );

  const renderSocialProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Platforms (comma-separated)</Label>
        <Input
          value={widget.props.platforms?.join(', ') || ''}
          onChange={(e) => handleUpdate('platforms', e.target.value.split(',').map(p => p.trim()))}
          placeholder="facebook, twitter, instagram, linkedin"
        />
        <p className="text-xs text-muted-foreground">Supported: facebook, twitter, instagram, linkedin, youtube</p>
      </div>
      {renderSelect('Size', 'size', widget.props.size || 'medium', [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ])}
      {renderColorPicker('Icon Color', 'color', widget.props.color || '#333333')}
      {renderPositionAndSize()}
    </>
  );

  const renderIconProperties = () => (
    <>
      <IconPicker
        value={widget.props.name || 'Globe'}
        uploadedIcon={widget.props.uploadedIcon}
        onChange={(iconName, uploadedUrl) => {
          // Batch update both icon properties together to avoid race conditions
          handleUpdateMultiple({
            name: iconName,
            uploadedIcon: uploadedUrl || ''
          });
        }}
        size={widget.props.size || '2rem'}
        color={widget.props.color || '#0066cc'}
      />
      {renderTextInput('Size', 'size', widget.props.size, '1rem, 2rem, 3rem...')}
      {renderColorPicker('Color', 'color', widget.props.color)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor || 'transparent')}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0')}
      {renderTextInput('Padding', 'padding', widget.props.padding || '0')}
      {renderSelect('Rotation', 'rotation', widget.props.rotation || '0', [
        { value: '0', label: 'None' },
        { value: '45', label: '45°' },
        { value: '90', label: '90°' },
        { value: '180', label: '180°' },
        { value: '270', label: '270°' },
        { value: '-45', label: '-45°' },
        { value: '-90', label: '-90°' }
      ])}
      {renderSelect('Flip', 'flip', widget.props.flip || 'none', [
        { value: 'none', label: 'None' },
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
        { value: 'both', label: 'Both' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderColumnProperties = () => (
    <>
      <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Column Container</p>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          This is a column inside a section. Drag widgets here to add content.
        </p>
      </div>
      
      {renderTextInput('Padding', 'padding', widget.props.padding, '0.5rem, 1rem, 2rem...')}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || 'transparent')}
      {renderTextInput('Min Height', 'minHeight', widget.props.minHeight || '100px', '100px, 200px, 300px...')}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0', '0px, 8px, 16px...')}
      
      <div className="space-y-2">
        <Label>Width</Label>
        <p className="text-xs text-muted-foreground">
          Width is automatically managed by the parent section's grid layout.
        </p>
      </div>
    </>
  );

  // Navigation widgets properties
  const renderNavbarProperties = () => {
    const navLinks = normalizeNavLinks(widget.props.links);

    const handleNavLinkChange = (index: number, key: keyof NavLink, value: string) => {
      const updated = [...navLinks];
      updated[index] = { ...updated[index], [key]: value };
      handleUpdate('links', updated);
    };

    const handleRemoveNavLink = (index: number) => {
      const updated = navLinks.filter((_, idx) => idx !== index);
      handleUpdate('links', updated);
    };

    const handleAddNavLink = () => {
      const label = `Link ${navLinks.length + 1}`;
      handleUpdate('links', [...navLinks, { ...DEFAULT_NAV_LINK, label }]);
    };

    return (
      <>
        {renderTextInput('Logo Text', 'logoText', widget.props.logoText || '')}
        <ImageUpload
          value={widget.props.logo}
          onChange={(url) => handleUpdate('logo', url)}
          label="Logo Image"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Navigation Links</Label>
            {navLinks.length > 0 && (
              <span className="text-xs text-muted-foreground">{navLinks.length} link{navLinks.length === 1 ? '' : 's'}</span>
            )}
          </div>

          {navLinks.length === 0 && (
            <p className="text-xs text-muted-foreground">No links yet. Use “Add Link” to get started.</p>
          )}

          <div className="space-y-3">
            {navLinks.map((link, idx) => (
              <div key={`${link.label}-${idx}`} className="space-y-2 rounded-lg border bg-muted/10 p-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Link {idx + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleRemoveNavLink(idx)}
                    aria-label={`Remove link ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={link.label}
                  onChange={(e) => handleNavLinkChange(idx, 'label', e.target.value)}
                  placeholder="Navigation label"
                />
                <Input
                  value={link.href}
                  onChange={(e) => handleNavLinkChange(idx, 'href', e.target.value)}
                  placeholder="https://example.com/section"
                />
              </div>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={handleAddNavLink}>
            Add Link
          </Button>
        </div>

        {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
        {renderColorPicker('Text Color', 'color', widget.props.color)}
        {renderTextInput('Height', 'height', widget.props.height || '60px')}
        {renderSwitch(
          'Fixed Position',
          'position',
          widget.props.position === 'fixed',
          {
            description: 'Keep the navigation bar pinned to the top of the page',
            onChange: (checked) => handleUpdate('position', checked ? 'fixed' : 'relative')
          }
        )}
        {renderSwitch('Show Shadow', 'shadow', widget.props.shadow ?? true, 'Adds a subtle drop shadow beneath the navbar')}
        {renderPositionAndSize()}
      </>
    );
  };

  const renderFooterProperties = () => (
    <>
      {renderTextInput('Copyright Text', 'copyright', widget.props.copyright)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderTextInput('Padding', 'padding', widget.props.padding)}
      {renderSlider('Columns', 'columns', widget.props.columns, 1, 6, 1)}
      {renderPositionAndSize()}
    </>
  );

  const renderBreadcrumbProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Breadcrumb Items</Label>
        {widget.props.items?.map((item: string, idx: number) => (
          <Input
            key={idx}
            value={item}
            onChange={(e) => {
              const newItems = [...widget.props.items];
              newItems[idx] = e.target.value;
              handleUpdate('items', newItems);
            }}
            placeholder={`Item ${idx + 1}`}
          />
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('items', [...(widget.props.items || []), 'New Item'])}
        >
          Add Item
        </Button>
      </div>
      {renderTextInput('Separator', 'separator', widget.props.separator)}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderColorPicker('Hover Color', 'hoverColor', widget.props.hoverColor)}
      {renderPositionAndSize()}
    </>
  );

  // Data Display widgets properties
  const renderTableProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Table Headers</Label>
        {widget.props.headers?.map((header: string, idx: number) => (
          <Input
            key={idx}
            value={header}
            onChange={(e) => {
              const newHeaders = [...widget.props.headers];
              newHeaders[idx] = e.target.value;
              handleUpdate('headers', newHeaders);
            }}
            placeholder={`Header ${idx + 1}`}
          />
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('headers', [...(widget.props.headers || []), 'Header'])}
        >
          Add Header
        </Button>
      </div>
      {renderSwitch('Striped Rows', 'striped', widget.props.striped)}
      {renderSwitch('Bordered', 'bordered', widget.props.bordered)}
      {renderSwitch('Hoverable', 'hoverable', widget.props.hoverable)}
      {renderColorPicker('Header Background', 'headerBackground', widget.props.headerBackground)}
      {renderColorPicker('Header Color', 'headerColor', widget.props.headerColor)}
      {renderPositionAndSize()}
    </>
  );

  const renderListProperties = () => (
    <>
      <div className="space-y-2">
        <Label>List Items</Label>
        {widget.props.items?.map((item: string, idx: number) => (
          <Input
            key={idx}
            value={item}
            onChange={(e) => {
              const newItems = [...widget.props.items];
              newItems[idx] = e.target.value;
              handleUpdate('items', newItems);
            }}
            placeholder={`Item ${idx + 1}`}
          />
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('items', [...(widget.props.items || []), 'New Item'])}
        >
          Add Item
        </Button>
      </div>
      {renderSelect('List Type', 'listType', widget.props.listType, [
        { value: 'unordered', label: 'Unordered' },
        { value: 'ordered', label: 'Ordered' }
      ])}
      {renderSelect('List Style', 'listStyle', widget.props.listStyle, [
        { value: 'disc', label: 'Disc' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
        { value: 'decimal', label: 'Decimal' },
        { value: 'none', label: 'None' }
      ])}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderTextInput('Font Size', 'fontSize', widget.props.fontSize)}
      {renderTextInput('Line Height', 'lineHeight', widget.props.lineHeight)}
      {renderTextInput('Padding', 'padding', widget.props.padding)}
      {renderPositionAndSize()}
    </>
  );

  const renderProgressBarProperties = () => (
    <>
      {renderSlider('Value', 'value', widget.props.value, 0, widget.props.max || 100, 1)}
      {renderSlider('Max Value', 'max', widget.props.max, 10, 1000, 10)}
      {renderTextInput('Label', 'label', widget.props.label)}
      {renderSwitch('Show Percentage', 'showPercentage', widget.props.showPercentage)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Fill Color', 'fillColor', widget.props.fillColor)}
      {renderTextInput('Height', 'height', widget.props.height)}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius)}
      {renderSwitch('Animated', 'animated', widget.props.animated)}
      {renderPositionAndSize()}
    </>
  );

  const renderStatsProperties = () => (
    <>
      {renderTextInput('Value', 'value', widget.props.value)}
      {renderTextInput('Label', 'label', widget.props.label)}
      {renderTextInput('Change', 'change', widget.props.change)}
      {renderSelect('Change Type', 'changeType', widget.props.changeType, [
        { value: 'positive', label: 'Positive' },
        { value: 'negative', label: 'Negative' },
        { value: 'neutral', label: 'Neutral' }
      ])}
      {renderTextInput('Icon', 'icon', widget.props.icon)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor)}
      {renderPositionAndSize()}
    </>
  );

  // Forms & Inputs widgets properties
  const renderSearchBarProperties = () => (
    <>
      {renderTextInput('Placeholder', 'placeholder', widget.props.placeholder)}
      {renderTextInput('Button Text', 'buttonText', widget.props.buttonText)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius)}
      {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth)}
      {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor)}
      {renderSwitch('Show Button', 'showButton', widget.props.showButton)}
      {renderSwitch('Show Icon', 'showIcon', widget.props.showIcon)}
      {renderPositionAndSize()}
    </>
  );

  const renderNewsletterProperties = () => (
    <>
      {renderTextInput('Title', 'title', widget.props.title)}
      {renderTextarea('Description', 'description', widget.props.description)}
      {renderTextInput('Placeholder', 'placeholder', widget.props.placeholder)}
      {renderTextInput('Button Text', 'buttonText', widget.props.buttonText)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Button Color', 'buttonColor', widget.props.buttonColor)}
      {renderTextInput('Padding', 'padding', widget.props.padding)}
      {renderPositionAndSize()}
    </>
  );

  const renderContactInfoProperties = () => (
    <>
      {renderTextInput('Phone', 'phone', widget.props.phone)}
      {renderTextInput('Email', 'email', widget.props.email)}
      {renderTextarea('Address', 'address', widget.props.address)}
      {renderSwitch('Show Icons', 'showIcons', widget.props.showIcons)}
      {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor)}
      {renderColorPicker('Text Color', 'textColor', widget.props.textColor)}
      {renderTextInput('Font Size', 'fontSize', widget.props.fontSize)}
      {renderPositionAndSize()}
    </>
  );

  // Media widgets properties
  const renderGalleryProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Images</Label>
        {widget.props.images?.map((image: string, idx: number) => (
          <div key={idx} className="space-y-2">
            <ImageUpload
              value={image}
              onChange={(url) => {
                const newImages = [...widget.props.images];
                newImages[idx] = url;
                handleUpdate('images', newImages);
              }}
              label={`Image ${idx + 1}`}
            />
          </div>
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('images', [...(widget.props.images || []), ''])}
        >
          Add Image
        </Button>
      </div>
      {renderSlider('Columns', 'columns', widget.props.columns, 1, 6, 1)}
      {renderTextInput('Gap', 'gap', widget.props.gap)}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius)}
      {renderSelect('Aspect Ratio', 'aspectRatio', widget.props.aspectRatio, [
        { value: 'auto', label: 'Auto' },
        { value: '16/9', label: '16:9' },
        { value: '4/3', label: '4:3' },
        { value: '1/1', label: '1:1 Square' },
        { value: '3/4', label: '3:4' },
        { value: '9/16', label: '9:16' }
      ])}
      {renderSwitch('Enable Lightbox', 'lightbox', widget.props.lightbox)}
      {renderSwitch('Show Captions', 'captions', widget.props.captions)}
      {renderPositionAndSize()}
    </>
  );

  const renderCarouselProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Slides</Label>
        {widget.props.slides?.map((slide: string, idx: number) => (
          <div key={idx} className="space-y-2">
            <ImageUpload
              value={slide}
              onChange={(url) => {
                const newSlides = [...widget.props.slides];
                newSlides[idx] = url;
                handleUpdate('slides', newSlides);
              }}
              label={`Slide ${idx + 1}`}
            />
          </div>
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('slides', [...(widget.props.slides || []), ''])}
        >
          Add Slide
        </Button>
      </div>
      {renderSwitch('Autoplay', 'autoplay', widget.props.autoplay)}
      {renderSlider('Interval (ms)', 'interval', widget.props.interval, 1000, 10000, 500)}
      {renderSwitch('Show Indicators', 'showIndicators', widget.props.showIndicators)}
      {renderSwitch('Show Arrows', 'showArrows', widget.props.showArrows)}
      {renderTextInput('Height', 'height', widget.props.height)}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius)}
      {renderPositionAndSize()}
    </>
  );

  const renderAudioPlayerProperties = () => (
    <>
      {renderTextInput('Audio URL', 'src', widget.props.src)}
      {renderTextInput('Title', 'title', widget.props.title)}
      {renderTextInput('Artist', 'artist', widget.props.artist)}
      {renderSwitch('Show Controls', 'showControls', widget.props.showControls)}
      {renderSwitch('Autoplay', 'autoplay', widget.props.autoplay)}
      {renderSwitch('Loop', 'loop', widget.props.loop)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderPositionAndSize()}
    </>
  );

  // Commerce widgets properties
  const renderProductCardProperties = () => (
    <>
      {renderTextInput('Title', 'title', widget.props.title)}
      {renderTextInput('Price', 'price', widget.props.price)}
      {renderTextInput('Original Price', 'originalPrice', widget.props.originalPrice)}
      <ImageUpload
        value={widget.props.image}
        onChange={(url) => handleUpdate('image', url)}
        label="Product Image"
      />
      {renderSlider('Rating', 'rating', widget.props.rating || 0, 0, 5, 0.5)}
      {renderTextInput('Badge Text', 'badge', widget.props.badge)}
      {renderColorPicker('Badge Color', 'badgeColor', widget.props.badgeColor)}
      {renderTextInput('Button Text', 'buttonText', widget.props.buttonText)}
      {renderTextInput('Currency', 'currency', widget.props.currency)}
      {renderPositionAndSize()}
    </>
  );

  const renderPricingProperties = () => (
    <>
      {renderTextInput('Title', 'title', widget.props.title)}
      {renderTextInput('Price', 'price', widget.props.price)}
      {renderTextInput('Period', 'period', widget.props.period)}
      <div className="space-y-2">
        <Label>Features</Label>
        {widget.props.features?.map((feature: string, idx: number) => (
          <Input
            key={idx}
            value={feature}
            onChange={(e) => {
              const newFeatures = [...widget.props.features];
              newFeatures[idx] = e.target.value;
              handleUpdate('features', newFeatures);
            }}
            placeholder={`Feature ${idx + 1}`}
          />
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('features', [...(widget.props.features || []), 'New Feature'])}
        >
          Add Feature
        </Button>
      </div>
      {renderTextInput('Button Text', 'buttonText', widget.props.buttonText)}
      {renderSwitch('Featured', 'featured', widget.props.featured)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Accent Color', 'accentColor', widget.props.accentColor)}
      {renderPositionAndSize()}
    </>
  );

  const renderTestimonialProperties = () => (
    <>
      {renderTextarea('Quote', 'quote', widget.props.quote)}
      {renderTextInput('Author', 'author', widget.props.author)}
      {renderTextInput('Role', 'role', widget.props.role)}
      <ImageUpload
        value={widget.props.avatar}
        onChange={(url) => handleUpdate('avatar', url)}
        label="Avatar Image"
      />
      {renderSlider('Rating', 'rating', widget.props.rating || 0, 0, 5, 1)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderSwitch('Show Quote Icon', 'quoteIcon', widget.props.quoteIcon)}
      {renderPositionAndSize()}
    </>
  );

  // Special widgets properties
  const renderCountdownProperties = () => (
    <>
      {renderTextInput('Target Date', 'targetDate', widget.props.targetDate)}
      {renderTextInput('Title', 'title', widget.props.title)}
      {renderSwitch('Show Days', 'showDays', widget.props.showDays)}
      {renderSwitch('Show Hours', 'showHours', widget.props.showHours)}
      {renderSwitch('Show Minutes', 'showMinutes', widget.props.showMinutes)}
      {renderSwitch('Show Seconds', 'showSeconds', widget.props.showSeconds)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Text Color', 'textColor', widget.props.textColor)}
      {renderPositionAndSize()}
    </>
  );

  const renderMapProperties = () => (
    <>
      {renderTextInput('Latitude', 'latitude', widget.props.latitude?.toString())}
      {renderTextInput('Longitude', 'longitude', widget.props.longitude?.toString())}
      {renderSlider('Zoom', 'zoom', widget.props.zoom, 1, 20, 1)}
      {renderTextInput('Height', 'height', widget.props.height)}
      {renderSwitch('Show Marker', 'showMarker', widget.props.showMarker)}
      {renderTextInput('Marker Title', 'markerTitle', widget.props.markerTitle)}
      {renderSelect('Map Style', 'style', widget.props.style, [
        { value: 'streets', label: 'Streets' },
        { value: 'satellite', label: 'Satellite' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'terrain', label: 'Terrain' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderWeatherProperties = () => (
    <>
      {renderTextInput('Location', 'location', widget.props.location)}
      {renderSelect('Units', 'units', widget.props.units, [
        { value: 'metric', label: 'Celsius' },
        { value: 'imperial', label: 'Fahrenheit' }
      ])}
      {renderSwitch('Show Forecast', 'showForecast', widget.props.showForecast)}
      {renderSlider('Forecast Days', 'days', widget.props.days, 1, 7, 1)}
      {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Text Color', 'textColor', widget.props.textColor)}
      {renderPositionAndSize()}
    </>
  );

  const renderSocialShareProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Platforms</Label>
        {['facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp'].map((platform) => (
          <div key={platform} className="flex items-center gap-2">
            <Switch
              checked={widget.props.platforms?.includes(platform)}
              onCheckedChange={(checked) => {
                const platforms = widget.props.platforms || [];
                if (checked && !platforms.includes(platform)) {
                  handleUpdate('platforms', [...platforms, platform]);
                } else if (!checked) {
                  handleUpdate('platforms', platforms.filter((p: string) => p !== platform));
                }
              }}
            />
            <Label className="capitalize">{platform}</Label>
          </div>
        ))}
      </div>
      {renderSelect('Style', 'style', widget.props.style, [
        { value: 'buttons', label: 'Buttons' },
        { value: 'icons', label: 'Icons Only' }
      ])}
      {renderSwitch('Show Labels', 'showLabels', widget.props.showLabels)}
      {renderSelect('Size', 'size', widget.props.size, [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ])}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius)}
      {renderTextInput('Gap', 'gap', widget.props.gap)}
      {renderPositionAndSize()}
    </>
  );

  const renderRatingProperties = () => (
    <>
      {renderSlider('Value', 'value', widget.props.value, 0, widget.props.max || 5, 0.5)}
      {renderSlider('Max', 'max', widget.props.max, 3, 10, 1)}
      {renderTextInput('Size', 'size', widget.props.size)}
      {renderColorPicker('Color', 'color', widget.props.color)}
      {renderColorPicker('Empty Color', 'emptyColor', widget.props.emptyColor)}
      {renderSwitch('Read Only', 'readonly', widget.props.readonly)}
      {renderSwitch('Show Value', 'showValue', widget.props.showValue)}
      {renderPositionAndSize()}
    </>
  );

  const renderTimelineProperties = () => (
    <>
      <div className="space-y-3">
        <Label>Timeline Items</Label>
        {widget.props.items?.map((item: any, idx: number) => (
          <div key={idx} className="space-y-2 p-3 border rounded">
            <Input
              value={item.date}
              onChange={(e) => {
                const newItems = [...widget.props.items];
                newItems[idx].date = e.target.value;
                handleUpdate('items', newItems);
              }}
              placeholder="Date"
            />
            <Input
              value={item.title}
              onChange={(e) => {
                const newItems = [...widget.props.items];
                newItems[idx].title = e.target.value;
                handleUpdate('items', newItems);
              }}
              placeholder="Title"
            />
            <Textarea
              value={item.description}
              onChange={(e) => {
                const newItems = [...widget.props.items];
                newItems[idx].description = e.target.value;
                handleUpdate('items', newItems);
              }}
              placeholder="Description"
            />
          </div>
        ))}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUpdate('items', [...(widget.props.items || []), { date: '', title: '', description: '' }])}
        >
          Add Item
        </Button>
      </div>
      {renderSelect('Orientation', 'orientation', widget.props.orientation, [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' }
      ])}
      {renderColorPicker('Line Color', 'lineColor', widget.props.lineColor)}
      {renderColorPicker('Dot Color', 'dotColor', widget.props.dotColor)}
      {renderSwitch('Alternating', 'alternating', widget.props.alternating)}
      {renderPositionAndSize()}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Widget Info Badge */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg text-blue-900 dark:text-blue-100 capitalize">
            {widget.type}
          </span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">ID: {widget.id}</p>
      </div>

      {/* Widget-specific properties */}
      <div className="space-y-4">
        {widget.type === 'heading' && renderHeadingProperties()}
        {widget.type === 'text' && renderTextProperties()}
        {widget.type === 'image' && renderImageProperties()}
        {widget.type === 'button' && renderButtonProperties()}
        {widget.type === 'video' && renderVideoProperties()}
        {widget.type === 'section' && renderSectionProperties()}
        {widget.type === 'divider' && renderDividerProperties()}
        {widget.type === 'accordion' && renderAccordionProperties()}
        {widget.type === 'form' && renderFormProperties()}
        {widget.type === 'cta' && renderCTAProperties()}
        {widget.type === 'card' && renderCardProperties()}
        {widget.type === 'alert' && renderAlertProperties()}
        {widget.type === 'social' && renderSocialProperties()}
        {widget.type === 'icon' && renderIconProperties()}
        {widget.type === 'column' && renderColumnProperties()}
        
        {/* Navigation widgets */}
        {widget.type === 'navbar' && renderNavbarProperties()}
        {widget.type === 'footer' && renderFooterProperties()}
        {widget.type === 'breadcrumb' && renderBreadcrumbProperties()}
        
        {/* Data Display widgets */}
        {widget.type === 'table' && renderTableProperties()}
        {widget.type === 'list' && renderListProperties()}
        {widget.type === 'progressBar' && renderProgressBarProperties()}
        {widget.type === 'stats' && renderStatsProperties()}
        
        {/* Forms & Inputs widgets */}
        {widget.type === 'searchBar' && renderSearchBarProperties()}
        {widget.type === 'newsletter' && renderNewsletterProperties()}
        {widget.type === 'contactInfo' && renderContactInfoProperties()}
        
        {/* Media widgets */}
        {widget.type === 'gallery' && renderGalleryProperties()}
        {widget.type === 'carousel' && renderCarouselProperties()}
        {widget.type === 'audioPlayer' && renderAudioPlayerProperties()}
        
        {/* Commerce widgets */}
        {widget.type === 'productCard' && renderProductCardProperties()}
        {widget.type === 'pricing' && renderPricingProperties()}
        {widget.type === 'testimonial' && renderTestimonialProperties()}
        
        {/* Special widgets */}
        {widget.type === 'countdown' && renderCountdownProperties()}
        {widget.type === 'map' && renderMapProperties()}
        {widget.type === 'weather' && renderWeatherProperties()}
        {widget.type === 'socialShare' && renderSocialShareProperties()}
        {widget.type === 'rating' && renderRatingProperties()}
        {widget.type === 'timeline' && renderTimelineProperties()}
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground">Quick Actions</h4>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => onDuplicate(widget)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate Widget
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start"
          onClick={() => onDelete(widget.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Widget
        </Button>
      </div>
    </div>
  );
}
