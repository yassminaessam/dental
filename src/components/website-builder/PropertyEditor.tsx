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
  type ColorPickerOptions = {
    onChange?: (value: string) => void;
  };

  const renderColorPicker = (
    label: string,
    prop: string,
    value: string,
    options?: ColorPickerOptions
  ) => {
    const resolvedValue = value || '';

    const handleValueChange = (newValue: string) => {
      if (options?.onChange) {
        options.onChange(newValue);
      } else {
        handleUpdate(prop, newValue);
      }
    };

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={/^#([0-9A-Fa-f]{3}){1,2}$/.test(resolvedValue) ? resolvedValue : '#000000'}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-20 h-10 cursor-pointer"
          />
          <Input
            value={resolvedValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 font-mono text-sm"
          />
        </div>
      </div>
    );
  };

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
        { value: '1.25rem', label: 'Large' },
        { value: '1.5rem', label: 'XL' }
      ])}
      {renderSelect('Font Weight', 'fontWeight', widget.props.fontWeight || 'normal', [
        { value: '300', label: 'Light (300)' },
        { value: '400', label: 'Regular (400)' },
        { value: '500', label: 'Medium (500)' },
        { value: '600', label: 'Semibold (600)' },
        { value: '700', label: 'Bold (700)' }
      ])}
      {renderTextInput('Font Family', 'fontFamily', widget.props.fontFamily || 'inherit', 'e.g., Inter, "Open Sans"')}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || 'transparent')}
      {renderAlignment('textAlign', widget.props.textAlign || 'left')}
      {renderSelect('Line Height', 'lineHeight', widget.props.lineHeight || '1.5', [
        { value: '1', label: 'Tight (1)' },
        { value: '1.25', label: 'Snug (1.25)' },
        { value: '1.5', label: 'Normal (1.5)' },
        { value: '1.75', label: 'Relaxed (1.75)' },
        { value: '2', label: 'Loose (2)' }
      ])}
      {renderTextInput('Letter Spacing', 'letterSpacing', widget.props.letterSpacing || 'normal', 'e.g., normal, 0.05em, 1px')}
      {renderSelect('Text Transform', 'textTransform', widget.props.textTransform || 'none', [
        { value: 'none', label: 'None' },
        { value: 'uppercase', label: 'Uppercase' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'capitalize', label: 'Capitalize' }
      ])}
      {renderSelect('Text Decoration', 'textDecoration', widget.props.textDecoration || 'none', [
        { value: 'none', label: 'None' },
        { value: 'underline', label: 'Underline' },
        { value: 'line-through', label: 'Strikethrough' },
        { value: 'overline', label: 'Overline' }
      ])}
      {renderTextInput('Margin', 'margin', widget.props.margin || '0 0 1rem', 'CSS margin e.g., 0 0 1rem')}
      {renderTextInput('Padding', 'padding', widget.props.padding || '0', 'CSS padding e.g., 0.5rem 0')}
      {renderTextInput('Text Shadow', 'textShadow', widget.props.textShadow || 'none', 'e.g., 0 1px 2px rgba(0,0,0,0.1)')}
      {renderPositionAndSize()}
    </>
  );

  const renderImageProperties = () => {
    const opacityValue = widget.props.opacity !== undefined && widget.props.opacity !== ''
      ? parseFloat(widget.props.opacity)
      : 1;
    const safeOpacity = Number.isNaN(opacityValue) ? 1 : opacityValue;

    return (
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
        {renderSelect('Image Alignment', 'align', widget.props.align || 'center', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'stretch', label: 'Stretch' }
        ])}
        {renderTextInput('Margin', 'margin', widget.props.margin || '0 0 1.5rem', 'CSS margin e.g., 0 auto 2rem')}
        {renderTextInput('Padding', 'padding', widget.props.padding || '0', 'Inner padding e.g., 0.5rem')}
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#f8fafc')}
        {renderSelect('Object Fit', 'objectFit', widget.props.objectFit || 'cover', [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
          { value: 'none', label: 'None' },
          { value: 'scale-down', label: 'Scale Down' }
        ])}
        {renderSelect('Object Position', 'objectPosition', widget.props.objectPosition || 'center', [
          { value: 'center', label: 'Center' },
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
          { value: 'left top', label: 'Top Left' },
          { value: 'right top', label: 'Top Right' },
          { value: 'left bottom', label: 'Bottom Left' },
          { value: 'right bottom', label: 'Bottom Right' }
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
        {renderSelect('Hover Effect', 'hoverEffect', widget.props.hoverEffect || 'none', [
          { value: 'none', label: 'None' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'lift', label: 'Lift' },
          { value: 'fade', label: 'Fade' }
        ])}
        {renderTextInput('Transition', 'transition', widget.props.transition || 'transform 0.3s ease, box-shadow 0.3s ease', 'CSS transition e.g., transform 0.3s ease')}
        {renderSlider('Opacity', 'opacity', safeOpacity, 0, 1, 0.1)}
        {renderSelect('Filter', 'filter', widget.props.filter || 'none', [
          { value: 'none', label: 'None' },
          { value: 'grayscale(100%)', label: 'Grayscale' },
          { value: 'sepia(100%)', label: 'Sepia' },
          { value: 'blur(5px)', label: 'Blur' },
          { value: 'brightness(150%)', label: 'Bright' },
          { value: 'contrast(200%)', label: 'High Contrast' }
        ])}
        {renderTextInput('Link URL', 'link', widget.props.link || '', 'Optional link URL')}
        {renderSwitch('Open Link in New Tab', 'openInNewTab', widget.props.openInNewTab || false, 'Opens image link in a new tab')}
        {renderTextInput('Link rel Attribute', 'linkRel', widget.props.linkRel || 'noopener noreferrer', 'rel attribute for SEO/security')}
        {renderSwitch('Show Caption', 'showCaption', widget.props.showCaption || false, 'Display caption below image')}
        {widget.props.showCaption && (
          <div className="space-y-2">
            {renderTextInput('Caption Text', 'caption', widget.props.caption || '', 'Describe the image...')}
            {renderColorPicker('Caption Color', 'captionColor', widget.props.captionColor || '#4b5563')}
            {renderSelect('Caption Align', 'captionAlign', widget.props.captionAlign || 'center', [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' }
            ])}
            {renderTextInput('Caption Size', 'captionSize', widget.props.captionSize || '0.875rem', 'e.g., 0.875rem, 14px')}
          </div>
        )}
        {renderSelect('Loading', 'loading', widget.props.loading || 'lazy', [
          { value: 'lazy', label: 'Lazy' },
          { value: 'eager', label: 'Eager' }
        ])}
        {renderPositionAndSize()}
      </>
    );
  };

  const renderButtonProperties = () => (
    <>
      {renderTextInput('Button Text', 'text', widget.props.text, 'Enter button text...')}
      {renderTextInput('Link URL', 'link', widget.props.link, 'https://...')}
      {renderSwitch('Open Link in New Tab', 'openInNewTab', widget.props.openInNewTab || false, 'Opens the link in a new browser tab')}
      {renderTextInput('Rel Attribute', 'linkRel', widget.props.linkRel || 'noopener noreferrer', 'e.g., noopener noreferrer')}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor)}
      {renderColorPicker('Text Color', 'color', widget.props.color)}
      {renderColorPicker('Hover Background Color', 'hoverBackgroundColor', widget.props.hoverBackgroundColor || widget.props.backgroundColor)}
      {renderColorPicker('Hover Text Color', 'hoverColor', widget.props.hoverColor || widget.props.color)}
      {renderSelect('Size', 'size', widget.props.size || 'medium', [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ])}
      {renderTextInput('Custom Padding', 'padding', widget.props.padding || '', 'e.g., 0.75rem 1.5rem (leave empty for preset)')}
      {renderTextInput('Font Size', 'fontSize', widget.props.fontSize || '', 'e.g., 1rem (leave empty for preset)')}
      {renderSelect('Font Weight', 'fontWeight', widget.props.fontWeight || '600', [
        { value: '400', label: 'Light (400)' },
        { value: '500', label: 'Medium (500)' },
        { value: '600', label: 'Semibold (600)' },
        { value: '700', label: 'Bold (700)' }
      ])}
      {renderSelect('Text Transform', 'textTransform', widget.props.textTransform || 'none', [
        { value: 'none', label: 'None' },
        { value: 'uppercase', label: 'Uppercase' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'capitalize', label: 'Capitalize' }
      ])}
      {renderTextInput('Letter Spacing', 'letterSpacing', widget.props.letterSpacing || 'normal', 'e.g., normal, 0.05em, 1px')}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.375rem', '8px, 16px, 24px...')}
      {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0px', '0px, 1px, 2px...')}
      {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#0066cc')}
      {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'double', label: 'Double' }
      ])}
      {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'e.g., 0 4px 12px rgba(0,0,0,0.15)')}
      {renderTextInput('Hover Box Shadow', 'hoverBoxShadow', widget.props.hoverBoxShadow || widget.props.boxShadow || 'none', 'Hover shadow e.g., 0 6px 14px rgba(0,0,0,0.2)')}
      {renderSelect('Content Alignment', 'align', widget.props.align || 'center', [
        { value: 'flex-start', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'Right' }
      ])}
      {renderSwitch('Full Width', 'fullWidth', widget.props.fullWidth || false, 'Button spans full container width')}
      {renderTextInput('Transition', 'transition', widget.props.transition || 'all 0.2s ease', 'CSS transition e.g., all 0.2s ease')}
      {renderSwitch('Disabled', 'disabled', widget.props.disabled || false, 'Disable button interactions')}
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
      {renderColorPicker('Container Background', 'containerBackground', widget.props.containerBackground || 'transparent')}
      {renderColorPicker('Header Background', 'headerBackground', widget.props.headerBackground || '#f8fafc')}
      {renderColorPicker('Header Hover Background', 'headerHoverBackground', widget.props.headerHoverBackground || '#eef2ff')}
      {renderColorPicker('Header Text Color', 'headerTextColor', widget.props.headerTextColor || '#0f172a')}
      {renderColorPicker('Content Background', 'contentBackground', widget.props.contentBackground || '#ffffff')}
      {renderColorPicker('Content Text Color', 'contentTextColor', widget.props.contentTextColor || '#4b5563')}
      {renderTextInput('Title Font Size', 'titleFontSize', widget.props.titleFontSize || '1rem', 'e.g., 1rem, 18px')}
      {renderTextInput('Content Font Size', 'contentFontSize', widget.props.contentFontSize || '0.95rem', 'e.g., 0.95rem, 16px')}
      {renderTextInput('Header Padding', 'headerPadding', widget.props.headerPadding || '1rem 1.25rem', 'CSS padding e.g., 1rem 1.25rem')}
      {renderTextInput('Content Padding', 'contentPadding', widget.props.contentPadding || '1rem 1.25rem', 'CSS padding')}
      {renderTextInput('Gap', 'gap', widget.props.gap || '0.75rem', 'Spacing between title and icon')}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.75rem', '0px, 8px, 16px...')}
      {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px', '0px, 1px, 2px...')}
      {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e5e7eb')}
      {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'double', label: 'Double' }
      ])}
      {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'e.g., 0 10px 25px rgba(0,0,0,0.08)')}
      {renderSelect('Icon Style', 'iconShape', widget.props.iconShape || 'chevron', [
        { value: 'chevron', label: 'Chevron' },
        { value: 'caret', label: 'Caret' },
        { value: 'plus', label: 'Plus / Minus' }
      ])}
      {renderSelect('Icon Position', 'iconPosition', widget.props.iconPosition || 'right', [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' }
      ])}
      {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor || '#0f172a')}
      {renderColorPicker('Icon Background', 'iconBackground', widget.props.iconBackground || 'transparent')}
      {renderTextInput('Icon Size', 'iconSize', widget.props.iconSize || '1.125rem', 'e.g., 1rem, 18px')}
      {renderTextInput('Transition', 'transition', widget.props.transition || 'all 0.25s ease', 'CSS transition')}
      {renderSwitch('Show Divider', 'showDivider', widget.props.showDivider || false, 'Display a divider between header and content')}
      {widget.props.showDivider && (
        renderColorPicker('Divider Color', 'dividerColor', widget.props.dividerColor || '#e5e7eb')
      )}
      {renderSwitch('Show Content Border', 'showContentBorder', widget.props.showContentBorder || false, 'Add a border above the content area')}
      {widget.props.showContentBorder && (
        renderColorPicker('Content Border Color', 'contentBorderColor', widget.props.contentBorderColor || '#e5e7eb')
      )}
      {renderPositionAndSize()}
    </>
  );

  const renderFormProperties = () => (
    <>
      {renderTextInput('Form Title', 'title', widget.props.title || '', 'Contact Form')}
      {renderTextarea('Description', 'description', widget.props.description || '', 'We would love to hear from you...')}
      {renderTextInput('Submit Text', 'submitText', widget.props.submitText, 'Submit, Send, Contact Us...')}
      {renderTextInput('Action URL', 'action', widget.props.action || '', 'Form submission URL')}
      {renderSelect('HTTP Method', 'method', widget.props.method || 'POST', [
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' }
      ])}
      <div className="space-y-2">
        <Label>Form Fields (comma-separated)</Label>
        <Input
          value={widget.props.fields?.join(', ') || ''}
          onChange={(e) => handleUpdate('fields', e.target.value.split(',').map(f => f.trim()).filter(Boolean))}
          placeholder="name, email, phone, message"
        />
        <p className="text-xs text-muted-foreground">Example: name, email, phone, message</p>
      </div>
      {renderSelect('Columns', 'columns', String(widget.props.columns || 1), [
        { value: '1', label: 'Single Column' },
        { value: '2', label: 'Two Columns' }
      ])}
      {renderTextInput('Field Gap', 'gap', widget.props.gap || '1rem', 'Spacing between fields e.g., 1rem')}
      {renderTextInput('Padding', 'padding', widget.props.padding || '1.5rem', 'Form padding e.g., 1.5rem')}
      {renderColorPicker('Container Background', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
      {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#4b5563')}
      {renderSelect('Title Alignment', 'titleAlign', widget.props.titleAlign || 'left', [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ])}
      {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e5e7eb')}
      {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px', '0px, 1px, 2px...')}
      {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'double', label: 'Double' }
      ])}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.75rem', '8px, 16px...')}
      {renderTextInput('Box Shadow', 'shadow', widget.props.shadow || '0 10px 25px rgba(0,0,0,0.05)', 'CSS shadow value')}
      {renderSwitch('Show Labels', 'showLabels', widget.props.showLabels !== false, 'Toggle field labels visibility')}
      {renderColorPicker('Label Color', 'labelColor', widget.props.labelColor || '#111827')}
      {renderTextInput('Label Font Size', 'labelFontSize', widget.props.labelFontSize || '0.95rem', 'Font size e.g., 0.95rem')}
      {renderColorPicker('Input Background', 'inputBackground', widget.props.inputBackground || '#ffffff')}
      {renderColorPicker('Input Text Color', 'inputTextColor', widget.props.inputTextColor || '#111827')}
      {renderColorPicker('Input Placeholder Color', 'inputPlaceholderColor', widget.props.inputPlaceholderColor || '#9ca3af')}
      {renderColorPicker('Input Border Color', 'inputBorderColor', widget.props.inputBorderColor || '#d1d5db')}
      {renderTextInput('Input Border Width', 'inputBorderWidth', widget.props.inputBorderWidth || '1px', '0px, 1px, 2px...')}
      {renderSelect('Input Border Style', 'inputBorderStyle', widget.props.inputBorderStyle || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'double', label: 'Double' }
      ])}
      {renderTextInput('Input Border Radius', 'inputBorderRadius', widget.props.inputBorderRadius || '0.5rem', '6px, 12px...')}
      {renderTextInput('Input Padding', 'inputPadding', widget.props.inputPadding || '0.75rem', '0.75rem, 1rem...')}
      {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#2563eb')}
      {renderColorPicker('Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#1d4ed8')}
      {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#ffffff')}
      {renderTextInput('Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.75rem 1.5rem', 'e.g., 0.75rem 1.5rem')}
      {renderTextInput('Button Border Radius', 'buttonBorderRadius', widget.props.buttonBorderRadius || '0.5rem', '8px, 9999px...')}
      {renderSwitch('Button Full Width', 'buttonFullWidth', widget.props.buttonFullWidth !== false, 'Make submit button span full width')}
      {renderPositionAndSize()}
    </>
  );

  const renderCTAProperties = () => {
    const overlayRaw = widget.props.overlayOpacity;
    const overlayOpacity = typeof overlayRaw === 'number'
      ? overlayRaw
      : parseFloat(overlayRaw) || 0.65;
    const safeOverlayOpacity = Math.max(0, Math.min(1, overlayOpacity));

    return (
      <>
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Content</h3>
        {renderTextInput('Heading', 'heading', widget.props.heading, 'Call to action heading...')}
        {renderTextInput('Description', 'description', widget.props.description || '', 'Optional description...', true)}
        {renderSwitch('Show Badge', 'showBadge', widget.props.showBadge !== false, 'Display badge / eyebrow text above the heading')}
        {widget.props.showBadge !== false && (
          <div className="space-y-3">
            {renderTextInput('Badge Text', 'badgeText', widget.props.badgeText || '', 'Limited Offer, New, Hot Deal...')}
            {renderTextInput('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(255,255,255,0.15)', 'CSS color e.g., rgba(255,255,255,0.15)')}
            {renderColorPicker('Badge Text Color', 'badgeColor', widget.props.badgeColor || '#ffffff')}
            {renderTextInput('Badge Padding', 'badgePadding', widget.props.badgePadding || '0.25rem 0.75rem', 'Padding e.g., 0.25rem 0.75rem')}
            {renderTextInput('Badge Letter Spacing', 'badgeLetterSpacing', widget.props.badgeLetterSpacing || '0.1em', 'Tracking e.g., 0.1em')}
          </div>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Spacing</h3>
        {renderSelect('Content Alignment', 'alignment', widget.props.alignment || 'center', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ])}
        {renderSelect('Buttons Alignment', 'buttonsAlignment', widget.props.buttonsAlignment || widget.props.alignment || 'center', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ])}
        {renderTextInput('Content Max Width', 'contentMaxWidth', widget.props.contentMaxWidth || '640px', 'e.g., 640px, 60%')}
        {renderTextInput('Content Gap', 'contentGap', widget.props.contentGap || '1rem', 'Spacing between CTA elements')}
        {renderTextInput('Buttons Gap', 'buttonsGap', widget.props.buttonsGap || '0.75rem', 'Spacing between action buttons')}
        {renderTextInput('Padding', 'padding', widget.props.padding || '3rem', 'Inner spacing e.g., 3rem 2rem')}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1.5rem', 'Rounded corners e.g., 1.5rem')}
        {renderTextInput('Box Shadow', 'shadow', widget.props.shadow || '0 25px 70px rgba(15,23,42,0.35)', 'CSS box-shadow value')}
        {renderSwitch('Full Width Buttons', 'buttonsFullWidth', widget.props.buttonsFullWidth || false, 'Stretch action buttons to fill available width')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Background & Overlay</h3>
        {renderColorPicker(
          'Background Color',
          'backgroundColor',
          widget.props.backgroundColor || '#0f172a',
          {
            onChange: (val) => {
              handleUpdateMultiple({
                backgroundColor: val,
                ...(widget.props.useBackgroundGradient !== false ? { useBackgroundGradient: false } : {})
              });
            }
          }
        )}
        {renderSwitch(
          'Enable Background Gradient',
          'useBackgroundGradient',
          widget.props.useBackgroundGradient !== false,
          'Toggle a gradient overlay on top of the base color'
        )}
        {widget.props.useBackgroundGradient !== false && (
          renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'CSS gradient e.g., linear-gradient(...)')
        )}
        {renderTextInput('Background Image URL', 'backgroundImage', widget.props.backgroundImage || '', 'https://example.com/image.jpg')}
        {renderSwitch('Show Overlay', 'showOverlay', widget.props.showOverlay !== false, 'Apply a translucent overlay on top of the background')}
        {widget.props.showOverlay !== false && (
          <>
            {renderTextInput('Overlay Color', 'overlayColor', widget.props.overlayColor || '#0f172a', 'CSS color (hex, rgba, etc.)')}
            {renderSlider('Overlay Opacity', 'overlayOpacity', safeOverlayOpacity, 0, 1, 0.05)}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Typography & Colors</h3>
        {renderColorPicker('Heading Color', 'headingColor', widget.props.headingColor || widget.props.textColor || '#ffffff')}
        {renderTextInput('Heading Font Size', 'headingSize', widget.props.headingSize || '2.5rem', 'e.g., 2.5rem, 48px')}
        {renderSelect('Heading Weight', 'headingWeight', widget.props.headingWeight || '700', [
          { value: '400', label: 'Regular (400)' },
          { value: '500', label: 'Medium (500)' },
          { value: '600', label: 'Semibold (600)' },
          { value: '700', label: 'Bold (700)' },
          { value: '800', label: 'Extra Bold (800)' }
        ])}
        {renderColorPicker('Body Text Color', 'color', widget.props.color || widget.props.textColor || '#ffffff')}
        {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#f8fafc')}
        {renderTextInput('Description Font Size', 'descriptionSize', widget.props.descriptionSize || '1.125rem', 'e.g., 1rem, 18px')}
        {renderTextInput('Description Max Width', 'descriptionMaxWidth', widget.props.descriptionMaxWidth || '560px', 'Limit paragraph width, e.g., 560px')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Button</h3>
        {renderTextInput('Primary Button Text', 'buttonText', widget.props.buttonText || 'Get Started', 'Get Started, Book Now...')}
        {renderTextInput('Primary Button Link', 'link', widget.props.link || '', 'https://...')}
        {renderSwitch('Open in New Tab', 'buttonNewTab', widget.props.buttonNewTab || false, 'Opens the primary button link in a new tab')}
        {renderTextInput('Primary Button rel Attribute', 'buttonRel', widget.props.buttonRel || 'noopener noreferrer', 'rel attribute for SEO/security')}
        {renderSelect('Primary Button Style', 'buttonStyle', widget.props.buttonStyle || 'solid', [
          { value: 'solid', label: 'Solid' },
          { value: 'outline', label: 'Outline' }
        ])}
        {renderColorPicker('Primary Button Background', 'buttonBackground', widget.props.buttonBackground || '#ffffff')}
        {renderColorPicker('Primary Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#0f172a')}
        {renderColorPicker('Primary Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#f1f5f9')}
        {renderColorPicker('Primary Button Hover Text Color', 'buttonHoverColor', widget.props.buttonHoverColor || widget.props.buttonTextColor || '#0f172a')}
        {renderTextInput('Primary Button Border Width', 'buttonBorderWidth', widget.props.buttonBorderWidth || '0px', '0px, 1px, 2px...')}
        {renderColorPicker('Primary Button Border Color', 'buttonBorderColor', widget.props.buttonBorderColor || widget.props.buttonTextColor || '#0f172a')}
        {renderTextInput('Primary Button Border Radius', 'buttonBorderRadius', widget.props.buttonBorderRadius || '999px', 'e.g., 0.75rem, 999px')}
        {renderTextInput('Primary Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.9rem 2.4rem', 'e.g., 0.75rem 1.5rem')}
        {renderTextInput('Button Transition', 'buttonTransition', widget.props.buttonTransition || 'all 0.2s ease', 'CSS transition')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary Button</h3>
        {renderSwitch('Show Secondary Button', 'showSecondaryButton', widget.props.showSecondaryButton || false, {
          description: 'Display a secondary action button',
          onChange: (checked) => {
            handleUpdate('showSecondaryButton', checked);
            if (checked && !widget.props.secondaryButtonText) {
              handleUpdate('secondaryButtonText', 'Learn More');
            }
          }
        })}
        {widget.props.showSecondaryButton && (
          <div className="space-y-3">
            {renderTextInput('Secondary Button Text', 'secondaryButtonText', widget.props.secondaryButtonText || 'Learn More', 'Learn More, Contact Us...')}
            {renderTextInput('Secondary Button Link', 'secondaryButtonLink', widget.props.secondaryButtonLink || '', 'https://...')}
            {renderSwitch('Open Secondary in New Tab', 'secondaryButtonNewTab', widget.props.secondaryButtonNewTab || false, 'Open secondary button link in a new tab')}
            {renderTextInput('Secondary Button rel Attribute', 'secondaryButtonRel', widget.props.secondaryButtonRel || 'noopener noreferrer', 'rel attribute for SEO/security')}
            {renderSelect('Secondary Button Style', 'secondaryButtonStyle', widget.props.secondaryButtonStyle || 'outline', [
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
              { value: 'ghost', label: 'Ghost' }
            ])}
            {renderTextInput('Secondary Button Background', 'secondaryButtonBackground', widget.props.secondaryButtonBackground || 'transparent', 'CSS color or gradient')}
            {renderColorPicker('Secondary Button Text Color', 'secondaryButtonTextColor', widget.props.secondaryButtonTextColor || '#ffffff')}
            {renderTextInput('Secondary Button Hover Background', 'secondaryButtonHoverBackground', widget.props.secondaryButtonHoverBackground || 'rgba(255,255,255,0.12)', 'CSS color for hover state')}
            {renderColorPicker('Secondary Button Hover Text Color', 'secondaryButtonHoverColor', widget.props.secondaryButtonHoverColor || widget.props.secondaryButtonTextColor || '#ffffff')}
            {renderTextInput('Secondary Button Border Width', 'secondaryButtonBorderWidth', widget.props.secondaryButtonBorderWidth || '1px', '0px, 1px, 2px...')}
            {renderTextInput('Secondary Button Border Color', 'secondaryButtonBorderColor', widget.props.secondaryButtonBorderColor || 'rgba(255,255,255,0.55)', 'CSS color for border')}
            {renderTextInput('Secondary Button Border Radius', 'secondaryButtonBorderRadius', widget.props.secondaryButtonBorderRadius || '999px', 'Rounded corners e.g., 0.75rem, 999px')}
            {renderTextInput('Secondary Button Padding', 'secondaryButtonPadding', widget.props.secondaryButtonPadding || '0.9rem 2.2rem', 'Spacing e.g., 0.75rem 1.5rem')}
          </div>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderCardProperties = () => (
    <>
      {renderTextInput('Title', 'title', widget.props.title, 'Card title...')}
      {renderTextInput('Content', 'content', widget.props.content, 'Card content...', true)}
      <ImageUpload
        value={widget.props.image || ''}
        onChange={(url) => handleUpdate('image', url)}
        label="Card Image"
      />
      {renderTextInput('Link URL', 'link', widget.props.link || '', 'Optional link')}
      {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
      {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.5rem', '8px, 16px...')}
      {renderTextInput('Padding', 'padding', widget.props.padding || '1.5rem', 'Card inner spacing e.g., 1.5rem')}
      {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 1px 3px rgba(0,0,0,0.1)', 'CSS shadow value')}
      {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px', 'Border width e.g., 1px')}
      {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e5e7eb')}
      {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ])}
      {renderPositionAndSize()}
    </>
  );

  const renderAlertProperties = () => {
    const iconOptions = [
      { value: 'AlertCircle', label: 'Alert Circle' },
      { value: 'Info', label: 'Info' },
      { value: 'Check', label: 'Check' },
      { value: 'Bell', label: 'Bell' },
      { value: 'HelpCircle', label: 'Help Circle' },
      { value: 'X', label: 'X' }
    ];

    return (
      <>
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Content</h3>
        {renderSelect('Variant', 'type', widget.props.type || 'info', [
          { value: 'info', label: 'Info' },
          { value: 'success', label: 'Success' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' }
        ])}
        {renderTextInput('Title', 'title', widget.props.title || '', 'Short headline...')}
        {renderTextInput('Message', 'message', widget.props.message || '', 'Main alert message...', true)}
        {renderTextInput('Message Line Height', 'messageLineHeight', widget.props.messageLineHeight || '1.5', 'e.g., 1.5, 1.75')}
        {renderSwitch('Show Description', 'showDescription', widget.props.showDescription !== false, 'Display additional supporting text')}
        {widget.props.showDescription !== false && (
          <>
            {renderTextInput('Description', 'description', widget.props.description || '', 'Optional supporting text...', true)}
            {renderTextInput('Description Line Height', 'descriptionLineHeight', widget.props.descriptionLineHeight || '1.5', 'e.g., 1.5, 1.75')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Alignment</h3>
        {renderSelect('Layout', 'layout', widget.props.layout || 'vertical', [
          { value: 'vertical', label: 'Stacked' },
          { value: 'horizontal', label: 'Inline' }
        ])}
        {renderSelect('Text Alignment', 'alignment', widget.props.alignment || 'left', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ])}
        {renderSwitch('Full Width', 'fullWidth', widget.props.fullWidth !== false, 'Alert spans the available width')}
        {renderTextInput('Padding', 'padding', widget.props.padding || '1rem 1.25rem', 'Spacing e.g., 1rem 1.25rem')}
        {renderTextInput('Content Gap', 'gap', widget.props.gap || '0.75rem', 'Spacing between icon/text/actions')}
        {renderTextInput('Text Gap', 'textGap', widget.props.textGap || '0.35rem', 'Spacing between lines of text')}
        {renderTextInput('Icon Gap', 'iconSpacing', widget.props.iconSpacing || '0.75rem', 'Spacing between icon and content')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Colors & Styles</h3>
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '')}
        {renderColorPicker('Text Color', 'textColor', widget.props.textColor || '')}
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '')}
        {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px', '0px, 1px, 2px...')}
        {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' },
          { value: 'none', label: 'None' }
        ])}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.75rem', 'Rounded corners e.g., 0.75rem')}
        {renderTextInput('Box Shadow', 'shadow', widget.props.shadow || 'none', 'CSS shadow value e.g., 0 4px 12px rgba(0,0,0,0.1)')}
        {renderSwitch('Accent Bar', 'accentEnabled', widget.props.accentEnabled || false, 'Display a colored accent bar')}        
        {widget.props.accentEnabled && (
          <>
            {renderColorPicker('Accent Color', 'accentColor', widget.props.accentColor || '')}
            {renderSelect('Accent Position', 'accentPosition', widget.props.accentPosition || 'left', [
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' }
            ])}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Icon</h3>
        {renderSwitch('Show Icon', 'showIcon', widget.props.showIcon !== false, 'Display an icon alongside the text')}
        {widget.props.showIcon !== false && (
          <div className="space-y-3">
            {renderSelect('Icon', 'icon', widget.props.icon || 'AlertCircle', iconOptions)}
            {renderTextInput('Icon Size', 'iconSize', widget.props.iconSize || '1.25rem', '1rem, 20px...')}
            {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor || '')}
            {renderColorPicker('Icon Background', 'iconBackground', widget.props.iconBackground || 'rgba(255,255,255,0.2)')}
          </div>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Actions</h3>
        {renderSwitch('Show Actions', 'showActions', widget.props.showActions || false, 'Display primary/secondary actions inside the alert')}
        {widget.props.showActions && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Primary Action</h4>
              {renderTextInput('Primary Text', 'primaryActionText', widget.props.primaryActionText || 'Resolve', 'Resolve, View details...')}
              {renderTextInput('Primary Link', 'primaryActionLink', widget.props.primaryActionLink || '', 'https://...')}
              {renderSelect('Primary Variant', 'primaryActionVariant', widget.props.primaryActionVariant || 'solid', [
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' }
              ])}
              {renderColorPicker('Primary Background', 'primaryActionBackground', widget.props.primaryActionBackground || '')}
              {renderColorPicker('Primary Text Color', 'primaryActionTextColor', widget.props.primaryActionTextColor || '')}
              {renderColorPicker('Primary Hover Background', 'primaryActionHoverBackground', widget.props.primaryActionHoverBackground || '')}
              {renderColorPicker('Primary Hover Text', 'primaryActionHoverTextColor', widget.props.primaryActionHoverTextColor || '')}
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Secondary Action</h4>
              {renderTextInput('Secondary Text', 'secondaryActionText', widget.props.secondaryActionText || 'Dismiss', 'Optional secondary action label')}
              {renderTextInput('Secondary Link', 'secondaryActionLink', widget.props.secondaryActionLink || '', 'https://...')}
              {renderSelect('Secondary Variant', 'secondaryActionVariant', widget.props.secondaryActionVariant || 'ghost', [
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' }
              ])}
              {renderColorPicker('Secondary Background', 'secondaryActionBackground', widget.props.secondaryActionBackground || 'transparent')}
              {renderColorPicker('Secondary Text Color', 'secondaryActionTextColor', widget.props.secondaryActionTextColor || '')}
              {renderColorPicker('Secondary Hover Background', 'secondaryActionHoverBackground', widget.props.secondaryActionHoverBackground || '')}
              {renderColorPicker('Secondary Hover Text', 'secondaryActionHoverTextColor', widget.props.secondaryActionHoverTextColor || '')}
            </div>
          </div>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Dismiss Button</h3>
        {renderSwitch('Dismissible', 'dismissible', widget.props.dismissible || false, 'Show a close button on the alert')}
        {widget.props.dismissible && (
          <div className="space-y-3">
            {renderTextInput('Close Label', 'closeLabel', widget.props.closeLabel || 'Dismiss', 'Accessible label for the close button')}
            {renderSelect('Close Button Variant', 'closeButtonVariant', widget.props.closeButtonVariant || 'ghost', [
              { value: 'ghost', label: 'Ghost' },
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' }
            ])}
            {renderColorPicker('Close Icon/Text Color', 'closeIconColor', widget.props.closeIconColor || '')}
          </div>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

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

  const renderIconProperties = () => {
    const opacityValue = widget.props.opacity !== undefined
      ? (typeof widget.props.opacity === 'number' ? widget.props.opacity : parseFloat(widget.props.opacity) || 1)
      : 1;
    const strokeValue = widget.props.strokeWidth !== undefined
      ? (typeof widget.props.strokeWidth === 'number' ? widget.props.strokeWidth : parseFloat(widget.props.strokeWidth) || 1.5)
      : 1.5;
    const rotationValue = widget.props.rotation !== undefined
      ? (typeof widget.props.rotation === 'number' ? widget.props.rotation : parseFloat(widget.props.rotation) || 0)
      : 0;

    return (
      <>
        <IconPicker
          value={widget.props.name || 'Globe'}
          uploadedIcon={widget.props.uploadedIcon}
          onChange={(iconName, uploadedUrl) => {
            handleUpdateMultiple({
              name: iconName,
              uploadedIcon: uploadedUrl || '',
              imageSrc: uploadedUrl || ''
            });
          }}
          size={widget.props.size || '2rem'}
          color={widget.props.color || '#0066cc'}
        />
        {renderTextInput('Size', 'size', widget.props.size, '1rem, 2rem, 3rem...')}
        {renderSlider('Stroke Width', 'strokeWidth', strokeValue, 0.5, 4, 0.1, 'px')}
        {renderColorPicker('Color', 'color', widget.props.color)}
        {renderColorPicker('Background', 'backgroundColor', widget.props.backgroundColor || 'transparent')}
        {renderColorPicker('Hover Color', 'hoverColor', widget.props.hoverColor || widget.props.color || '#0f172a')}
        {renderColorPicker('Hover Background', 'hoverBackground', widget.props.hoverBackground || widget.props.backgroundColor || 'transparent')}
        {renderTextInput('Padding', 'padding', widget.props.padding || '0.5rem', '0, 0.5rem, 1rem...')}
        {renderTextInput('Margin', 'margin', widget.props.margin || '0 auto 1rem', 'Margin e.g., 0 auto 1rem')}
        {renderSelect('Alignment', 'align', widget.props.align || 'center', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ])}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.5rem', '0px, 8px, 9999px...')}
        {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0px', '0px, 1px, 2px...')}
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e5e7eb')}
        {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' }
        ])}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'e.g., 0 6px 18px rgba(0,0,0,0.1)')}
        {renderTextInput('Hover Box Shadow', 'hoverBoxShadow', widget.props.hoverBoxShadow || widget.props.boxShadow || 'none', 'Shadow when hovering')}
        {renderTextInput('Hover Scale', 'hoverScale', widget.props.hoverScale || '1', '1, 1.05, 0.95...')}
        {renderTextInput('Transition', 'transition', widget.props.transition || 'transform 0.2s ease, box-shadow 0.2s ease', 'CSS transition')}
        {renderSlider('Opacity', 'opacity', opacityValue, 0.1, 1, 0.05)}
        {renderSlider('Rotation (deg)', 'rotation', rotationValue, -180, 360, 5, '°')}
        {renderSelect('Flip', 'flip', widget.props.flip || 'none', [
          { value: 'none', label: 'None' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
          { value: 'both', label: 'Both' }
        ])}
        {renderTextInput('Tooltip', 'tooltip', widget.props.tooltip || '', 'Optional hover tooltip')}
        {renderTextInput('Link URL', 'link', widget.props.link || '', 'https://...')}
        {renderSwitch('Open Link in New Tab', 'openInNewTab', widget.props.openInNewTab || false)}
        {renderTextInput('Link rel Attribute', 'linkRel', widget.props.linkRel || 'noopener noreferrer', 'rel attribute for the link')}
        {renderSwitch('Show Label', 'showLabel', widget.props.showLabel || false, 'Display text next to the icon')}
        {widget.props.showLabel && (
          <div className="space-y-3">
            {renderTextInput('Label Text', 'label', widget.props.label || '', 'Add supporting text')}
            {renderSelect('Label Position', 'labelPosition', widget.props.labelPosition || 'bottom', [
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' }
            ])}
            {renderColorPicker('Label Color', 'labelColor', widget.props.labelColor || '#1f2937')}
            {renderTextInput('Label Size', 'labelSize', widget.props.labelSize || '0.875rem', 'e.g., 0.875rem, 14px')}
            {renderTextInput('Label Spacing', 'labelSpacing', widget.props.labelSpacing || '0.25rem', 'Gap between icon and label')}
          </div>
        )}
        {renderPositionAndSize()}
      </>
    );
  };

  const renderColumnProperties = () => {
    const columnOpacity = widget.props.opacity !== undefined
      ? (typeof widget.props.opacity === 'number' ? widget.props.opacity : parseFloat(widget.props.opacity) || 1)
      : 1;

    return (
      <>
        <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Column Container</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            This is a column inside a section. Drag widgets here to add content.
          </p>
        </div>
        
        {renderTextInput('Padding', 'padding', widget.props.padding || '1rem', '0.5rem, 1rem, 2rem...')}
        {renderTextInput('Margin', 'margin', widget.props.margin || '0', '0 auto, 1rem, 2rem...')}
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || 'transparent')}
        {renderTextInput('Min Height', 'minHeight', widget.props.minHeight || '100px', '100px, 200px, 300px...')}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '0.5rem', '0px, 8px, 16px...')}
        {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px', '0px, 1px, 2px...')}
        {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'dashed', [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' }
        ])}
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || '#e0e0e0')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'e.g., 0 10px 20px rgba(0,0,0,0.08)')}
        {renderSlider('Opacity', 'opacity', columnOpacity, 0.1, 1, 0.05)}
        
        <div className="space-y-2">
          <Label>Width</Label>
          <p className="text-xs text-muted-foreground">
            Width is automatically managed by the parent section's grid layout.
          </p>
        </div>

        {renderPositionAndSize()}
      </>
    );
  };

  // Navigation widgets properties
  const renderNavbarProperties = () => {
    const navLinks = normalizeNavLinks(widget.props.links);
    const secondaryActionIcons = ['Phone', 'Mail', 'Calendar', 'User', 'ShoppingCart', 'Bell'];
    const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
    const togglePlatform = (platform: string, enabled: boolean) => {
      const current = Array.isArray(widget.props.socialPlatforms) ? widget.props.socialPlatforms : [];
      if (enabled && !current.includes(platform)) {
        handleUpdate('socialPlatforms', [...current, platform]);
      } else if (!enabled) {
        handleUpdate('socialPlatforms', current.filter((p: string) => p !== platform));
      }
    };

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
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Branding</h3>
        {renderTextInput('Logo Text', 'logoText', widget.props.logoText || '')}
        {renderSwitch('Show Tagline', 'showTagline', widget.props.showTagline || false, 'Display a short tagline next to the logo')}
        {widget.props.showTagline && renderTextInput('Tagline', 'tagline', widget.props.tagline || 'Quality Care For Every Smile')}
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

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Links Styling</h3>
        {renderSelect('Links Alignment', 'linksAlignment', widget.props.linksAlignment || 'between', [
          { value: 'start', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'between', label: 'Spread / Centered' },
          { value: 'end', label: 'Right' }
        ])}
        {renderColorPicker('Link Color', 'linkColor', widget.props.linkColor || widget.props.color || '#0f172a')}
        {renderColorPicker('Link Hover Color', 'linkHoverColor', widget.props.linkHoverColor || '#2563eb')}
        {renderColorPicker('Link Active Color', 'linkActiveColor', widget.props.linkActiveColor || '#1d4ed8')}
        {renderColorPicker('Link Hover Background', 'linkHoverBackground', widget.props.linkHoverBackground || 'rgba(37,99,235,0.08)')}
        {renderColorPicker('Link Active Background', 'linkActiveBackground', widget.props.linkActiveBackground || 'rgba(37,99,235,0.12)')}
        {renderSwitch('Uppercase Links', 'linkUppercase', widget.props.linkUppercase || false, 'Transform link labels to uppercase')}
        {renderTextInput('Link Gap', 'linkGap', widget.props.linkGap || '1.5rem', 'Spacing between links')}
        {renderTextInput('Link Padding', 'linkPadding', widget.props.linkPadding || '0.25rem 0.5rem', 'Clickable padding per link')}
        {renderTextInput('Link Border Radius', 'linkBorderRadius', widget.props.linkBorderRadius || '999px', 'Rounded corners for link pill')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        {renderTextInput('Container Max Width', 'containerMaxWidth', widget.props.containerMaxWidth || '1200px', 'e.g., 1200px, 100%')}
        {renderTextInput('Padding', 'padding', widget.props.padding || '0.75rem 2rem', 'Top/bottom + left/right padding')}
        {renderTextInput('Height', 'height', widget.props.height || '72px', 'Minimum navbar height')}
        {renderSelect('Position', 'position', widget.props.position || 'sticky', [
          { value: 'sticky', label: 'Sticky' },
          { value: 'fixed', label: 'Fixed' },
          { value: 'relative', label: 'Static' }
        ])}
        {widget.props.position === 'sticky' && (
          renderTextInput('Sticky Offset', 'stickyOffset', widget.props.stickyOffset || '0px', 'e.g., 0px, 24px')
        )}
        {renderSwitch('Show Shadow', 'shadow', widget.props.shadow ?? true, 'Adds a drop shadow beneath the navbar')}
        {renderSwitch('Show Divider', 'showDivider', widget.props.showDivider || false, 'Adds a subtle divider under the navbar')}
        {widget.props.showDivider && renderColorPicker('Divider Color', 'dividerColor', widget.props.dividerColor || 'rgba(15,23,42,0.08)')}
        {renderTextInput('Border Bottom', 'borderBottom', widget.props.borderBottom || '1px solid rgba(15,23,42,0.08)', 'CSS border value or none')}
        {renderTextInput('Rounded Corners', 'rounded', widget.props.rounded || '999px', '0px, 12px, 999px...')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Background & Colors</h3>
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
        {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'Optional CSS gradient e.g., linear-gradient(...)')}
        {renderColorPicker('Text Color', 'color', widget.props.color || '#1f2937')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Action Button</h3>
        {renderSwitch('Show Primary Button', 'showButton', widget.props.showButton || false, 'Display a call-to-action button on the right')}
        {widget.props.showButton && (
          <div className="space-y-3">
            {renderTextInput('Button Text', 'buttonText', widget.props.buttonText || 'Book Visit')}
            {renderTextInput('Button Link', 'buttonLink', widget.props.buttonLink || '#book')}
            {renderSelect('Button Variant', 'buttonVariant', widget.props.buttonVariant || 'solid', [
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
              { value: 'ghost', label: 'Ghost' }
            ])}
            {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#2563eb')}
            {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#ffffff')}
            {renderColorPicker('Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#1d4ed8')}
            {renderColorPicker('Button Hover Text Color', 'buttonHoverTextColor', widget.props.buttonHoverTextColor || '#ffffff')}
            {renderTextInput('Button Border Width', 'buttonBorderWidth', widget.props.buttonBorderWidth || '0px', '0px, 1px, 2px...')}
            {renderColorPicker('Button Border Color', 'buttonBorderColor', widget.props.buttonBorderColor || widget.props.buttonBackground || '#2563eb')}
            {renderTextInput('Button Border Radius', 'buttonBorderRadius', widget.props.buttonBorderRadius || '999px', 'Rounded corners e.g., 0.5rem, 999px')}
          </div>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary Actions & Social</h3>
        {renderSwitch('Show Secondary Action', 'showSecondaryAction', widget.props.showSecondaryAction || false, 'Display an icon action next to the button')}
        {widget.props.showSecondaryAction && (
          <div className="space-y-3">
            {renderSelect('Secondary Action Icon', 'secondaryActionIcon', widget.props.secondaryActionIcon || 'Phone', secondaryActionIcons.map((icon) => ({ value: icon, label: icon })))}
            {renderTextInput('Secondary Action Label', 'secondaryActionLabel', widget.props.secondaryActionLabel || 'Call Us')}
            {renderTextInput('Secondary Action Link', 'secondaryActionLink', widget.props.secondaryActionLink || '#contact')}
          </div>
        )}
        {renderSwitch('Show Social Icons', 'showSocialIcons', widget.props.showSocialIcons || false, 'Display quick social links on the right')}
        {widget.props.showSocialIcons && (
          <div className="space-y-2">
            <Label>Social Platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {socialPlatforms.map((platform) => (
                <div key={platform} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm capitalize">
                  <span>{platform}</span>
                  <Switch
                    checked={Array.isArray(widget.props.socialPlatforms) ? widget.props.socialPlatforms.includes(platform) : false}
                    onCheckedChange={(checked) => togglePlatform(platform, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

  const renderAnchorProperties = () => {
    const scrollMarginValue = typeof widget.props.scrollMargin === 'number'
      ? widget.props.scrollMargin
      : 120;

    const sanitizeAnchorId = (value: string) =>
      value
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .toLowerCase();

    return (
      <>
        <div className="space-y-2">
          <Label>Anchor ID</Label>
          <Input
            value={widget.props.anchorId || ''}
            onChange={(e) => handleUpdate('anchorId', sanitizeAnchorId(e.target.value))}
            placeholder="e.g., services, contact"
          />
          <p className="text-xs text-muted-foreground">
            Use this ID in links like <code className="font-mono text-[11px]">#services</code> to scroll here.
          </p>
        </div>
        {renderTextInput('Label (optional)', 'label', widget.props.label || '', 'Helper label for this anchor')}
        {renderTextarea('Helper Text', 'helperText', widget.props.helperText || '', 'Shown only in the editor to explain this anchor')}
        {renderSwitch('Show Label On Published Page', 'showLabel', widget.props.showLabel ?? false, 'Display an anchor badge on the live site')}
        {renderColorPicker('Indicator Color', 'indicatorColor', widget.props.indicatorColor || '#2563eb')}
        {renderSlider('Scroll Margin Top', 'scrollMargin', scrollMarginValue, 0, 300, 5, 'px')}
        {renderPositionAndSize()}
      </>
    );
  };

  // Data Display widgets properties
  const renderTableProperties = () => {
    const headers: string[] = Array.isArray(widget.props.headers) ? widget.props.headers : [];
    const rows: string[][] = Array.isArray(widget.props.rows) ? widget.props.rows : [];
    const rawAlignments: string[] = Array.isArray(widget.props.columnAlignments)
      ? widget.props.columnAlignments
      : [];

    const normalizeRows = (data: string[][]): string[][] => {
      return data.map((row) => {
        const next = [...row];
        while (next.length < headers.length) {
          next.push('');
        }
        if (next.length > headers.length) {
          next.splice(headers.length);
        }
        return next;
      });
    };

    const normalizedRows = normalizeRows(rows);
    const normalizedAlignments = headers.map((_, idx) => rawAlignments[idx] || 'left');

    const handleHeaderChange = (index: number, value: string) => {
      const updatedHeaders = [...headers];
      updatedHeaders[index] = value;
      handleUpdate('headers', updatedHeaders);
    };

    const handleAddHeader = () => {
      const newHeader = `Column ${headers.length + 1}`;
      const updatedHeaders = [...headers, newHeader];
      const updatedRows = normalizedRows.map((row) => [...row, '']);
      const updatedAlignments = [...normalizedAlignments, 'left'];
      handleUpdateMultiple({
        headers: updatedHeaders,
        rows: updatedRows,
        columnAlignments: updatedAlignments
      });
    };

    const handleRemoveHeader = (index: number) => {
      const updatedHeaders = headers.filter((_, idx) => idx !== index);
      const updatedRows = normalizedRows.map((row) => row.filter((_, idx) => idx !== index));
      const updatedAlignments = normalizedAlignments.filter((_, idx) => idx !== index);
      handleUpdateMultiple({
        headers: updatedHeaders,
        rows: updatedRows,
        columnAlignments: updatedAlignments
      });
    };

    const handleAlignmentChange = (index: number, value: string) => {
      const updated = [...normalizedAlignments];
      updated[index] = value;
      handleUpdate('columnAlignments', updated);
    };

    const handleRowChange = (rowIndex: number, cellIndex: number, value: string) => {
      const updatedRows = normalizedRows.map((row) => [...row]);
      if (!updatedRows[rowIndex]) return;
      updatedRows[rowIndex][cellIndex] = value;
      handleUpdate('rows', updatedRows);
    };

    const handleAddRow = () => {
      const template = headers.map(() => '');
      handleUpdate('rows', [...normalizedRows, template]);
    };

    const handleRemoveRow = (index: number) => {
      const updatedRows = normalizedRows.filter((_, idx) => idx !== index);
      handleUpdate('rows', updatedRows);
    };

    return (
      <>
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Data</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Headers</Label>
              <span className="text-xs text-muted-foreground">{headers.length} column{headers.length === 1 ? '' : 's'}</span>
            </div>
            {headers.length === 0 && (
              <p className="text-xs text-muted-foreground">Add at least one column to start populating the table.</p>
            )}
            <div className="space-y-3">
              {headers.map((header, idx) => (
                <div key={`${header}-${idx}`} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={header}
                      onChange={(e) => handleHeaderChange(idx, e.target.value)}
                      placeholder={`Column ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={headers.length <= 1}
                      onClick={() => handleRemoveHeader(idx)}
                      aria-label={`Remove column ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Alignment</span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant={normalizedAlignments[idx] === 'left' ? 'default' : 'outline'}
                        className="h-8 w-8"
                        onClick={() => handleAlignmentChange(idx, 'left')}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={normalizedAlignments[idx] === 'center' ? 'default' : 'outline'}
                        className="h-8 w-8"
                        onClick={() => handleAlignmentChange(idx, 'center')}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={normalizedAlignments[idx] === 'right' ? 'default' : 'outline'}
                        className="h-8 w-8"
                        onClick={() => handleAlignmentChange(idx, 'right')}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddHeader}>
              <Plus className="h-4 w-4 mr-2" /> Add Column
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Rows</Label>
              <span className="text-xs text-muted-foreground">{normalizedRows.length} row{normalizedRows.length === 1 ? '' : 's'}</span>
            </div>
            {normalizedRows.length === 0 && (
              <p className="text-xs text-muted-foreground">No rows yet. Use “Add Row” to create sample data.</p>
            )}
            <div className="space-y-3">
              {normalizedRows.map((row, rowIdx) => (
                <div key={`row-${rowIdx}`} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Row {rowIdx + 1}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveRow(rowIdx)}
                      aria-label={`Remove row ${rowIdx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {row.map((cell, cellIdx) => (
                      <Input
                        key={`row-${rowIdx}-cell-${cellIdx}`}
                        value={cell}
                        onChange={(e) => handleRowChange(rowIdx, cellIdx, e.target.value)}
                        placeholder={headers[cellIdx] || `Column ${cellIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" /> Add Row
            </Button>
          </div>
        </div>

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        {renderColorPicker('Table Background', 'tableBackground', widget.props.tableBackground || '#ffffff')}
        {renderTextInput('Table Padding', 'tablePadding', widget.props.tablePadding || '1.5rem')}
        {renderTextInput('Min Table Width', 'minTableWidth', widget.props.minTableWidth || '640px')}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1rem')}
        {renderSwitch('Show Border', 'bordered', widget.props.bordered ?? true)}
        {widget.props.bordered !== false && (
          <>
            {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px')}
            {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'rgba(15,23,42,0.12)')}
          </>
        )}
        {renderSwitch('Show Shadow', 'showShadow', widget.props.showShadow ?? true, 'Adds depth behind the table container')}
        {widget.props.showShadow !== false &&
          renderTextInput('Shadow', 'tableShadow', widget.props.tableShadow || '0 25px 45px rgba(15,23,42,0.08)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Header Styling</h3>
        {renderColorPicker('Header Background', 'headerBackground', widget.props.headerBackground || '#f8fafc')}
        {renderColorPicker('Header Text Color', 'headerColor', widget.props.headerColor || '#0f172a')}
        {renderTextInput('Header Font Size', 'headerFontSize', widget.props.headerFontSize || '0.75rem')}
        {renderTextInput('Header Font Weight', 'headerFontWeight', widget.props.headerFontWeight || '600')}
        {renderTextInput('Header Letter Spacing', 'headerLetterSpacing', widget.props.headerLetterSpacing || '0.08em')}
        {renderSelect('Header Text Transform', 'headerTextTransform', widget.props.headerTextTransform || 'uppercase', [
          { value: 'none', label: 'None' },
          { value: 'uppercase', label: 'Uppercase' },
          { value: 'capitalize', label: 'Capitalized' }
        ])}
        {renderTextInput('Header Padding', 'headerPadding', widget.props.headerPadding || '0.75rem 1rem')}
        {renderColorPicker('Header Divider Color', 'headerBorderColor', widget.props.headerBorderColor || 'rgba(15,23,42,0.12)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Rows & Cells</h3>
        {renderTextInput('Cell Padding', 'cellPadding', widget.props.cellPadding || '0.85rem 1rem')}
        {renderTextInput('Cell Font Size', 'cellFontSize', widget.props.cellFontSize || '0.95rem')}
        {renderColorPicker('Cell Text Color', 'cellColor', widget.props.cellColor || '#1f2937')}
        {renderColorPicker('Cell Background', 'cellBackground', widget.props.cellBackground || '#ffffff')}
        {renderSwitch('Striped Rows', 'striped', widget.props.striped ?? true)}
        {widget.props.striped !== false && renderColorPicker('Striped Row Color', 'stripedColor', widget.props.stripedColor || 'rgba(15,23,42,0.04)')}
        {renderSwitch('Row Hover Highlight', 'hoverable', widget.props.hoverable ?? true)}
        {widget.props.hoverable !== false && renderColorPicker('Row Hover Color', 'rowHoverColor', widget.props.rowHoverColor || 'rgba(37,99,235,0.08)')}
        {renderSwitch('Row Dividers', 'showRowDividers', widget.props.showRowDividers ?? true)}
        {widget.props.showRowDividers !== false && (
          <>
            {renderTextInput('Row Divider Width', 'rowBorderWidth', widget.props.rowBorderWidth || '1px')}
            {renderColorPicker('Row Divider Color', 'rowBorderColor', widget.props.rowBorderColor || 'rgba(15,23,42,0.08)')}
          </>
        )}
        {renderSwitch('Column Dividers', 'showColumnDividers', widget.props.showColumnDividers || false)}
        {widget.props.showColumnDividers && (
          <>
            {renderTextInput('Column Divider Width', 'columnDividerWidth', widget.props.columnDividerWidth || '1px')}
            {renderColorPicker('Column Divider Color', 'columnDividerColor', widget.props.columnDividerColor || 'rgba(15,23,42,0.08)')}
          </>
        )}
        {renderSlider('Visible Rows (preview)', 'maxVisibleRows', widget.props.maxVisibleRows ?? 4, 1, 8, 1, '')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Caption & Toolbar</h3>
        {renderSwitch('Show Caption', 'showCaption', widget.props.showCaption ?? true)}
        {widget.props.showCaption !== false && (
          <>
            {renderTextInput('Caption', 'caption', widget.props.caption || 'Recent Performance')}
            {renderSelect('Caption Position', 'captionPosition', widget.props.captionPosition || 'top', [
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' }
            ])}
            {renderSelect('Caption Align', 'captionAlign', widget.props.captionAlign || 'left', [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'between', label: 'Spread' },
              { value: 'right', label: 'Right' }
            ])}
          </>
        )}

        {renderSwitch('Show Toolbar', 'showToolbar', widget.props.showToolbar ?? true)}
        {widget.props.showToolbar !== false && (
          <>
            {renderTextInput('Toolbar Title', 'toolbarTitle', widget.props.toolbarTitle || 'Team KPIs')}
            {renderTextarea('Toolbar Description', 'toolbarDescription', widget.props.toolbarDescription || 'Snapshot of efficiency across the practice')}
            {renderTextInput('Action Label', 'toolbarActionText', widget.props.toolbarActionText || 'View All')}
            {renderTextInput('Action Link', 'toolbarActionLink', widget.props.toolbarActionLink || '#reports')}
            {renderSelect('Action Variant', 'toolbarActionVariant', widget.props.toolbarActionVariant || 'ghost', [
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
              { value: 'ghost', label: 'Ghost' }
            ])}
          </>
        )}
        {renderColorPicker('Accent Color', 'tableAccentColor', widget.props.tableAccentColor || '#2563eb')}
        {renderTextInput('Empty State Text', 'emptyStateText', widget.props.emptyStateText || 'No data available')}

        {renderPositionAndSize()}
      </>
    );
  };

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

  const renderProgressBarProperties = () => {
    const parseNumber = (value: any, fallback: number) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const minValue = parseNumber(widget.props.min, 0);
    const rawMax = parseNumber(widget.props.max, 100);
    const safeMax = rawMax > minValue ? rawMax : minValue + 1;
    const valueStepRaw = parseNumber(widget.props.valueStep, 1);
    const sliderStep = valueStepRaw > 0 ? valueStepRaw : 1;
    const rawValue = parseNumber(widget.props.value, minValue);
    const clampedValue = Math.min(Math.max(rawValue, minValue), safeMax);
    const goalValue = parseNumber(widget.props.goalValue, safeMax);
    const decimals = parseInt(widget.props.valueDecimalPlaces ?? 0, 10) || 0;
    const showValueSwitch = widget.props.showValue ?? widget.props.showPercentage ?? true;

    return (
      <>
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Data & Value</h3>
        {renderSlider('Value', 'value', clampedValue, minValue, safeMax, sliderStep)}
        <div className="grid grid-cols-2 gap-3">
          {renderNumberInput('Minimum', 'min', minValue)}
          {renderNumberInput('Maximum', 'max', safeMax)}
        </div>
        {renderNumberInput('Step', 'valueStep', sliderStep)}
        {renderSelect('Value Display', 'valueFormat', widget.props.valueFormat || 'percent', [
          { value: 'percent', label: 'Percent' },
          { value: 'value', label: 'Raw Value' }
        ])}
        {renderNumberInput('Decimal Places', 'valueDecimalPlaces', Math.max(0, decimals))}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Value Prefix', 'valuePrefix', widget.props.valuePrefix ?? '')}
          {renderTextInput('Value Suffix', 'valueSuffix', widget.props.valueSuffix ?? (widget.props.valueFormat === 'percent' ? '%' : ''))}
        </div>

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Labels & Value Text</h3>
        {renderSwitch('Show Label', 'showLabel', widget.props.showLabel ?? true)}
        {renderSwitch('Show Description', 'showDescription', widget.props.showDescription ?? true)}
        {renderTextInput('Label', 'label', widget.props.label || '')}
        {renderTextarea('Description', 'description', widget.props.description || '')}
        {renderSelect('Label Layout', 'labelLayout', widget.props.labelLayout || 'stacked', [
          { value: 'stacked', label: 'Stacked' },
          { value: 'inline', label: 'Inline' },
          { value: 'between', label: 'Spread Apart' }
        ])}
        {renderColorPicker('Label Color', 'labelColor', widget.props.labelColor || '#0f172a')}
        {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#475569')}
        {renderSwitch('Show Value Text', 'showValue', showValueSwitch)}
        {renderSelect('Value Position', 'valuePosition', widget.props.valuePosition || 'inline', [
          { value: 'inline', label: 'Inline with Label' },
          { value: 'inside', label: 'Inside Bar' },
          { value: 'below', label: 'Below Bar' }
        ])}
        {renderColorPicker('Value Text Color', 'valueColor', widget.props.valueColor || '#0f172a')}
        {widget.props.valuePosition === 'inside' && (
          renderColorPicker('Value Inside Color', 'valueInsideColor', widget.props.valueInsideColor || '#ffffff')
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Bar Appearance</h3>
        {renderTextInput('Bar Height', 'barHeight', widget.props.barHeight || widget.props.height || '1rem')}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '999px')}
        {renderColorPicker('Track Color', 'trackColor', widget.props.trackColor || widget.props.backgroundColor || '#e2e8f0')}
        {renderColorPicker('Track Border Color', 'trackBorderColor', widget.props.trackBorderColor || 'transparent')}
        {renderTextInput('Track Border Width', 'trackBorderWidth', widget.props.trackBorderWidth || '0px')}
        {renderSwitch('Gradient Fill', 'useGradient', widget.props.useGradient ?? true, 'Use CSS gradients for the fill background')}
        {widget.props.useGradient === false
          ? renderColorPicker('Fill Color', 'fillColor', widget.props.fillColor || '#2563eb')
          : renderTextInput('Fill Gradient CSS', 'fillGradient', widget.props.fillGradient || 'linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)')}
        {renderSwitch('Striped Fill', 'striped', widget.props.striped ?? true)}
        {widget.props.striped && (
          <>
            {renderColorPicker('Stripe Color', 'stripeColor', widget.props.stripeColor || 'rgba(255,255,255,0.35)')}
            {renderTextInput('Stripe Size', 'stripeSize', widget.props.stripeSize || '1.5rem 1.5rem', 'e.g. 1.5rem 1.5rem')}
            {renderSwitch('Animate Stripes', 'animateStripes', widget.props.animateStripes ?? true)}
          </>
        )}
        {renderSwitch('Animate Width', 'animateTransition', widget.props.animateTransition ?? widget.props.animated ?? true)}
        {renderSwitch('Glow / Shadow', 'showGlow', widget.props.showGlow ?? true)}
        {widget.props.showGlow && (
          <>
            {renderColorPicker('Glow Color', 'glowColor', widget.props.glowColor || 'rgba(14,165,233,0.35)')}
            {renderTextInput('Glow Shadow', 'fillShadow', widget.props.fillShadow || '0 12px 30px rgba(37,99,235,0.35)')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Goal Indicator</h3>
        {renderSwitch('Show Goal Marker', 'showGoal', widget.props.showGoal ?? true)}
        {widget.props.showGoal !== false && (
          <>
            {renderNumberInput('Goal Value', 'goalValue', goalValue)}
            {renderTextInput('Goal Label', 'goalLabel', widget.props.goalLabel || '')}
            {renderSwitch('Show Goal Label', 'showGoalLabel', widget.props.showGoalLabel ?? true)}
            {renderColorPicker('Goal Color', 'goalColor', widget.props.goalColor || '#0ea5e9')}
            {renderColorPicker('Goal Label Color', 'goalLabelColor', widget.props.goalLabelColor || '#0f172a')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Min / Max Labels</h3>
        {renderSwitch('Show Min/Max Labels', 'showMinMaxLabels', widget.props.showMinMaxLabels ?? true)}
        {widget.props.showMinMaxLabels !== false && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Min Label', 'minLabel', widget.props.minLabel || '')}
              {renderTextInput('Max Label', 'maxLabel', widget.props.maxLabel || '')}
            </div>
            {renderColorPicker('Meta Text Color', 'minMaxColor', widget.props.minMaxColor || '#94a3b8')}
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderStatsProperties = () => {
    const layout = widget.props.layout || 'vertical';
    const showDescription = widget.props.showDescription !== false;
    const showIcon = widget.props.showIcon !== false;
    const showBadge = widget.props.showBadge ?? Boolean(widget.props.badgeText);
    const showChange = widget.props.showChange !== false;
    const showAccent = widget.props.showAccent ?? false;
    const showDivider = widget.props.showDivider ?? false;
    const changeType = widget.props.changeType || 'positive';
    const iconNameValue = widget.props.iconName || widget.props.icon || 'TrendingUp';

    return (
      <>
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Metric</h3>
        {renderTextInput('Value', 'value', typeof widget.props.value === 'number' ? widget.props.value.toString() : widget.props.value || '')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Value Prefix', 'valuePrefix', widget.props.valuePrefix || '')}
          {renderTextInput('Value Suffix', 'valueSuffix', widget.props.valueSuffix || '')}
        </div>
        {renderTextInput('Value Font Size', 'valueFontSize', widget.props.valueFontSize || '2.5rem', 'e.g., 2.75rem, 48px')}
        {renderSelect('Value Weight', 'valueFontWeight', widget.props.valueFontWeight || '700', [
          { value: '400', label: 'Regular (400)' },
          { value: '500', label: 'Medium (500)' },
          { value: '600', label: 'Semibold (600)' },
          { value: '700', label: 'Bold (700)' },
          { value: '800', label: 'Extra Bold (800)' }
        ])}
        {renderTextInput('Value Line Height', 'valueLineHeight', widget.props.valueLineHeight || '1.1', 'e.g., 1.1, 120%')}
        {renderTextInput('Value Letter Spacing', 'valueLetterSpacing', widget.props.valueLetterSpacing || '-0.02em', 'e.g., 0, -0.02em')}
        {renderColorPicker('Value Color', 'valueColor', widget.props.valueColor || '#0f172a')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Labels & Description</h3>
        {renderTextInput('Label', 'label', widget.props.label || '')}
        {renderTextInput('Label Font Size', 'labelFontSize', widget.props.labelFontSize || '1rem', 'e.g., 1rem, 16px')}
        {renderSelect('Label Weight', 'labelFontWeight', widget.props.labelFontWeight || '600', [
          { value: '400', label: 'Regular (400)' },
          { value: '500', label: 'Medium (500)' },
          { value: '600', label: 'Semibold (600)' },
          { value: '700', label: 'Bold (700)' }
        ])}
        {renderSwitch('Uppercase Label', 'labelUppercase', widget.props.labelUppercase ?? false)}
        {renderColorPicker('Label Color', 'labelColor', widget.props.labelColor || '#475569')}
        {renderSwitch('Show Description', 'showDescription', showDescription)}
        {showDescription && (
          <>
            {renderTextarea('Description', 'description', widget.props.description || '', 'Optional supporting text')}
            {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#94a3b8')}
          </>
        )}
        {renderSwitch('Show Badge', 'showBadge', showBadge)}
        {showBadge && (
          <>
            {renderTextInput('Badge Text', 'badgeText', widget.props.badgeText || 'Live')}
            {renderSelect('Badge Style', 'badgeStyle', widget.props.badgeStyle || 'pill', [
              { value: 'pill', label: 'Pill' },
              { value: 'soft', label: 'Soft Square' },
              { value: 'underline', label: 'Underline' }
            ])}
            {renderColorPicker('Badge Text Color', 'badgeColor', widget.props.badgeColor || '#1d4ed8')}
            {renderColorPicker('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(59,130,246,0.12)')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Icon</h3>
        {renderSwitch('Show Icon', 'showIcon', showIcon)}
        {showIcon && (
          <>
            <IconPicker
              value={iconNameValue}
              uploadedIcon={widget.props.iconUpload || widget.props.uploadedIcon}
              onChange={(name, uploadedUrl) => {
                handleUpdateMultiple({
                  iconName: name,
                  icon: name,
                  iconUpload: uploadedUrl || '',
                  uploadedIcon: uploadedUrl || ''
                });
              }}
              size={widget.props.iconSize || '2rem'}
              color={widget.props.iconColor || '#2563eb'}
            />
            {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor || '#2563eb')}
            {renderColorPicker('Icon Background', 'iconBackground', widget.props.iconBackground || 'rgba(37,99,235,0.12)')}
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Icon Size', 'iconSize', widget.props.iconSize || '2rem', 'Icon size e.g., 1.75rem')}
              {renderTextInput('Icon Padding', 'iconPadding', widget.props.iconPadding || '0.65rem', 'Around the icon e.g., 0.75rem')}
            </div>
            {renderTextInput('Icon Border Radius', 'iconBorderRadius', widget.props.iconBorderRadius || '0.85rem', 'e.g., 0.5rem, 999px')}
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Icon Border Width', 'iconBorderWidth', widget.props.iconBorderWidth || '0px', 'e.g., 0px, 1px')}
              {renderSelect('Icon Border Style', 'iconBorderStyle', widget.props.iconBorderStyle || 'solid', [
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' }
              ])}
            </div>
            {renderColorPicker('Icon Border Color', 'iconBorderColor', widget.props.iconBorderColor || 'transparent')}
            {renderTextInput('Icon Shadow', 'iconShadow', widget.props.iconShadow || 'none', 'CSS shadow e.g., 0 10px 20px rgba(0,0,0,0.08)')}
            {renderSelect('Icon Placement', 'iconPosition', widget.props.iconPosition || 'left', [
              { value: 'left', label: 'Inline left' },
              { value: 'top', label: 'Stacked above text' }
            ])}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Change Indicator</h3>
        {renderSwitch('Show Change Indicator', 'showChange', showChange)}
        {showChange && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Change Value', 'change', typeof widget.props.change === 'number' ? widget.props.change.toString() : widget.props.change || '')}
              {renderSelect('Change Type', 'changeType', changeType, [
                { value: 'positive', label: 'Positive' },
                { value: 'negative', label: 'Negative' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'custom', label: 'Custom' }
              ])}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Change Prefix', 'changePrefix', widget.props.changePrefix || '', '+, ↑, etc')}
              {renderTextInput('Change Suffix', 'changeSuffix', widget.props.changeSuffix || '', '%, pts, etc')}
            </div>
            {renderTextInput('Change Label', 'changeLabel', widget.props.changeLabel || '', 'e.g., vs last month')}
            {renderColorPicker('Change Label Color', 'changeLabelColor', widget.props.changeLabelColor || '#94a3b8')}
            <div className="grid grid-cols-2 gap-3">
              {renderSelect('Indicator Icon Style', 'changeIconStyle', widget.props.changeIconStyle || 'arrow', [
                { value: 'arrow', label: 'Arrow' },
                { value: 'trend', label: 'Trend line' },
                { value: 'dot', label: 'Colored dot' },
                { value: 'none', label: 'No icon' }
              ])}
              {renderSelect('Indicator Badge Style', 'changeBadgeStyle', widget.props.changeBadgeStyle || 'pill', [
                { value: 'pill', label: 'Filled pill' },
                { value: 'soft', label: 'Soft background' },
                { value: 'inline', label: 'Text only' }
              ])}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Positive Text', 'changePositiveColor', widget.props.changePositiveColor || '#15803d')}
              {renderColorPicker('Positive Background', 'changePositiveBackground', widget.props.changePositiveBackground || 'rgba(34,197,94,0.15)')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Negative Text', 'changeNegativeColor', widget.props.changeNegativeColor || '#b91c1c')}
              {renderColorPicker('Negative Background', 'changeNegativeBackground', widget.props.changeNegativeBackground || 'rgba(239,68,68,0.15)')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Neutral Text', 'changeNeutralColor', widget.props.changeNeutralColor || '#475569')}
              {renderColorPicker('Neutral Background', 'changeNeutralBackground', widget.props.changeNeutralBackground || 'rgba(71,85,105,0.12)')}
            </div>
            {changeType === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                {renderColorPicker('Custom Text', 'changeCustomColor', widget.props.changeCustomColor || '#0f172a')}
                {renderColorPicker('Custom Background', 'changeCustomBackground', widget.props.changeCustomBackground || 'rgba(15,23,42,0.08)')}
              </div>
            )}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Card</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layout', layout, [
            { value: 'vertical', label: 'Stacked' },
            { value: 'horizontal', label: 'Split / horizontal' }
          ])}
          {renderSelect('Alignment', 'alignment', widget.props.alignment || 'left', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ])}
        </div>
        {renderTextInput('Content Gap', 'gap', widget.props.gap || (layout === 'horizontal' ? '1.5rem' : '1rem'), 'Spacing between groups e.g., 1rem')}
        {renderTextInput('Padding', 'padding', widget.props.padding || '1.5rem', 'CSS padding e.g., 1.5rem')}
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
        {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...) overrides background color when set')}
        {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1rem', '0px, 1rem, 999px...')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px', 'e.g., 0px, 1px')}
          {renderSelect('Border Style', 'borderStyle', widget.props.borderStyle || 'solid', [
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' }
          ])}
        </div>
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'rgba(15,23,42,0.08)')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 20px 40px rgba(15,23,42,0.08)', 'CSS shadow e.g., 0 15px 30px rgba(15,23,42,0.08)')}
        {renderSwitch('Show Accent Indicator', 'showAccent', showAccent)}
        {showAccent && (
          <>
            {renderColorPicker('Accent Color', 'accentColor', widget.props.accentColor || '#2563eb')}
            {renderSelect('Accent Position', 'accentPosition', widget.props.accentPosition || 'top', [
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' }
            ])}
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Accent Length', 'accentSize', widget.props.accentSize || '48px', 'Length e.g., 48px')}
              {renderTextInput('Accent Thickness', 'accentThickness', widget.props.accentThickness || '4px', 'Thickness e.g., 4px')}
            </div>
            {renderTextInput('Accent Offset', 'accentInset', widget.props.accentInset || '1rem', 'Distance from edge e.g., 1rem')}
          </>
        )}
        {renderSwitch('Show Divider', 'showDivider', showDivider)}
        {showDivider && (
          <>
            {renderTextInput('Divider Thickness', 'dividerThickness', widget.props.dividerThickness || '1px')}
            {renderColorPicker('Divider Color', 'dividerColor', widget.props.dividerColor || 'rgba(15,23,42,0.12)')}
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  // Forms & Inputs widgets properties
  const renderSearchBarProperties = () => {
    const layout = widget.props.layout || 'inline';
    const showLabel = widget.props.showLabel ?? false;
    const showHelperText = widget.props.showHelperText ?? false;
    const showIcon = widget.props.showIcon !== false;
    const showButton = widget.props.showButton !== false;
    const showVoiceButton = widget.props.showVoiceButton ?? false;
    const showAdvancedButton = widget.props.showAdvancedButton ?? false;
    const showFilters = widget.props.showFilters ?? false;
    const quickFilters = Array.isArray(widget.props.quickFilters)
      ? widget.props.quickFilters
      : typeof widget.props.quickFilters === 'string'
        ? widget.props.quickFilters.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [];
    const quickFiltersValue = quickFilters.join('\n');

    const handleQuickFiltersChange = (value: string) => {
      const next = value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      handleUpdate('quickFilters', next);
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layout', layout, [
            { value: 'inline', label: 'Inline' },
            { value: 'stacked', label: 'Stacked' }
          ])}
          {renderSelect('Alignment', 'alignment', widget.props.alignment || 'left', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderSwitch('Full Width', 'fullWidth', widget.props.fullWidth ?? true)}
          {renderTextInput('Max Width', 'maxWidth', widget.props.maxWidth || '640px', 'e.g., 640px, 100%')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Container Padding', 'padding', widget.props.padding || '0', 'e.g., 0, 1rem')}
          {renderTextInput('Content Gap', 'gap', widget.props.gap || '0.75rem', 'Spacing between elements')}
        </div>
        {renderColorPicker('Container Background', 'backgroundColor', widget.props.backgroundColor || 'transparent')}
        {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '999px')}
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0px')}
        </div>
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'transparent')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || 'none', 'CSS shadow e.g., 0 20px 40px rgba(15,23,42,0.08)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Label & Helper Text</h3>
        {renderSwitch('Show Label', 'showLabel', showLabel)}
        {showLabel && (
          <>
            {renderTextInput('Label', 'label', widget.props.label || 'Search')}
            {renderColorPicker('Label Color', 'labelColor', widget.props.labelColor || '#0f172a')}
            {renderTextInput('Label Size', 'labelSize', widget.props.labelSize || '0.9rem')}
            {renderSwitch('Uppercase Label', 'labelUppercase', widget.props.labelUppercase ?? false)}
          </>
        )}
        {renderSwitch('Show Helper Text', 'showHelperText', showHelperText)}
        {showHelperText && (
          <>
            {renderTextarea('Helper Text', 'helperText', widget.props.helperText || '', 'Shown beneath the field')}
            {renderColorPicker('Helper Text Color', 'helperColor', widget.props.helperColor || '#94a3b8')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Input Field</h3>
        {renderTextInput('Placeholder', 'placeholder', widget.props.placeholder || 'Search...')}
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Input Text Color', 'inputTextColor', widget.props.inputTextColor || '#0f172a')}
          {renderTextInput('Font Size', 'inputFontSize', widget.props.inputFontSize || '1rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Input Height', 'inputHeight', widget.props.inputHeight || '52px')}
          {renderTextInput('Input Padding', 'inputPadding', widget.props.inputPadding || '0.75rem 1rem')}
        </div>
        {renderColorPicker('Input Background', 'inputBackground', widget.props.inputBackground || '#ffffff')}
        {renderTextInput('Input Gradient', 'inputBackgroundGradient', widget.props.inputBackgroundGradient || '', 'linear-gradient(...)')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Input Border Radius', 'inputBorderRadius', widget.props.inputBorderRadius || '999px')}
          {renderTextInput('Input Border Width', 'inputBorderWidth', widget.props.inputBorderWidth || '1px')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Input Border Style', 'inputBorderStyle', widget.props.inputBorderStyle || 'solid', [
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' }
          ])}
          {renderColorPicker('Input Border Color', 'inputBorderColor', widget.props.inputBorderColor || '#e2e8f0')}
        </div>
        {renderColorPicker('Placeholder Color', 'inputPlaceholderColor', widget.props.inputPlaceholderColor || '#94a3b8')}
        {renderColorPicker('Focus Ring Color', 'focusRingColor', widget.props.focusRingColor || '#2563eb')}
        {renderTextInput('Input Shadow', 'inputShadow', widget.props.inputShadow || '0 4px 12px rgba(15,23,42,0.08)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Input Icon</h3>
        {renderSwitch('Show Icon', 'showIcon', showIcon)}
        {showIcon && (
          <>
            <IconPicker
              value={widget.props.iconName || widget.props.icon || 'Search'}
              uploadedIcon={widget.props.iconUpload}
              onChange={(name, uploadedUrl) => {
                handleUpdateMultiple({
                  iconName: name,
                  icon: name,
                  iconUpload: uploadedUrl || ''
                });
              }}
              size={widget.props.iconSize || '1.1rem'}
              color={widget.props.iconColor || '#2563eb'}
            />
            <div className="grid grid-cols-2 gap-3">
              {renderSelect('Icon Position', 'iconPosition', widget.props.iconPosition || 'left', [
                { value: 'left', label: 'Left inside field' },
                { value: 'right', label: 'Right inside field' }
              ])}
              {renderTextInput('Icon Size', 'iconSize', widget.props.iconSize || '1.1rem')}
            </div>
            {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor || '#2563eb')}
            {renderColorPicker('Icon Background', 'iconBackground', widget.props.iconBackground || 'transparent')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Button</h3>
        {renderSwitch('Show Button', 'showButton', showButton)}
        {showButton && (
          <>
            {renderTextInput('Button Text', 'buttonText', widget.props.buttonText || 'Search')}
            <div className="grid grid-cols-2 gap-3">
              {renderSelect('Button Variant', 'buttonVariant', widget.props.buttonVariant || 'solid', [
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' }
              ])}
              {renderTextInput('Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.75rem 1.5rem')}
            </div>
            {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#2563eb')}
            {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#ffffff')}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#1d4ed8')}
              {renderColorPicker('Button Hover Text', 'buttonHoverTextColor', widget.props.buttonHoverTextColor || '#ffffff')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Button Border Width', 'buttonBorderWidth', widget.props.buttonBorderWidth || '0px')}
              {renderSelect('Button Border Style', 'buttonBorderStyle', widget.props.buttonBorderStyle || 'solid', [
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' }
              ])}
            </div>
            {renderColorPicker('Button Border Color', 'buttonBorderColor', widget.props.buttonBorderColor || 'transparent')}
            {renderTextInput('Button Border Radius', 'buttonRadius', widget.props.buttonRadius || '999px')}
            <div className="grid grid-cols-2 gap-3">
              <IconPicker
                value={widget.props.buttonIconName || ''}
                uploadedIcon={widget.props.buttonIconUpload}
                onChange={(name, uploadedUrl) => {
                  handleUpdateMultiple({
                    buttonIconName: name,
                    buttonIconUpload: uploadedUrl || ''
                  });
                }}
                size="1rem"
                color={widget.props.buttonTextColor || '#ffffff'}
              />
              {renderSelect('Button Icon Position', 'buttonIconPosition', widget.props.buttonIconPosition || 'right', [
                { value: 'left', label: 'Left of text' },
                { value: 'right', label: 'Right of text' }
              ])}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary Actions</h3>
        {renderSwitch('Show Voice Button', 'showVoiceButton', showVoiceButton)}
        {showVoiceButton && (
          <>
            {renderTextInput('Voice Tooltip', 'voiceButtonTooltip', widget.props.voiceButtonTooltip || 'Voice search')}
            {renderColorPicker('Voice Button Color', 'voiceButtonColor', widget.props.voiceButtonColor || '#64748b')}
            {renderColorPicker('Voice Button Background', 'voiceButtonBackground', widget.props.voiceButtonBackground || 'rgba(148,163,184,0.15)')}
          </>
        )}
        {renderSwitch('Show Advanced Button', 'showAdvancedButton', showAdvancedButton)}
        {showAdvancedButton && (
          <>
            {renderTextInput('Advanced Button Label', 'advancedButtonLabel', widget.props.advancedButtonLabel || 'Advanced')}
            {renderSelect('Advanced Variant', 'advancedButtonVariant', widget.props.advancedButtonVariant || 'ghost', [
              { value: 'ghost', label: 'Ghost' },
              { value: 'outline', label: 'Outline' },
              { value: 'link', label: 'Text Link' }
            ])}
            {renderColorPicker('Advanced Text Color', 'advancedButtonTextColor', widget.props.advancedButtonTextColor || '#2563eb')}
            {renderColorPicker('Advanced Hover Color', 'advancedButtonHoverColor', widget.props.advancedButtonHoverColor || '#1d4ed8')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Quick Filters</h3>
        {renderSwitch('Show Quick Filters', 'showFilters', showFilters)}
        {showFilters && (
          <>
            {renderTextInput('Filters Label', 'filtersLabel', widget.props.filtersLabel || 'Popular searches')}
            <div className="space-y-2">
              <Label>Filter Items (one per line)</Label>
              <Textarea
                rows={4}
                value={quickFiltersValue}
                onChange={(e) => handleQuickFiltersChange(e.target.value)}
                placeholder="Teeth whitening\nBraces\nImplants"
              />
            </div>
            {renderSelect('Filter Style', 'filterStyle', widget.props.filterStyle || 'pill', [
              { value: 'pill', label: 'Rounded pills' },
              { value: 'chip', label: 'Soft chips' },
              { value: 'link', label: 'Underline links' }
            ])}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Filter Text Color', 'filterTextColor', widget.props.filterTextColor || '#2563eb')}
              {renderColorPicker('Filter Background', 'filterBackground', widget.props.filterBackground || 'rgba(37,99,235,0.08)')}
            </div>
            {renderColorPicker('Filter Border Color', 'filterBorderColor', widget.props.filterBorderColor || 'transparent')}
            {renderColorPicker('Filter Hover Background', 'filterHoverBackground', widget.props.filterHoverBackground || 'rgba(37,99,235,0.15)')}
            {renderTextInput('Filters Gap', 'filterGap', widget.props.filterGap || '0.5rem')}
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderNewsletterProperties = () => {
    const layout = widget.props.layout || 'centered';
    const alignment = widget.props.alignment || 'center';
    const showImage = widget.props.showImage ?? true;
    const showBadge = widget.props.showBadge ?? true;
    const showEyebrow = widget.props.showEyebrow ?? true;
    const showSecondaryButton = widget.props.showSecondaryButton ?? false;
    const showStats = widget.props.showStats ?? true;
    const showLogos = widget.props.showLogos ?? false;

    const bulletPoints = Array.isArray(widget.props.bulletPoints)
      ? widget.props.bulletPoints
      : typeof widget.props.bulletPoints === 'string'
        ? widget.props.bulletPoints.split(/[\r\n]+/).map(point => point.trim()).filter(Boolean)
        : [];
    const bulletPointsValue = bulletPoints.join('\n');

    const logos = Array.isArray(widget.props.logos)
      ? widget.props.logos
      : typeof widget.props.logos === 'string'
        ? widget.props.logos.split(/[\r\n]+/).map(logo => logo.trim()).filter(Boolean)
        : [];
    const logosValue = logos.join('\n');

    const handleBulletPointsChange = (value: string) => {
      const list = value
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
      handleUpdate('bulletPoints', list);
    };

    const handleLogosChange = (value: string) => {
      const list = value
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
      handleUpdate('logos', list);
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layout', layout, [
            { value: 'centered', label: 'Centered Card' },
            { value: 'split', label: 'Split with Illustration' }
          ])}
          {renderSelect('Alignment', 'alignment', alignment, [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Max Width', 'maxWidth', widget.props.maxWidth || '720px')}
          {renderTextInput('Padding', 'padding', widget.props.padding || '3rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Content Gap', 'gap', widget.props.gap || '1.5rem')}
          {renderTextInput('Text Block Gap', 'textGap', widget.props.textGap || '1.25rem', 'Spacing between text sections')}
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1.25rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px')}
          {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'rgba(15,23,42,0.08)')}
        </div>
        {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
        {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 20px 45px rgba(15,23,42,0.12)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Content</h3>
        {renderSwitch('Show Highlight Badge', 'showBadge', showBadge)}
        {showBadge && (
          <div className="grid grid-cols-2 gap-3">
            {renderTextInput('Badge Text', 'badgeText', widget.props.badgeText || 'Free dental tips')}
            {renderColorPicker('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(59,130,246,0.12)')}
          </div>
        )}
        {showBadge && renderColorPicker('Badge Text Color', 'badgeColor', widget.props.badgeColor || '#2563eb')}
        {renderSwitch('Show Eyebrow', 'showEyebrow', showEyebrow)}
        {showEyebrow && (
          <div className="grid grid-cols-2 gap-3">
            {renderTextInput('Eyebrow', 'eyebrow', widget.props.eyebrow || 'Stay in the loop')}
            {renderColorPicker('Eyebrow Color', 'eyebrowColor', widget.props.eyebrowColor || '#2563eb')}
          </div>
        )}
        {renderTextInput('Title', 'title', widget.props.title || 'Subscribe to our Newsletter')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Title Font Size', 'titleFontSize', widget.props.titleFontSize || '2rem')}
          {renderSelect('Title Weight', 'titleFontWeight', widget.props.titleFontWeight || '700', [
            { value: '500', label: 'Medium' },
            { value: '600', label: 'Semibold' },
            { value: '700', label: 'Bold' },
            { value: '800', label: 'Extra Bold' }
          ])}
        </div>
        {renderColorPicker('Title Color', 'titleColor', widget.props.titleColor || '#0f172a')}
        {renderTextarea('Description', 'description', widget.props.description || 'Get the latest updates delivered to your inbox.')}
        {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#475569')}
        {renderTextInput('Description Gap', 'descriptionSpacing', widget.props.descriptionSpacing || '1.25rem', 'Spacing below description text')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Highlight List</h3>
        <div className="space-y-2">
          <Label>Bullet Points (one per line)</Label>
          <Textarea
            rows={4}
            value={bulletPointsValue}
            onChange={(e) => handleBulletPointsChange(e.target.value)}
            placeholder={'Exclusive offers\nMonthly dental tips\nPriority access to new services'}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <IconPicker
            value={widget.props.bulletIconName || 'Check'}
            uploadedIcon={widget.props.bulletIconUpload}
            onChange={(name, uploadedUrl) => {
              handleUpdateMultiple({
                bulletIconName: name,
                bulletIconUpload: uploadedUrl || ''
              });
            }}
            size="1rem"
            color={widget.props.bulletIconColor || '#16a34a'}
          />
          {renderColorPicker('Bullet Icon Color', 'bulletIconColor', widget.props.bulletIconColor || '#16a34a')}
        </div>
        {renderColorPicker('Bullet Text Color', 'bulletTextColor', widget.props.bulletTextColor || '#0f172a')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Form Input</h3>
        {renderTextInput('Input Label', 'inputLabel', widget.props.inputLabel || '')}
        {renderColorPicker('Input Label Color', 'inputLabelColor', widget.props.inputLabelColor || '#0f172a')}
        {renderTextInput('Placeholder', 'placeholder', widget.props.placeholder || 'Enter your email')}
        {renderColorPicker('Input Text Color', 'inputTextColor', widget.props.inputTextColor || '#0f172a')}
        {renderColorPicker('Placeholder Color', 'inputPlaceholderColor', widget.props.inputPlaceholderColor || '#94a3b8')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Input Background', 'inputBackground', widget.props.inputBackground || '#ffffff')}
          {renderTextInput('Input Gradient', 'inputBackgroundGradient', widget.props.inputBackgroundGradient || '', 'linear-gradient(...)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Input Border Radius', 'inputBorderRadius', widget.props.inputBorderRadius || '999px')}
          {renderTextInput('Input Border Width', 'inputBorderWidth', widget.props.inputBorderWidth || '1px')}
        </div>
        {renderColorPicker('Input Border Color', 'inputBorderColor', widget.props.inputBorderColor || 'rgba(148,163,184,0.6)')}
        {renderTextInput('Input Shadow', 'inputShadow', widget.props.inputShadow || '0 10px 30px rgba(15,23,42,0.08)')}
        {renderTextarea('Input Helper Text', 'inputHelperText', widget.props.inputHelperText || '')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Button</h3>
        {renderTextInput('Button Text', 'buttonText', widget.props.buttonText || 'Subscribe')}
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Button Variant', 'buttonVariant', widget.props.buttonVariant || 'solid', [
            { value: 'solid', label: 'Solid' },
            { value: 'outline', label: 'Outline' },
            { value: 'ghost', label: 'Ghost' }
          ])}
          {renderTextInput('Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.85rem 1.75rem')}
        </div>
        {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#2563eb')}
        {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#ffffff')}
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#1d4ed8')}
          {renderColorPicker('Button Hover Text', 'buttonHoverTextColor', widget.props.buttonHoverTextColor || '#ffffff')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Button Border Width', 'buttonBorderWidth', widget.props.buttonBorderWidth || '0px')}
          {renderSelect('Button Border Style', 'buttonBorderStyle', widget.props.buttonBorderStyle || 'solid', [
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' }
          ])}
        </div>
        {renderColorPicker('Button Border Color', 'buttonBorderColor', widget.props.buttonBorderColor || 'transparent')}
        {renderTextInput('Button Border Radius', 'buttonRadius', widget.props.buttonRadius || '999px')}
        <div className="grid grid-cols-2 gap-3">
          <IconPicker
            value={widget.props.buttonIconName || 'ArrowRight'}
            uploadedIcon={widget.props.buttonIconUpload}
            onChange={(name, uploadedUrl) => {
              handleUpdateMultiple({
                buttonIconName: name,
                buttonIconUpload: uploadedUrl || ''
              });
            }}
            size="1rem"
            color={widget.props.buttonTextColor || '#ffffff'}
          />
          {renderSelect('Button Icon Position', 'buttonIconPosition', widget.props.buttonIconPosition || 'right', [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' }
          ])}
        </div>

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary Action</h3>
        {renderSwitch('Show Secondary Button', 'showSecondaryButton', showSecondaryButton)}
        {showSecondaryButton && (
          <>
            {renderTextInput('Secondary Text', 'secondaryButtonText', widget.props.secondaryButtonText || 'No thanks, maybe later')}
            {renderSelect('Secondary Variant', 'secondaryButtonVariant', widget.props.secondaryButtonVariant || 'link', [
              { value: 'link', label: 'Text Link' },
              { value: 'ghost', label: 'Ghost' },
              { value: 'outline', label: 'Outline' }
            ])}
            {renderColorPicker('Secondary Text Color', 'secondaryButtonColor', widget.props.secondaryButtonColor || '#64748b')}
            {renderColorPicker('Secondary Hover Color', 'secondaryButtonHoverColor', widget.props.secondaryButtonHoverColor || '#0f172a')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Consent & Messaging</h3>
        {renderTextarea('Consent Text', 'consentText', widget.props.consentText || 'By subscribing you agree to receive emails from us. Unsubscribe anytime.')}
        {renderColorPicker('Consent Text Color', 'consentTextColor', widget.props.consentTextColor || '#94a3b8')}
        {renderTextarea('Success Message', 'successMessage', widget.props.successMessage || "You're in! Check your inbox for a confirmation email.")}
        {renderColorPicker('Success Message Color', 'successMessageColor', widget.props.successMessageColor || '#15803d')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Trust Indicators</h3>
        {renderSwitch('Show Stats Callout', 'showStats', showStats)}
        {showStats && (
          <div className="grid grid-cols-2 gap-3">
            {renderTextInput('Stats Value', 'statsValue', widget.props.statsValue || '98%')}
            {renderTextInput('Stats Label', 'statsLabel', widget.props.statsLabel || 'Satisfaction rate')}
          </div>
        )}
        {showStats && renderColorPicker('Stats Accent Color', 'statsAccentColor', widget.props.statsAccentColor || '#22c55e')}
        {renderSwitch('Show Logos', 'showLogos', showLogos)}
        {showLogos && (
          <>
            {renderTextInput('Logos Title', 'logosTitle', widget.props.logosTitle || 'Trusted by top clinics')}
            <div className="space-y-2">
              <Label>Logo Labels (one per line)</Label>
              <Textarea
                rows={3}
                value={logosValue}
                onChange={(e) => handleLogosChange(e.target.value)}
                placeholder={'SmileCo\nBright Dental\nOralCare+'}
              />
            </div>
            {renderColorPicker('Logo Text Color', 'logoTextColor', widget.props.logoTextColor || '#475569')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Illustration</h3>
        {renderSwitch('Show Illustration', 'showImage', showImage)}
        {showImage && (
          <>
            {renderSelect('Image Position', 'imagePosition', widget.props.imagePosition || 'right', [
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' }
            ])}
            <ImageUpload
              value={widget.props.imageUrl}
              onChange={(url) => handleUpdate('imageUrl', url)}
              label="Illustration Image"
            />
            {renderTextInput('Image Alt Text', 'imageAlt', widget.props.imageAlt || 'Newsletter illustration')}
            {renderColorPicker('Image Background', 'imageBackground', widget.props.imageBackground || '#eef2ff')}
            {renderTextInput('Image Border Radius', 'imageBorderRadius', widget.props.imageBorderRadius || '1rem')}
            {renderTextInput('Image Height', 'imageHeight', widget.props.imageHeight || '280px')}
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderContactInfoProperties = () => {
    const contactItems = Array.isArray(widget.props.contactItems) ? widget.props.contactItems : [];
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp'];
    const socialLinks = typeof widget.props.socialLinks === 'object' && widget.props.socialLinks !== null
      ? widget.props.socialLinks
      : {};

    const updateContactItem = (index: number, key: string, value: string) => {
      const items = contactItems.length ? [...contactItems] : [];
      items[index] = { ...items[index], [key]: value };
      handleUpdate('contactItems', items);
    };

    const removeContactItem = (index: number) => {
      const items = contactItems.filter((_, idx: number) => idx !== index);
      handleUpdate('contactItems', items);
    };

    const addContactItem = () => {
      handleUpdate('contactItems', [
        ...contactItems,
        {
          icon: 'Phone',
          label: 'New contact',
          value: 'Details goes here',
          helper: '',
          href: ''
        }
      ]);
    };

    const toggleSocialPlatform = (platform: string, enabled: boolean) => {
      const current = Array.isArray(widget.props.socialPlatforms) ? widget.props.socialPlatforms : [];
      if (enabled && !current.includes(platform)) {
        handleUpdate('socialPlatforms', [...current, platform]);
      } else if (!enabled) {
        handleUpdate('socialPlatforms', current.filter((item: string) => item !== platform));
      }
    };

    const setSocialLink = (platform: string, value: string) => {
      handleUpdate('socialLinks', {
        ...socialLinks,
        [platform]: value
      });
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layout', widget.props.layout || 'cards', [
            { value: 'list', label: 'Stacked List' },
            { value: 'columns', label: 'Two Columns' },
            { value: 'cards', label: 'Cards' }
          ])}
          {renderSelect('Alignment', 'alignment', widget.props.alignment || 'left', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Columns (list/cards)', 'columns', widget.props.columns || '2', '1, 2, 3...')}
          {renderTextInput('Item Gap', 'itemGap', widget.props.itemGap || '1rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Padding', 'padding', widget.props.padding || '2rem')}
          {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
          {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'rgba(15,23,42,0.08)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1.25rem')}
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px')}
        </div>
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 20px 45px rgba(15,23,42,0.12)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Header</h3>
        {renderTextInput('Heading', 'heading', widget.props.heading || 'Contact our care team')}
        {renderTextarea('Subheading', 'subheading', widget.props.subheading || 'We respond within 1 business day')}
        {renderColorPicker('Heading Color', 'headingColor', widget.props.headingColor || '#0f172a')}
        {renderColorPicker('Subheading Color', 'subheadingColor', widget.props.subheadingColor || '#475569')}
        {renderTextInput('Text Gap', 'textGap', widget.props.textGap || '1rem', 'Spacing between head/description blocks')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Contact Items</h3>
        <div className="space-y-3">
          {contactItems.map((item: any, idx: number) => (
            <div key={idx} className="p-3 border rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Item {idx + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContactItem(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Input
                  value={item?.icon || ''}
                  onChange={(e) => updateContactItem(idx, 'icon', e.target.value)}
                  placeholder="Phone, Mail, Home..."
                />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={item?.label || ''}
                  onChange={(e) => updateContactItem(idx, 'label', e.target.value)}
                  placeholder="Call us"
                />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={item?.value || ''}
                  onChange={(e) => updateContactItem(idx, 'value', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Helper Text</Label>
                <Input
                  value={item?.helper || ''}
                  onChange={(e) => updateContactItem(idx, 'helper', e.target.value)}
                  placeholder="Mon-Fri 9am-6pm"
                />
              </div>
              <div className="space-y-2">
                <Label>Link (optional)</Label>
                <Input
                  value={item?.href || ''}
                  onChange={(e) => updateContactItem(idx, 'href', e.target.value)}
                  placeholder="tel:+15551234567"
                />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addContactItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact Item
          </Button>
        </div>
        {renderSwitch('Show Icons', 'showIcons', widget.props.showIcons ?? true)}
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Icon Color', 'iconColor', widget.props.iconColor || '#2563eb')}
          {renderColorPicker('Icon Background', 'iconBackground', widget.props.iconBackground || 'rgba(37,99,235,0.08)')}
        </div>
        {renderTextInput('Icon Size', 'iconSize', widget.props.iconSize || '1.1rem')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Typography</h3>
        {renderColorPicker('Primary Text Color', 'textColor', widget.props.textColor || '#0f172a')}
        {renderColorPicker('Helper Text Color', 'helperColor', widget.props.helperColor || '#64748b')}
        {renderTextInput('Font Size', 'fontSize', widget.props.fontSize || '1rem')}
        {renderTextInput('Value Font Weight', 'valueFontWeight', widget.props.valueFontWeight || '600')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary CTA</h3>
        {renderSwitch('Show CTA Button', 'showCTA', widget.props.showCTA ?? true)}
        {widget.props.showCTA !== false && (
          <>
            {renderTextInput('CTA Text', 'ctaText', widget.props.ctaText || 'Book an appointment')}
            {renderTextInput('CTA Link', 'ctaHref', widget.props.ctaHref || '#')}
            <div className="grid grid-cols-2 gap-3">
              {renderSelect('CTA Variant', 'ctaVariant', widget.props.ctaVariant || 'solid', [
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' }
              ])}
              {renderTextInput('CTA Padding', 'ctaPadding', widget.props.ctaPadding || '0.85rem 1.5rem')}
            </div>
            {renderColorPicker('CTA Background', 'ctaBackground', widget.props.ctaBackground || '#2563eb')}
            {renderColorPicker('CTA Text Color', 'ctaTextColor', widget.props.ctaTextColor || '#ffffff')}
            {renderTextInput('CTA Border Width', 'ctaBorderWidth', widget.props.ctaBorderWidth || '0px')}
            {renderColorPicker('CTA Border Color', 'ctaBorderColor', widget.props.ctaBorderColor || 'transparent')}
            <div className="grid grid-cols-2 gap-3">
              <IconPicker
                value={widget.props.ctaIconName || 'ArrowRight'}
                uploadedIcon={widget.props.ctaIconUpload}
                onChange={(name, uploadedUrl) => {
                  handleUpdateMultiple({
                    ctaIconName: name,
                    ctaIconUpload: uploadedUrl || ''
                  });
                }}
                size="1rem"
                color={widget.props.ctaTextColor || '#ffffff'}
              />
              {renderSelect('CTA Icon Position', 'ctaIconPosition', widget.props.ctaIconPosition || 'right', [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' }
              ])}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary CTA & Footnote</h3>
        {renderSwitch('Show Secondary Link', 'showSecondaryCTA', widget.props.showSecondaryCTA ?? false)}
        {widget.props.showSecondaryCTA && (
          <>
            {renderTextInput('Secondary Text', 'secondaryCTAText', widget.props.secondaryCTAText || 'Email our coordinators')}
            {renderTextInput('Secondary Link', 'secondaryCTAHref', widget.props.secondaryCTAHref || '#')}
            {renderColorPicker('Secondary Text Color', 'secondaryCTAColor', widget.props.secondaryCTAColor || '#2563eb')}
          </>
        )}
        {renderTextarea('Footnote', 'footnote', widget.props.footnote || '')}
        {renderColorPicker('Footnote Color', 'footnoteColor', widget.props.footnoteColor || '#94a3b8')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Social Profiles</h3>
        {renderSwitch('Show Social Icons', 'showSocial', widget.props.showSocial ?? true)}
        {widget.props.showSocial !== false && (
          <>
            {renderTextInput('Social Label', 'socialLabel', widget.props.socialLabel || 'Connect with us')}
            {renderColorPicker('Social Icon Color', 'socialIconColor', widget.props.socialIconColor || '#2563eb')}
            {renderColorPicker('Social Background', 'socialIconBackground', widget.props.socialIconBackground || 'rgba(37,99,235,0.08)')}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Platforms</Label>
              {socialPlatforms.map((platform) => (
                <div key={platform} className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{platform}</Label>
                    <Switch
                      checked={Array.isArray(widget.props.socialPlatforms) ? widget.props.socialPlatforms.includes(platform) : false}
                      onCheckedChange={(checked) => toggleSocialPlatform(platform, checked)}
                    />
                  </div>
                  <Input
                    value={socialLinks[platform] || ''}
                    onChange={(e) => setSocialLink(platform, e.target.value)}
                    placeholder={`https://${platform}.com/your-page`}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  // Media widgets properties
  const renderGalleryProperties = () => {
    const galleryItems = Array.isArray(widget.props.images) ? widget.props.images : [];

    const updateGalleryItem = (index: number, key: string, value: string) => {
      const items = galleryItems.length ? [...galleryItems] : [];
      const current = items[index];
      const normalized = typeof current === 'object' && current !== null
        ? { ...current }
        : { src: typeof current === 'string' ? current : '' };
      normalized[key] = value;
      items[index] = normalized;
      handleUpdate('images', items);
    };

    const removeGalleryItem = (index: number) => {
      const items = galleryItems.filter((_, idx) => idx !== index);
      handleUpdate('images', items);
    };

    const addGalleryItem = () => {
      handleUpdate('images', [
        ...galleryItems,
        {
          src: '',
          alt: '',
          title: '',
          description: '',
          badge: ''
        }
      ]);
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layout', widget.props.layout || 'grid', [
            { value: 'grid', label: 'Grid' },
            { value: 'masonry', label: 'Masonry' }
          ])}
          {renderTextInput('Columns', 'columns', widget.props.columns?.toString() || '3', '1-6')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Mobile Columns', 'mobileColumns', widget.props.mobileColumns?.toString() || '1', '1-3')}
          {renderTextInput('Gap', 'gap', widget.props.gap || '1rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Row Gap', 'rowGap', widget.props.rowGap || widget.props.gap || '1rem')}
          {renderTextInput('Padding', 'padding', widget.props.padding || '1.5rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
          {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1rem')}
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0px')}
        </div>
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'transparent')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 20px 35px rgba(15,23,42,0.08)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Images & Content</h3>
        <div className="space-y-3">
          {galleryItems.map((item: any, idx: number) => {
            const src = typeof item === 'string' ? item : item?.src;
            return (
              <div key={idx} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Image {idx + 1}</Label>
                  <Button variant="ghost" size="sm" onClick={() => removeGalleryItem(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <ImageUpload
                  value={src}
                  onChange={(url) => updateGalleryItem(idx, 'src', url)}
                  label="Image"
                />
                <div className="space-y-2">
                  <Label>Alt Text</Label>
                  <Input
                    value={item?.alt || ''}
                    onChange={(e) => updateGalleryItem(idx, 'alt', e.target.value)}
                    placeholder="Describe the image"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={item?.title || ''}
                    onChange={(e) => updateGalleryItem(idx, 'title', e.target.value)}
                    placeholder="Dental makeover"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={item?.description || ''}
                    onChange={(e) => updateGalleryItem(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="Short supporting text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input
                    value={item?.badge || ''}
                    onChange={(e) => updateGalleryItem(idx, 'badge', e.target.value)}
                    placeholder="Before & After"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link (optional)</Label>
                  <Input
                    value={item?.href || ''}
                    onChange={(e) => updateGalleryItem(idx, 'href', e.target.value)}
                    placeholder="https://example.com/case-study"
                  />
                </div>
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={addGalleryItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Gallery Item
          </Button>
        </div>

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Image Styling</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Image Border Radius', 'imageBorderRadius', widget.props.imageBorderRadius || '1rem')}
          {renderTextInput('Image Border Width', 'imageBorderWidth', widget.props.imageBorderWidth || '0px')}
        </div>
        {renderColorPicker('Image Border Color', 'imageBorderColor', widget.props.imageBorderColor || 'transparent')}
        {renderTextInput('Image Shadow', 'imageShadow', widget.props.imageShadow || '0 12px 25px rgba(15,23,42,0.12)')}
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Aspect Ratio', 'imageAspectRatio', widget.props.imageAspectRatio || 'auto', [
            { value: 'auto', label: 'Auto' },
            { value: '16/9', label: '16:9' },
            { value: '4/3', label: '4:3' },
            { value: '3/2', label: '3:2' },
            { value: '1/1', label: '1:1' }
          ])}
          {renderTextInput('Fixed Height', 'imageHeight', widget.props.imageHeight || '', 'e.g., 280px')}
        </div>
        {renderSelect('Object Fit', 'objectFit', widget.props.objectFit || 'cover', [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
          { value: 'scale-down', label: 'Scale Down' }
        ])}
        {renderSelect('Hover Effect', 'hoverEffect', widget.props.hoverEffect || 'zoom', [
          { value: 'none', label: 'None' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'lift', label: 'Lift' },
          { value: 'fade', label: 'Fade' },
          { value: 'grayscale', label: 'Grayscale' }
        ])}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Overlay & Captions</h3>
        {renderSwitch('Show Overlay', 'showOverlay', widget.props.showOverlay ?? true)}
        {widget.props.showOverlay !== false && (
          <>
            {renderColorPicker('Overlay Color', 'overlayColor', widget.props.overlayColor || 'rgba(15,23,42,0.45)')}
            <IconPicker
              value={widget.props.overlayIconName || 'Eye'}
              uploadedIcon={widget.props.overlayIconUpload}
              onChange={(name, uploadedUrl) => {
                handleUpdateMultiple({
                  overlayIconName: name,
                  overlayIconUpload: uploadedUrl || ''
                });
              }}
              size="1.1rem"
              color="#ffffff"
            />
            {renderSwitch('Show Preview Icon', 'showPreviewIcon', widget.props.showPreviewIcon ?? true)}
          </>
        )}
        {renderSwitch('Show Captions', 'showCaptions', widget.props.showCaptions ?? true)}
        {widget.props.showCaptions !== false && (
          <>
            {renderSelect('Caption Alignment', 'captionAlignment', widget.props.captionAlignment || 'left', [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' }
            ])}
            {renderColorPicker('Title Color', 'captionColor', widget.props.captionColor || '#0f172a')}
            {renderColorPicker('Description Color', 'captionDescriptionColor', widget.props.captionDescriptionColor || '#475569')}
            {renderSwitch('Show Badge', 'showBadges', widget.props.showBadges ?? true)}
            {widget.props.showBadges !== false && (
              <div className="grid grid-cols-2 gap-3">
                {renderColorPicker('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(37,99,235,0.12)')}
                {renderColorPicker('Badge Text Color', 'badgeColor', widget.props.badgeColor || '#2563eb')}
              </div>
            )}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Interactions</h3>
        {renderSwitch('Enable Lightbox Preview', 'lightbox', widget.props.lightbox ?? true)}
        {renderSwitch('Open Image Links in New Tab', 'openLinksInNewTab', widget.props.openLinksInNewTab ?? true)}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderCarouselProperties = () => {
    const slides = Array.isArray(widget.props.slides) ? widget.props.slides : [];

    const updateSlide = (index: number, key: string, value: string) => {
      const items = slides.length ? [...slides] : [];
      const current = typeof items[index] === 'object' && items[index] !== null
        ? { ...items[index] }
        : { image: typeof items[index] === 'string' ? items[index] : '' };
      current[key] = value;
      items[index] = current;
      handleUpdate('slides', items);
    };

    const removeSlide = (index: number) => {
      const items = slides.filter((_, idx) => idx !== index);
      handleUpdate('slides', items);
    };

    const addSlide = () => {
      handleUpdate('slides', [
        ...slides,
        {
          image: '',
          alt: '',
          headline: '',
          subheadline: '',
          description: '',
          badge: '',
          buttonText: '',
          buttonHref: ''
        }
      ]);
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Height', 'height', widget.props.height || '420px')}
          {renderTextInput('Slide Width (desktop)', 'slideWidth', widget.props.slideWidth || '70%')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Corner Radius', 'borderRadius', widget.props.borderRadius || '1.25rem')}
          {renderTextInput('Inner Padding', 'padding', widget.props.padding || '0')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
          {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        </div>
        {renderTextInput('Gap Between Slides', 'slideGap', widget.props.slideGap || '1.25rem')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Slides</h3>
        <div className="space-y-3">
          {slides.map((slide: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Slide {idx + 1}</Label>
                <Button variant="ghost" size="sm" onClick={() => removeSlide(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <ImageUpload
                value={slide?.image || (typeof slide === 'string' ? slide : '')}
                onChange={(url) => updateSlide(idx, 'image', url)}
                label="Background Image"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Alt Text</Label>
                  <Input
                    value={slide?.alt || ''}
                    onChange={(e) => updateSlide(idx, 'alt', e.target.value)}
                    placeholder="Describe the slide"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input
                    value={slide?.badge || ''}
                    onChange={(e) => updateSlide(idx, 'badge', e.target.value)}
                    placeholder="New treatment"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={slide?.headline || ''}
                  onChange={(e) => updateSlide(idx, 'headline', e.target.value)}
                  placeholder="Compassionate dentistry"
                />
              </div>
              <div className="space-y-2">
                <Label>Subheadline</Label>
                <Input
                  value={slide?.subheadline || ''}
                  onChange={(e) => updateSlide(idx, 'subheadline', e.target.value)}
                  placeholder="Ultra-modern studio"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={slide?.description || ''}
                  onChange={(e) => updateSlide(idx, 'description', e.target.value)}
                  rows={3}
                  placeholder="Short supporting copy"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={slide?.buttonText || ''}
                    onChange={(e) => updateSlide(idx, 'buttonText', e.target.value)}
                    placeholder="Learn more"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={slide?.buttonHref || ''}
                    onChange={(e) => updateSlide(idx, 'buttonHref', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSlide} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </Button>
        </div>

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Content & Overlay</h3>
        {renderSwitch('Show Overlay', 'showOverlay', widget.props.showOverlay ?? true)}
        {widget.props.showOverlay !== false && (
          <>
            {renderColorPicker('Overlay Color', 'overlayColor', widget.props.overlayColor || 'rgba(0,0,0,0.35)')}
            {renderTextInput('Overlay Blur', 'overlayBlur', widget.props.overlayBlur || '0px')}
          </>
        )}
        {renderSwitch('Show Content', 'showContent', widget.props.showContent ?? true)}
        {widget.props.showContent !== false && (
          <>
            {renderSelect('Content Alignment', 'contentAlignment', widget.props.contentAlignment || 'left', [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' }
            ])}
            {renderColorPicker('Headline Color', 'headlineColor', widget.props.headlineColor || '#ffffff')}
            {renderColorPicker('Body Color', 'bodyColor', widget.props.bodyColor || 'rgba(255,255,255,0.8)')}
            {renderColorPicker('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(255,255,255,0.15)')}
            {renderColorPicker('Badge Text Color', 'badgeColor', widget.props.badgeColor || '#ffffff')}
            {renderTextInput('Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.65rem 1.5rem')}
            {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#ffffff')}
            {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#0f172a')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Navigation & Indicators</h3>
        {renderSwitch('Show Arrows', 'showArrows', widget.props.showArrows ?? true)}
        {widget.props.showArrows !== false && (
          <>
            {renderSelect('Arrow Position', 'arrowPosition', widget.props.arrowPosition || 'sides', [
              { value: 'sides', label: 'Outside (sides)' },
              { value: 'inside', label: 'Inside' }
            ])}
            {renderColorPicker('Arrow Background', 'arrowBackground', widget.props.arrowBackground || 'rgba(15,23,42,0.6)')}
            {renderColorPicker('Arrow Color', 'arrowColor', widget.props.arrowColor || '#ffffff')}
          </>
        )}
        {renderSwitch('Show Indicators', 'showIndicators', widget.props.showIndicators ?? true)}
        {widget.props.showIndicators !== false && (
          <>
            {renderSelect('Indicator Style', 'indicatorStyle', widget.props.indicatorStyle || 'dots', [
              { value: 'dots', label: 'Dots' },
              { value: 'line', label: 'Line' }
            ])}
            {renderColorPicker('Indicator Color', 'indicatorColor', widget.props.indicatorColor || 'rgba(255,255,255,0.5)')}
            {renderColorPicker('Active Indicator', 'indicatorActiveColor', widget.props.indicatorActiveColor || '#ffffff')}
          </>
        )}
        {renderSwitch('Show Thumbnails', 'showThumbnails', widget.props.showThumbnails ?? false)}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Autoplay & Behavior</h3>
        {renderSwitch('Autoplay', 'autoplay', widget.props.autoplay ?? true)}
        {widget.props.autoplay !== false && (
          <>
            {renderTextInput('Autoplay Interval (ms)', 'interval', widget.props.interval?.toString() || '5000')}
            {renderTextInput('Transition Duration (ms)', 'transitionDuration', widget.props.transitionDuration?.toString() || '600')}
          </>
        )}
        {renderSwitch('Loop Slides', 'loop', widget.props.loop ?? true)}
        {renderSwitch('Pause on Hover', 'pauseOnHover', widget.props.pauseOnHover ?? true)}

        {renderPositionAndSize()}
      </>
    );
  };

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
  const renderProductCardProperties = () => {
    const features = Array.isArray(widget.props.features) ? widget.props.features : [];

    const updateFeature = (index: number, value: string) => {
      const updated = [...features];
      updated[index] = value;
      handleUpdate('features', updated);
    };

    const removeFeature = (index: number) => {
      handleUpdate('features', features.filter((_, idx) => idx !== index));
    };

    const addFeature = () => {
      handleUpdate('features', [...features, 'Highlight a key benefit']);
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layoutVariant', widget.props.layoutVariant || 'vertical', [
            { value: 'vertical', label: 'Vertical Card' },
            { value: 'horizontal', label: 'Horizontal Split' }
          ])}
          {renderSelect('Text Alignment', 'alignment', widget.props.alignment || 'left', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Card Padding', 'cardPadding', widget.props.cardPadding || '1.5rem')}
          {renderTextInput('Content Gap', 'contentGap', widget.props.contentGap || '1.25rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Card Background', 'cardBackground', widget.props.cardBackground || '#ffffff')}
          {renderTextInput('Background Gradient', 'cardBackgroundGradient', widget.props.cardBackgroundGradient || '', 'linear-gradient(...)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1.25rem')}
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px')}
        </div>
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'rgba(15,23,42,0.08)')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 25px 45px rgba(15,23,42,0.12)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Media & Badge</h3>
        {renderSwitch('Show Image', 'showImage', widget.props.showImage ?? true)}
        {widget.props.showImage !== false && (
          <>
            <ImageUpload
              value={widget.props.image}
              onChange={(url) => handleUpdate('image', url)}
              label="Product Image"
            />
            {renderTextInput('Image Alt Text', 'imageAlt', widget.props.imageAlt || '')}
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Image Height', 'imageHeight', widget.props.imageHeight || '260px')}
              {renderTextInput('Image Border Radius', 'imageBorderRadius', widget.props.imageBorderRadius || '1.25rem')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Image Background', 'imageBackground', widget.props.imageBackground || '#f1f5f9')}
              {renderSelect('Object Fit', 'objectFit', widget.props.objectFit || 'cover', [
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'fill', label: 'Fill' },
                { value: 'scale-down', label: 'Scale Down' }
              ])}
            </div>
            {renderTextInput('Media Width (horizontal layout)', 'mediaWidth', widget.props.mediaWidth || '320px')}
          </>
        )}
        {renderSwitch('Show Badge', 'showBadge', widget.props.showBadge ?? true)}
        {widget.props.showBadge !== false && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Badge Text', 'badge', widget.props.badge || 'Bestseller')}
              {renderSelect('Badge Position', 'badgePosition', widget.props.badgePosition || 'top-left', [
                { value: 'top-left', label: 'Top Left' },
                { value: 'top-right', label: 'Top Right' }
              ])}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(37,99,235,0.15)')}
              {renderColorPicker('Badge Text Color', 'badgeTextColor', widget.props.badgeTextColor || '#1d4ed8')}
            </div>
          </>
        )}
        {renderSwitch('Show Favorite Icon', 'showFavoriteIcon', widget.props.showFavoriteIcon ?? true)}
        {widget.props.showFavoriteIcon !== false && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Favorite Icon Color', 'favoriteIconColor', widget.props.favoriteIconColor || '#ef4444')}
              {renderColorPicker('Favorite Icon Background', 'favoriteIconBackground', widget.props.favoriteIconBackground || '#ffffff')}
            </div>
            <div className="space-y-2 mt-2">
              <Label>Favorite Icon</Label>
              <IconPicker
                value={widget.props.favoriteIconName || 'Heart'}
                uploadedIcon={widget.props.favoriteIconUpload}
                onChange={(name, uploadedUrl) => handleUpdateMultiple({
                  favoriteIconName: name,
                  favoriteIconUpload: uploadedUrl || ''
                })}
              />
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Content & Pricing</h3>
        {renderTextInput('Title', 'title', widget.props.title)}
        {renderTextInput('Subtitle', 'subtitle', widget.props.subtitle)}
        {renderTextarea('Description', 'description', widget.props.description || '', 'Short supporting copy about this product')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Price', 'price', widget.props.price)}
          {renderTextInput('Original Price', 'originalPrice', widget.props.originalPrice)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Currency Symbol', 'currency', widget.props.currency || '$')}
          {renderSwitch('Show Currency Symbol', 'showCurrency', widget.props.showCurrency ?? true)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Price Suffix', 'priceSuffix', widget.props.priceSuffix || '')}
          {renderTextInput('Price Label', 'priceLabel', widget.props.priceLabel || 'One-time payment')}
        </div>
        {renderSwitch('Show Discount Tag', 'showDiscount', widget.props.showDiscount ?? true)}
        {widget.props.showDiscount !== false && (
          <div className="grid grid-cols-2 gap-3">
            {renderTextInput('Discount Text', 'discountText', widget.props.discountText || 'Save 25%')}
            {renderColorPicker('Discount Text Color', 'discountColor', widget.props.discountColor || '#15803d')}
          </div>
        )}
        {widget.props.showDiscount !== false && renderColorPicker('Discount Background', 'discountBackground', widget.props.discountBackground || 'rgba(34,197,94,0.15)')}
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Price Color', 'priceColor', widget.props.priceColor || '#0f172a')}
          {renderColorPicker('Original Price Color', 'originalPriceColor', widget.props.originalPriceColor || '#94a3b8')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Title Color', 'titleColor', widget.props.titleColor || '#0f172a')}
          {renderColorPicker('Subtitle Color', 'subtitleColor', widget.props.subtitleColor || '#2563eb')}
        </div>
        {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#475569')}
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Stock Status', 'stockStatus', widget.props.stockStatus || 'In stock · Ships in 24h')}
          {renderColorPicker('Stock Color', 'stockColor', widget.props.stockColor || '#16a34a')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Shipping Text', 'shippingText', widget.props.shippingText || 'Free worldwide shipping')}
          {renderColorPicker('Shipping Text Color', 'shippingColor', widget.props.shippingColor || '#2563eb')}
        </div>

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Rating & Social Proof</h3>
        {renderSwitch('Show Rating', 'showRating', widget.props.showRating ?? true)}
        {widget.props.showRating !== false && (
          <>
            {renderSlider('Rating', 'rating', widget.props.rating ?? 4.5, 0, 5, 0.1)}
            {renderTextInput('Rating Count Label', 'ratingCountLabel', widget.props.ratingCountLabel || '128 reviews')}
            {renderTextInput('Rating Caption', 'ratingLabel', widget.props.ratingLabel || 'Loved by patients worldwide')}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Star Color', 'starColor', widget.props.starColor || '#facc15')}
              {renderColorPicker('Rating Text Color', 'ratingColor', widget.props.ratingColor || '#475569')}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Features & Highlights</h3>
        {renderSwitch('Show Features List', 'showFeatures', widget.props.showFeatures ?? true)}
        {widget.props.showFeatures !== false && (
          <>
            <div className="space-y-2">
              <Label>Feature Items</Label>
              {features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFeature(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addFeature} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <Label>Feature Icon</Label>
                <IconPicker
                  value={widget.props.featureIconName || 'Check'}
                  uploadedIcon={widget.props.featureIconUpload}
                  onChange={(name, uploadedUrl) => handleUpdateMultiple({
                    featureIconName: name,
                    featureIconUpload: uploadedUrl || ''
                  })}
                />
              </div>
              {renderColorPicker('Feature Icon Color', 'featureIconColor', widget.props.featureIconColor || '#2563eb')}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Action</h3>
        {renderTextInput('Button Text', 'buttonText', widget.props.buttonText)}
        {renderTextInput('Button Link', 'buttonHref', widget.props.buttonHref || '#')}
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Button Variant', 'buttonVariant', widget.props.buttonVariant || 'solid', [
            { value: 'solid', label: 'Solid' },
            { value: 'outline', label: 'Outline' },
            { value: 'ghost', label: 'Ghost' }
          ])}
          {renderSwitch('Full Width Button', 'buttonFullWidth', widget.props.buttonFullWidth ?? true)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#2563eb')}
          {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#ffffff')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#1d4ed8')}
          {renderColorPicker('Button Hover Text', 'buttonHoverTextColor', widget.props.buttonHoverTextColor || '#ffffff')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.85rem 1.25rem')}
          {renderTextInput('Button Border Radius', 'buttonBorderRadius', widget.props.buttonBorderRadius || '999px')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Button Border Width', 'buttonBorderWidth', widget.props.buttonBorderWidth || '0px')}
          {renderColorPicker('Button Border Color', 'buttonBorderColor', widget.props.buttonBorderColor || 'transparent')}
        </div>
        <div className="space-y-2">
          <Label>Button Icon</Label>
          <IconPicker
            value={widget.props.ctaIconName || 'ShoppingCart'}
            uploadedIcon={widget.props.ctaIconUpload}
            onChange={(name, uploadedUrl) => handleUpdateMultiple({
              ctaIconName: name,
              ctaIconUpload: uploadedUrl || ''
            })}
          />
        </div>
        {renderSelect('Icon Position', 'ctaIconPosition', widget.props.ctaIconPosition || 'right', [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ])}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary Action</h3>
        {renderSwitch('Show Secondary Button', 'showSecondaryButton', widget.props.showSecondaryButton ?? true)}
        {widget.props.showSecondaryButton !== false && (
          <>
            {renderTextInput('Secondary Button Text', 'secondaryButtonText', widget.props.secondaryButtonText || 'View details')}
            {renderTextInput('Secondary Button Link', 'secondaryButtonHref', widget.props.secondaryButtonHref || '#')}
            {renderSelect('Secondary Variant', 'secondaryButtonVariant', widget.props.secondaryButtonVariant || 'link', [
              { value: 'link', label: 'Link' },
              { value: 'ghost', label: 'Ghost' }
            ])}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Secondary Text Color', 'secondaryButtonColor', widget.props.secondaryButtonColor || '#2563eb')}
              {renderColorPicker('Secondary Hover Color', 'secondaryButtonHoverColor', widget.props.secondaryButtonHoverColor || '#1d4ed8')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Secondary Background', 'secondaryButtonBackground', widget.props.secondaryButtonBackground || 'rgba(37,99,235,0.08)')}
              {renderColorPicker('Secondary Hover Background', 'secondaryButtonHoverBackground', widget.props.secondaryButtonHoverBackground || 'rgba(37,99,235,0.16)')}
            </div>
            {renderTextInput('Secondary Padding', 'secondaryButtonPadding', widget.props.secondaryButtonPadding || '0.75rem 1rem')}
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderPricingProperties = () => {
    const includedFeatures = Array.isArray(widget.props.features) ? widget.props.features : [];
    const limitedFeatures = Array.isArray(widget.props.limitedFeatures) ? widget.props.limitedFeatures : [];

    const updateFeature = (list: string[], index: number, value: string, key: 'features' | 'limitedFeatures') => {
      const updated = [...list];
      updated[index] = value;
      handleUpdate(key, updated);
    };

    const addFeature = (key: 'features' | 'limitedFeatures', fallback: string) => {
      const current = key === 'features' ? includedFeatures : limitedFeatures;
      handleUpdate(key, [...current, fallback]);
    };

    const removeFeature = (key: 'features' | 'limitedFeatures', index: number) => {
      const current = key === 'features' ? includedFeatures : limitedFeatures;
      handleUpdate(key, current.filter((_, idx) => idx !== index));
    };

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout Variant', 'layoutVariant', widget.props.layoutVariant || 'card', [
            { value: 'card', label: 'Raised Card' },
            { value: 'outline', label: 'Outline' },
            { value: 'minimal', label: 'Minimal' }
          ])}
          {renderSelect('Alignment', 'alignment', widget.props.alignment || 'left', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Max Width', 'maxWidth', widget.props.maxWidth || '420px')}
          {renderTextInput('Padding', 'cardPadding', widget.props.cardPadding || '2rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#ffffff')}
          {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1.5rem')}
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '1px')}
        </div>
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'rgba(15,23,42,0.08)')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 25px 45px rgba(15,23,42,0.12)')}
        <div className="grid grid-cols-2 gap-3">
          {renderSwitch('Show Accent Bar', 'showAccentBar', widget.props.showAccentBar ?? true)}
          {renderSelect('Accent Position', 'accentPosition', widget.props.accentPosition || 'top', [
            { value: 'top', label: 'Top' },
            { value: 'left', label: 'Left' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Accent Color', 'accentColor', widget.props.accentColor || '#2563eb')}
          {renderTextInput('Accent Thickness', 'accentThickness', widget.props.accentThickness || '4px')}
        </div>
        {renderSwitch('Featured Plan', 'featured', widget.props.featured ?? true)}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Header & Description</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Badge Text', 'badgeText', widget.props.badgeText || 'Most popular')}
          {renderColorPicker('Badge Background', 'badgeBackground', widget.props.badgeBackground || 'rgba(37,99,235,0.12)')}
        </div>
        {renderColorPicker('Badge Text Color', 'badgeColor', widget.props.badgeColor || '#1d4ed8')}
        {renderTextInput('Title', 'title', widget.props.title)}
        {renderTextInput('Subtitle', 'subtitle', widget.props.subtitle)}
        {renderTextarea('Description', 'description', widget.props.description || '', 'Describe what is included in this plan')}
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Title Color', 'titleColor', widget.props.titleColor || '#0f172a')}
          {renderColorPicker('Subtitle Color', 'subtitleColor', widget.props.subtitleColor || '#2563eb')}
        </div>
        {renderColorPicker('Description Color', 'descriptionColor', widget.props.descriptionColor || '#475569')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Pricing</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Price', 'price', widget.props.price)}
          {renderTextInput('Original Price', 'originalPrice', widget.props.originalPrice)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Currency Symbol', 'currency', widget.props.currency || '$')}
          {renderSwitch('Show Currency', 'showCurrency', widget.props.showCurrency ?? true)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Price Suffix', 'priceSuffix', widget.props.priceSuffix || '/month')}
          {renderSwitch('Show Original Price', 'showOriginalPrice', widget.props.showOriginalPrice ?? true)}
        </div>
        {renderTextInput('Price Label', 'priceLabel', widget.props.priceLabel || 'Billed monthly · Cancel anytime')}
        {renderTextInput('Price Subtext', 'priceSubtext', widget.props.priceSubtext || 'Switch yearly to save 15%')}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {renderColorPicker('Price Color', 'priceColor', widget.props.priceColor || '#0f172a')}
          {renderColorPicker('Suffix Color', 'priceSuffixColor', widget.props.priceSuffixColor || '#475569')}
        </div>
        {renderColorPicker('Original Price Color', 'originalPriceColor', widget.props.originalPriceColor || '#94a3b8')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Features</h3>
        {renderSwitch('Show Features', 'showFeatures', widget.props.showFeatures ?? true)}
        {widget.props.showFeatures !== false && (
          <>
            <div className="space-y-2">
              <Label>Included Features</Label>
              {includedFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(includedFeatures, idx, e.target.value, 'features')}
                    placeholder={`Feature ${idx + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFeature('features', idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => addFeature('features', 'Premium support & concierge onboarding')} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <Label>Feature Icon</Label>
                <IconPicker
                  value={widget.props.featureIconName || 'Check'}
                  uploadedIcon={widget.props.featureIconUpload}
                  onChange={(name, uploadedUrl) => handleUpdateMultiple({
                    featureIconName: name,
                    featureIconUpload: uploadedUrl || ''
                  })}
                />
              </div>
              {renderColorPicker('Feature Icon Color', 'featureIconColor', widget.props.featureIconColor || '#16a34a')}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Label>Limited / Unavailable Features</Label>
              {limitedFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(limitedFeatures, idx, e.target.value, 'limitedFeatures')}
                    placeholder={`Limited feature ${idx + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFeature('limitedFeatures', idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => addFeature('limitedFeatures', 'On-site training available on Enterprise tier')} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Limited Feature
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="space-y-2">
                <Label>Limited Feature Icon</Label>
                <IconPicker
                  value={widget.props.limitedFeatureIconName || 'X'}
                  uploadedIcon={widget.props.limitedFeatureIconUpload}
                  onChange={(name, uploadedUrl) => handleUpdateMultiple({
                    limitedFeatureIconName: name,
                    limitedFeatureIconUpload: uploadedUrl || ''
                  })}
                />
              </div>
              {renderColorPicker('Limited Icon Color', 'limitedFeatureIconColor', widget.props.limitedFeatureIconColor || '#ef4444')}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Primary Action</h3>
        {renderTextInput('Button Text', 'buttonText', widget.props.buttonText || 'Choose plan')}
        {renderTextInput('Button Link', 'buttonHref', widget.props.buttonHref || '#')}
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Button Variant', 'buttonVariant', widget.props.buttonVariant || 'solid', [
            { value: 'solid', label: 'Solid' },
            { value: 'outline', label: 'Outline' },
            { value: 'ghost', label: 'Ghost' }
          ])}
          {renderSwitch('Full Width Button', 'buttonFullWidth', widget.props.buttonFullWidth ?? true)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Button Background', 'buttonBackground', widget.props.buttonBackground || '#2563eb')}
          {renderColorPicker('Button Text Color', 'buttonTextColor', widget.props.buttonTextColor || '#ffffff')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Button Hover Background', 'buttonHoverBackground', widget.props.buttonHoverBackground || '#1d4ed8')}
          {renderColorPicker('Button Hover Text', 'buttonHoverTextColor', widget.props.buttonHoverTextColor || '#ffffff')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Button Padding', 'buttonPadding', widget.props.buttonPadding || '0.85rem 1.5rem')}
          {renderTextInput('Button Border Radius', 'buttonBorderRadius', widget.props.buttonBorderRadius || '999px')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Button Border Width', 'buttonBorderWidth', widget.props.buttonBorderWidth || '0px')}
          {renderColorPicker('Button Border Color', 'buttonBorderColor', widget.props.buttonBorderColor || 'transparent')}
        </div>
        <div className="space-y-2">
          <Label>Button Icon</Label>
          <IconPicker
            value={widget.props.ctaIconName || 'ArrowRight'}
            uploadedIcon={widget.props.ctaIconUpload}
            onChange={(name, uploadedUrl) => handleUpdateMultiple({
              ctaIconName: name,
              ctaIconUpload: uploadedUrl || ''
            })}
          />
        </div>
        {renderSelect('Icon Position', 'ctaIconPosition', widget.props.ctaIconPosition || 'right', [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ])}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Secondary Action</h3>
        {renderSwitch('Show Secondary Button', 'showSecondaryButton', widget.props.showSecondaryButton ?? true)}
        {widget.props.showSecondaryButton !== false && (
          <>
            {renderTextInput('Secondary Text', 'secondaryButtonText', widget.props.secondaryButtonText || 'Compare plans')}
            {renderTextInput('Secondary Link', 'secondaryButtonHref', widget.props.secondaryButtonHref || '#')}
            {renderSelect('Secondary Variant', 'secondaryButtonVariant', widget.props.secondaryButtonVariant || 'ghost', [
              { value: 'ghost', label: 'Ghost' },
              { value: 'link', label: 'Link' }
            ])}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Secondary Text Color', 'secondaryButtonColor', widget.props.secondaryButtonColor || '#2563eb')}
              {renderColorPicker('Secondary Hover Color', 'secondaryButtonHoverColor', widget.props.secondaryButtonHoverColor || '#1d4ed8')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Secondary Background', 'secondaryButtonBackground', widget.props.secondaryButtonBackground || 'rgba(37,99,235,0.08)')}
              {renderColorPicker('Secondary Hover Background', 'secondaryButtonHoverBackground', widget.props.secondaryButtonHoverBackground || 'rgba(37,99,235,0.16)')}
            </div>
            {renderTextInput('Secondary Padding', 'secondaryButtonPadding', widget.props.secondaryButtonPadding || '0.75rem 1rem')}
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Trust & Notes</h3>
        {renderSwitch('Show Guarantee', 'showGuarantee', widget.props.showGuarantee ?? true)}
        {widget.props.showGuarantee !== false && (
          <div className="space-y-2">
            {renderTextInput('Guarantee Text', 'guaranteeText', widget.props.guaranteeText || '30-day money-back guarantee')}
            {renderColorPicker('Guarantee Color', 'guaranteeColor', widget.props.guaranteeColor || '#15803d')}
          </div>
        )}
        {renderSwitch('Show Footer Note', 'showFooterNote', widget.props.showFooterNote ?? true)}
        {widget.props.showFooterNote !== false && renderTextarea('Footer Note', 'footerNote', widget.props.footerNote || 'Need a custom plan? Contact our coordinators.')}

        {renderPositionAndSize()}
      </>
    );
  };

  const renderTestimonialProperties = () => {
    const logos = Array.isArray(widget.props.logos) ? widget.props.logos : [];

    const updateLogo = (index: number, value: string) => {
      const updated = [...logos];
      updated[index] = value;
      handleUpdate('logos', updated);
    };

    const addLogo = () => handleUpdate('logos', [...logos, 'SmileCo']);
    const removeLogo = (index: number) => handleUpdate('logos', logos.filter((_, idx) => idx !== index));

    return (
      <>
        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Layout & Container</h3>
        <div className="grid grid-cols-2 gap-3">
          {renderSelect('Layout', 'layoutVariant', widget.props.layoutVariant || 'card', [
            { value: 'card', label: 'Card' },
            { value: 'minimal', label: 'Minimal' }
          ])}
          {renderSelect('Alignment', 'alignment', widget.props.alignment || 'left', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' }
          ])}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Max Width', 'maxWidth', widget.props.maxWidth || '640px')}
          {renderTextInput('Padding', 'cardPadding', widget.props.cardPadding || '2.5rem')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Background Color', 'backgroundColor', widget.props.backgroundColor || '#0f172a')}
          {renderTextInput('Background Gradient', 'backgroundGradient', widget.props.backgroundGradient || '', 'linear-gradient(...)')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderTextInput('Border Radius', 'borderRadius', widget.props.borderRadius || '1.75rem')}
          {renderTextInput('Border Width', 'borderWidth', widget.props.borderWidth || '0px')}
        </div>
        {renderColorPicker('Border Color', 'borderColor', widget.props.borderColor || 'transparent')}
        {renderTextInput('Box Shadow', 'boxShadow', widget.props.boxShadow || '0 35px 65px rgba(15,23,42,0.35)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Quote Content</h3>
        {renderTextarea('Quote', 'quote', widget.props.quote || '“Our patients love the seamless experience we created with CairoDental.”')}
        {renderTextInput('Highlight Text', 'highlightText', widget.props.highlightText || 'patients')}
        <div className="grid grid-cols-2 gap-3">
          {renderColorPicker('Quote Color', 'quoteColor', widget.props.quoteColor || '#ffffff')}
          {renderColorPicker('Highlight Color', 'highlightColor', widget.props.highlightColor || '#fde047')}
        </div>
        {renderSlider('Quote Font Size', 'quoteSize', widget.props.quoteSize || 1.4, 1, 2.4, 0.1)}
        {renderSlider('Quote Line Height', 'quoteLineHeight', widget.props.quoteLineHeight || 1.5, 0, 20, 0.1)}
        {renderSwitch('Italicize Quote', 'quoteItalic', widget.props.quoteItalic ?? true)}
        {renderSwitch('Show Quote Icon', 'showQuoteIcon', widget.props.showQuoteIcon ?? true)}
        {widget.props.showQuoteIcon !== false && (
          <div className="grid grid-cols-2 gap-3">
            <IconPicker
              value={widget.props.quoteIconName || 'MessageSquare'}
              uploadedIcon={widget.props.quoteIconUpload}
              onChange={(name, uploadedUrl) => handleUpdateMultiple({
                quoteIconName: name,
                quoteIconUpload: uploadedUrl || ''
              })}
            />
            {renderColorPicker('Quote Icon Color', 'quoteIconColor', widget.props.quoteIconColor || '#0f172a')}
          </div>
        )}
        {widget.props.showQuoteIcon !== false && renderColorPicker('Quote Icon Background', 'quoteIconBackground', widget.props.quoteIconBackground || '#fde68a')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Author & Avatar</h3>
        {renderSwitch('Show Avatar', 'showAvatar', widget.props.showAvatar ?? true)}
        {widget.props.showAvatar !== false && (
          <>
            <ImageUpload
              value={widget.props.avatar}
              onChange={(url) => handleUpdate('avatar', url)}
              label="Author Avatar"
            />
            {renderSelect('Avatar Shape', 'avatarShape', widget.props.avatarShape || 'circle', [
              { value: 'circle', label: 'Circle' },
              { value: 'rounded', label: 'Rounded' }
            ])}
            {renderSelect('Avatar Size', 'avatarSize', widget.props.avatarSize || '64px', [
              { value: '56px', label: 'Small' },
              { value: '64px', label: 'Medium' },
              { value: '72px', label: 'Large' }
            ])}
          </>
        )}
        {renderTextInput('Author Name', 'author', widget.props.author)}
        {renderTextInput('Author Role', 'role', widget.props.role)}
        {renderTextInput('Company / Location', 'company', widget.props.company)}
        {renderColorPicker('Author Name Color', 'authorColor', widget.props.authorColor || '#ffffff')}
        {renderColorPicker('Role Color', 'roleColor', widget.props.roleColor || 'rgba(255,255,255,0.7)')}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Rating & Metrics</h3>
        {renderSwitch('Show Rating', 'showRating', widget.props.showRating ?? true)}
        {widget.props.showRating !== false && (
          <>
            {renderSlider('Rating', 'rating', widget.props.rating ?? 5, 0, 5, 0.1)}
            {renderTextInput('Rating Label', 'ratingLabel', widget.props.ratingLabel || 'Based on 180 patient stories')}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Star Color', 'starColor', widget.props.starColor || '#facc15')}
              {renderColorPicker('Rating Text Color', 'ratingColor', widget.props.ratingColor || 'rgba(255,255,255,0.85)')}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">CTA</h3>
        {renderSwitch('Show CTA Button', 'showCTA', widget.props.showCTA ?? true)}
        {widget.props.showCTA !== false && (
          <>
            {renderTextInput('Button Text', 'ctaText', widget.props.ctaText || 'Read full case study')}
            {renderTextInput('Button Link', 'ctaHref', widget.props.ctaHref || '#')}
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Button Background', 'ctaBackground', widget.props.ctaBackground || '#fde047')}
              {renderColorPicker('Button Text Color', 'ctaTextColor', widget.props.ctaTextColor || '#0f172a')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderColorPicker('Button Hover Background', 'ctaHoverBackground', widget.props.ctaHoverBackground || '#facc15')}
              {renderColorPicker('Button Hover Text', 'ctaHoverTextColor', widget.props.ctaHoverTextColor || '#0f172a')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderTextInput('Button Padding', 'ctaPadding', widget.props.ctaPadding || '0.85rem 1.6rem')}
              {renderTextInput('Button Border Radius', 'ctaBorderRadius', widget.props.ctaBorderRadius || '999px')}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <h3 className="text-sm font-semibold mb-3 text-blue-700">Logo Strip</h3>
        {renderSwitch('Show Logos', 'showLogos', widget.props.showLogos ?? true)}
        {widget.props.showLogos !== false && (
          <>
            <div className="space-y-2">
              <Label>Logos</Label>
              {logos.map((logo: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={logo}
                    onChange={(e) => updateLogo(idx, e.target.value)}
                    placeholder={`Logo ${idx + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeLogo(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addLogo} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Logo
              </Button>
            </div>
            {renderColorPicker('Logo Text Color', 'logoTextColor', widget.props.logoTextColor || 'rgba(255,255,255,0.6)')}
          </>
        )}

        {renderPositionAndSize()}
      </>
    );
  };

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
        {widget.type === 'anchor' && renderAnchorProperties()}
        
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
