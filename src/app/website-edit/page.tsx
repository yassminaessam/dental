/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Columns, 
  Video, 
  Globe, 
  MessageSquare,
  CreditCard,
  AlertCircle,
  Layout,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Save,
  Undo,
  Redo,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  GripVertical,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Menu,
  User,
  Search,
  Link,
  Link2,
  Layers,
  Grid,
  List,
  BarChart,
  LineChart,
  PieChart,
  Table,
  FileText,
  File,
  Folder,
  Download,
  Upload,
  Share2,
  Maximize2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Volume2,
  VolumeX,
  Cloud,
  Home,
  Check,
  X,
  Info,
  HelpCircle,
  Plus,
  Minus,
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Sun,
  Moon,
  Zap,
  Bell,
  Lock,
  Unlock,
  Camera,
  Image,
  Mic,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Bluetooth,
  Database,
  HardDrive,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Tv,
  Printer,
  Bookmark,
  Tag,
  Flag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Gift,
  Package,
  Percent,
  Hash,
  AtSign,
  Anchor as AnchorIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PropertyEditor } from "@/components/website-builder/PropertyEditor";
import type { Widget, WidgetDefinition, NavLink } from "@/types/website-builder";
import { normalizeNavLinks } from "@/lib/website-builder";

type StyleValue = string | number | null | undefined;

type CanvasSettings = {
  backgroundColor: string;
  backgroundGradient: string;
  padding: string;
  borderRadius: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  shadow: string;
  showGrid: boolean;
  gridColor: string;
  gridSize: number;
  extraWidthPadding: number;
  extraHeightPadding: number;
  minWidth: string;
  minHeight: string;
  maxWidth: string;
  maxHeight: string;
  align: 'left' | 'center';
};

type BuilderStatePayload = {
  templates: TemplateDefinition[];
  canvasWidgets: Widget[];
  canvasSettings: CanvasSettings;
};

const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  backgroundColor: '#ffffff',
  backgroundGradient: '',
  padding: '2rem',
  borderRadius: '24px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(15,23,42,0.08)',
  shadow: '0 35px 80px rgba(15,23,42,0.08)',
  showGrid: false,
  gridColor: 'rgba(15,23,42,0.25)',
  gridSize: 40,
  extraWidthPadding: 200,
  extraHeightPadding: 200,
  minWidth: '1200px',
  minHeight: '1000px',
  maxWidth: '1600px',
  maxHeight: '2000px',
  align: 'center'
};

const CANVAS_SETTINGS_STORAGE_KEY = 'websiteBuilderCanvasSettings';
const BUILDER_STATE_STORAGE_KEY = 'websiteBuilderState';
const BUILDER_STATE_API_PATH = '/api/website-builder/state';

const camelToKebab = (value: string) =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const formatStyleValue = (value: StyleValue) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value;
};

const buildCssBlock = (className: string, styles: Record<string, StyleValue>) => {
  const cssBody = Object.entries(styles)
    .map(([key, value]) => {
      const formatted = formatStyleValue(value);
      return formatted ? `${camelToKebab(key)}: ${formatted};` : '';
    })
    .filter(Boolean)
    .join(' ');

  if (!cssBody) {
    return '';
  }

  return `.${className} { ${cssBody} }`;
};

const parseSizeValue = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(numeric)) return numeric;
  }
  return fallback;
};

const parsePaddingShorthand = (value: unknown): { horizontal: number; vertical: number } => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return { horizontal: value * 2, vertical: value * 2 };
  }

  if (typeof value !== 'string') {
    return { horizontal: 0, vertical: 0 };
  }

  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { horizontal: 0, vertical: 0 };
  }

  const values = tokens.map((token) => parseSizeValue(token, 0));

  switch (values.length) {
    case 1:
      return { horizontal: values[0] * 2, vertical: values[0] * 2 };
    case 2:
      return { horizontal: values[1] * 2, vertical: values[0] * 2 };
    case 3:
      return { horizontal: values[1] * 2, vertical: values[0] + values[2] };
    default:
      return { horizontal: values[1] + values[3], vertical: values[0] + values[2] };
  }
};

const getWidgetHeight = (widget: Widget): number => {
  const rawHeight = widget.props?.height;

  if (typeof rawHeight === 'number') {
    return rawHeight;
  }

  if (typeof rawHeight === 'string') {
    const parsed = parseFloat(rawHeight);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  switch (widget.type) {
    case 'heading':
      return 120;
    case 'text':
      return 160;
    case 'image':
      return 240;
    case 'stats':
      return 220;
    case 'newsletter':
      return 360;
    case 'testimonial':
      return 320;
    case 'carousel':
      return 420;
    case 'gallery':
      return 360;
    case 'pricing':
      return 380;
    case 'productCard':
      return 380;
    case 'contactInfo':
      return 320;
    case 'navbar':
      return 80;
    case 'footer':
      return 150;
    case 'section':
      return 520;
    case 'anchor':
      return 40;
    default:
      return 200;
  }
};

// Available widgets library
const widgetLibrary: WidgetDefinition[] = [
  // Basic Content
  {
    type: 'heading',
    label: 'Heading',
    icon: Type,
    category: 'basic',
    defaultProps: { 
      text: 'New Heading', 
      level: 'h2', 
      color: '#000000', 
      fontSize: '2rem',
      textAlign: 'left',
      fontWeight: 'bold',
      fontFamily: 'inherit',
      letterSpacing: 'normal',
      textTransform: 'none',
      textDecoration: 'none',
      margin: '0 0 1rem 0',
      textShadow: 'none'
    }
  },
  {
    type: 'text',
    label: 'Text',
    icon: Type,
    category: 'basic',
    defaultProps: { 
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 
      color: '#333333', 
      fontSize: '1rem',
      textAlign: 'left',
      lineHeight: '1.5',
      fontFamily: 'inherit',
      fontWeight: 'normal',
      fontStyle: 'normal',
      letterSpacing: 'normal',
      wordSpacing: 'normal',
      textIndent: '0',
      margin: '0 0 1rem 0',
      maxWidth: '100%'
    }
  },
  {
    type: 'image',
    label: 'Image',
    icon: ImageIcon,
    category: 'basic',
    defaultProps: { 
      src: '', 
      uploadedUrl: '',
      alt: 'Image', 
      width: '100%', 
      height: 'auto',
      objectFit: 'cover',
      objectPosition: 'center',
      borderRadius: '0',
      borderWidth: '0',
      borderColor: '#e0e0e0',
      borderStyle: 'solid',
      boxShadow: 'none',
      opacity: '1',
      filter: 'none',
      loading: 'lazy',
      aspectRatio: 'auto',
      backgroundColor: '#f8fafc',
      padding: '0',
      margin: '0 0 1.5rem',
      align: 'center',
      hoverEffect: 'none',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      link: '',
      openInNewTab: false,
      linkRel: 'noopener noreferrer',
      caption: '',
      showCaption: false,
      captionColor: '#4b5563',
      captionAlign: 'center',
      captionSize: '0.875rem'
    }
  },
  {
    type: 'button',
    label: 'Button',
    icon: Square,
    category: 'basic',
    defaultProps: { 
      text: 'Click Me', 
      backgroundColor: '#0066cc', 
      color: '#ffffff', 
      link: '#',
      size: 'medium',
      borderRadius: '0.375rem',
      fullWidth: false,
      borderWidth: '0',
      borderColor: '#0066cc',
      borderStyle: 'solid',
      boxShadow: 'none',
      hoverBackgroundColor: '#0052a3',
      hoverColor: '#ffffff',
      hoverBoxShadow: 'none',
      fontSize: '',
      fontWeight: '600',
      padding: '',
      letterSpacing: 'normal',
      textTransform: 'none',
      transition: 'all 0.2s ease',
      align: 'center',
      openInNewTab: false,
      linkRel: 'noopener noreferrer',
      disabled: false
    }
  },
  {
    type: 'video',
    label: 'Video',
    icon: Video,
    category: 'basic',
    defaultProps: { 
      src: '', 
      poster: '',
      width: '100%', 
      height: '400px',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      borderRadius: '0',
      boxShadow: 'none'
    }
  },
  {
    type: 'icon',
    label: 'Icon',
    icon: Globe,
    category: 'basic',
    defaultProps: { 
      iconType: 'lucide',
      name: 'Globe',
      uploadedIcon: '',
      size: '2.5rem', 
      color: '#0f172a',
      strokeWidth: '1.5',
      backgroundColor: 'transparent',
      borderRadius: '0',
      padding: '0.5rem',
      margin: '0 auto 1rem',
      borderWidth: '0px',
      borderColor: 'transparent',
      borderStyle: 'solid',
      boxShadow: 'none',
      opacity: '1',
      rotation: '0',
      flip: 'none',
      align: 'center',
      hoverColor: '#0f172a',
      hoverBackground: 'transparent',
      hoverBoxShadow: 'none',
      hoverScale: '1',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      link: '',
      openInNewTab: false,
      linkRel: 'noopener noreferrer',
      tooltip: '',
      showLabel: false,
      label: '',
      labelPosition: 'bottom',
      labelColor: '#1f2937',
      labelSize: '0.875rem',
      labelSpacing: '0.25rem',
      useImage: false,
      imageSrc: ''
    }
  },
  // Layout & Structure
  {
    type: 'section',
    label: 'Section',
    icon: Layout,
    category: 'layout',
    defaultProps: { 
      backgroundColor: '#ffffff', 
      backgroundImage: '',
      padding: '2rem', 
      columns: 1,
      columnGap: '1rem',
      maxWidth: '100%',
      centerContent: false
    }
  },
  {
    type: 'column',
    label: 'Column',
    icon: Columns,
    category: 'layout',
    defaultProps: { 
      width: '100%', 
      padding: '1rem',
      backgroundColor: 'transparent',
      minHeight: '100px'
    }
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: Square,
    category: 'layout',
    defaultProps: { 
      color: '#e0e0e0', 
      height: '1px', 
      margin: '1rem 0',
      style: 'solid'
    }
  },
  // Interactive Elements
  {
    type: 'accordion',
    label: 'Accordion',
    icon: ChevronDown,
    category: 'interactive',
    defaultProps: { 
      title: 'Accordion Title', 
      content: 'Accordion content goes here. You can add more details or information that will be revealed when the user clicks on the title.',
      defaultOpen: false,
      headerBackground: '#f8fafc',
      headerHoverBackground: '#eef2ff',
      headerTextColor: '#0f172a',
      containerBackground: 'transparent',
      contentBackground: '#ffffff',
      contentTextColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '0.75rem',
      boxShadow: 'none',
      headerPadding: '1rem 1.25rem',
      contentPadding: '1rem 1.25rem',
      iconColor: '#0f172a',
      iconBackground: 'transparent',
      iconSize: '1.125rem',
      iconShape: 'chevron',
      iconPosition: 'right',
      gap: '0.75rem',
      transition: 'all 0.25s ease',
      showDivider: false,
      dividerColor: '#e5e7eb',
      showContentBorder: false,
      contentBorderColor: '#e5e7eb',
      titleFontSize: '1rem',
      contentFontSize: '0.95rem'
    }
  },
  {
    type: 'form',
    label: 'Form',
    icon: MessageSquare,
    category: 'interactive',
    defaultProps: { 
      title: 'Contact Form',
      description: 'We would love to hear from you. Fill out the form below and we will reply shortly.',
      fields: ['name', 'email', 'message'], 
      submitText: 'Submit',
      action: '',
      method: 'POST',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      gap: '1rem',
      shadow: '0 10px 25px rgba(0,0,0,0.05)',
      titleAlign: 'left',
      descriptionColor: '#4b5563',
      showLabels: true,
      labelColor: '#111827',
      labelFontSize: '0.95rem',
      inputBackground: '#ffffff',
      inputTextColor: '#111827',
      inputBorderColor: '#d1d5db',
      inputBorderWidth: '1px',
      inputBorderStyle: 'solid',
      inputBorderRadius: '0.5rem',
      inputPadding: '0.75rem',
      inputPlaceholderColor: '#9ca3af',
      columns: 1,
      buttonBackground: '#2563eb',
      buttonTextColor: '#ffffff',
      buttonPadding: '0.75rem 1.5rem',
      buttonBorderRadius: '0.5rem',
      buttonFullWidth: true,
      buttonHoverBackground: '#1d4ed8'
    }
  },
  {
    type: 'cta',
    label: 'Call to Action',
    icon: CreditCard,
    category: 'interactive',
    defaultProps: { 
      heading: 'Take Action Now', 
      description: 'Don\'t miss this amazing opportunity!',
      badgeText: 'Limited Offer',
      showBadge: true,
      alignment: 'center',
      contentMaxWidth: '640px',
      contentGap: '1rem',
      buttonsGap: '0.75rem',
      padding: '3rem',
      borderRadius: '1.5rem',
      shadow: '0 25px 70px rgba(15,23,42,0.35)',
      backgroundColor: '#0f172a',
      useBackgroundGradient: true,
      backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
      backgroundImage: '',
      showOverlay: true,
      overlayColor: '#0f172a',
      overlayOpacity: 0.65,
      textColor: '#ffffff',
      color: '#ffffff',
      headingColor: '#ffffff',
      headingSize: '2.5rem',
      headingWeight: '700',
      descriptionColor: '#f8fafc',
      descriptionSize: '1.125rem',
      descriptionMaxWidth: '560px',
      badgeBackground: 'rgba(255,255,255,0.15)',
      badgeColor: '#ffffff',
      badgePadding: '0.25rem 0.75rem',
      badgeLetterSpacing: '0.1em',
      buttonText: 'Get Started', 
      link: '#',
      buttonStyle: 'solid',
      buttonBackground: '#ffffff',
      buttonTextColor: '#0f172a',
      buttonHoverBackground: '#f1f5f9',
      buttonHoverColor: '#0f172a',
      buttonBorderRadius: '999px',
      buttonPadding: '0.9rem 2.4rem',
      buttonBorderWidth: '0px',
      buttonBorderColor: '#ffffff',
      buttonTransition: 'all 0.2s ease',
      buttonNewTab: false,
      buttonRel: 'noopener noreferrer',
      buttonsFullWidth: false,
      showSecondaryButton: false,
      secondaryButtonText: 'Learn More',
      secondaryButtonLink: '#',
      secondaryButtonStyle: 'outline',
      secondaryButtonBackground: 'transparent',
      secondaryButtonTextColor: '#ffffff',
      secondaryButtonHoverBackground: 'rgba(255,255,255,0.12)',
      secondaryButtonHoverColor: '#ffffff',
      secondaryButtonBorderColor: 'rgba(255,255,255,0.55)',
      secondaryButtonBorderWidth: '1px',
      secondaryButtonBorderRadius: '999px',
      secondaryButtonPadding: '0.9rem 2.2rem',
      secondaryButtonNewTab: false,
      secondaryButtonRel: 'noopener noreferrer',
      buttonsAlignment: 'center'
    }
  },
  {
    type: 'social',
    label: 'Social Media',
    icon: Globe,
    category: 'interactive',
    defaultProps: { 
      platforms: ['facebook', 'twitter', 'instagram'],
      size: 'medium',
      color: '#333333'
    }
  },
  // Cards & Alerts
  {
    type: 'card',
    label: 'Card',
    icon: Square,
    category: 'content',
    defaultProps: { 
      title: 'Card Title', 
      content: 'Card content goes here. Add your description or information.',
      image: '',
      link: '',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      borderWidth: '1px',
      borderColor: '#e0e0e0',
      borderStyle: 'solid'
    }
  },
  {
    type: 'alert',
    label: 'Alert',
    icon: AlertCircle,
    category: 'content',
    defaultProps: { 
      type: 'info',
      title: 'Heads up!',
      message: 'This is an alert message. It can be used to display important information to your users.',
      description: 'Additional context or supporting details can go here to guide the user.',
      showDescription: true,
      showIcon: true,
      icon: 'AlertCircle',
      iconSize: '1.25rem',
      iconColor: '',
      iconBackground: 'rgba(255,255,255,0.2)',
      layout: 'vertical',
      alignment: 'left',
      backgroundColor: '',
      textColor: '',
      borderColor: '',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '0.75rem',
      padding: '1rem 1.25rem',
      shadow: 'none',
      accentEnabled: false,
      accentColor: '',
      accentPosition: 'left',
      fullWidth: true,
      gap: '0.75rem',
      textGap: '0.35rem',
      iconSpacing: '0.75rem',
      messageLineHeight: '1.5',
      descriptionLineHeight: '1.5',
      showActions: false,
      primaryActionText: 'Resolve',
      primaryActionLink: '#',
      primaryActionVariant: 'solid',
      primaryActionBackground: '',
      primaryActionTextColor: '',
      primaryActionHoverBackground: '',
      primaryActionHoverTextColor: '',
      secondaryActionText: 'Dismiss',
      secondaryActionLink: '#',
      secondaryActionVariant: 'ghost',
      secondaryActionBackground: 'transparent',
      secondaryActionTextColor: '',
      secondaryActionHoverBackground: '',
      secondaryActionHoverTextColor: '',
      dismissible: false,
      closeLabel: 'Dismiss',
      closeIconColor: '',
      closeButtonVariant: 'ghost'
    }
  },
  // Navigation
  {
    type: 'navbar',
    label: 'Navigation Bar',
    icon: Menu,
    category: 'navigation',
    defaultProps: {
      logo: '',
      logoText: 'Brand',
      tagline: 'Quality Care For Every Smile',
      showTagline: false,
      links: [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' }
      ],
      backgroundColor: '#ffffff',
      backgroundGradient: '',
      color: '#1f2937',
      linkColor: '#0f172a',
      linkHoverColor: '#2563eb',
      linkHoverBackground: 'rgba(37,99,235,0.08)',
      linkActiveColor: '#1d4ed8',
      linkActiveBackground: 'rgba(37,99,235,0.12)',
      linkUppercase: false,
      linkGap: '1.5rem',
      linkPadding: '0.25rem 0.5rem',
      linkBorderRadius: '999px',
      containerMaxWidth: '1200px',
      padding: '0.75rem 2rem',
      height: '72px',
      linksAlignment: 'between',
      position: 'sticky',
      stickyOffset: '0px',
      showDivider: false,
      dividerColor: 'rgba(15,23,42,0.08)',
      borderBottom: '1px solid rgba(15,23,42,0.08)',
      rounded: '999px',
      shadow: true,
      showButton: true,
      buttonText: 'Book Visit',
      buttonLink: '#book',
      buttonVariant: 'solid',
      buttonBackground: '#2563eb',
      buttonTextColor: '#ffffff',
      buttonHoverBackground: '#1d4ed8',
      buttonHoverTextColor: '#ffffff',
      buttonBorderColor: '#2563eb',
      buttonBorderWidth: '0px',
      buttonBorderRadius: '999px',
      showSecondaryAction: false,
      secondaryActionIcon: 'Phone',
      secondaryActionLabel: 'Call Us',
      secondaryActionLink: '#contact',
      socialPlatforms: ['facebook', 'instagram'],
      showSocialIcons: false
    }
  },
  {
    type: 'anchor',
    label: 'Anchor Target',
    icon: AnchorIcon,
    category: 'navigation',
    defaultProps: {
      anchorId: 'section-anchor',
      label: 'Section Anchor',
      helperText: 'Drop near a section to create a scroll target.',
      showLabel: false,
      indicatorColor: '#2563eb',
      scrollMargin: 120,
      width: '100%',
      height: '0px'
    }
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: Layers,
    category: 'navigation',
    defaultProps: {
      backgroundColor: '#333333',
      color: '#ffffff',
      padding: '3rem 2rem',
      columns: 3,
      copyright: '© 2024 Your Company. All rights reserved.',
      links: []
    }
  },
  {
    type: 'breadcrumb',
    label: 'Breadcrumb',
    icon: ChevronRight,
    category: 'navigation',
    defaultProps: {
      items: ['Home', 'Products', 'Category', 'Item'],
      separator: '/',
      color: '#666666',
      hoverColor: '#0066cc'
    }
  },
  // Data Display
  {
    type: 'table',
    label: 'Table',
    icon: Table,
    category: 'data',
    defaultProps: {
      headers: ['Name', 'Email', 'Status'],
      rows: [
        ['John Doe', 'john@example.com', 'Active'],
        ['Jane Smith', 'jane@example.com', 'Pending']
      ],
      striped: true,
      stripedColor: 'rgba(15,23,42,0.04)',
      hoverable: true,
      rowHoverColor: 'rgba(37,99,235,0.08)',
      bordered: true,
      borderColor: 'rgba(15,23,42,0.12)',
      borderWidth: '1px',
      borderRadius: '1rem',
      showShadow: true,
      tableShadow: '0 25px 45px rgba(15,23,42,0.08)',
      tableBackground: '#ffffff',
      tablePadding: '1.5rem',
      headerBackground: '#f8fafc',
      headerColor: '#0f172a',
      headerFontSize: '0.75rem',
      headerFontWeight: '600',
      headerLetterSpacing: '0.08em',
      headerTextTransform: 'uppercase',
      headerPadding: '0.75rem 1rem',
      headerBorderColor: 'rgba(15,23,42,0.12)',
      cellPadding: '0.85rem 1rem',
      cellFontSize: '0.95rem',
      cellColor: '#1f2937',
      cellBackground: '#ffffff',
      showRowDividers: true,
      rowBorderWidth: '1px',
      rowBorderColor: 'rgba(15,23,42,0.08)',
      showColumnDividers: false,
      columnDividerWidth: '1px',
      columnDividerColor: 'rgba(15,23,42,0.08)',
      columnAlignments: ['left', 'left', 'center'],
      minTableWidth: '640px',
      maxVisibleRows: 4,
      caption: 'Recent Performance',
      showCaption: true,
      captionPosition: 'top',
      captionAlign: 'left',
      showToolbar: true,
      toolbarTitle: 'Team KPIs',
      toolbarDescription: 'Snapshot of efficiency across the practice',
      toolbarActionText: 'View All',
      toolbarActionLink: '#reports',
      toolbarActionVariant: 'ghost',
      emptyStateText: 'No data available',
      tableAccentColor: '#2563eb'
    }
  },
  {
    type: 'list',
    label: 'List',
    icon: List,
    category: 'data',
    defaultProps: {
      items: ['First item', 'Second item', 'Third item'],
      listType: 'unordered',
      listStyle: 'disc',
      color: '#333333',
      fontSize: '1rem',
      lineHeight: '1.8',
      padding: '0 0 0 1.5rem'
    }
  },
  {
    type: 'progressBar',
    label: 'Progress Bar',
    icon: BarChart,
    category: 'data',
    defaultProps: {
      min: 0,
      value: 65,
      max: 100,
      valueStep: 1,
      label: 'Treatment Progress',
      description: 'Tracking quarterly patient acquisition goals',
      showLabel: true,
      showDescription: true,
      showValue: true,
      valueFormat: 'percent',
      valueDecimalPlaces: 0,
      valuePrefix: '',
      valueSuffix: '%',
      valuePosition: 'inline',
      labelLayout: 'stacked',
      labelColor: '#0f172a',
      descriptionColor: '#475569',
      valueColor: '#0f172a',
      valueInsideColor: '#ffffff',
      barHeight: '1rem',
      height: '1rem',
      borderRadius: '999px',
      trackColor: '#e2e8f0',
      backgroundColor: '#e2e8f0',
      trackBorderWidth: '0px',
      trackBorderColor: 'transparent',
      fillColor: '#2563eb',
      fillGradient: 'linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)',
      useGradient: true,
      fillShadow: '0 12px 30px rgba(37,99,235,0.35)',
      animateTransition: true,
      animated: true,
      striped: true,
      stripeColor: 'rgba(255,255,255,0.35)',
      stripeSize: '1.5rem 1.5rem',
      animateStripes: true,
      showGlow: true,
      glowColor: 'rgba(14,165,233,0.35)',
      showGoal: true,
      goalValue: 90,
      goalLabel: 'Target 90%',
      goalColor: '#0ea5e9',
      goalLabelColor: '#0f172a',
      showGoalLabel: true,
      showMinMaxLabels: true,
      minLabel: '0%',
      maxLabel: '100%',
      minMaxColor: '#94a3b8'
    }
  },
  {
    type: 'stats',
    label: 'Statistics',
    icon: PieChart,
    category: 'data',
    defaultProps: {
      value: '1,234',
      valuePrefix: '',
      valueSuffix: '',
      valueColor: '#0f172a',
      valueFontSize: '2.5rem',
      valueFontWeight: '700',
      valueLineHeight: '1.1',
      valueLetterSpacing: '-0.02em',
      label: 'Total Sales',
      labelColor: '#475569',
      labelFontSize: '1rem',
      labelFontWeight: '600',
      labelUppercase: false,
      description: 'vs last month',
      descriptionColor: '#94a3b8',
      showDescription: true,
      showBadge: true,
      badgeText: 'Live',
      badgeStyle: 'pill',
      badgeColor: '#1d4ed8',
      badgeBackground: 'rgba(59,130,246,0.12)',
      showIcon: true,
      iconName: 'TrendingUp',
      icon: 'TrendingUp',
      iconUpload: '',
      iconColor: '#2563eb',
      iconBackground: 'rgba(37,99,235,0.12)',
      iconPadding: '0.65rem',
      iconBorderRadius: '0.85rem',
      iconBorderWidth: '0px',
      iconBorderStyle: 'solid',
      iconBorderColor: 'transparent',
      iconShadow: 'none',
      iconSize: '2rem',
      iconPosition: 'left',
      showChange: true,
      change: '+12%',
      changeLabel: 'vs last month',
      changeLabelColor: '#94a3b8',
      changeType: 'positive',
      changePrefix: '',
      changeSuffix: '',
      changeIconStyle: 'arrow',
      changeBadgeStyle: 'pill',
      changePositiveColor: '#15803d',
      changePositiveBackground: 'rgba(34,197,94,0.15)',
      changeNegativeColor: '#b91c1c',
      changeNegativeBackground: 'rgba(239,68,68,0.15)',
      changeNeutralColor: '#475569',
      changeNeutralBackground: 'rgba(71,85,105,0.12)',
      changeCustomColor: '#0f172a',
      changeCustomBackground: 'rgba(15,23,42,0.08)',
      layout: 'vertical',
      alignment: 'left',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      backgroundGradient: '',
      borderRadius: '1rem',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(15,23,42,0.08)',
      boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
      showAccent: false,
      accentColor: '#2563eb',
      accentPosition: 'top',
      accentSize: '48px',
      accentThickness: '4px',
      accentInset: '1rem',
      showDivider: false,
      dividerColor: 'rgba(15,23,42,0.12)',
      dividerThickness: '1px'
    }
  },
  // Forms & Inputs
  {
    type: 'searchBar',
    label: 'Search Bar',
    icon: Search,
    category: 'forms',
    defaultProps: {
      layout: 'inline',
      alignment: 'left',
      fullWidth: true,
      maxWidth: '640px',
      padding: '0',
      gap: '0.75rem',
      backgroundColor: 'transparent',
      backgroundGradient: '',
      borderRadius: '999px',
      borderWidth: '0px',
      borderColor: 'transparent',
      boxShadow: 'none',
      placeholder: 'Search services, doctors, or treatments...',
      label: 'Search',
      labelColor: '#0f172a',
      labelSize: '0.9rem',
      labelUppercase: false,
      showLabel: false,
      helperText: '',
      helperColor: '#94a3b8',
      showHelperText: false,
      inputTextColor: '#0f172a',
      inputFontSize: '1rem',
      inputHeight: '52px',
      inputPadding: '0.75rem 1rem',
      inputBackground: '#ffffff',
      inputBackgroundGradient: '',
      inputBorderRadius: '999px',
      inputBorderWidth: '1px',
      inputBorderStyle: 'solid',
      inputBorderColor: '#e2e8f0',
      inputPlaceholderColor: '#94a3b8',
      focusRingColor: '#2563eb',
      inputShadow: '0 4px 12px rgba(15,23,42,0.08)',
      showIcon: true,
      iconName: 'Search',
      iconColor: '#2563eb',
      iconBackground: 'transparent',
      iconSize: '1.1rem',
      iconPosition: 'left',
      showButton: true,
      buttonText: 'Search',
      buttonVariant: 'solid',
      buttonPadding: '0.75rem 1.5rem',
      buttonBackground: '#2563eb',
      buttonTextColor: '#ffffff',
      buttonHoverBackground: '#1d4ed8',
      buttonHoverTextColor: '#ffffff',
      buttonBorderWidth: '0px',
      buttonBorderStyle: 'solid',
      buttonBorderColor: 'transparent',
      buttonRadius: '999px',
      buttonIconName: '',
      buttonIconPosition: 'right',
      showVoiceButton: false,
      voiceButtonTooltip: 'Voice search',
      voiceButtonColor: '#475569',
      voiceButtonBackground: 'rgba(148,163,184,0.15)',
      showAdvancedButton: false,
      advancedButtonLabel: 'Advanced',
      advancedButtonVariant: 'ghost',
      advancedButtonTextColor: '#2563eb',
      advancedButtonHoverColor: '#1d4ed8',
      showFilters: false,
      filtersLabel: 'Popular searches',
      quickFilters: ['Teeth whitening', 'Braces', 'Dental implants'],
      filterStyle: 'pill',
      filterTextColor: '#2563eb',
      filterBackground: 'rgba(37,99,235,0.08)',
      filterBorderColor: 'transparent',
      filterHoverBackground: 'rgba(37,99,235,0.15)',
      filterGap: '0.5rem'
    }
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    category: 'forms',
    defaultProps: {
      layout: 'centered',
      alignment: 'center',
      maxWidth: '720px',
      padding: '3rem',
      gap: '1.5rem',
      textGap: '1.25rem',
      backgroundColor: '#ffffff',
      backgroundGradient: '',
      borderRadius: '1.25rem',
      borderWidth: '1px',
      borderColor: 'rgba(15,23,42,0.08)',
      boxShadow: '0 30px 60px rgba(15,23,42,0.08)',
      showBadge: true,
      badgeText: 'Free dental tips',
      badgeBackground: 'rgba(59,130,246,0.12)',
      badgeColor: '#2563eb',
      showEyebrow: true,
      eyebrow: 'Stay in the loop',
      eyebrowColor: '#2563eb',
      title: 'Subscribe to our Newsletter',
      titleFontSize: '2.5rem',
      titleFontWeight: '700',
      titleColor: '#0f172a',
      description: 'Monthly dental care news, promotions, and patient success stories delivered straight to your inbox.',
      descriptionColor: '#475569',
      descriptionSpacing: '1.25rem',
      bulletPoints: [
        'Exclusive promotions and offers',
        'Monthly dental health tips',
        'Priority access to new services'
      ],
      bulletIconName: 'Check',
      bulletIconColor: '#16a34a',
      bulletTextColor: '#0f172a',
      inputLabel: '',
      inputLabelColor: '#0f172a',
      placeholder: 'Enter your email address',
      inputHelperText: '',
      helperColor: '#94a3b8',
      inputBackground: '#ffffff',
      inputBackgroundGradient: '',
      inputBorderRadius: '999px',
      inputBorderWidth: '1px',
      inputBorderColor: 'rgba(148,163,184,0.6)',
      inputShadow: '0 10px 30px rgba(15,23,42,0.12)',
      inputTextColor: '#0f172a',
      inputPlaceholderColor: '#94a3b8',
      buttonText: 'Subscribe',
      buttonVariant: 'solid',
      buttonPadding: '0.85rem 1.75rem',
      buttonBackground: '#2563eb',
      buttonTextColor: '#ffffff',
      buttonHoverBackground: '#1d4ed8',
      buttonHoverTextColor: '#ffffff',
      buttonBorderWidth: '0px',
      buttonBorderStyle: 'solid',
      buttonBorderColor: 'transparent',
      buttonRadius: '999px',
      buttonIconName: 'ArrowRight',
      buttonIconPosition: 'right',
      showSecondaryButton: true,
      secondaryButtonText: 'No thanks, maybe later',
      secondaryButtonVariant: 'link',
      secondaryButtonColor: '#64748b',
      secondaryButtonHoverColor: '#0f172a',
      consentText: 'By subscribing you agree to receive emails from us. Unsubscribe anytime.',
      consentTextColor: '#94a3b8',
      successMessage: "You're in! Check your inbox for a confirmation email.",
      successMessageColor: '#15803d',
      showStats: true,
      statsValue: '98%',
      statsLabel: 'Patient satisfaction',
      statsAccentColor: '#22c55e',
      showLogos: true,
      logosTitle: 'Trusted by leading clinics',
      logos: ['SmileCo', 'BrightDental', 'OralCare+'],
      logoTextColor: '#64748b',
      showImage: true,
      imagePosition: 'right',
      imageUrl: '',
      imageAlt: 'Happy patient illustration',
      imageBackground: '#eef2ff',
      imageBorderRadius: '1rem',
      imageHeight: '280px'
    }
  },
  {
    type: 'contactInfo',
    label: 'Contact Info',
    icon: Phone,
    category: 'forms',
    defaultProps: {
      layout: 'cards',
      alignment: 'left',
      columns: '2',
      itemGap: '1rem',
      padding: '2rem',
      backgroundColor: '#ffffff',
      backgroundGradient: '',
      borderRadius: '1.25rem',
      borderWidth: '1px',
      borderColor: 'rgba(15,23,42,0.08)',
      boxShadow: '0 20px 45px rgba(15,23,42,0.12)',
      heading: 'Contact our care team',
      subheading: 'We respond within one business day',
      headingColor: '#0f172a',
      subheadingColor: '#475569',
      textGap: '1rem',
      showIcons: true,
      iconColor: '#2563eb',
      iconBackground: 'rgba(37,99,235,0.08)',
      iconSize: '1.1rem',
      textColor: '#0f172a',
      helperColor: '#64748b',
      fontSize: '1rem',
      valueFontWeight: '600',
      contactItems: [
        {
          icon: 'Phone',
          label: 'Call us',
          value: '(555) 123-4567',
          helper: 'Mon-Fri · 9am-6pm',
          href: 'tel:+15551234567'
        },
        {
          icon: 'Mail',
          label: 'Email',
          value: 'smiles@cairodental.com',
          helper: 'We reply within 24h',
          href: 'mailto:smiles@cairodental.com'
        },
        {
          icon: 'MapPin',
          label: 'Visit us',
          value: '12 Nile St, Cairo',
          helper: 'Parking available on site',
          href: 'https://maps.google.com/'
        }
      ],
      showCTA: true,
      ctaText: 'Book an appointment',
      ctaHref: '#',
      ctaVariant: 'solid',
      ctaBackground: '#2563eb',
      ctaTextColor: '#ffffff',
      ctaPadding: '0.85rem 1.5rem',
      ctaBorderWidth: '0px',
      ctaBorderColor: 'transparent',
      ctaIconName: 'ArrowRight',
      ctaIconPosition: 'right',
      showSecondaryCTA: true,
      secondaryCTAText: 'Email our coordinators',
      secondaryCTAHref: 'mailto:smiles@cairodental.com',
      secondaryCTAColor: '#2563eb',
      footnote: 'Emergency patients can call our hotline 24/7.',
      footnoteColor: '#94a3b8',
      showSocial: true,
      socialLabel: 'Connect with us',
      socialPlatforms: ['facebook', 'instagram', 'linkedin'],
      socialIconColor: '#2563eb',
      socialIconBackground: 'rgba(37,99,235,0.08)',
      socialLinks: {
        facebook: 'https://facebook.com/cairodental',
        instagram: 'https://instagram.com/cairodental',
        linkedin: 'https://linkedin.com/company/cairodental'
      }
    }
  },
  // Media
  {
    type: 'gallery',
    label: 'Image Gallery',
    icon: Grid,
    category: 'media',
    defaultProps: {
      images: [
        {
          src: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=80',
          alt: 'Modern dental suite',
          title: 'Modern Suites',
          description: 'Spa-like treatment rooms with panoramic city views.',
          badge: 'Clinic'
        },
        {
          src: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=800&q=80',
          alt: 'Patient smile makeover',
          title: 'Smile Makeover',
          description: 'Composite veneers applied in a single visit.',
          badge: 'Case Study'
        },
        {
          src: 'https://images.unsplash.com/photo-1507457379470-08b5f7c4f1b4?auto=format&fit=crop&w=800&q=80',
          alt: 'Digital scanning',
          title: 'Digital Scans',
          description: '3D intraoral scanning for accurate treatment planning.',
          badge: 'Technology'
        }
      ],
      heading: 'Treatment Gallery',
      subheading: 'Recent cases and behind-the-scenes moments from our specialists.',
      textGap: '1rem',
      layout: 'grid',
      columns: 3,
      mobileColumns: 1,
      gap: '1rem',
      rowGap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      backgroundGradient: '',
      borderRadius: '1rem',
      borderWidth: '0px',
      borderColor: 'transparent',
      boxShadow: 'none',
      imageBorderRadius: '1rem',
      imageBorderWidth: '0px',
      imageBorderColor: 'transparent',
      imageShadow: '0 12px 25px rgba(15,23,42,0.12)',
      imageAspectRatio: '16/9',
      imageHeight: '',
      objectFit: 'cover',
      hoverEffect: 'zoom',
      showOverlay: true,
      overlayColor: 'rgba(15,23,42,0.45)',
      overlayIconName: 'Maximize2',
      showPreviewIcon: true,
      showCaptions: true,
      captionAlignment: 'left',
      captionColor: '#0f172a',
      captionDescriptionColor: '#475569',
      showBadges: true,
      badgeBackground: 'rgba(37,99,235,0.12)',
      badgeColor: '#2563eb',
      lightbox: true,
      openLinksInNewTab: true,
      ctaText: 'View all cases',
      ctaHref: '#',
      ctaVariant: 'outline',
      ctaBackground: '#2563eb',
      ctaTextColor: '#2563eb',
      ctaBorderColor: '#2563eb',
      ctaBorderWidth: '1px',
      ctaPadding: '0.65rem 1.25rem',
      ctaIconName: 'ArrowRight',
      ctaIconPosition: 'right'
    }
  },
  {
    type: 'carousel',
    label: 'Carousel',
    icon: Layers,
    category: 'media',
    defaultProps: {
      slides: [
        {
          image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1400&q=80',
          alt: 'Patient smile makeover',
          badge: 'Smile Makeover',
          headline: 'Transformative cosmetic dentistry',
          subheadline: 'Tailored veneer & whitening plans',
          description: 'See how our cosmetic specialists craft confident smiles with same-day restorations.',
          buttonText: 'Explore services',
          buttonHref: '#services'
        },
        {
          image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1400&q=80',
          alt: 'Modern dental studio',
          badge: 'Technology',
          headline: 'Comfort-first clinics',
          subheadline: 'Relaxing suites and digital workflows',
          description: 'Every chair features aromatherapy, streaming entertainment, and guided relaxation.',
          buttonText: 'Tour facilities',
          buttonHref: '#tour'
        },
        {
          image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80',
          alt: 'Pediatric dentistry',
          badge: 'Kids Club',
          headline: 'Gentle pediatric visits',
          subheadline: 'Playful care for growing smiles',
          description: 'Board-certified pediatric dentists make every visit positive with comfort kits and story time.',
          buttonText: 'Book kids visit',
          buttonHref: '#kids'
        }
      ],
      height: '460px',
      slideWidth: '80%',
      slideGap: '1.5rem',
      padding: '0',
      backgroundColor: 'transparent',
      backgroundGradient: '',
      borderRadius: '1.5rem',
      showOverlay: true,
      overlayColor: 'rgba(15,23,42,0.35)',
      overlayBlur: '0px',
      showContent: true,
      contentAlignment: 'left',
      headlineColor: '#ffffff',
      bodyColor: 'rgba(255,255,255,0.9)',
      badgeBackground: 'rgba(255,255,255,0.12)',
      badgeColor: '#ffffff',
      buttonPadding: '0.7rem 1.5rem',
      buttonBackground: '#ffffff',
      buttonTextColor: '#0f172a',
      showArrows: true,
      arrowPosition: 'sides',
      arrowBackground: 'rgba(15,23,42,0.6)',
      arrowColor: '#ffffff',
      showIndicators: true,
      indicatorStyle: 'dots',
      indicatorColor: 'rgba(255,255,255,0.4)',
      indicatorActiveColor: '#ffffff',
      showThumbnails: false,
      autoplay: true,
      interval: 5000,
      transitionDuration: 600,
      loop: true,
      pauseOnHover: true
    }
  },
  {
    type: 'audioPlayer',
    label: 'Audio Player',
    icon: Volume2,
    category: 'media',
    defaultProps: {
      src: '',
      title: 'Audio Title',
      artist: 'Artist Name',
      showControls: true,
      autoplay: false,
      loop: false,
      backgroundColor: '#f8f9fa'
    }
  },
  // Commerce
  {
    type: 'productCard',
    label: 'Product Card',
    icon: ShoppingCart,
    category: 'commerce',
    defaultProps: {
      layoutVariant: 'vertical',
      alignment: 'left',
      cardPadding: '1.75rem',
      contentGap: '1.25rem',
      cardBackground: '#ffffff',
      cardBackgroundGradient: '',
      borderRadius: '1.5rem',
      borderWidth: '1px',
      borderColor: 'rgba(15,23,42,0.08)',
      boxShadow: '0 25px 45px rgba(15,23,42,0.12)',
      showImage: true,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      imageAlt: 'SonicClean Pro whitening kit',
      imageHeight: '260px',
      imageBorderRadius: '1.25rem',
      imageBackground: '#eef2ff',
      objectFit: 'cover',
      mediaWidth: '320px',
      showBadge: true,
      badge: 'Bestseller',
      badgePosition: 'top-left',
      badgeBackground: 'rgba(59,130,246,0.18)',
      badgeTextColor: '#1d4ed8',
      showFavoriteIcon: true,
      favoriteIconName: 'Heart',
      favoriteIconColor: '#ef4444',
      favoriteIconBackground: '#ffffff',
      title: 'SonicClean Pro Whitening Kit',
      subtitle: 'Enamel-safe LED light treatment',
      description: 'Complete at-home whitening system with dual-light therapy, enamel-safe serum pens, and a travel-ready case.',
      price: '249',
      originalPrice: '329',
      currency: '$',
      showCurrency: true,
      priceSuffix: '/kit',
      priceLabel: 'One-time payment',
      priceColor: '#0f172a',
      originalPriceColor: '#94a3b8',
      showDiscount: true,
      discountText: 'Save 25%',
      discountColor: '#15803d',
      discountBackground: 'rgba(34,197,94,0.15)',
      titleColor: '#0f172a',
      subtitleColor: '#2563eb',
      descriptionColor: '#475569',
      stockStatus: 'In stock · Ships in 24h',
      stockColor: '#16a34a',
      shippingText: 'Free worldwide shipping',
      shippingColor: '#2563eb',
      showRating: true,
      rating: 4.8,
      ratingCountLabel: '128 reviews',
      ratingLabel: 'Recommended by dentists',
      starColor: '#facc15',
      ratingColor: '#475569',
      showFeatures: true,
      features: [
        'Enamel-safe LED dual-light therapy',
        'Built-in 15-minute auto timer',
        'Wireless magnetic charging travel case'
      ],
      featureIconName: 'Check',
      featureIconColor: '#2563eb',
      buttonText: 'Add to cart',
      buttonHref: '#',
      buttonVariant: 'solid',
      buttonFullWidth: true,
      buttonBackground: '#2563eb',
      buttonTextColor: '#ffffff',
      buttonHoverBackground: '#1d4ed8',
      buttonHoverTextColor: '#ffffff',
      buttonPadding: '0.85rem 1.4rem',
      buttonBorderRadius: '999px',
      buttonBorderWidth: '0px',
      buttonBorderColor: 'transparent',
      ctaIconName: 'ShoppingCart',
      ctaIconPosition: 'right',
      showSecondaryButton: true,
      secondaryButtonText: 'View details',
      secondaryButtonHref: '#',
      secondaryButtonVariant: 'link',
      secondaryButtonColor: '#2563eb',
      secondaryButtonHoverColor: '#1d4ed8',
      secondaryButtonBackground: 'transparent',
      secondaryButtonHoverBackground: 'transparent',
      secondaryButtonPadding: '0.5rem 0.75rem'
    }
  },
  {
    type: 'pricing',
    label: 'Pricing Table',
    icon: CreditCard,
    category: 'commerce',
    defaultProps: {
      layoutVariant: 'card',
      alignment: 'left',
      maxWidth: '420px',
      cardPadding: '2.25rem',
      backgroundColor: '#ffffff',
      backgroundGradient: '',
      borderRadius: '1.5rem',
      borderWidth: '1px',
      borderColor: 'rgba(15,23,42,0.08)',
      boxShadow: '0 25px 45px rgba(15,23,42,0.12)',
      showAccentBar: true,
      accentPosition: 'top',
      accentColor: '#2563eb',
      accentThickness: '4px',
      featured: true,
      badgeText: 'Most popular',
      badgeBackground: 'rgba(59,130,246,0.12)',
      badgeColor: '#1d4ed8',
      title: 'Professional Plan',
      subtitle: 'For rapidly scaling dental groups',
      description: 'Unlock unlimited messaging, advanced automations, and dedicated onboarding.',
      titleColor: '#0f172a',
      subtitleColor: '#2563eb',
      price: '149',
      originalPrice: '199',
      currency: '$',
      showCurrency: true,
      priceSuffix: '/month',
      priceLabel: 'Billed monthly · Cancel anytime',
      priceSubtext: 'Switch to annual billing and save 15%',
      priceColor: '#0f172a',
      priceSuffixColor: '#475569',
      originalPriceColor: '#94a3b8',
      descriptionColor: '#475569',
      showOriginalPrice: true,
      showFeatures: true,
      features: [
        'Unlimited patient profiles & messaging',
        'Priority phone & WhatsApp support',
        'AI-powered reminders + smart routing'
      ],
      featureIconName: 'Check',
      featureIconColor: '#16a34a',
      limitedFeatures: ['On-site training available with Enterprise'],
      limitedFeatureIconName: 'X',
      limitedFeatureIconColor: '#ef4444',
      buttonText: 'Start free trial',
      buttonHref: '#',
      buttonVariant: 'solid',
      buttonFullWidth: true,
      buttonBackground: '#2563eb',
      buttonTextColor: '#ffffff',
      buttonHoverBackground: '#1d4ed8',
      buttonHoverTextColor: '#ffffff',
      buttonPadding: '0.9rem 1.5rem',
      buttonBorderRadius: '999px',
      buttonBorderWidth: '0px',
      buttonBorderColor: 'transparent',
      ctaIconName: 'ArrowRight',
      ctaIconPosition: 'right',
      showSecondaryButton: true,
      secondaryButtonText: 'Compare all plans',
      secondaryButtonHref: '#',
      secondaryButtonVariant: 'ghost',
      secondaryButtonColor: '#2563eb',
      secondaryButtonHoverColor: '#1d4ed8',
      secondaryButtonBackground: 'rgba(37,99,235,0.08)',
      secondaryButtonHoverBackground: 'rgba(37,99,235,0.16)',
      secondaryButtonPadding: '0.75rem 1rem',
      showGuarantee: true,
      guaranteeText: '30-day money-back guarantee',
      guaranteeColor: '#16a34a',
      showFooterNote: true,
      footerNote: 'Need a custom plan? Talk to our enterprise team.'
    }
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    icon: MessageSquare,
    category: 'commerce',
    defaultProps: {
      layoutVariant: 'card',
      alignment: 'left',
      maxWidth: '640px',
      cardPadding: '2.75rem',
      backgroundColor: '#0f172a',
      backgroundGradient: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
      borderRadius: '1.75rem',
      borderWidth: '0px',
      borderColor: 'transparent',
      boxShadow: '0 35px 65px rgba(15,23,42,0.35)',
      quote: '“CairoDental gave us the operating system we always wanted — patients feel heard, and our team works in perfect sync.”',
      highlightText: 'patients',
      quoteColor: '#ffffff',
      highlightColor: '#fde047',
      quoteSize: 1.6,
      quoteLineHeight: 1.5,
      quoteItalic: true,
      showQuoteIcon: true,
      quoteIconName: 'MessageSquare',
      quoteIconColor: '#0f172a',
      quoteIconBackground: '#fde47a',
      showAvatar: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      avatarShape: 'circle',
      avatarSize: '64px',
      author: 'Dr. Layla Hassan',
      role: 'Clinical Director, BrightSmiles Network',
      company: 'Cairo, Egypt',
      authorColor: '#ffffff',
      roleColor: 'rgba(255,255,255,0.7)',
      showRating: true,
      rating: 4.9,
      ratingLabel: 'Based on 180 patient stories',
      starColor: '#facc15',
      ratingColor: 'rgba(255,255,255,0.8)',
      showCTA: true,
      ctaText: 'Read full case study',
      ctaHref: '#',
      ctaBackground: '#fde047',
      ctaTextColor: '#0f172a',
      ctaHoverBackground: '#facc15',
      ctaHoverTextColor: '#0f172a',
      ctaPadding: '0.85rem 1.6rem',
      ctaBorderRadius: '999px',
      showLogos: true,
      logos: ['SmileCo', 'OralCare+', 'Dental360'],
      logoTextColor: 'rgba(255,255,255,0.6)'
    }
  },
  // Special
  {
    type: 'countdown',
    label: 'Countdown Timer',
    icon: Clock,
    category: 'special',
    defaultProps: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Offer Ends In:',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      backgroundColor: '#333333',
      textColor: '#ffffff'
    }
  },
  {
    type: 'map',
    label: 'Map',
    icon: MapPin,
    category: 'special',
    defaultProps: {
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 12,
      height: '400px',
      showMarker: true,
      markerTitle: 'Our Location',
      style: 'streets'
    }
  },
  {
    type: 'weather',
    label: 'Weather Widget',
    icon: Cloud,
    category: 'special',
    defaultProps: {
      location: 'New York',
      units: 'metric',
      showForecast: true,
      days: 5,
      backgroundColor: '#f8f9fa',
      textColor: '#333333'
    }
  },
  {
    type: 'socialShare',
    label: 'Social Share',
    icon: Share2,
    category: 'special',
    defaultProps: {
      platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp'],
      style: 'buttons',
      showLabels: false,
      size: 'medium',
      borderRadius: '50%',
      gap: '0.5rem'
    }
  },
  {
    type: 'rating',
    label: 'Star Rating',
    icon: Star,
    category: 'special',
    defaultProps: {
      value: 4,
      max: 5,
      size: '1.5rem',
      color: '#ffd700',
      emptyColor: '#e0e0e0',
      readonly: false,
      showValue: true
    }
  },
  {
    type: 'timeline',
    label: 'Timeline',
    icon: Clock,
    category: 'special',
    defaultProps: {
      items: [
        { date: '2024', title: 'Event 1', description: 'Description 1' },
        { date: '2023', title: 'Event 2', description: 'Description 2' }
      ],
      orientation: 'vertical',
      lineColor: '#0066cc',
      dotColor: '#0066cc',
      alternating: true
    }
  }
];

export default function WebsiteEditPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [canvasWidgets, setCanvasWidgets] = React.useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = React.useState<Widget | null>(null);
  const [history, setHistory] = React.useState<Widget[][]>([[]]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [isPersistingState, setIsPersistingState] = React.useState(false);
  const [draggedWidget, setDraggedWidget] = React.useState<WidgetDefinition | null>(null);
  const [draggedExistingWidget, setDraggedExistingWidget] = React.useState<Widget | null>(null);
  const [dropTargetSection, setDropTargetSection] = React.useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = React.useState<number | null>(null);
  const [isWidgetPanelCollapsed, setIsWidgetPanelCollapsed] = React.useState(false);
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] = React.useState(false);
  const [isDraggingPosition, setIsDraggingPosition] = React.useState(false);
  const [repositioningWidget, setRepositioningWidget] = React.useState<Widget | null>(null);
  const [dragStartPos, setDragStartPos] = React.useState({ x: 0, y: 0 });
  const [widgetStartPos, setWidgetStartPos] = React.useState({ x: 0, y: 0 });
  const [activeMainTab, setActiveMainTab] = React.useState<'widgets' | 'templates'>('widgets');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [accordionState, setAccordionState] = React.useState<Record<string, boolean>>({});
  const [canvasSettings, setCanvasSettings] = React.useState<CanvasSettings>({ ...DEFAULT_CANVAS_SETTINGS });
  const [activePropertiesPanel, setActivePropertiesPanel] = React.useState<'canvas' | 'widget'>('canvas');
  const [canvasSettingsHydrated, setCanvasSettingsHydrated] = React.useState(false);
  const handleCanvasSettingChange = <K extends keyof CanvasSettings>(key: K, value: CanvasSettings[K]) => {
    setCanvasSettings((prev) => ({ ...prev, [key]: value }));
  };
  const canvasDimensions = React.useMemo(() => {
    if (!canvasWidgets.length) {
      return { width: 0, height: 0 };
    }

    let maxX = 0;
    let maxY = 0;

    const trackWidgetBounds = (widgets: Widget[]) => {
      widgets.forEach((widget) => {
        const widgetWidth = parseSizeValue(widget.props?.width, 400);
        const fallbackHeight = getWidgetHeight(widget);
        const widgetHeight = parseSizeValue(widget.props?.height, fallbackHeight);
        const widgetX = parseSizeValue(widget.props?.x, 0);
        const widgetY = parseSizeValue(widget.props?.y, 0);

        maxX = Math.max(maxX, widgetX + widgetWidth);
        maxY = Math.max(maxY, widgetY + widgetHeight);

        if (Array.isArray(widget.children) && widget.children.length) {
          trackWidgetBounds(widget.children);
        }
      });
    };

    trackWidgetBounds(canvasWidgets);

    return {
      width: maxX,
      height: maxY
    };
  }, [canvasWidgets]);

  const minCanvasWidth = parseSizeValue(canvasSettings.minWidth || '1200', 1200);
  const minCanvasHeight = parseSizeValue(canvasSettings.minHeight || '1000', 1000);
  const maxCanvasWidth = canvasSettings.maxWidth
    ? parseSizeValue(canvasSettings.maxWidth, Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;
  const maxCanvasHeight = canvasSettings.maxHeight
    ? parseSizeValue(canvasSettings.maxHeight, Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;
  const extraWidthPadding = typeof canvasSettings.extraWidthPadding === 'number'
    ? canvasSettings.extraWidthPadding
    : parseFloat(String(canvasSettings.extraWidthPadding)) || 0;
  const extraHeightPadding = typeof canvasSettings.extraHeightPadding === 'number'
    ? canvasSettings.extraHeightPadding
    : parseFloat(String(canvasSettings.extraHeightPadding)) || 0;
  const paddingTotals = parsePaddingShorthand(canvasSettings.padding);

  const rawCanvasWidth = canvasDimensions.width + extraWidthPadding + paddingTotals.horizontal;
  const rawCanvasHeight = canvasDimensions.height + extraHeightPadding + paddingTotals.vertical;

  const canvasWidth = Math.min(Math.max(rawCanvasWidth, minCanvasWidth), maxCanvasWidth);
  const canvasHeight = Math.min(Math.max(rawCanvasHeight, minCanvasHeight), maxCanvasHeight);
  const canvasBackground = canvasSettings.backgroundGradient || canvasSettings.backgroundColor || '#ffffff';
  const baseCanvasStyle: React.CSSProperties = {
    minHeight: `${canvasHeight}px`,
    width: `${canvasWidth}px`,
    padding: canvasSettings.padding || '2rem',
    borderRadius: canvasSettings.borderRadius || '24px',
    borderWidth: canvasSettings.borderWidth || '0px',
    borderStyle: canvasSettings.borderStyle || 'solid',
    borderColor: canvasSettings.borderColor || 'transparent',
    boxShadow: canvasSettings.shadow || 'none',
    background: canvasBackground,
    margin: canvasSettings.align === 'center' ? '0 auto' : '0',
    position: 'relative',
    transition: 'box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease',
  };
  const editCanvasStyle: React.CSSProperties = {
    ...baseCanvasStyle,
    userSelect: isDraggingPosition ? 'none' : 'auto'
  };
  const previewCanvasStyle: React.CSSProperties = {
    ...baseCanvasStyle,
    userSelect: 'auto'
  };
  const canvasGridSize = Math.max(4, canvasSettings.gridSize || 40);
  const canvasGridColor = canvasSettings.gridColor || 'rgba(15,23,42,0.25)';
  const propertyPanelDescription = activePropertiesPanel === 'canvas'
    ? 'Adjust the canvas background, spacing, and helper guides.'
    : selectedWidget
      ? 'Customize the selected widget.'
      : 'Select a widget to edit.';

  type TemplateDefinition = {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    widgets: Widget[];
    canvasSettings?: CanvasSettings;
  };

  // Dental Clinic Landing Page Templates
  const initialTemplates: TemplateDefinition[] = [
    {
      id: 'template1',
      name: 'Modern Dental Clinic',
      description: 'Clean and professional design with appointment booking',
      thumbnail: '🦷',
      widgets: [
        // Header/Navbar
        {
          id: '',
          type: 'navbar',
          props: {
            logo: '',
            logoText: 'CairoDental',
            links: [
              { label: 'Home', href: '#home' },
              { label: 'Services', href: '#services' },
              { label: 'About', href: '#about' },
              { label: 'Testimonials', href: '#testimonials' },
              { label: 'Contact', href: '#contact' }
            ],
            backgroundColor: '#ffffff',
            color: '#1f2937',
            x: 0,
            y: 0,
            width: '100%',
            height: '70px',
            shadow: true
          },
          children: []
        },
        // Hero Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '5rem 2rem 5rem 2rem',
            x: 0,
            y: 70,
            width: '100%',
            height: '450px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Your Smile, Our Passion',
                level: 'h1',
                fontSize: '3.5rem',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                x: 200,
                y: 80
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Experience world-class dental care with cutting-edge technology and compassionate professionals',
                fontSize: '1.25rem',
                color: '#cbd5e1',
                textAlign: 'center',
                lineHeight: '1.8',
                x: 250,
                y: 180
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Schedule Consultation',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '1.125rem',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                x: 460,
                y: 280
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: '📞 +20 123 456 7890  |  ⏰ Open 24/7',
                fontSize: '1rem',
                color: '#94a3b8',
                textAlign: 'center',
                x: 430,
                y: 370
              },
              children: []
            }
          ]
        },
        // Services Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#f8fafc',
            padding: '4rem 2rem 4rem 2rem',
            x: 0,
            y: 520,
            width: '100%',
            height: '720px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Our Services',
                level: 'h2',
                fontSize: '2.75rem',
                color: '#0f172a',
                textAlign: 'center',
                fontWeight: 'bold',
                x: 450,
                y: 30
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Comprehensive dental care solutions tailored to your needs',
                fontSize: '1.125rem',
                color: '#64748b',
                textAlign: 'center',
                x: 350,
                y: 100
              },
              children: []
            },
            // Service Cards
            {
              id: '',
              type: 'card',
              props: {
                title: '🦷 General Dentistry',
                content: 'Routine checkups, cleanings, and comprehensive preventive care to keep your teeth healthy',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                x: 60,
                y: 160,
                width: '340px',
                height: '180px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: '✨ Cosmetic Dentistry',
                content: 'Professional teeth whitening, porcelain veneers, and complete smile transformations',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                x: 430,
                y: 160,
                width: '340px',
                height: '180px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: '🎯 Orthodontics',
                content: 'Traditional braces and clear Invisalign aligners for perfectly straight smiles',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                x: 800,
                y: 160,
                width: '340px',
                height: '180px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: '🔧 Dental Implants',
                content: 'Advanced implant technology for permanent, natural-looking tooth replacement',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                x: 60,
                y: 360,
                width: '340px',
                height: '180px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: '👶 Pediatric Care',
                content: 'Specialized, gentle dental care designed specifically for children of all ages',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                x: 430,
                y: 360,
                width: '340px',
                height: '180px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: '🚨 Emergency Care',
                content: 'Immediate 24/7 emergency dental services when you need us most',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                x: 800,
                y: 360,
                width: '340px',
                height: '180px'
              },
              children: []
            }
          ]
        },
        // About Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#ffffff',
            padding: '4rem 2rem 4rem 2rem',
            x: 0,
            y: 1240,
            width: '100%',
            height: '380px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Why Choose CairoDental?',
                level: 'h2',
                fontSize: '2.75rem',
                color: '#0f172a',
                textAlign: 'center',
                fontWeight: 'bold',
                x: 380,
                y: 30
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '20+',
                label: 'Years Experience',
                icon: 'award',
                backgroundColor: '#eff6ff',
                iconColor: '#3b82f6',
                x: 150,
                y: 140
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '10,000+',
                label: 'Happy Patients',
                icon: 'users',
                backgroundColor: '#f0fdf4',
                iconColor: '#10b981',
                x: 400,
                y: 140
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '15+',
                label: 'Expert Dentists',
                icon: 'star',
                backgroundColor: '#fef3c7',
                iconColor: '#f59e0b',
                x: 650,
                y: 140
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '24/7',
                label: 'Emergency Care',
                icon: 'clock',
                backgroundColor: '#fef2f2',
                iconColor: '#ef4444',
                x: 900,
                y: 140
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'State-of-the-art equipment and advanced dental technologies ensure you receive the best care in a comfortable, modern environment.',
                fontSize: '1.125rem',
                color: '#64748b',
                textAlign: 'center',
                lineHeight: '1.8',
                x: 200,
                y: 270,
                width: '800px'
              },
              children: []
            }
          ]
        },
        // Testimonials Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#f8fafc',
            padding: '4rem 2rem 4rem 2rem',
            x: 0,
            y: 1620,
            width: '100%',
            height: '420px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Patient Testimonials',
                level: 'h2',
                fontSize: '2.75rem',
                color: '#0f172a',
                textAlign: 'center',
                fontWeight: 'bold',
                x: 420,
                y: 30
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: '⭐⭐⭐⭐⭐ Rated 5.0 by 1,000+ patients',
                fontSize: '1rem',
                color: '#64748b',
                textAlign: 'center',
                x: 430,
                y: 100
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'The best dental experience I have ever had! Professional staff, modern equipment, and truly caring service.',
                author: 'Sarah Mohamed',
                role: 'Patient since 2020',
                rating: 5,
                backgroundColor: '#ffffff',
                quoteIcon: true,
                x: 60,
                y: 160,
                width: '340px'
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'Dr. Ahmed is amazing with kids. My children actually look forward to their dental visits now!',
                author: 'Omar Hassan',
                role: 'Parent of 3',
                rating: 5,
                backgroundColor: '#ffffff',
                quoteIcon: true,
                x: 430,
                y: 160,
                width: '340px'
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'Modern facilities and excellent service. I highly recommend CairoDental to everyone seeking quality care.',
                author: 'Fatima Ali',
                role: 'Patient since 2019',
                rating: 5,
                backgroundColor: '#ffffff',
                quoteIcon: true,
                x: 800,
                y: 160,
                width: '340px'
              },
              children: []
            }
          ]
        },
        // Contact Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#3b82f6',
            backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '4rem 2rem 4rem 2rem',
            x: 0,
            y: 2040,
            width: '100%',
            height: '350px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Ready for Your Best Smile?',
                level: 'h2',
                fontSize: '2.75rem',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 'bold',
                x: 340,
                y: 40
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Schedule your consultation today and experience the difference',
                fontSize: '1.25rem',
                color: '#dbeafe',
                textAlign: 'center',
                x: 330,
                y: 120
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Book Appointment Now',
                backgroundColor: '#ffffff',
                color: '#3b82f6',
                fontSize: '1.125rem',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                x: 460,
                y: 190
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: '📞 +20 123 456 7890  |  📧 info@cairodental.com  |  📍 123 Tahrir Square, Cairo',
                fontSize: '0.95rem',
                color: '#dbeafe',
                textAlign: 'center',
                x: 300,
                y: 280
              },
              children: []
            }
          ]
        },
        // Footer
        {
          id: '',
          type: 'footer',
          props: {
            copyright: '© 2024 CairoDental. All rights reserved.',
            links: ['Privacy Policy', 'Terms of Service', 'Careers', 'Contact Us'],
            backgroundColor: '#0f172a',
            color: '#94a3b8',
            padding: '2rem',
            x: 0,
            y: 2390,
            width: '100%',
            height: '120px'
          },
          children: []
        }
      ],
      canvasSettings: { ...DEFAULT_CANVAS_SETTINGS }
    },
    {
      id: 'template2',
      name: 'Family Dental Care',
      description: 'Warm and welcoming design for family-oriented practice',
      thumbnail: '👨‍👩‍👧‍👦',
      widgets: [
        // Header
        {
          id: '',
          type: 'navbar',
          props: {
            logo: '',
            logoText: 'Family Dental',
            links: [
              { label: 'Home', href: '#home' },
              { label: 'Services', href: '#services' },
              { label: 'Our Team', href: '#team' },
              { label: 'Kids Zone', href: '#kids' },
              { label: 'Contact', href: '#contact' }
            ],
            backgroundColor: '#10b981',
            color: '#ffffff',
            x: 0,
            y: 0,
            width: '100%',
            height: '80px'
          },
          children: []
        },
        // Hero Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#ecfdf5',
            padding: '3rem',
            x: 0,
            y: 80,
            width: '100%',
            height: '500px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Caring for Your Family\'s Smiles',
                level: 'h1',
                fontSize: '2.75rem',
                color: '#059669',
                textAlign: 'center',
                x: 200,
                y: 80
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'From kids to grandparents, we provide gentle and comprehensive dental care for the whole family.',
                fontSize: '1.25rem',
                color: '#6b7280',
                textAlign: 'center',
                x: 150,
                y: 180
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Book Family Appointment',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '1.125rem',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                x: 420,
                y: 280
              },
              children: []
            },
            {
              id: '',
              type: 'icon',
              props: {
                name: 'Heart',
                size: '2rem',
                color: '#ef4444',
                x: 400,
                y: 380
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Trusted by 5000+ Families',
                fontSize: '1rem',
                color: '#059669',
                fontWeight: 'bold',
                x: 450,
                y: 385
              },
              children: []
            }
          ]
        },
        // Services for Families
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#ffffff',
            padding: '4rem 2rem',
            x: 0,
            y: 580,
            width: '100%',
            height: '550px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Complete Family Dental Care',
                level: 'h2',
                fontSize: '2.25rem',
                color: '#047857',
                textAlign: 'center',
                x: 350,
                y: 20
              },
              children: []
            },
            // Kids Service Card
            {
              id: '',
              type: 'card',
              props: {
                title: 'Kids Dentistry',
                content: 'Fun, gentle care with toys, games, and rewards to make dental visits enjoyable',
                backgroundColor: '#fef3c7',
                borderRadius: '1rem',
                padding: '2rem',
                x: 50,
                y: 120,
                width: '350px',
                height: '180px'
              },
              children: []
            },
            // Teen Service Card
            {
              id: '',
              type: 'card',
              props: {
                title: 'Teen Orthodontics',
                content: 'Braces and Invisalign options for confident smiles during the school years',
                backgroundColor: '#dbeafe',
                borderRadius: '1rem',
                padding: '2rem',
                x: 425,
                y: 120,
                width: '350px',
                height: '180px'
              },
              children: []
            },
            // Adult Service Card
            {
              id: '',
              type: 'card',
              props: {
                title: 'Adult Care',
                content: 'Comprehensive dental services including cosmetic and restorative treatments',
                backgroundColor: '#fce7f3',
                borderRadius: '1rem',
                padding: '2rem',
                x: 800,
                y: 120,
                width: '350px',
                height: '180px'
              },
              children: []
            },
            // Senior Service Card
            {
              id: '',
              type: 'card',
              props: {
                title: 'Senior Dental Care',
                content: 'Specialized care for dentures, implants, and age-related dental needs',
                backgroundColor: '#e0e7ff',
                borderRadius: '1rem',
                padding: '2rem',
                x: 240,
                y: 320,
                width: '350px',
                height: '180px'
              },
              children: []
            },
            // Prevention Card
            {
              id: '',
              type: 'card',
              props: {
                title: 'Preventive Care',
                content: 'Regular checkups, cleanings, and fluoride treatments for the whole family',
                backgroundColor: '#dcfce7',
                borderRadius: '1rem',
                padding: '2rem',
                x: 615,
                y: 320,
                width: '350px',
                height: '180px'
              },
              children: []
            }
          ]
        },
        // Our Team
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#f9fafb',
            padding: '4rem 2rem',
            x: 0,
            y: 1130,
            width: '100%',
            height: '450px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Meet Our Friendly Team',
                level: 'h2',
                fontSize: '2.25rem',
                color: '#047857',
                textAlign: 'center',
                x: 380,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Experienced professionals who love working with families',
                fontSize: '1.125rem',
                color: '#6b7280',
                textAlign: 'center',
                x: 300,
                y: 80
              },
              children: []
            },
            // Team member cards
            {
              id: '',
              type: 'card',
              props: {
                title: 'Dr. Sarah Johnson',
                content: 'Pediatric Specialist - 15 years making kids smile',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                x: 100,
                y: 150,
                width: '300px',
                height: '220px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Dr. Michael Chen',
                content: 'Family Dentist - Expert in gentle, compassionate care',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                x: 450,
                y: 150,
                width: '300px',
                height: '220px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Dr. Lisa Martinez',
                content: 'Orthodontist - Creating beautiful smiles for teens',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                x: 800,
                y: 150,
                width: '300px',
                height: '220px'
              },
              children: []
            }
          ]
        },
        // Kids Zone Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#fef3c7',
            padding: '3rem 2rem',
            x: 0,
            y: 1580,
            width: '100%',
            height: '350px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: '🎈 Kids Love Our Office! 🎈',
                level: 'h2',
                fontSize: '2rem',
                color: '#d97706',
                textAlign: 'center',
                x: 380,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'list',
              props: {
                items: ['Play area with toys and games', 'TV screens in treatment rooms', 'Prize box after visits', 'Gentle, kid-friendly approach'],
                ordered: false,
                fontSize: '1.125rem',
                color: '#92400e',
                x: 400,
                y: 100
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Schedule Kids Appointment',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontSize: '1.125rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                x: 420,
                y: 250
              },
              children: []
            }
          ]
        },
        // Testimonials
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#ffffff',
            padding: '4rem 2rem',
            x: 0,
            y: 1930,
            width: '100%',
            height: '400px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Happy Families',
                level: 'h2',
                fontSize: '2.25rem',
                color: '#047857',
                textAlign: 'center',
                x: 450,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'My kids actually ask when they can go back to the dentist! The staff is amazing.',
                author: 'Jennifer Smith',
                rating: 5,
                backgroundColor: '#ecfdf5',
                x: 100,
                y: 120,
                width: '320px'
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'Three generations of our family come here. We wouldn\'t go anywhere else!',
                author: 'Robert Johnson',
                rating: 5,
                backgroundColor: '#ecfdf5',
                x: 440,
                y: 120,
                width: '320px'
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'The team makes everyone feel comfortable, from toddlers to grandparents.',
                author: 'Maria Garcia',
                rating: 5,
                backgroundColor: '#ecfdf5',
                x: 780,
                y: 120,
                width: '320px'
              },
              children: []
            }
          ]
        },
        // Contact & Hours
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#047857',
            padding: '3rem 2rem',
            x: 0,
            y: 2330,
            width: '100%',
            height: '350px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Visit Us Today!',
                level: 'h2',
                fontSize: '2rem',
                color: '#ffffff',
                textAlign: 'center',
                x: 450,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'contactInfo',
              props: {
                phone: 'Call: (555) 123-4567',
                email: 'smile@familydental.com',
                address: '456 Oak Street, Family Plaza, Cairo',
                backgroundColor: 'transparent',
                color: '#ffffff',
                x: 380,
                y: 100
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Hours: Mon-Fri 8am-6pm, Sat 9am-2pm',
                fontSize: '1.125rem',
                color: '#d1fae5',
                textAlign: 'center',
                x: 380,
                y: 200
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Get Directions',
                backgroundColor: '#ffffff',
                color: '#047857',
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                x: 470,
                y: 260
              },
              children: []
            }
          ]
        },
        // Footer
        {
          id: '',
          type: 'footer',
          props: {
            copyright: '© 2024 Family Dental Care. Smiles for All Ages.',
            links: ['Privacy', 'Insurance', 'FAQs', 'Careers'],
            backgroundColor: '#064e3b',
            color: '#a7f3d0',
            x: 0,
            y: 2680,
            width: '100%',
            height: '120px'
          },
          children: []
        }
      ],
      canvasSettings: { ...DEFAULT_CANVAS_SETTINGS }
    },
    {
      id: 'template3',
      name: 'Premium Dental Studio',
      description: 'Luxurious design for high-end dental practice',
      thumbnail: '✨',
      widgets: [
        // Elegant Header
        {
          id: '',
          type: 'navbar',
          props: {
            logo: '',
            logoText: 'Premium Dental Studio',
            links: [
              { label: 'Services', href: '#services' },
              { label: 'Technology', href: '#technology' },
              { label: 'Our Experts', href: '#experts' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'VIP Booking', href: '#vip' }
            ],
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            x: 0,
            y: 0,
            width: '100%',
            height: '90px'
          },
          children: []
        },
        // Luxury Hero
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#111827',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '5rem 2rem',
            x: 0,
            y: 90,
            width: '100%',
            height: '600px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Experience Premium Dental Excellence',
                level: 'h1',
                fontSize: '3.5rem',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                x: 100,
                y: 150
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Where artistry meets advanced dentistry',
                fontSize: '1.5rem',
                color: '#e5e7eb',
                textAlign: 'center',
                fontStyle: 'italic',
                x: 300,
                y: 250
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Schedule VIP Consultation',
                backgroundColor: '#fbbf24',
                color: '#1f2937',
                fontSize: '1.25rem',
                padding: '1.25rem 3rem',
                borderRadius: '9999px',
                fontWeight: 'bold',
                x: 400,
                y: 350
              },
              children: []
            },
            {
              id: '',
              type: 'icon',
              props: {
                name: 'Star',
                size: '2rem',
                color: '#fbbf24',
                x: 550,
                y: 450
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: '5-Star Rated Clinic',
                fontSize: '1rem',
                color: '#fbbf24',
                fontWeight: 'bold',
                x: 470,
                y: 490
              },
              children: []
            }
          ]
        },
        // Excellence Statistics
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#ffffff',
            padding: '4rem 2rem',
            x: 0,
            y: 690,
            width: '100%',
            height: '350px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Setting the Standard in Dental Excellence',
                level: 'h2',
                fontSize: '2rem',
                color: '#1f2937',
                textAlign: 'center',
                x: 250,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '15+',
                label: 'Years of Excellence',
                icon: 'award',
                color: '#7c3aed',
                x: 100,
                y: 120
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '5000+',
                label: 'VIP Patients',
                icon: 'users',
                color: '#7c3aed',
                x: 350,
                y: 120
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '100%',
                label: 'Satisfaction',
                icon: 'star',
                color: '#7c3aed',
                x: 600,
                y: 120
              },
              children: []
            },
            {
              id: '',
              type: 'stats',
              props: {
                value: '50+',
                label: 'Awards Won',
                icon: 'trophy',
                color: '#7c3aed',
                x: 850,
                y: 120
              },
              children: []
            }
          ]
        },
        // Premium Services
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#f9fafb',
            padding: '4rem 2rem',
            x: 0,
            y: 1040,
            width: '100%',
            height: '650px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Exclusive Services',
                level: 'h2',
                fontSize: '2.5rem',
                color: '#1f2937',
                textAlign: 'center',
                x: 400,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Bespoke dental solutions tailored to your unique needs',
                fontSize: '1.25rem',
                color: '#6b7280',
                textAlign: 'center',
                fontStyle: 'italic',
                x: 280,
                y: 80
              },
              children: []
            },
            // Premium Service Cards
            {
              id: '',
              type: 'card',
              props: {
                title: 'Smile Design Studio',
                content: 'Digital smile makeover with 3D visualization and custom veneers',
                backgroundColor: '#faf5ff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.1)',
                x: 50,
                y: 150,
                width: '350px',
                height: '200px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Same-Day Crowns',
                content: 'CEREC technology for crowns in a single appointment',
                backgroundColor: '#fef3c7',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(251, 191, 36, 0.1)',
                x: 425,
                y: 150,
                width: '350px',
                height: '200px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Laser Dentistry',
                content: 'Pain-free procedures with advanced laser technology',
                backgroundColor: '#ffe4e6',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(244, 63, 94, 0.1)',
                x: 800,
                y: 150,
                width: '350px',
                height: '200px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'VIP Concierge Service',
                content: 'Personal treatment coordinator and priority scheduling',
                backgroundColor: '#ecfdf5',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)',
                x: 50,
                y: 380,
                width: '350px',
                height: '200px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Spa Dentistry',
                content: 'Relaxing atmosphere with massage chairs and aromatherapy',
                backgroundColor: '#fce7f3',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(236, 72, 153, 0.1)',
                x: 425,
                y: 380,
                width: '350px',
                height: '200px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Executive Dental Care',
                content: 'After-hours appointments for busy professionals',
                backgroundColor: '#e0e7ff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.1)',
                x: 800,
                y: 380,
                width: '350px',
                height: '200px'
              },
              children: []
            }
          ]
        },
        // Technology Section
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#111827',
            padding: '4rem 2rem',
            x: 0,
            y: 1690,
            width: '100%',
            height: '450px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'State-of-the-Art Technology',
                level: 'h2',
                fontSize: '2.5rem',
                color: '#ffffff',
                textAlign: 'center',
                x: 300,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'list',
              props: {
                items: ['Digital X-rays with 90% less radiation', '3D CT Scanning for precise diagnostics', 'Intraoral cameras for detailed imaging', 'CEREC same-day crown technology', 'Laser technology for pain-free procedures', 'Digital impression system - no messy molds'],
                ordered: false,
                fontSize: '1.125rem',
                color: '#d1d5db',
                x: 350,
                y: 120
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Explore Our Technology',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                fontSize: '1.125rem',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                x: 430,
                y: 350
              },
              children: []
            }
          ]
        },
        // Expert Team
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#ffffff',
            padding: '4rem 2rem',
            x: 0,
            y: 2140,
            width: '100%',
            height: '500px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'World-Class Dental Experts',
                level: 'h2',
                fontSize: '2.5rem',
                color: '#1f2937',
                textAlign: 'center',
                x: 330,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Internationally trained specialists committed to excellence',
                fontSize: '1.125rem',
                color: '#6b7280',
                textAlign: 'center',
                fontStyle: 'italic',
                x: 280,
                y: 80
              },
              children: []
            },
            // Expert Cards
            {
              id: '',
              type: 'card',
              props: {
                title: 'Dr. Alexander Sterling',
                content: 'Cosmetic Specialist - Harvard trained with 20+ years experience',
                backgroundColor: '#faf5ff',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                x: 100,
                y: 150,
                width: '320px',
                height: '250px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Dr. Victoria Laurent',
                content: 'Implant Specialist - European certified implantologist',
                backgroundColor: '#fef3c7',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                x: 440,
                y: 150,
                width: '320px',
                height: '250px'
              },
              children: []
            },
            {
              id: '',
              type: 'card',
              props: {
                title: 'Dr. James Mitchell',
                content: 'Orthodontics Expert - Invisalign Diamond Provider',
                backgroundColor: '#ecfdf5',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                x: 780,
                y: 150,
                width: '320px',
                height: '250px'
              },
              children: []
            }
          ]
        },
        // Testimonials
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#f9fafb',
            padding: '4rem 2rem',
            x: 0,
            y: 2640,
            width: '100%',
            height: '450px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Client Success Stories',
                level: 'h2',
                fontSize: '2.5rem',
                color: '#1f2937',
                textAlign: 'center',
                x: 380,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'The level of care and attention to detail is unmatched. Truly a premium experience.',
                author: 'CEO, Fortune 500 Company',
                rating: 5,
                backgroundColor: '#ffffff',
                x: 100,
                y: 120,
                width: '340px'
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'From the moment you walk in, you know you\'re in the best hands possible.',
                author: 'International Model',
                rating: 5,
                backgroundColor: '#ffffff',
                x: 460,
                y: 120,
                width: '340px'
              },
              children: []
            },
            {
              id: '',
              type: 'testimonial',
              props: {
                quote: 'They transformed my smile and my confidence. Worth every penny.',
                author: 'TV Personality',
                rating: 5,
                backgroundColor: '#ffffff',
                x: 820,
                y: 120,
                width: '340px'
              },
              children: []
            }
          ]
        },
        // VIP Contact
        {
          id: '',
          type: 'section',
          props: {
            backgroundColor: '#7c3aed',
            padding: '4rem 2rem',
            x: 0,
            y: 3090,
            width: '100%',
            height: '400px'
          },
          children: [
            {
              id: '',
              type: 'heading',
              props: {
                text: 'Begin Your Premium Dental Journey',
                level: 'h2',
                fontSize: '2.5rem',
                color: '#ffffff',
                textAlign: 'center',
                x: 250,
                y: 20
              },
              children: []
            },
            {
              id: '',
              type: 'text',
              props: {
                text: 'Private consultations available by appointment only',
                fontSize: '1.25rem',
                color: '#e9d5ff',
                textAlign: 'center',
                x: 320,
                y: 90
              },
              children: []
            },
            {
              id: '',
              type: 'contactInfo',
              props: {
                phone: 'VIP Line: +20 100 VIP CARE',
                email: 'concierge@premiumdental.com',
                address: 'Zamalek Tower, Floor 25, Cairo',
                backgroundColor: 'transparent',
                color: '#ffffff',
                x: 380,
                y: 150
              },
              children: []
            },
            {
              id: '',
              type: 'button',
              props: {
                text: 'Request VIP Consultation',
                backgroundColor: '#fbbf24',
                color: '#1f2937',
                fontSize: '1.25rem',
                padding: '1.25rem 3rem',
                borderRadius: '9999px',
                fontWeight: 'bold',
                boxShadow: '0 20px 25px rgba(251, 191, 36, 0.25)',
                x: 400,
                y: 260
              },
              children: []
            }
          ]
        },
        // Luxury Footer
        {
          id: '',
          type: 'footer',
          props: {
            copyright: '© 2024 Premium Dental Studio. Excellence Redefined.',
            links: ['Privacy', 'Terms', 'VIP Program', 'Careers', 'Contact'],
            backgroundColor: '#111827',
            color: '#9ca3af',
            x: 0,
            y: 3490,
            width: '100%',
            height: '150px'
          },
          children: []
        }
      ],
      canvasSettings: { ...DEFAULT_CANVAS_SETTINGS }
    }
  ];

  const TEMPLATE_STORAGE_KEY = 'websiteBuilderTemplates';
  const [templates, setTemplates] = React.useState<TemplateDefinition[]>(initialTemplates);
  const [editingTemplateId, setEditingTemplateId] = React.useState<string | null>(null);
  const [templatesHydrated, setTemplatesHydrated] = React.useState(false);

  const normalizeTemplateSections = (widgets: Widget[]): Widget[] => {
    let currentY = 0;

    return widgets.map(widget => {
      const heightValue = getWidgetHeight(widget);
      const normalizedWidget: Widget = {
        ...widget,
        props: {
          ...widget.props,
          y: currentY
        }
      };

      currentY += heightValue;
      return normalizedWidget;
    });
  };

  const templateNeedsNormalization = (widgets: Widget[]): boolean => {
    return widgets.every((widget) => {
      const position = widget.props?.y;
      if (typeof position === 'number') {
        return Number.isNaN(position);
      }
      if (typeof position === 'string') {
        const trimmed = position.trim().toLowerCase();
        if (!trimmed) {
          return true;
        }
        if (trimmed === 'auto') {
          return true;
        }
        const parsed = parseFloat(trimmed);
        return Number.isNaN(parsed);
      }
      return position === null || position === undefined;
    });
  };

  // Apply template to canvas
  const applyTemplate = (template: TemplateDefinition) => {
    const clonedWidgets = template.widgets.map((widget) => cloneWidgetWithNewIds(widget));
    const arrangedWidgets = templateNeedsNormalization(clonedWidgets)
      ? normalizeTemplateSections(clonedWidgets)
      : clonedWidgets;

    setCanvasWidgets(arrangedWidgets);
    setCanvasSettings(template.canvasSettings ? { ...DEFAULT_CANVAS_SETTINGS, ...template.canvasSettings } : { ...DEFAULT_CANVAS_SETTINGS });
    setSelectedWidget(null);
    addToHistory(arrangedWidgets);
    toast({
      title: "Template Applied",
      description: `${template.name} has been applied to your canvas`,
    });
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      return;
    }

    applyTemplate(template);
    setEditingTemplateId(templateId);
    toast({
      title: "Editing Template",
      description: `You are now editing ${template.name}`,
    });
  };

  const handleSaveTemplate = async (templateId: string) => {
    if (editingTemplateId !== templateId) {
      toast({
        title: "Cannot Save",
        description: "Click Edit on this template before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!canvasWidgets.length) {
      toast({
        title: "Nothing to Save",
        description: "Add widgets to the canvas before saving the template.",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      return;
    }

    const orderedWidgets = sortWidgetsByPosition(canvasWidgets);

    const updatedTemplate = {
      ...template,
      widgets: cloneWidgetsForStorage(orderedWidgets),
      canvasSettings,
    };

    const nextTemplates = templates.map((t) => (t.id === templateId ? updatedTemplate : t));

    setTemplates(nextTemplates);
    setEditingTemplateId(null);

    try {
      await saveBuilderState({ templates: nextTemplates });
      toast({
        title: "Template Saved",
        description: `${template.name} has been updated`,
      });
    } catch (error) {
      console.error('Failed to persist template to database', error);
      const description = error instanceof Error ? error.message : 'Failed to save template. Please try again.';
      toast({
        title: "Save Failed",
        description,
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const applyLoadedWidgets = (widgets: Widget[]) => {
      const ordered = sortWidgetsByPosition(widgets);
      setCanvasWidgets(ordered);
      setHistory([ordered]);
      setHistoryIndex(0);
    };

    const loadFromLocal = () => {
      if (!isMounted) return;

      try {
        const storedState = window.localStorage.getItem(BUILDER_STATE_STORAGE_KEY);
        if (storedState) {
          const parsed = JSON.parse(storedState) as Partial<BuilderStatePayload>;
          if (Array.isArray(parsed.templates)) {
            setTemplates(parsed.templates as TemplateDefinition[]);
          }
          if (Array.isArray(parsed.canvasWidgets)) {
            applyLoadedWidgets(parsed.canvasWidgets as Widget[]);
          }
          if (parsed.canvasSettings) {
            setCanvasSettings({ ...DEFAULT_CANVAS_SETTINGS, ...parsed.canvasSettings });
          }
          return;
        }
      } catch (error) {
        console.error('Failed to load builder state from local storage', error);
      }

      try {
        const storedTemplates = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (storedTemplates) {
          const parsedTemplates = JSON.parse(storedTemplates);
          if (Array.isArray(parsedTemplates)) {
            setTemplates(parsedTemplates as TemplateDefinition[]);
          }
        }

        const storedCanvas = window.localStorage.getItem(CANVAS_SETTINGS_STORAGE_KEY);
        if (storedCanvas) {
          const parsedCanvas = JSON.parse(storedCanvas);
          setCanvasSettings({ ...DEFAULT_CANVAS_SETTINGS, ...parsedCanvas });
        }
      } catch (error) {
        console.error('Failed to load legacy builder state', error);
      }
    };

    const hydrate = async () => {
      try {
        const response = await fetch(BUILDER_STATE_API_PATH, { cache: 'no-store', credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to fetch builder state');
        }
        const payload = await response.json();
        const data = payload?.data as Partial<BuilderStatePayload> | null;

        if (!isMounted) return;

        if (data) {
          if (Array.isArray(data.templates)) {
            setTemplates(data.templates as TemplateDefinition[]);
          }
          if (Array.isArray(data.canvasWidgets)) {
            applyLoadedWidgets(data.canvasWidgets as Widget[]);
          }
          if (data.canvasSettings) {
            setCanvasSettings({ ...DEFAULT_CANVAS_SETTINGS, ...data.canvasSettings });
          }
          return;
        }

        loadFromLocal();
      } catch (error) {
        console.error('Failed to hydrate builder state from API', error);
        loadFromLocal();
      } finally {
        if (isMounted) {
          setTemplatesHydrated(true);
          setCanvasSettingsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!templatesHydrated || !canvasSettingsHydrated || typeof window === 'undefined') {
      return;
    }

    const payload: BuilderStatePayload = {
      templates,
      canvasWidgets,
      canvasSettings,
    };

    try {
      window.localStorage.setItem(BUILDER_STATE_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to cache builder state locally', error);
    }
  }, [templates, canvasWidgets, canvasSettings, templatesHydrated, canvasSettingsHydrated]);

  // Add global style for grab cursor
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .canvas-widget-wrapper {
        cursor: grab !important;
      }
      .canvas-widget-wrapper:active {
        cursor: grabbing !important;
      }
      .canvas-widget-wrapper * {
        cursor: inherit !important;
      }
      .widget-dragging {
        opacity: 0.8;
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add global mouseup handler for drag end
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingPosition && repositioningWidget) {
        addToHistory(canvasWidgets);
        toast({
          title: "Widget Repositioned",
          description: `Position updated to (${repositioningWidget.props.x}, ${repositioningWidget.props.y})`
        });
      }
      setIsDraggingPosition(false);
      setRepositioningWidget(null);
    };

    if (isDraggingPosition) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDraggingPosition, repositioningWidget, canvasWidgets]);

  // Generate unique ID for widgets
  const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const cloneWidgetWithNewIds = (widget: Widget): Widget => ({
    ...widget,
    id: generateId(),
    children: widget.children?.map((child) => cloneWidgetWithNewIds(child)) || []
  });

  const cloneWidgetsForStorage = (widgets: Widget[]): Widget[] =>
    widgets.map((widget) => ({
      ...widget,
      props: { ...widget.props },
      children: widget.children ? cloneWidgetsForStorage(widget.children) : []
    }));

  const saveBuilderState = React.useCallback(async (overrides?: Partial<BuilderStatePayload>) => {
    const payload: BuilderStatePayload = {
      templates: overrides?.templates ?? templates,
      canvasWidgets: cloneWidgetsForStorage(overrides?.canvasWidgets ?? sortWidgetsByPosition(canvasWidgets)),
      canvasSettings: overrides?.canvasSettings ?? canvasSettings
    };

    const response = await fetch(BUILDER_STATE_API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save builder state';
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch (error) {
        console.error('Failed to parse builder state save error', error);
      }
      throw new Error(errorMessage);
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(BUILDER_STATE_STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn('Failed to persist builder state locally', error);
      }
    }
  }, [templates, canvasWidgets, canvasSettings]);

  // Order widgets by their vertical position so template saves mirror visual layout
  const sortWidgetsByPosition = (widgets: Widget[]): Widget[] =>
    [...widgets].sort((a, b) => ((a.props?.y ?? 0) - (b.props?.y ?? 0)));

  // Calculate next widget position (staggered to avoid overlap)
  const getNextPosition = () => {
    const count = canvasWidgets.length;
    const offsetX = (count * 20) % 400; // Stagger horizontally
    const offsetY = Math.floor(count / 20) * 150; // Stack after 20 widgets
    return { x: 50 + offsetX, y: 50 + offsetY };
  };

  // Create columns for a section
  const createColumns = (count: number): Widget[] => {
    return Array.from({ length: count }, () => ({
      id: generateId(),
      type: 'column',
      props: { 
        width: '100%', 
        padding: '1rem',
        backgroundColor: 'transparent',
        minHeight: '100px'
      },
      children: []
    }));
  };

  // Handle drag start from widget library
  const handleDragStart = (widget: WidgetDefinition) => {
    setDraggedWidget(widget);
    setDraggedExistingWidget(null);
  };

  // Handle drag start for existing widget (for rearranging)
  const handleExistingWidgetDragStart = (widget: Widget, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedExistingWidget(widget);
    setDraggedWidget(null);
  };

  // Handle reposition start (mouse down on widget)
  const handleRepositionStart = (widget: Widget, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDraggingPosition(true);
    setRepositioningWidget(widget);
    
    // Store the initial mouse position and widget position
    const startX = e.clientX;
    const startY = e.clientY;
    const widgetX = typeof widget.props.x === 'number' ? widget.props.x : parseFloat(widget.props.x || '0') || 0;
    const widgetY = typeof widget.props.y === 'number' ? widget.props.y : parseFloat(widget.props.y || '0') || 0;
    
    setDragStartPos({ x: startX, y: startY });
    setWidgetStartPos({ x: widgetX, y: widgetY });
    

  };

  // Handle reposition move (mouse move while dragging)
  const handleRepositionMove = (e: React.MouseEvent) => {
    if (!isDraggingPosition || !repositioningWidget) return;

    e.preventDefault();
    e.stopPropagation();
    
    // Calculate how much the mouse has moved since drag started
    const currentMouseX = e.clientX;
    const currentMouseY = e.clientY;
    const deltaX = currentMouseX - dragStartPos.x;
    const deltaY = currentMouseY - dragStartPos.y;
    
    // Apply the delta to the widget's starting position
    const newX = Math.max(0, Math.round(widgetStartPos.x + deltaX));
    const newY = Math.max(0, Math.round(widgetStartPos.y + deltaY));
    
    // Update both X and Y positions together
    const updateInWidgets = (widgets: Widget[]): Widget[] => {
      return widgets.map(w => {
        if (w.id === repositioningWidget.id) {
          return { ...w, props: { ...w.props, x: newX, y: newY } };
        }
        if (w.children) {
          return { ...w, children: updateInWidgets(w.children) };
        }
        return w;
      });
    };
    
    const updatedWidgets = updateInWidgets(canvasWidgets);
    setCanvasWidgets(updatedWidgets);
    
    // Also update the repositioning widget state to track current position
    setRepositioningWidget({ ...repositioningWidget, props: { ...repositioningWidget.props, x: newX, y: newY } });
    
    // Update selected widget if it's being repositioned
    if (selectedWidget && selectedWidget.id === repositioningWidget.id) {
      setSelectedWidget({ ...repositioningWidget, props: { ...repositioningWidget.props, x: newX, y: newY } });
    }
  };

  // Handle reposition end (mouse up)
  const handleRepositionEnd = () => {
    if (isDraggingPosition && repositioningWidget) {
      addToHistory(canvasWidgets);
      toast({
        title: "Widget Repositioned",
        description: `Position updated to (${repositioningWidget.props.x}, ${repositioningWidget.props.y})`
      });
    }
    
    setIsDraggingPosition(false);
    setRepositioningWidget(null);
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    let updatedWidgets: Widget[];

    // Handle dropping new widget from library
    if (draggedWidget) {
      const position = getNextPosition();
      const defaultSize = {
        width: draggedWidget.type === 'anchor' ? '100%' :
               draggedWidget.type === 'section' ? '800px' :
               draggedWidget.type === 'button' ? '150px' :
               draggedWidget.type === 'heading' ? '400px' :
               draggedWidget.type === 'text' ? '500px' :
               draggedWidget.type === 'image' ? '300px' :
               draggedWidget.type === 'video' ? '500px' :
               draggedWidget.type === 'icon' ? '60px' :
               draggedWidget.type === 'divider' ? '100%' :
               draggedWidget.type === 'accordion' ? '600px' :
               draggedWidget.type === 'form' ? '500px' :
               draggedWidget.type === 'cta' ? '400px' :
               draggedWidget.type === 'social' ? '200px' :
               draggedWidget.type === 'card' ? '350px' :
               draggedWidget.type === 'alert' ? '600px' :
               '300px',
        height: draggedWidget.type === 'anchor' ? '0px' :
                draggedWidget.type === 'section' ? '400px' :
                draggedWidget.type === 'button' ? '50px' :
                draggedWidget.type === 'heading' ? '60px' :
                draggedWidget.type === 'text' ? 'auto' :
                draggedWidget.type === 'image' ? '250px' :
                draggedWidget.type === 'video' ? '400px' :
                draggedWidget.type === 'icon' ? '60px' :
                draggedWidget.type === 'divider' ? '2px' :
                draggedWidget.type === 'accordion' ? 'auto' :
                draggedWidget.type === 'form' ? 'auto' :
                draggedWidget.type === 'cta' ? '300px' :
                draggedWidget.type === 'social' ? '60px' :
                draggedWidget.type === 'card' ? '400px' :
                draggedWidget.type === 'alert' ? 'auto' :
                'auto'
      };
      
      const newWidget: Widget = {
        id: generateId(),
        type: draggedWidget.type,
        props: { 
          ...draggedWidget.defaultProps,
          x: position.x,
          y: position.y,
          ...defaultSize
        },
        children: draggedWidget.type === 'section' 
          ? createColumns(draggedWidget.defaultProps.columns || 1)
          : draggedWidget.type === 'column'
          ? []
          : undefined
      };

      if (dropTargetIndex !== null) {
        updatedWidgets = insertWidgetAtPosition(canvasWidgets, newWidget, dropTargetIndex);
      } else {
        updatedWidgets = [...canvasWidgets, newWidget];
      }
      
      toast({
        title: "Widget Added",
        description: `${draggedWidget.label} has been added to the canvas.`
      });
    }
    // Handle moving existing widget
    else if (draggedExistingWidget) {
      // Remove widget from its current location
      const widgetsWithoutDragged = removeWidgetById(canvasWidgets, draggedExistingWidget.id);
      
      // Add widget to new location
      if (dropTargetIndex !== null) {
        updatedWidgets = insertWidgetAtPosition(widgetsWithoutDragged, draggedExistingWidget, dropTargetIndex);
      } else {
        updatedWidgets = [...widgetsWithoutDragged, draggedExistingWidget];
      }
      
      toast({
        title: "Widget Moved",
        description: "The widget has been repositioned."
      });
    } else {
      return;
    }

    setCanvasWidgets(updatedWidgets);
    addToHistory(updatedWidgets);
    setDraggedWidget(null);
    setDraggedExistingWidget(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Add to history for undo/redo
  const addToHistory = (widgets: Widget[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(widgets);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasWidgets(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasWidgets(history[historyIndex + 1]);
    }
  };

  // Delete widget (recursive to handle nested widgets)
  const handleDeleteWidget = (widgetId: string) => {
    const deleteFromWidgets = (widgets: Widget[]): Widget[] => {
      return widgets.filter(w => w.id !== widgetId).map(w => ({
        ...w,
        children: w.children ? deleteFromWidgets(w.children) : undefined
      }));
    };
    
    const updatedWidgets = deleteFromWidgets(canvasWidgets);
    setCanvasWidgets(updatedWidgets);
    addToHistory(updatedWidgets);
    setSelectedWidget(null);
    toast({
      title: "Widget Deleted",
      description: "The widget has been removed from the canvas."
    });
  };

  // Duplicate widget (recursive to handle nested widgets)
  const handleDuplicateWidget = (widget: Widget) => {
    const duplicateWithNewIds = (w: Widget): Widget => ({
      ...w,
      id: generateId(),
      children: w.children?.map(child => duplicateWithNewIds(child))
    });
    
    const newWidget = duplicateWithNewIds(widget);
    const updatedWidgets = [...canvasWidgets, newWidget];
    setCanvasWidgets(updatedWidgets);
    addToHistory(updatedWidgets);
    toast({
      title: "Widget Duplicated",
      description: "The widget has been duplicated."
    });
  };

  // Find widget by ID (recursive)
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

  // Remove widget from anywhere in the tree (returns new tree without the widget)
  const removeWidgetById = (widgets: Widget[], id: string): Widget[] => {
    return widgets.filter(w => w.id !== id).map(w => ({
      ...w,
      children: w.children ? removeWidgetById(w.children, id) : undefined
    }));
  };

  // Insert widget at specific position in canvas
  const insertWidgetAtPosition = (widgets: Widget[], widget: Widget, index: number): Widget[] => {
    const newWidgets = [...widgets];
    newWidgets.splice(index, 0, widget);
    return newWidgets;
  };

  // Insert widget at specific position in a section or column
  const insertWidgetInSection = (widgets: Widget[], containerId: string, widget: Widget, index: number | null): Widget[] => {
    return widgets.map(w => {
      if (w.id === containerId && w.children !== undefined) {
        const newChildren = [...w.children];
        if (index !== null && index >= 0 && index <= newChildren.length) {
          newChildren.splice(index, 0, widget);
        } else {
          newChildren.push(widget);
        }
        return { ...w, children: newChildren };
      }
      if (w.children) {
        return { ...w, children: insertWidgetInSection(w.children, containerId, widget, index) };
      }
      return w;
    });
  };

  // Update widget properties (recursive to handle nested widgets)
  const handleUpdateProperty = (widgetId: string, property: string, value: any) => {
    const updateInWidgets = (widgets: Widget[]): Widget[] => {
      return widgets.map(w => {
        if (w.id === widgetId) {
          if (w.type === 'section' && property === 'columns') {
            const newColumnCount = parseInt(value);
            const currentColumnCount = w.children?.length || 0;
            let newChildren = w.children || [];

            if (newColumnCount > currentColumnCount) {
              const columnsToAdd = newColumnCount - currentColumnCount;
              const newColumns = createColumns(columnsToAdd);
              newChildren = [...newChildren, ...newColumns];
            } else if (newColumnCount < currentColumnCount) {
              newChildren = newChildren.slice(0, newColumnCount);
            }

            return { ...w, props: { ...w.props, [property]: value }, children: newChildren };
          }
          return { ...w, props: { ...w.props, [property]: value } };
        }
        if (w.children) {
          return { ...w, children: updateInWidgets(w.children) };
        }
        return w;
      });
    };
    
    const updatedWidgets = updateInWidgets(canvasWidgets);
    setCanvasWidgets(updatedWidgets);
    
    // Update selected widget if it's being edited - find it recursively
    if (selectedWidget && selectedWidget.id === widgetId) {
      const updated = findWidgetById(updatedWidgets, widgetId);
      if (updated) setSelectedWidget(updated);
    }
  };

  // Update multiple widget properties at once (for batch updates)
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
    
    // Update selected widget if it's being edited - find it recursively
    if (selectedWidget && selectedWidget.id === widgetId) {
      const updated = findWidgetById(updatedWidgets, widgetId);
      if (updated) setSelectedWidget(updated);
    }
  };

  // Add widget to a specific section or column
  const handleDropInSection = (containerId: string, e: React.DragEvent) => {
    e.stopPropagation();
    
    let updatedWidgets: Widget[];
    const insertIndex = dropTargetIndex;

    // Handle dropping new widget from library
    if (draggedWidget) {
      const newWidget: Widget = {
        id: generateId(),
        type: draggedWidget.type,
        props: { ...draggedWidget.defaultProps },
        children: draggedWidget.type === 'section' 
          ? createColumns(draggedWidget.defaultProps.columns || 1)
          : draggedWidget.type === 'column'
          ? []
          : undefined
      };

      updatedWidgets = insertWidgetInSection(canvasWidgets, containerId, newWidget, insertIndex);
      
      toast({
        title: "Widget Added",
        description: `${draggedWidget.label} has been added.`
      });
    }
    // Handle moving existing widget
    else if (draggedExistingWidget) {
      // Remove widget from its current location
      const widgetsWithoutDragged = removeWidgetById(canvasWidgets, draggedExistingWidget.id);
      
      // Add widget to container at specific position
      updatedWidgets = insertWidgetInSection(widgetsWithoutDragged, containerId, draggedExistingWidget, insertIndex);
      
      toast({
        title: "Widget Moved",
        description: "The widget has been repositioned."
      });
    } else {
      return;
    }

    setCanvasWidgets(updatedWidgets);
    addToHistory(updatedWidgets);
    setDraggedWidget(null);
    setDraggedExistingWidget(null);
    setDropTargetSection(null);
    setDropTargetIndex(null);
  };

  // Save page
  const handleSave = async () => {
    if (isPersistingState) {
      return;
    }

    setIsPersistingState(true);
    try {
      await saveBuilderState();
      toast({
        title: "Page Saved",
        description: "Your website has been saved successfully."
      });
    } catch (error) {
      console.error('Failed to save builder state', error);
      const description = error instanceof Error ? error.message : 'Failed to save the page. Please try again.';
      toast({
        title: "Save Failed",
        description,
        variant: "destructive"
      });
    } finally {
      setIsPersistingState(false);
    }
  };

  // Render widget on canvas
  const renderWidget = (
    widget: Widget,
    isNested: boolean = false,
    enableDrag: boolean = true,
    mode: 'edit' | 'preview' = 'edit'
  ) => {
    const isPreview = mode === 'preview';
    const isSelected = !isPreview && selectedWidget?.id === widget.id;
    const isDragging = !isPreview && draggedExistingWidget?.id === widget.id;
    const widgetStyles: string[] = [];

    const registerStyle = (
      suffix: string,
      styles: Record<string, StyleValue>
    ) => {
      const className = `widget-${widget.id}-${suffix}`;
      const cssBlock = buildCssBlock(className, styles);
      if (cssBlock) {
        widgetStyles.push(cssBlock);
      }
      return className;
    };

    const wrapperClasses = [
      'relative group transition-all',
      isDragging ? 'opacity-50' : '',
      !isPreview
        ? isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2'
        : ''
    ]
      .filter(Boolean)
      .join(' ');
    
    return (
      <div
        key={widget.id}
        draggable={!isPreview && enableDrag}
        onDragStart={!isPreview && enableDrag ? (e) => handleExistingWidgetDragStart(widget, e) : undefined}
        onDragEnd={
          !isPreview
            ? () => {
                setDraggedExistingWidget(null);
                setDropTargetIndex(null);
              }
            : undefined
        }
        className={`${wrapperClasses} pointer-events-auto`}
        onClick={!isPreview ? (e) => {
          e.stopPropagation();
          setSelectedWidget(widget);
        } : undefined}
      >
        {/* Widget controls */}
        {!isPreview && (
          <div className="absolute -top-8 left-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded-t text-xs z-10">
            <GripVertical className="h-3 w-3" />
            <span className="flex-1 font-medium">{widget.type}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateWidget(widget);
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 hover:bg-red-500/20"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWidget(widget.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Widget content preview */}
        <div>
          {widget.type === 'heading' && (() => {
            const headingClass = registerStyle('heading', {
              color: widget.props.color,
              fontSize: widget.props.fontSize,
              textAlign: widget.props.textAlign,
              fontWeight: widget.props.fontWeight
            });

            return (
              <div
                className={headingClass}
                style={{
                  color: widget.props.color || '#1f2937',
                  fontSize: widget.props.fontSize || '2rem',
                  textAlign: widget.props.textAlign || 'left',
                  fontWeight: widget.props.fontWeight || '600',
                  lineHeight: widget.props.lineHeight || '1.2',
                  margin: widget.props.margin || '0 0 1rem'
                }}
              >
              {widget.props.text}
              </div>
            );
          })()}
          {widget.type === 'text' && (() => {
            const textClass = registerStyle('text', {
              color: widget.props.color,
              fontSize: widget.props.fontSize,
              textAlign: widget.props.textAlign,
              lineHeight: widget.props.lineHeight
            });

            return (
              <div
                className={textClass}
                style={{
                  color: widget.props.color || '#374151',
                  fontSize: widget.props.fontSize || '1rem',
                  textAlign: widget.props.textAlign || 'left',
                  lineHeight: widget.props.lineHeight || '1.5',
                  margin: widget.props.margin || '0 0 1rem',
                  padding: widget.props.padding || '0',
                  letterSpacing: widget.props.letterSpacing || 'normal',
                  fontWeight: widget.props.fontWeight || '400',
                  fontFamily: widget.props.fontFamily || 'inherit',
                  backgroundColor: widget.props.backgroundColor || 'transparent',
                  textTransform: widget.props.textTransform || 'none',
                  textDecoration: widget.props.textDecoration || 'none',
                  textShadow: widget.props.textShadow || undefined
                }}
              >
                {widget.props.text}
              </div>
            );
          })()}
          {widget.type === 'image' && (() => {
            const imageSrc = widget.props.src || widget.props.uploadedUrl || widget.props.image;
            const hasImage = Boolean(imageSrc);
            const resolvedHeight = widget.props.height && widget.props.height !== 'auto'
              ? widget.props.height
              : undefined;
            const resolvedOpacity = widget.props.opacity ? parseFloat(widget.props.opacity) : 1;
            const alignment = widget.props.align || 'center';
            const justifyMap: Record<string, string> = {
              left: 'flex-start',
              center: 'center',
              right: 'flex-end',
              stretch: 'stretch'
            };
            const hoverEffectClassMap: Record<string, string> = {
              zoom: 'transform-gpu transition-transform duration-200 hover:scale-105',
              lift: 'transform-gpu transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
              fade: 'transition-opacity duration-200 hover:opacity-90',
              none: ''
            };
            const hoverEffectClass = hoverEffectClassMap[widget.props.hoverEffect as keyof typeof hoverEffectClassMap] || '';

            const containerClass = registerStyle('image-container', {
              width: widget.props.width || '100%',
              height: resolvedHeight || 'auto',
              minHeight: (resolvedHeight || hasImage) ? undefined : '200px',
              borderRadius: widget.props.borderRadius || '0',
              borderWidth: widget.props.borderWidth || '0',
              borderColor: widget.props.borderColor || 'transparent',
              borderStyle: widget.props.borderStyle || 'solid',
              overflow: 'hidden',
              boxShadow: widget.props.boxShadow || 'none',
              padding: widget.props.padding || '0',
              backgroundColor: widget.props.backgroundColor || (hasImage ? 'transparent' : '#f3f4f6'),
              transition: widget.props.transition || 'transform 0.3s ease, box-shadow 0.3s ease'
            });

            const imageClass = registerStyle('image-element', {
              width: '100%',
              height: resolvedHeight ? '100%' : 'auto',
              objectFit: widget.props.objectFit || 'cover',
              objectPosition: widget.props.objectPosition || 'center',
              opacity: resolvedOpacity,
              filter: widget.props.filter || 'none',
              display: 'block'
            });

            const figureStyle: React.CSSProperties = {
              margin: widget.props.margin || '0 0 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: alignment === 'stretch' ? 'stretch' : (justifyMap[alignment] ? justifyMap[alignment as keyof typeof justifyMap] : 'center'),
              gap: widget.props.showCaption && widget.props.caption ? '0.5rem' : undefined
            };

            const containerStyle: React.CSSProperties = {
              width: widget.props.width || '100%',
              height: resolvedHeight || 'auto',
              minHeight: (resolvedHeight || hasImage) ? undefined : '200px',
              borderRadius: widget.props.borderRadius || '0',
              borderWidth: widget.props.borderWidth || '0',
              borderColor: widget.props.borderColor || 'transparent',
              borderStyle: widget.props.borderStyle || 'solid',
              overflow: 'hidden',
              boxShadow: widget.props.boxShadow || 'none',
              padding: widget.props.padding || '0',
              backgroundColor: widget.props.backgroundColor || (hasImage ? 'transparent' : '#f3f4f6'),
              transition: widget.props.transition || 'transform 0.3s ease, box-shadow 0.3s ease'
            };

            const imageStyles: React.CSSProperties = {
              width: '100%',
              height: resolvedHeight ? '100%' : 'auto',
              objectFit: widget.props.objectFit || 'cover',
              objectPosition: widget.props.objectPosition || 'center',
              opacity: resolvedOpacity,
              filter: widget.props.filter || 'none',
              display: 'block',
              aspectRatio: widget.props.aspectRatio && widget.props.aspectRatio !== 'auto'
                ? widget.props.aspectRatio
                : undefined
            };

            const imageContent = (
              <div
                className={`relative ${containerClass} ${hoverEffectClass}`.trim()}
                style={containerStyle}
              >
                {hasImage && (
                  <img
                    src={imageSrc}
                    alt={widget.props.alt || 'Image'}
                    className={imageClass}
                    loading={widget.props.loading || 'lazy'}
                    style={imageStyles}
                    onError={(e) => {
                      const placeholder = e.currentTarget.parentElement?.querySelector('[data-image-placeholder]') as HTMLElement | null;
                      if (placeholder) {
                        placeholder.classList.remove('hidden');
                      }
                      e.currentTarget.classList.add('hidden');
                    }}
                  />
                )}
                <div
                  data-image-placeholder
                  className={`absolute inset-0 flex flex-col items-center justify-center text-gray-500 ${hasImage ? 'hidden' : ''}`}
                  style={{
                    backgroundColor: widget.props.backgroundColor || '#f3f4f6'
                  }}
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span>No image selected</span>
                </div>
              </div>
            );

            const clickableContent = widget.props.link ? (
              <a
                href={widget.props.link}
                target={widget.props.openInNewTab ? '_blank' : undefined}
                rel={widget.props.linkRel || 'noopener noreferrer'}
                className="block w-full"
                onClick={(e) => !isPreview && e.preventDefault()}
              >
                {imageContent}
              </a>
            ) : (
              imageContent
            );

            return (
              <figure style={figureStyle} className="w-full">
                {clickableContent}
                {widget.props.showCaption && widget.props.caption && (
                  <figcaption
                    style={{
                      color: widget.props.captionColor || '#4b5563',
                      textAlign: widget.props.captionAlign || alignment,
                      fontSize: widget.props.captionSize || '0.875rem'
                    }}
                  >
                    {widget.props.caption}
                  </figcaption>
                )}
              </figure>
            );
          })()}
          {widget.type === 'button' && (() => {
            const paddingPresets: Record<string, string> = {
              small: '0.5rem 1rem',
              medium: '0.75rem 1.5rem',
              large: '1rem 2rem'
            };

            const fontPresets: Record<string, string> = {
              small: '0.875rem',
              medium: '1rem',
              large: '1.125rem'
            };

            const sizeKey = widget.props.size || 'medium';
            const resolvedPadding = widget.props.padding?.trim()
              ? widget.props.padding
              : paddingPresets[sizeKey] || paddingPresets.medium;
            const resolvedFontSize = widget.props.fontSize?.trim()
              ? widget.props.fontSize
              : fontPresets[sizeKey] || fontPresets.medium;

            const backgroundColor = widget.props.backgroundColor || '#0066cc';
            const textColor = widget.props.color || '#ffffff';
            const borderColor = widget.props.borderColor || backgroundColor;
            const isDisabled = Boolean(widget.props.disabled);

            const buttonClass = registerStyle('button', {
              backgroundColor,
              color: textColor,
              padding: resolvedPadding,
              borderRadius: widget.props.borderRadius || '0.375rem',
              fontWeight: widget.props.fontWeight || '600',
              fontSize: resolvedFontSize,
              width: widget.props.fullWidth ? '100%' : 'auto',
              borderWidth: widget.props.borderWidth || '0px',
              borderStyle: widget.props.borderStyle || 'solid',
              borderColor,
              boxShadow: widget.props.boxShadow || 'none',
              letterSpacing: widget.props.letterSpacing || 'normal',
              textTransform: widget.props.textTransform || 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: widget.props.align || 'center',
              textDecoration: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
              transition: widget.props.transition || 'all 0.2s ease'
            });

            if (!isDisabled) {
              const hoverCss = buildCssBlock(`${buttonClass}:hover`, {
                backgroundColor: widget.props.hoverBackgroundColor || undefined,
                color: widget.props.hoverColor || undefined,
                boxShadow: widget.props.hoverBoxShadow || undefined
              });
              if (hoverCss) {
                widgetStyles.push(hoverCss);
              }
            }

            const content = (
              <span className="inline-flex items-center gap-2">
                {widget.props.text}
              </span>
            );

            const commonProps = {
              className: `${buttonClass} focus:outline-none`,
              onClick: (e: React.MouseEvent) => {
                if (!isPreview) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            };

            const hasLink = Boolean(widget.props.link && widget.props.link.trim() !== '');

            if (hasLink) {
              const target = widget.props.openInNewTab ? '_blank' : '_self';
              const rel = widget.props.openInNewTab
                ? widget.props.linkRel || 'noopener noreferrer'
                : widget.props.linkRel || undefined;
              return (
                <a
                  href={widget.props.link}
                  target={isPreview ? target : '_self'}
                  rel={isPreview ? rel : 'noopener noreferrer'}
                  {...commonProps}
                  aria-disabled={isDisabled ? 'true' : 'false'}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                type="button"
                disabled={isDisabled}
                {...commonProps}
              >
                {content}
              </button>
            );
          })()}
          {widget.type === 'video' && (
            <div 
              className="bg-gray-200 flex items-center justify-center"
              style={{ 
                width: widget.props.width,
                height: widget.props.height,
                borderRadius: widget.props.borderRadius
              }}
            >
              <Video className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {widget.type === 'icon' && (() => {
            const iconSize = widget.props.size || '2rem';
            const iconColor = widget.props.color || '#0066cc';
            const strokeWidth = widget.props.strokeWidth !== undefined
              ? (typeof widget.props.strokeWidth === 'number' ? widget.props.strokeWidth : parseFloat(widget.props.strokeWidth) || 1.5)
              : 1.5;
            const iconOpacity = widget.props.opacity !== undefined
              ? (typeof widget.props.opacity === 'number' ? widget.props.opacity : parseFloat(widget.props.opacity) || 1)
              : 1;
            const rotationValue = widget.props.rotation !== undefined
              ? (typeof widget.props.rotation === 'number' ? widget.props.rotation : parseFloat(widget.props.rotation) || 0)
              : 0;
            const hoverScaleValue = widget.props.hoverScale !== undefined
              ? (typeof widget.props.hoverScale === 'number' ? widget.props.hoverScale : parseFloat(widget.props.hoverScale) || 1)
              : 1;

            const flipTransform = widget.props.flip === 'horizontal'
              ? 'scaleX(-1)'
              : widget.props.flip === 'vertical'
                ? 'scaleY(-1)'
                : widget.props.flip === 'both'
                  ? 'scale(-1)'
                  : 'scale(1)';
            const baseTransform = `${flipTransform} rotate(${rotationValue}deg)`;

            const iconContainerStyles: Record<string, StyleValue> = {
              color: iconColor,
              fontSize: iconSize,
              backgroundColor: widget.props.backgroundColor || 'transparent',
              borderRadius: widget.props.borderRadius || '0',
              padding: widget.props.padding || '0',
              borderWidth: widget.props.borderWidth || '0',
              borderColor: widget.props.borderColor || 'transparent',
              borderStyle: widget.props.borderStyle || 'solid',
              boxShadow: widget.props.boxShadow || 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: widget.props.transition || 'transform 0.2s ease, box-shadow 0.2s ease',
              transform: baseTransform,
              opacity: iconOpacity,
              cursor: widget.props.link ? 'pointer' : 'default',
              width: 'fit-content',
              height: 'fit-content'
            };

            const iconContainerClass = registerStyle('icon-container', iconContainerStyles);

            const hoverCss = buildCssBlock(`${iconContainerClass}:hover`, {
              color: widget.props.hoverColor || undefined,
              backgroundColor: widget.props.hoverBackground || undefined,
              boxShadow: widget.props.hoverBoxShadow || undefined,
              transform: hoverScaleValue !== 1 ? `${baseTransform} scale(${hoverScaleValue})` : undefined
            });
            if (hoverCss) {
              widgetStyles.push(hoverCss);
            }

            const renderIcon = () => {
              const uploadedIcon = widget.props.uploadedIcon || widget.props.imageSrc;
              if (uploadedIcon) {
                return (
                  <img
                    src={uploadedIcon}
                    alt={widget.props.name || 'Icon'}
                    style={{ width: iconSize, height: iconSize, objectFit: 'contain' }}
                    className="object-contain"
                  />
                );
              }

              const iconName = widget.props.name || 'Globe';
              const iconMap: Record<string, any> = {
                'User': User,
                'Settings': Settings,
                'Search': Search,
                'Mail': Mail,
                'Phone': Phone,
                'MapPin': MapPin,
                'Calendar': Calendar,
                'Clock': Clock,
                'Heart': Heart,
                'Star': Star,
                'ShoppingCart': ShoppingCart,
                'Menu': Menu,
                'X': X,
                'Check': Check,
                'AlertCircle': AlertCircle,
                'Info': Info,
                'HelpCircle': HelpCircle,
                'Globe': Globe,
                'Link': Link,
                'Download': Download,
                'Upload': Upload,
                'Share2': Share2,
                'Copy': Copy,
                'Trash2': Trash2,
                'Edit': Edit,
                'Save': Save,
                'Home': Home,
                'Plus': Plus,
                'Minus': Minus,
                'ChevronRight': ChevronRight,
                'ChevronLeft': ChevronLeft,
                'ChevronUp': ChevronUp,
                'ChevronDown': ChevronDown,
                'ArrowRight': ArrowRight,
                'ArrowLeft': ArrowLeft,
                'ArrowUp': ArrowUp,
                'ArrowDown': ArrowDown,
                'Facebook': Facebook,
                'Twitter': Twitter,
                'Instagram': Instagram,
                'Linkedin': Linkedin,
                'Youtube': Youtube,
                'Github': Github,
                'Sun': Sun,
                'Moon': Moon,
                'Cloud': Cloud,
                'Zap': Zap,
                'Bell': Bell,
                'Lock': Lock,
                'Unlock': Unlock,
                'Eye': Eye,
                'EyeOff': EyeOff,
                'Camera': Camera,
                'Image': Image,
                'Video': Video,
                'Mic': Mic,
                'Volume2': Volume2,
                'VolumeX': VolumeX,
                'Wifi': Wifi,
                'WifiOff': WifiOff,
                'Battery': Battery,
                'BatteryCharging': BatteryCharging,
                'Bluetooth': Bluetooth,
                'Database': Database,
                'HardDrive': HardDrive,
                'Cpu': Cpu,
                'Monitor': Monitor,
                'Smartphone': Smartphone,
                'Tablet': Tablet,
                'Laptop': Laptop,
                'Watch': Watch,
                'Tv': Tv,
                'Printer': Printer,
                'Bookmark': Bookmark,
                'Tag': Tag,
                'Flag': Flag,
                'Folder': Folder,
                'File': File,
                'FileText': FileText,
                'BarChart': BarChart,
                'PieChart': PieChart,
                'LineChart': LineChart,
                'TrendingUp': TrendingUp,
                'TrendingDown': TrendingDown,
                'DollarSign': DollarSign,
                'CreditCard': CreditCard,
                'Gift': Gift,
                'Package': Package,
                'ShoppingBag': ShoppingBag,
                'Percent': Percent,
                'Hash': Hash,
                'AtSign': AtSign
              };

              const IconComponent = iconMap[iconName] || iconMap['Globe'] || Globe;
              return (
                <IconComponent
                  size={iconSize}
                  color={iconColor}
                  strokeWidth={strokeWidth}
                  style={{ display: 'block' }}
                />
              );
            };

            const hasLink = Boolean(widget.props.link && widget.props.link.trim() !== '');
            const labelPosition = widget.props.labelPosition || 'bottom';
            const labelSpacing = widget.props.labelSpacing || '0.25rem';
            const alignment = widget.props.align || 'center';
            const alignMap: Record<string, string> = {
              left: 'flex-start',
              center: 'center',
              right: 'flex-end'
            };

            const iconWrapper = (
              <div
                className={`${iconContainerClass}`}
                title={widget.props.tooltip || undefined}
                onClick={(e) => {
                  if (!isPreview && hasLink) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                {renderIcon()}
              </div>
            );

            const linkedIcon = hasLink ? (
              <a
                href={widget.props.link}
                target={isPreview && widget.props.openInNewTab ? '_blank' : '_self'}
                rel={isPreview ? (widget.props.linkRel || 'noopener noreferrer') : 'noopener noreferrer'}
                className="inline-flex"
                onClick={(e) => {
                  if (!isPreview) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                {iconWrapper}
              </a>
            ) : iconWrapper;

            const labelElement = widget.props.showLabel && widget.props.label ? (
              <span
                style={{
                  color: widget.props.labelColor || '#1f2937',
                  fontSize: widget.props.labelSize || '0.875rem'
                }}
              >
                {widget.props.label}
              </span>
            ) : null;

            const isHorizontalLabel = labelPosition === 'left' || labelPosition === 'right';
            const stackDirection = isHorizontalLabel ? 'row' : 'column';
            const reverseOrder = labelPosition === 'top' || labelPosition === 'left';

            return (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: alignMap[alignment] || 'center',
                  margin: widget.props.margin || '0 auto 1rem'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    flexDirection: stackDirection,
                    alignItems: 'center',
                    gap: labelElement ? labelSpacing : 0
                  }}
                >
                  {reverseOrder && labelElement}
                  {linkedIcon}
                  {!reverseOrder && labelElement}
                </div>
              </div>
            );
          })()}
          {widget.type === 'section' && (
            <div
              className="transition-all"
              style={{
                backgroundColor: widget.props.backgroundColor,
                backgroundImage: widget.props.backgroundImage ? `url(${widget.props.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: widget.props.padding,
                border: !isPreview 
                  ? '2px dashed #ccc' 
                  : widget.props.borderWidth && widget.props.borderWidth !== '0'
                    ? `${widget.props.borderWidth} ${widget.props.borderStyle || 'solid'} ${widget.props.borderColor || '#e0e0e0'}`
                    : 'none',
                borderRadius: widget.props.borderRadius || '0',
                minHeight: '100px',
                maxWidth: widget.props.maxWidth,
                margin: widget.props.centerContent ? '0 auto' : '0'
              }}
            >
              {!isPreview && (
                <div className="text-center text-gray-400 text-sm mb-4">
                  <Layout className="inline-block h-4 w-4 mr-1" />
                  Section Container ({widget.children?.length || 0} {widget.children?.length === 1 ? 'column' : 'columns'})
                </div>
              )}
              {widget.children && widget.children.length > 0 ? (
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${widget.children.length}, 1fr)`,
                    gap: widget.props.columnGap || '1rem'
                  }}
                >
                  {widget.children.map(column => renderWidget(column, true, mode === 'preview' ? false : true, mode))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-300 text-sm">
                  <div className="mb-2">Empty section - No columns</div>
                  <p className="text-xs">Adjust column count in properties</p>
                </div>
              )}
            </div>
          )}
          {widget.type === 'column' && (() => {
            const columnClass = registerStyle('column', {
              width: widget.props.width,
              padding: widget.props.padding,
              backgroundColor: widget.props.backgroundColor,
              border: !isPreview && dropTargetSection === widget.id ? '2px dashed #3b82f6' : '2px dashed #e0e0e0',
              minHeight: widget.props.minHeight || '100px',
              borderRadius: widget.props.borderRadius || '0'
            });

            return (
              <div
              {...(!isPreview
                ? {
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedWidget(widget);
                    },
                    onDragOver: (e: React.DragEvent) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDropTargetSection(widget.id);
                    },
                    onDragLeave: (e: React.DragEvent) => {
                      e.stopPropagation();
                      setDropTargetSection(null);
                    },
                    onDrop: (e: React.DragEvent) => handleDropInSection(widget.id, e),
                  }
                : {})}
              className={`transition-all rounded-lg cursor-pointer ${columnClass} ${
                !isPreview && dropTargetSection === widget.id
                  ? 'ring-2 ring-blue-400 bg-blue-50/30'
                  : !isPreview && isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : !isPreview
                  ? 'hover:ring-2 hover:ring-blue-400'
                  : ''
              }`}
            >
              {widget.children && widget.children.length > 0 ? (
                <div className="space-y-2">
                  {widget.children.map((child, idx) => (
                    <React.Fragment key={child.id}>
                      {!isPreview && (draggedWidget || draggedExistingWidget) && (
                        <div
                          className={`h-1 transition-all rounded ${
                            dropTargetIndex === idx && dropTargetSection === widget.id
                              ? 'h-8 bg-blue-100 border border-dashed border-blue-400 flex items-center justify-center'
                              : 'hover:h-4 hover:bg-blue-50'
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetSection(widget.id);
                            setDropTargetIndex(idx);
                          }}
                        >
                          {dropTargetIndex === idx && dropTargetSection === widget.id && (
                            <span className="text-xs text-blue-600">Drop here</span>
                          )}
                        </div>
                      )}
                      
                      {renderWidget(child, true, mode === 'preview' ? false : true, mode)}
                      
                      {!isPreview && idx === widget.children!.length - 1 && (draggedWidget || draggedExistingWidget) && (
                        <div
                          className={`h-1 transition-all rounded ${
                            dropTargetIndex === widget.children!.length && dropTargetSection === widget.id
                              ? 'h-8 bg-blue-100 border border-dashed border-blue-400 flex items-center justify-center'
                              : 'hover:h-4 hover:bg-blue-50'
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetSection(widget.id);
                            setDropTargetIndex(widget.children!.length);
                          }}
                        >
                          {dropTargetIndex === widget.children!.length && dropTargetSection === widget.id && (
                            <span className="text-xs text-blue-600">Drop here</span>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 text-xs py-8">
                  <Columns className="inline-block h-8 w-8 mb-2 opacity-50" />
                  <div>Empty Column</div>
                  {!isPreview && <div className="text-[10px] mt-1">Drop widgets here</div>}
                </div>
              )}
            </div>
          );
          })()}
          {widget.type === 'divider' && (() => {
            const dividerClass = registerStyle('divider', {
              borderColor: widget.props.color,
              borderWidth: widget.props.height,
              margin: widget.props.margin,
              borderStyle: widget.props.style
            });

            return <hr className={dividerClass} />;
          })()}
          {widget.type === 'anchor' && (() => {
            const rawAnchorId = (widget.props.anchorId || '').trim();
            const anchorId = rawAnchorId || widget.id;
            const showLabel = widget.props.showLabel ?? false;
            const indicatorColor = widget.props.indicatorColor || '#2563eb';
            const scrollMarginValue = typeof widget.props.scrollMargin === 'number'
              ? widget.props.scrollMargin
              : parseFloat(widget.props.scrollMargin) || 0;
            const anchorMinHeight = !isPreview ? '32px' : (showLabel ? '32px' : '0px');

            const anchorClass = registerStyle('anchor-target', {
              scrollMarginTop: `${scrollMarginValue}px`,
              minHeight: anchorMinHeight
            });

            return (
              <div
                id={anchorId}
                className={`${anchorClass} relative flex items-start`}
                style={{ minHeight: anchorMinHeight }}
              >
                {(!isPreview || showLabel) && (
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border"
                    style={{
                      color: indicatorColor,
                      borderColor: indicatorColor,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)'
                    }}
                  >
                    <AnchorIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {widget.props.label || `Anchor: #${anchorId}`}
                    </span>
                  </div>
                )}
                {!isPreview && widget.props.helperText && (
                  <p className="ml-3 text-xs text-muted-foreground max-w-sm">
                    {widget.props.helperText}
                  </p>
                )}
              </div>
            );
          })()}
          {widget.type === 'card' && (() => {
            const imageSrc = widget.props.image;
            const cardClass = registerStyle('card', {
              backgroundColor: widget.props.backgroundColor,
              borderRadius: widget.props.borderRadius,
              boxShadow: widget.props.boxShadow,
              borderWidth: widget.props.borderWidth,
              borderColor: widget.props.borderColor,
              borderStyle: widget.props.borderStyle,
              padding: widget.props.padding,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            });

            return (
              <div
                className={`${cardClass} hover:-translate-y-1 hover:shadow-lg cursor-pointer`}
                style={{
                  backgroundColor: widget.props.backgroundColor || '#ffffff',
                  borderRadius: widget.props.borderRadius || '0.5rem',
                  boxShadow: widget.props.boxShadow || '0 1px 3px rgba(0,0,0,0.1)',
                  borderWidth: widget.props.borderWidth || '1px',
                  borderStyle: widget.props.borderStyle || 'solid',
                  borderColor: widget.props.borderColor || '#e5e7eb',
                  padding: widget.props.padding || '1.5rem'
                }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={widget.props.title || 'Card image'}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="mb-4 bg-gray-100 h-40 flex items-center justify-center rounded-md text-gray-400 text-sm">
                    <ImageIcon className="h-6 w-6 mr-2" />
                    No image selected
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2">{widget.props.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{widget.props.content}</p>
                {widget.props.link && (
                  <a
                    href={widget.props.link}
                    className="text-blue-600 font-medium text-sm hover:underline"
                    onClick={(e) => !isPreview && e.preventDefault()}
                  >
                    Learn more →
                  </a>
                )}
              </div>
            );
          })()}
          {widget.type === 'alert' && (() => {
            const variant = (widget.props.type || 'info') as 'info' | 'success' | 'warning' | 'error';
            const palette: Record<string, { background: string; border: string; text: string; accent: string }> = {
              info: {
                background: '#e0f2ff',
                border: '#bae6fd',
                text: '#0f172a',
                accent: '#38bdf8'
              },
              success: {
                background: '#ecfdf3',
                border: '#bbf7d0',
                text: '#065f46',
                accent: '#34d399'
              },
              warning: {
                background: '#fffbeb',
                border: '#fde68a',
                text: '#92400e',
                accent: '#fbbf24'
              },
              error: {
                background: '#fef2f2',
                border: '#fecaca',
                text: '#991b1b',
                accent: '#f87171'
              }
            };

            const resolvedPalette = palette[variant] || palette.info;
            const backgroundColor = widget.props.backgroundColor && widget.props.backgroundColor !== ''
              ? widget.props.backgroundColor
              : resolvedPalette.background;
            const borderColor = widget.props.borderColor && widget.props.borderColor !== ''
              ? widget.props.borderColor
              : resolvedPalette.border;
            const textColor = widget.props.textColor && widget.props.textColor !== ''
              ? widget.props.textColor
              : resolvedPalette.text;
            const accentColor = widget.props.accentColor && widget.props.accentColor !== ''
              ? widget.props.accentColor
              : resolvedPalette.accent;

            const layout = widget.props.layout === 'horizontal' ? 'horizontal' : 'vertical';
            const alignment = widget.props.alignment || 'left';
            const textAlign = alignment === 'right' ? 'right' : alignment === 'center' ? 'center' : 'left';

            const containerStyles: Record<string, StyleValue> = {
              backgroundColor,
              color: textColor,
              borderColor,
              borderWidth: widget.props.borderWidth || '1px',
              borderStyle: widget.props.borderStyle || 'solid',
              borderRadius: widget.props.borderRadius || '0.75rem',
              boxShadow: widget.props.shadow || 'none',
              padding: widget.props.padding || '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.gap || '0.75rem',
              width: widget.props.fullWidth === false ? 'auto' : '100%',
              position: widget.props.accentEnabled ? 'relative' : undefined
            };

            const bodyStyles: Record<string, StyleValue> = {
              display: 'flex',
              flexDirection: layout === 'horizontal' ? 'row' : 'column',
              alignItems: layout === 'horizontal' ? 'center' : 'stretch',
              gap: widget.props.iconSpacing || '0.75rem',
              width: '100%'
            };

            const textGroupStyles: Record<string, StyleValue> = {
              flex: 1,
              width: '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.textGap || '0.4rem',
              textAlign
            };

            const titleStyles: Record<string, StyleValue> = {
              fontWeight: 600,
              fontSize: '1rem',
              margin: 0
            };

            const messageStyles: Record<string, StyleValue> = {
              margin: 0,
              lineHeight: widget.props.messageLineHeight || 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            };

            const descriptionStyles: Record<string, StyleValue> = {
              margin: 0,
              marginTop: '0.15rem',
              color: formatStyleValue(widget.props.descriptionColor) || formatStyleValue(widget.props.textColor) || textColor,
              lineHeight: widget.props.descriptionLineHeight || 1.5,
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            };

            const actionsStyles: Record<string, StyleValue> = {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start',
              width: '100%'
            };

            const showIcon = widget.props.showIcon !== false;
            const iconColor = widget.props.iconColor && widget.props.iconColor !== ''
              ? widget.props.iconColor
              : accentColor;
            const iconBackground = widget.props.iconBackground || 'rgba(255,255,255,0.2)';
            const iconStyles: Record<string, StyleValue> = {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              backgroundColor: iconBackground,
              borderRadius: '999px',
              padding: '0.4rem',
              flexShrink: 0,
              fontSize: widget.props.iconSize || '1.25rem'
            };

            const iconMap: Record<string, LucideIcon> = {
              AlertCircle,
              Info,
              Check,
              Bell,
              HelpCircle,
              X
            };
            const iconName = widget.props.icon || 'AlertCircle';
            const IconComponent = iconMap[iconName] || iconMap.AlertCircle;

            const accentPosition = widget.props.accentPosition || 'left';
            const accentStyles: Record<string, StyleValue> =
              accentPosition === 'left' || accentPosition === 'right'
                ? {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    [accentPosition]: 0,
                    backgroundColor: accentColor,
                    borderTopLeftRadius: accentPosition === 'left' ? widget.props.borderRadius || '0.75rem' : undefined,
                    borderBottomLeftRadius: accentPosition === 'left' ? widget.props.borderRadius || '0.75rem' : undefined,
                    borderTopRightRadius: accentPosition === 'right' ? widget.props.borderRadius || '0.75rem' : undefined,
                    borderBottomRightRadius: accentPosition === 'right' ? widget.props.borderRadius || '0.75rem' : undefined
                  }
                : {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '4px',
                    [accentPosition]: 0,
                    backgroundColor: accentColor,
                    borderTopLeftRadius: accentPosition === 'top' ? widget.props.borderRadius || '0.75rem' : undefined,
                    borderTopRightRadius: accentPosition === 'top' ? widget.props.borderRadius || '0.75rem' : undefined,
                    borderBottomLeftRadius: accentPosition === 'bottom' ? widget.props.borderRadius || '0.75rem' : undefined,
                    borderBottomRightRadius: accentPosition === 'bottom' ? widget.props.borderRadius || '0.75rem' : undefined
                  };

            const primaryVariant = widget.props.primaryActionVariant || 'solid';
            const primaryBackground = widget.props.primaryActionBackground || (primaryVariant === 'solid' ? accentColor : 'transparent');
            const primaryTextColor = widget.props.primaryActionTextColor || (primaryVariant === 'solid' ? '#ffffff' : accentColor);
            const primaryHoverBackground = widget.props.primaryActionHoverBackground || primaryBackground;
            const primaryHoverText = widget.props.primaryActionHoverTextColor || primaryTextColor;

            const baseButtonStyles = (bg: string, color: string, variant: string) => ({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              borderWidth: variant === 'solid' ? '0px' : '1px',
              borderStyle: 'solid',
              borderColor: variant === 'solid' ? 'transparent' : color,
              backgroundColor: variant === 'ghost' ? 'transparent' : bg,
              color,
              transition: 'all 0.2s ease'
            });

            const primaryButtonStyles = baseButtonStyles(primaryBackground, primaryTextColor, primaryVariant);
            const secondaryVariant = widget.props.secondaryActionVariant || 'ghost';
            const secondaryBackground = widget.props.secondaryActionBackground || 'transparent';
            const secondaryTextColor = widget.props.secondaryActionTextColor || accentColor;
            const secondaryHoverBackground = widget.props.secondaryActionHoverBackground || secondaryBackground;
            const secondaryHoverText = widget.props.secondaryActionHoverTextColor || secondaryTextColor;
            const secondaryButtonStyles = baseButtonStyles(secondaryBackground, secondaryTextColor, secondaryVariant);

            const closeVariant = widget.props.closeButtonVariant || 'ghost';
            const closeColor = widget.props.closeIconColor || textColor;
            const closeButtonStyles: Record<string, StyleValue> = {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '999px',
              borderWidth: closeVariant === 'outline' ? '1px' : '0px',
              borderStyle: 'solid',
              borderColor: closeVariant === 'outline' ? closeColor : 'transparent',
              backgroundColor: closeVariant === 'solid' ? closeColor : 'transparent',
              color: closeVariant === 'solid' ? backgroundColor : closeColor,
              marginLeft: layout === 'horizontal' ? 'auto' : undefined,
              padding: 0,
              cursor: 'pointer'
            };

            const containerClass = registerStyle('alert-container', containerStyles);
            const bodyClass = registerStyle('alert-body', bodyStyles);
            const textGroupClass = registerStyle('alert-text-group', textGroupStyles);
            const titleClass = registerStyle('alert-title', titleStyles);
            const messageClass = registerStyle('alert-message', messageStyles);
            const descriptionClass = registerStyle('alert-description', descriptionStyles);
            const actionsClass = registerStyle('alert-actions', actionsStyles);
            const iconClass = showIcon ? registerStyle('alert-icon', iconStyles) : '';
            const primaryButtonClass = widget.props.showActions && widget.props.primaryActionText
              ? registerStyle('alert-primary-button', primaryButtonStyles)
              : '';
            const secondaryButtonClass = widget.props.showActions && widget.props.secondaryActionText
              ? registerStyle('alert-secondary-button', secondaryButtonStyles)
              : '';
            const closeButtonClass = widget.props.dismissible
              ? registerStyle('alert-close-button', closeButtonStyles)
              : '';
            const accentClass = widget.props.accentEnabled ? registerStyle('alert-accent', accentStyles) : '';

            if (primaryButtonClass) {
              const hoverCss = buildCssBlock(`.${primaryButtonClass}:hover`, {
                backgroundColor: primaryVariant === 'solid' ? primaryHoverBackground : (primaryHoverBackground || 'transparent'),
                color: primaryHoverText,
                borderColor: primaryVariant === 'solid' ? undefined : (primaryHoverText || primaryTextColor)
              });
              if (hoverCss) widgetStyles.push(hoverCss);
            }

            if (secondaryButtonClass) {
              const hoverCss = buildCssBlock(`.${secondaryButtonClass}:hover`, {
                backgroundColor: secondaryHoverBackground,
                color: secondaryHoverText,
                borderColor: secondaryVariant === 'solid' ? 'transparent' : secondaryHoverText
              });
              if (hoverCss) widgetStyles.push(hoverCss);
            }

            const handleActionClick = (e: React.MouseEvent) => {
              if (!isPreview) {
                e.preventDefault();
                e.stopPropagation();
              }
            };

            return (
              <div className={containerClass}>
                {widget.props.accentEnabled && <div className={accentClass} aria-hidden="true" />}
                <div className={bodyClass}>
                  {showIcon && (
                    <span className={iconClass}>
                      <IconComponent size={widget.props.iconSize || '1.25rem'} />
                    </span>
                  )}
                  <div className={textGroupClass}>
                    {widget.props.title && <p className={titleClass}>{widget.props.title}</p>}
                    {widget.props.message && <p className={messageClass}>{widget.props.message}</p>}
                    {widget.props.showDescription !== false && widget.props.description && (
                      <p className={descriptionClass}>{widget.props.description}</p>
                    )}
                  </div>
                  {widget.props.dismissible && (
                    <button
                      className={`${closeButtonClass} focus:outline-none`}
                      aria-label={widget.props.closeLabel || 'Dismiss alert'}
                      onClick={handleActionClick}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {widget.props.showActions && (
                  <div className={actionsClass}>
                    {widget.props.primaryActionText && primaryButtonClass && (
                      <a
                        href={widget.props.primaryActionLink || '#'}
                        target={isPreview ? '_blank' : '_self'}
                        rel={isPreview ? 'noopener noreferrer' : undefined}
                        className={`${primaryButtonClass} focus:outline-none`}
                        onClick={handleActionClick}
                      >
                        {widget.props.primaryActionText}
                      </a>
                    )}
                    {widget.props.secondaryActionText && secondaryButtonClass && (
                      <a
                        href={widget.props.secondaryActionLink || '#'}
                        target={isPreview ? '_blank' : '_self'}
                        rel={isPreview ? 'noopener noreferrer' : undefined}
                        className={`${secondaryButtonClass} focus:outline-none`}
                        onClick={handleActionClick}
                      >
                        {widget.props.secondaryActionText}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          {widget.type === 'cta' && (() => {
            const alignment = widget.props.alignment || 'center';
            const buttonsAlignment = widget.props.buttonsAlignment || alignment;
            const alignItemsMap: Record<string, string> = {
              left: 'flex-start',
              center: 'center',
              right: 'flex-end'
            };
            const textAlign = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center';

            const backgroundGradient = typeof widget.props.backgroundGradient === 'string'
              ? widget.props.backgroundGradient.trim()
              : '';
            const backgroundImageUrl = typeof widget.props.backgroundImage === 'string'
              ? widget.props.backgroundImage.trim()
              : '';
            const useGradient = widget.props.useBackgroundGradient !== false;
            const backgroundImageValue = useGradient && backgroundGradient
              ? backgroundGradient
              : (backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined);

            const overlayRaw = widget.props.overlayOpacity;
            const overlayOpacity = (() => {
              if (typeof overlayRaw === 'number') return overlayRaw;
              const parsed = parseFloat(overlayRaw);
              return Number.isFinite(parsed) ? parsed : 0.65;
            })();
            const safeOverlayOpacity = Math.max(0, Math.min(1, overlayOpacity));
            const showOverlay = widget.props.showOverlay !== false && safeOverlayOpacity > 0;

            const containerStyles: Record<string, StyleValue> = {
              backgroundColor: widget.props.backgroundColor || '#0f172a',
              backgroundImage: backgroundImageValue,
              backgroundSize: backgroundImageValue ? 'cover' : undefined,
              backgroundPosition: backgroundImageValue ? 'center' : undefined,
              borderRadius: widget.props.borderRadius || '1.5rem',
              padding: widget.props.padding || '3rem',
              boxShadow: widget.props.shadow || 'none',
              color: widget.props.textColor || widget.props.color || '#ffffff',
              position: 'relative',
              overflow: 'hidden'
            };

            const overlayStyles: Record<string, StyleValue> = {
              position: 'absolute',
              inset: 0,
              backgroundColor: widget.props.overlayColor || '#0f172a',
              opacity: safeOverlayOpacity,
              pointerEvents: 'none'
            };

            const contentStyles: Record<string, StyleValue> = {
              position: 'relative',
              zIndex: 1,
              maxWidth: widget.props.contentMaxWidth || '640px',
              textAlign,
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.contentGap || '1rem',
              alignItems: alignItemsMap[alignment] || 'center',
              marginLeft: alignment === 'left' ? 0 : 'auto',
              marginRight: alignment === 'right' ? 0 : 'auto'
            };

            const badgeStyles: Record<string, StyleValue> = {
              alignSelf: alignItemsMap[alignment] || 'center',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: widget.props.badgeLetterSpacing || '0.1em',
              textTransform: 'uppercase',
              padding: widget.props.badgePadding || '0.25rem 0.75rem',
              borderRadius: '999px',
              color: widget.props.badgeColor || '#ffffff',
              backgroundColor: widget.props.badgeBackground || 'rgba(255,255,255,0.15)'
            };

            const headingStyles: Record<string, StyleValue> = {
              fontSize: widget.props.headingSize || '2.5rem',
              fontWeight: widget.props.headingWeight || '700',
              color: widget.props.headingColor || widget.props.textColor || widget.props.color || '#ffffff',
              margin: 0
            };

            const descriptionStyles: Record<string, StyleValue> = {
              color: widget.props.descriptionColor || widget.props.color || '#f8fafc',
              fontSize: widget.props.descriptionSize || '1.125rem',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: widget.props.descriptionMaxWidth || '560px',
              alignSelf: alignItemsMap[alignment] || 'center'
            };

            const buttonsFullWidth = Boolean(widget.props.buttonsFullWidth);
            const buttonGroupStyles: Record<string, StyleValue> = {
              display: 'flex',
              flexWrap: buttonsFullWidth ? 'nowrap' : 'wrap',
              flexDirection: buttonsFullWidth ? 'column' : 'row',
              gap: widget.props.buttonsGap || '0.75rem',
              justifyContent: buttonsAlignment === 'left'
                ? 'flex-start'
                : buttonsAlignment === 'right'
                  ? 'flex-end'
                  : 'center',
              alignItems: buttonsFullWidth ? 'stretch' : undefined,
              width: '100%'
            };

            const primaryIsOutline = (widget.props.buttonStyle || 'solid') === 'outline';
            const primaryBackground = primaryIsOutline
              ? 'transparent'
              : widget.props.buttonBackground || '#ffffff';
            const primaryBorderWidth = widget.props.buttonBorderWidth || (primaryIsOutline ? '1px' : '0px');
            const primaryBorderColor = widget.props.buttonBorderColor || (primaryIsOutline ? widget.props.buttonTextColor || '#0f172a' : 'transparent');
            const primaryTextColor = widget.props.buttonTextColor || '#0f172a';

            const baseButtonStyles: Record<string, StyleValue> = {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              textDecoration: 'none',
              transition: widget.props.buttonTransition || 'all 0.2s ease',
              borderRadius: widget.props.buttonBorderRadius || '999px',
              padding: widget.props.buttonPadding || '0.9rem 2.4rem',
              minWidth: buttonsFullWidth ? '100%' : undefined,
              width: buttonsFullWidth ? '100%' : 'auto',
              textAlign: 'center'
            };

            const primaryButtonStyles: Record<string, StyleValue> = {
              ...baseButtonStyles,
              backgroundColor: primaryBackground,
              color: primaryTextColor,
              borderWidth: primaryBorderWidth,
              borderColor: primaryBorderColor,
              borderStyle: 'solid',
              boxShadow: primaryIsOutline ? 'none' : undefined
            };

            const secondaryStyle = widget.props.secondaryButtonStyle || 'outline';
            const secondaryIsSolid = secondaryStyle === 'solid';
            const secondaryIsGhost = secondaryStyle === 'ghost';
            const secondaryBackground = secondaryIsGhost
              ? 'transparent'
              : widget.props.secondaryButtonBackground || 'transparent';
            const secondaryBorderColor = widget.props.secondaryButtonBorderColor || (secondaryIsSolid ? 'transparent' : 'rgba(255,255,255,0.55)');
            const secondaryBorderWidth = widget.props.secondaryButtonBorderWidth || (secondaryIsGhost ? '0px' : '1px');
            const secondaryTextColor = widget.props.secondaryButtonTextColor || '#ffffff';
            const showSecondaryButton = Boolean(widget.props.showSecondaryButton);
            const secondaryText = widget.props.secondaryButtonText || 'Learn More';

            const secondaryButtonStyles: Record<string, StyleValue> = {
              ...baseButtonStyles,
              backgroundColor: secondaryBackground,
              color: secondaryTextColor,
              borderWidth: secondaryBorderWidth,
              borderColor: secondaryBorderColor,
              borderStyle: 'solid',
              padding: widget.props.secondaryButtonPadding || widget.props.buttonPadding || '0.9rem 2.2rem'
            };

            const optionalHoverCss = (className: string, styles: Record<string, StyleValue>) => {
              const css = buildCssBlock(`.${className}:hover`, styles);
              if (css) {
                widgetStyles.push(css);
              }
            };

            const ctaClass = registerStyle('cta', containerStyles);
            const overlayClass = showOverlay ? registerStyle('cta-overlay', overlayStyles) : '';
            const ctaContentClass = registerStyle('cta-content', contentStyles);
            const badgeClass = registerStyle('cta-badge', badgeStyles);
            const headingClass = registerStyle('cta-heading', headingStyles);
            const descriptionClass = registerStyle('cta-description', descriptionStyles);
            const buttonsClass = registerStyle('cta-buttons', buttonGroupStyles);
            const primaryButtonClass = registerStyle('cta-button-primary', primaryButtonStyles);
            const secondaryButtonClass = showSecondaryButton
              ? registerStyle('cta-button-secondary', secondaryButtonStyles)
              : '';

            optionalHoverCss(primaryButtonClass, {
              backgroundColor: widget.props.buttonHoverBackground || (primaryIsOutline ? 'transparent' : primaryBackground),
              color: widget.props.buttonHoverColor || primaryTextColor,
              borderColor: widget.props.buttonBorderColor || primaryBorderColor
            });

            if (secondaryButtonClass) {
              optionalHoverCss(secondaryButtonClass, {
                backgroundColor: widget.props.secondaryButtonHoverBackground || secondaryBackground,
                color: widget.props.secondaryButtonHoverColor || secondaryTextColor,
                borderColor: widget.props.secondaryButtonBorderColor || secondaryBorderColor
              });
            }

            const primaryHref = widget.props.link && widget.props.link.trim() !== '' ? widget.props.link : '#';
            const primaryTarget = widget.props.buttonNewTab ? '_blank' : '_self';
            const primaryRel = widget.props.buttonNewTab
              ? widget.props.buttonRel || 'noopener noreferrer'
              : widget.props.buttonRel || undefined;

            const secondaryHref = widget.props.secondaryButtonLink && widget.props.secondaryButtonLink.trim() !== ''
              ? widget.props.secondaryButtonLink
              : '#';
            const secondaryTarget = widget.props.secondaryButtonNewTab ? '_blank' : '_self';
            const secondaryRel = widget.props.secondaryButtonNewTab
              ? widget.props.secondaryButtonRel || 'noopener noreferrer'
              : widget.props.secondaryButtonRel || undefined;

            const handleButtonClick = (e: React.MouseEvent) => {
              if (!isPreview) {
                e.preventDefault();
                e.stopPropagation();
              }
            };

            return (
              <div className={`${ctaClass}`}>
                {showOverlay && overlayClass && <div className={overlayClass} aria-hidden="true" />}
                <div className={ctaContentClass}>
                  {widget.props.showBadge !== false && widget.props.badgeText && (
                    <span className={badgeClass}>{widget.props.badgeText}</span>
                  )}
                  {widget.props.heading && (
                    <h2 className={headingClass}>{widget.props.heading}</h2>
                  )}
                  {widget.props.description && (
                    <p className={descriptionClass}>{widget.props.description}</p>
                  )}
                  <div className={buttonsClass}>
                    <a
                      href={primaryHref}
                      target={isPreview ? primaryTarget : '_self'}
                      rel={isPreview ? primaryRel : 'noopener noreferrer'}
                      className={`${primaryButtonClass} focus:outline-none`}
                      onClick={handleButtonClick}
                    >
                      {widget.props.buttonText || 'Get Started'}
                    </a>
                    {showSecondaryButton && (
                      <a
                        href={secondaryHref}
                        target={isPreview ? secondaryTarget : '_self'}
                        rel={isPreview ? secondaryRel : 'noopener noreferrer'}
                        className={`${secondaryButtonClass} focus:outline-none`}
                        onClick={handleButtonClick}
                      >
                        {secondaryText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          {widget.type === 'form' && (() => {
            const fields: string[] = Array.isArray(widget.props.fields)
              ? widget.props.fields
              : [];
            const columns = Math.max(1, parseInt(String(widget.props.columns || 1), 10) || 1);
            const gapValue = widget.props.gap || '1rem';
            const containerStyles: Record<string, StyleValue> = {
              backgroundColor: widget.props.backgroundColor || '#ffffff',
              borderColor: widget.props.borderColor || '#e5e7eb',
              borderWidth: widget.props.borderWidth || '1px',
              borderStyle: widget.props.borderStyle || 'solid',
              borderRadius: widget.props.borderRadius || '0.75rem',
              padding: widget.props.padding || '1.5rem',
              boxShadow: widget.props.shadow || '0 10px 25px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            };

            const labelStyles: Record<string, StyleValue> = {
              color: widget.props.labelColor || '#111827',
              fontSize: widget.props.labelFontSize || '0.95rem',
              fontWeight: 500,
              marginBottom: '0.35rem'
            };

            const inputStyles: Record<string, StyleValue> = {
              backgroundColor: widget.props.inputBackground || '#ffffff',
              color: widget.props.inputTextColor || '#111827',
              borderColor: widget.props.inputBorderColor || '#d1d5db',
              borderWidth: widget.props.inputBorderWidth || '1px',
              borderStyle: widget.props.inputBorderStyle || 'solid',
              borderRadius: widget.props.inputBorderRadius || '0.5rem',
              padding: widget.props.inputPadding || '0.75rem',
              width: '100%',
              boxShadow: 'none'
            };

            const buttonStyles: Record<string, StyleValue> = {
              backgroundColor: widget.props.buttonBackground || '#2563eb',
              color: widget.props.buttonTextColor || '#ffffff',
              padding: widget.props.buttonPadding || '0.75rem 1.5rem',
              borderRadius: widget.props.buttonBorderRadius || '0.5rem',
              fontWeight: 600,
              border: 'none',
              width: widget.props.buttonFullWidth === false ? 'auto' : '100%',
              textAlign: 'center',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer'
            };

            const gridStyles: Record<string, StyleValue> = {
              display: 'grid',
              gridTemplateColumns: columns === 1 ? '1fr' : `repeat(${columns}, minmax(0, 1fr))`,
              gap: gapValue
            };

            const titleAlign = widget.props.titleAlign || 'left';
            const titleStyles: Record<string, StyleValue> = {
              textAlign: titleAlign,
              fontWeight: 700,
              fontSize: '1.25rem',
              margin: 0
            };

            const descriptionStyles: Record<string, StyleValue> = {
              marginTop: '0.5rem',
              color: widget.props.descriptionColor || '#4b5563',
              textAlign: titleAlign
            };

            const fieldWideStyles: Record<string, StyleValue> = {
              gridColumn: '1 / -1'
            };

            const containerClass = registerStyle('form-container', containerStyles);
            const labelClass = registerStyle('form-label', labelStyles);
            const inputClass = registerStyle('form-input', inputStyles);
            const buttonClass = registerStyle('form-button', buttonStyles);
            const gridClass = registerStyle('form-grid', gridStyles);
            const titleClass = registerStyle('form-title', titleStyles);
            const descriptionClass = registerStyle('form-description', descriptionStyles);
            const fieldWideClass = registerStyle('form-field-wide', fieldWideStyles);

            const placeholderCss = buildCssBlock(`.${inputClass}::placeholder`, {
              color: widget.props.inputPlaceholderColor || '#9ca3af'
            });
            if (placeholderCss) {
              widgetStyles.push(placeholderCss);
            }

            const buttonHoverCss = buildCssBlock(`.${buttonClass}:hover`, {
              backgroundColor: widget.props.buttonHoverBackground || widget.props.buttonBackground || '#1d4ed8'
            });
            if (buttonHoverCss) {
              widgetStyles.push(buttonHoverCss);
            }

            const getFieldType = (fieldName: string) => {
              const lower = fieldName.toLowerCase();
              if (lower.includes('email')) return 'email';
              if (lower.includes('phone') || lower.includes('tel')) return 'tel';
              if (lower.includes('date')) return 'date';
              return 'text';
            };

            const shouldUseTextarea = (fieldName: string) => /message|note|comment|address|details/i.test(fieldName);

            return (
              <form
                className={containerClass}
                action={widget.props.action || undefined}
                method={(widget.props.method || 'POST').toString().toUpperCase()}
                onSubmit={(e) => e.preventDefault()}
              >
                {widget.props.title && (
                  <div>
                    <h3 className={titleClass}>{widget.props.title}</h3>
                    {widget.props.description && (
                      <p className={descriptionClass}>{widget.props.description}</p>
                    )}
                  </div>
                )}

                <div className={gridClass}>
                  {fields.map((field, idx) => {
                    const trimmed = (field || '').trim();
                    if (!trimmed) return null;
                    const isTextarea = shouldUseTextarea(trimmed);
                    const inputType = getFieldType(trimmed);
                    const displayLabel = trimmed.replace(/_/g, ' ');
                    const key = `${widget.id}-field-${idx}-${trimmed}`;

                    return (
                      <div
                        key={key}
                        className={isTextarea && columns > 1 ? fieldWideClass : undefined}
                      >
                        {widget.props.showLabels !== false && (
                          <Label className={labelClass}>
                            {displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1)}
                          </Label>
                        )}
                        {isTextarea ? (
                          <Textarea
                            className={inputClass}
                            placeholder={`Enter ${displayLabel}...`}
                            rows={4}
                          />
                        ) : (
                          <Input
                            type={inputType}
                            className={inputClass}
                            placeholder={`Enter ${displayLabel}...`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className={buttonClass}
                >
                  {widget.props.submitText || 'Submit'}
                </button>
              </form>
            );
          })()}
          {widget.type === 'accordion' && (() => {
            const iconShape = widget.props.iconShape || 'chevron';
            const iconPosition = widget.props.iconPosition || 'right';
            const iconColor = widget.props.iconColor || widget.props.headerTextColor || '#0f172a';
            const iconSize = widget.props.iconSize || '1.125rem';

            const iconMap: Record<string, { open: LucideIcon; closed: LucideIcon }> = {
              chevron: { open: ChevronUp, closed: ChevronDown },
              caret: { open: ChevronDown, closed: ChevronRight },
              plus: { open: Minus, closed: Plus }
            };
            const selectedIcon = iconMap[iconShape] || iconMap.chevron;

            const currentOpenState = Object.prototype.hasOwnProperty.call(accordionState, widget.id)
              ? accordionState[widget.id]
              : Boolean(widget.props.defaultOpen);
            const IconComponent = currentOpenState ? selectedIcon.open : selectedIcon.closed;

            const containerBackground = widget.props.containerBackground || 'transparent';
            const headerBackground = widget.props.headerBackground || containerBackground || '#f8fafc';
            const contentBackground = widget.props.contentBackground || containerBackground || '#ffffff';

            const containerStyles: Record<string, StyleValue> = {
              borderWidth: widget.props.borderWidth || '1px',
              borderColor: widget.props.borderColor || '#e5e7eb',
              borderStyle: widget.props.borderStyle || 'solid',
              borderRadius: widget.props.borderRadius || '0.75rem',
              boxShadow: widget.props.boxShadow || 'none',
              overflow: 'hidden',
              backgroundColor: containerBackground
            };

            const headerStyles: Record<string, StyleValue> = {
              backgroundColor: headerBackground,
              color: widget.props.headerTextColor || '#0f172a',
              padding: widget.props.headerPadding || '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: widget.props.gap || '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: widget.props.transition || 'all 0.25s ease',
              fontSize: widget.props.titleFontSize || '1rem'
            };

            const contentStyles: Record<string, StyleValue> = {
              backgroundColor: contentBackground,
              color: widget.props.contentTextColor || '#4b5563',
              padding: widget.props.contentPadding || '1rem 1.25rem',
              fontSize: widget.props.contentFontSize || '0.95rem',
              borderTop: widget.props.showContentBorder
                ? `1px solid ${widget.props.contentBorderColor || '#e5e7eb'}`
                : 'none'
            };

            const iconStyles: React.CSSProperties = {
              color: iconColor,
              width: iconSize,
              height: iconSize,
              backgroundColor: widget.props.iconBackground || 'transparent',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            };

            const dividerStyles: Record<string, StyleValue> = {
              height: '1px',
              backgroundColor: widget.props.dividerColor || '#e5e7eb'
            };

            const containerClass = registerStyle('accordion', containerStyles);
            const headerClass = registerStyle('accordion-header', headerStyles);
            const contentClass = registerStyle('accordion-content', contentStyles);
            const dividerClass = registerStyle('accordion-divider', dividerStyles);

            const headerHoverCss = buildCssBlock(`${headerClass}:hover`, {
              backgroundColor: widget.props.headerHoverBackground || headerBackground || '#eef2ff'
            });
            if (headerHoverCss) {
              widgetStyles.push(headerHoverCss);
            }

            const inlineContainerStyle = containerStyles as React.CSSProperties;
            const inlineHeaderStyle = headerStyles as React.CSSProperties;
            const inlineContentStyle = contentStyles as React.CSSProperties;
            const inlineDividerStyle = dividerStyles as React.CSSProperties;

            const handleAccordionToggle = (event?: React.SyntheticEvent) => {
              event?.stopPropagation();
              if (!isPreview) {
                setSelectedWidget(widget);
              }
              setAccordionState((prev) => {
                const nextValue = !(Object.prototype.hasOwnProperty.call(prev, widget.id)
                  ? prev[widget.id]
                  : Boolean(widget.props.defaultOpen));
                return {
                  ...prev,
                  [widget.id]: nextValue
                };
              });
            };

            const headerContent = (
              <div
                className={`${headerClass}`}
                style={inlineHeaderStyle}
                role="button"
                tabIndex={0}
                aria-expanded={currentOpenState ? 'true' : 'false'}
                onClick={handleAccordionToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAccordionToggle(e);
                  }
                }}
              >
                {iconPosition === 'left' && (
                  <span style={iconStyles}>
                    <IconComponent size={iconSize} color={iconColor} />
                  </span>
                )}
                <div className="flex-1">{widget.props.title}</div>
                {iconPosition === 'right' && (
                  <span style={iconStyles}>
                    <IconComponent size={iconSize} color={iconColor} />
                  </span>
                )}
              </div>
            );

            return (
              <div className={`${containerClass}`} style={inlineContainerStyle}>
                {headerContent}
                {widget.props.showDivider && <div className={dividerClass} style={inlineDividerStyle} />}
                {currentOpenState && (
                  <div className={`${contentClass}`} style={inlineContentStyle}>
                    {widget.props.content}
                  </div>
                )}
              </div>
            );
          })()}
          {widget.type === 'social' && (() => {
            const socialItemClass = registerStyle('social-item', {
              width:
                widget.props.size === 'small'
                  ? '32px'
                  : widget.props.size === 'large'
                  ? '48px'
                  : '40px',
              height:
                widget.props.size === 'small'
                  ? '32px'
                  : widget.props.size === 'large'
                  ? '48px'
                  : '40px',
              color: widget.props.color
            });

            return (
              <div className="flex items-center gap-3">
                {widget.props.platforms.map((platform: string, idx: number) => (
                  <div 
                    key={idx}
                    className={`rounded-full bg-gray-100 flex items-center justify-center ${socialItemClass}`}
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                ))}
              </div>
            );
          })()}
          
          {/* Navigation widgets */}
          {widget.type === 'navbar' && (() => {
            const navLinks: NavLink[] = normalizeNavLinks(widget.props.links);
            const hasLogoImage = Boolean(widget.props.logo);
            const linksAlignment = widget.props.linksAlignment || 'between';
            const backgroundGradient = (widget.props.backgroundGradient || '').trim();
            const justifyMap: Record<string, string> = {
              start: 'flex-start',
              center: 'center',
              between: 'space-between',
              end: 'flex-end'
            };
            const linkJustifyMap: Record<string, string> = {
              start: 'flex-start',
              center: 'center',
              between: 'center',
              end: 'flex-end'
            };

            const navbarClass = registerStyle('navbar', {
              backgroundColor: backgroundGradient ? undefined : (widget.props.backgroundColor || '#ffffff'),
              backgroundImage: backgroundGradient || undefined,
              color: widget.props.color || '#1f2937',
              minHeight: widget.props.height || '72px',
              padding: widget.props.padding || '0.75rem 2rem',
              borderRadius: widget.props.rounded || '999px',
              boxShadow: widget.props.shadow ? '0 20px 45px rgba(15,23,42,0.08)' : 'none',
              borderBottom: widget.props.showDivider
                ? widget.props.borderBottom || `1px solid ${widget.props.dividerColor || 'rgba(15,23,42,0.08)'}`
                : widget.props.borderBottom || 'none',
              position: widget.props.position === 'fixed'
                ? 'fixed'
                : widget.props.position === 'sticky'
                  ? 'sticky'
                  : 'relative',
              top: widget.props.position === 'sticky'
                ? widget.props.stickyOffset || '0px'
                : widget.props.position === 'fixed'
                  ? '0px'
                  : undefined,
              left: widget.props.position === 'fixed' ? 0 : undefined,
              right: widget.props.position === 'fixed' ? 0 : undefined,
              width: widget.props.position === 'fixed' ? '100%' : undefined,
              zIndex: widget.props.position === 'fixed' ? 60 : widget.props.position === 'sticky' ? 50 : undefined
            });

            const innerClass = registerStyle('navbar-inner', {
              display: 'flex',
              alignItems: 'center',
              justifyContent: justifyMap[linksAlignment] || 'space-between',
              gap: '1.5rem',
              width: '100%',
              flexWrap: 'wrap',
              maxWidth: widget.props.containerMaxWidth || '1200px',
              margin: '0 auto'
            });

            const brandClass = registerStyle('navbar-brand', {
              display: 'flex',
              flexDirection: widget.props.showTagline ? 'column' : 'row',
              alignItems: widget.props.showTagline ? 'flex-start' : 'center',
              gap: widget.props.showTagline ? '0.15rem' : '0.5rem',
              fontWeight: 600,
              fontSize: '1rem'
            });

            const taglineClass = registerStyle('navbar-tagline', {
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.55)'
            });

            const linksWrapperClass = registerStyle('navbar-links', {
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: linkJustifyMap[linksAlignment] || 'center',
              gap: widget.props.linkGap || '1.5rem',
              flex: linksAlignment === 'between' ? '1' : 'unset'
            });

            const linkStyles: Record<string, StyleValue> = {
              color: widget.props.linkColor || widget.props.color || '#0f172a',
              textDecoration: 'none',
              fontWeight: 500,
              textTransform: widget.props.linkUppercase ? 'uppercase' : 'none',
              padding: widget.props.linkPadding || '0.25rem 0.5rem',
              borderRadius: widget.props.linkBorderRadius || '999px',
              transition: 'color 0.2s ease, background-color 0.2s ease'
            };
            const linkClass = registerStyle('navbar-link', linkStyles);
            const hoverCss = buildCssBlock(`.${linkClass}:hover`, {
              color: widget.props.linkHoverColor || '#2563eb',
              backgroundColor: widget.props.linkHoverBackground || 'rgba(37, 99, 235, 0.08)'
            });
            if (hoverCss) widgetStyles.push(hoverCss);
            const activeCss = buildCssBlock(`.${linkClass}[data-active="true"]`, {
              color: widget.props.linkActiveColor || widget.props.linkHoverColor || '#2563eb',
              backgroundColor: widget.props.linkActiveBackground || 'rgba(37, 99, 235, 0.12)'
            });
            if (activeCss) widgetStyles.push(activeCss);

            const actionsClass = registerStyle('navbar-actions', {
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap'
            });

            const buttonVariant = widget.props.buttonVariant || 'solid';
            const buttonBackground = buttonVariant === 'solid'
              ? widget.props.buttonBackground || '#2563eb'
              : 'transparent';
            const buttonTextColor = widget.props.buttonTextColor || (buttonVariant === 'solid' ? '#ffffff' : widget.props.buttonBackground || '#2563eb');
            const primaryButtonClass = registerStyle('navbar-button', {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.55rem 1.5rem',
              borderRadius: widget.props.buttonBorderRadius || '999px',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: buttonBackground,
              color: buttonTextColor,
              borderWidth: widget.props.buttonBorderWidth || (buttonVariant === 'outline' ? '1px' : '0px'),
              borderStyle: 'solid',
              borderColor: widget.props.buttonBorderColor || widget.props.buttonBackground || '#2563eb',
              transition: 'all 0.2s ease'
            });
            const buttonHoverCss = buildCssBlock(`.${primaryButtonClass}:hover`, {
              backgroundColor: widget.props.buttonHoverBackground || (buttonVariant === 'solid' ? '#1d4ed8' : 'transparent'),
              color: widget.props.buttonHoverTextColor || buttonTextColor,
              borderColor: widget.props.buttonBorderColor || widget.props.buttonHoverBackground || '#1d4ed8'
            });
            if (buttonHoverCss) widgetStyles.push(buttonHoverCss);

            const secondaryIconMap: Record<string, LucideIcon> = {
              Phone,
              Mail,
              Calendar,
              User,
              ShoppingCart,
              Bell
            };
            const SecondaryIcon = secondaryIconMap[widget.props.secondaryActionIcon || 'Phone'] || Phone;
            const secondaryActionClass = registerStyle('navbar-secondary-action', {
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(15,23,42,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: widget.props.color || '#1f2937',
              backgroundColor: 'transparent',
              textDecoration: 'none'
            });

            const socialIconMap: Record<string, LucideIcon> = {
              facebook: Facebook,
              twitter: Twitter,
              instagram: Instagram,
              linkedin: Linkedin,
              youtube: Youtube
            };
            const socialWrapperClass = registerStyle('navbar-social', {
              display: 'flex',
              gap: '0.35rem',
              alignItems: 'center'
            });
            const socialButtonClass = registerStyle('navbar-social-button', {
              width: '2rem',
              height: '2rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(15,23,42,0.05)',
              color: widget.props.color || '#1f2937',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            });

            const handleNavClick = (e: React.MouseEvent) => {
              if (!isPreview) {
                e.preventDefault();
                e.stopPropagation();
              }
            };

            return (
              <div className={navbarClass}>
                <div className={innerClass}>
                  <div className={brandClass}>
                    <div className="flex items-center gap-2">
                      {hasLogoImage ? (
                        <img
                          src={widget.props.logo}
                          alt={widget.props.logoText || 'Logo'}
                          className="h-10 w-10 rounded-md border border-white/40 bg-white/20 object-contain"
                        />
                      ) : (
                        <span>{widget.props.logoText || 'Brand'}</span>
                      )}
                      {!hasLogoImage && widget.props.logoText && widget.props.showTagline && (
                        <span className={taglineClass}>{widget.props.tagline}</span>
                      )}
                    </div>
                    {hasLogoImage && widget.props.showTagline && (
                      <span className={taglineClass}>{widget.props.tagline}</span>
                    )}
                  </div>

                  <div className={linksWrapperClass}>
                    {navLinks.length > 0 ? (
                      navLinks.map((link, idx) => (
                        <a
                          key={`${link.label}-${idx}`}
                          href={link.href || '#'}
                          data-active={idx === 0 ? 'true' : undefined}
                          className={linkClass}
                          onClick={handleNavClick}
                        >
                          {link.label || `Link ${idx + 1}`}
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No links configured</span>
                    )}
                  </div>

                  <div className={actionsClass}>
                    {widget.props.showSocialIcons && Array.isArray(widget.props.socialPlatforms) && widget.props.socialPlatforms.length > 0 && (
                      <div className={socialWrapperClass}>
                        {widget.props.socialPlatforms.map((platform: string) => {
                          const Icon = socialIconMap[platform];
                          if (!Icon) return null;
                          return (
                            <span key={platform} className={socialButtonClass} title={platform}>
                              <Icon className="h-4 w-4" />
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {widget.props.showSecondaryAction && (
                      <a
                        href={widget.props.secondaryActionLink || '#'}
                        className={`${secondaryActionClass} focus:outline-none`}
                        onClick={handleNavClick}
                        title={widget.props.secondaryActionLabel || 'Action'}
                      >
                        <SecondaryIcon className="h-4 w-4" />
                      </a>
                    )}

                    {widget.props.showButton && widget.props.buttonText && (
                      <a
                        href={widget.props.buttonLink || '#'}
                        className={`${primaryButtonClass} focus:outline-none`}
                        onClick={handleNavClick}
                      >
                        {widget.props.buttonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          {widget.type === 'footer' && (() => {
            const footerClass = registerStyle('footer', {
              backgroundColor: widget.props.backgroundColor,
              color: widget.props.color,
              padding: widget.props.padding
            });

            return (
              <div className={footerClass}>
                <div className="text-sm text-center">
                  {widget.props.copyright}
                </div>
              </div>
            );
          })()}
          {widget.type === 'breadcrumb' && (() => {
            const breadcrumbItemClass = registerStyle('breadcrumb-item', {
              color: widget.props.color
            });

            return (
              <div className="flex items-center gap-2 text-sm">
                {widget.props.items?.map((item: string, idx: number) => (
                  <React.Fragment key={idx}>
                    <span className={breadcrumbItemClass}>{item}</span>
                    {idx < widget.props.items.length - 1 && (
                      <span className="opacity-50">{widget.props.separator}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })()}
          
          {/* Data Display widgets */}
          {widget.type === 'table' && (() => {
            const headers: string[] = Array.isArray(widget.props.headers) ? widget.props.headers : [];
            const rawRows: string[][] = Array.isArray(widget.props.rows) ? widget.props.rows : [];
            const rawAlignments: string[] = Array.isArray(widget.props.columnAlignments)
              ? widget.props.columnAlignments
              : [];

            const normalizeRows = (data: string[][]): string[][] => {
              if (headers.length === 0) {
                return data;
              }
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

            const resolveAlignment = (value: string): 'left' | 'center' | 'right' => {
              if (value === 'center' || value === 'right') return value;
              return 'left';
            };

            const rows = normalizeRows(rawRows);
            const alignments: ('left' | 'center' | 'right')[] = headers.map((_, idx) => resolveAlignment(rawAlignments[idx]));
            const rawMaxRows = typeof widget.props.maxVisibleRows === 'number' ? widget.props.maxVisibleRows : undefined;
            const maxVisibleRows = rawMaxRows ?? (rows.length || 3);
            const displayRows = rows.slice(0, Math.max(maxVisibleRows, 1));
            const remainingRows = Math.max(rows.length - displayRows.length, 0);
            const accentColor = widget.props.tableAccentColor || '#2563eb';
            const captionAlignMap: Record<string, string> = {
              left: 'flex-start',
              center: 'center',
              right: 'flex-end',
              between: 'space-between'
            };
            const captionAlignment = captionAlignMap[widget.props.captionAlign || 'left'] || 'flex-start';
            const showColumnDividers = Boolean(widget.props.showColumnDividers);
            const columnDividerStyle = `${widget.props.columnDividerWidth || '1px'} solid ${widget.props.columnDividerColor || 'rgba(15,23,42,0.08)'}`;

            const tableWrapperClass = registerStyle('table-wrapper', {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              backgroundColor: widget.props.tableBackground || '#ffffff',
              padding: widget.props.tablePadding || '1.5rem',
              borderRadius: widget.props.borderRadius || '1rem',
              borderWidth: widget.props.bordered === false ? '0px' : widget.props.borderWidth || '1px',
              borderStyle: widget.props.bordered === false ? 'none' : 'solid',
              borderColor: widget.props.borderColor || 'rgba(15,23,42,0.12)',
              boxShadow: widget.props.showShadow === false ? 'none' : widget.props.tableShadow || '0 25px 45px rgba(15,23,42,0.08)'
            });

            const toolbarClass =
              widget.props.showToolbar === false
                ? ''
                : registerStyle('table-toolbar', {
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  });

            const toolbarTitleClass = registerStyle('table-toolbar-title', {
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#0f172a'
            });

            const toolbarSubtitleClass = registerStyle('table-toolbar-subtitle', {
              fontSize: '0.85rem',
              color: '#475569'
            });

            const toolbarActionClass =
              widget.props.showToolbar !== false && widget.props.toolbarActionText
                ? registerStyle('table-toolbar-action', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '999px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderWidth: widget.props.toolbarActionVariant === 'outline' ? '1px' : '0px',
                    borderStyle: 'solid',
                    borderColor:
                      widget.props.toolbarActionVariant === 'outline'
                        ? accentColor
                        : 'transparent',
                    backgroundColor:
                      widget.props.toolbarActionVariant === 'solid'
                        ? accentColor
                        : 'transparent',
                    color:
                      widget.props.toolbarActionVariant === 'solid'
                        ? '#ffffff'
                        : accentColor
                  })
                : '';

            if (toolbarActionClass) {
              const hoverCss = buildCssBlock(`${toolbarActionClass}:hover`, {
                opacity: widget.props.toolbarActionVariant === 'solid' ? 0.9 : undefined,
                backgroundColor:
                  widget.props.toolbarActionVariant === 'ghost'
                    ? `${accentColor}14`
                    : undefined
              });
              if (hoverCss) widgetStyles.push(hoverCss);
            }

            const captionClass =
              widget.props.showCaption === false
                ? ''
                : registerStyle('table-caption', {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: captionAlignment,
                    gap: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#0f172a'
                  });

            const captionDotClass =
              widget.props.showCaption === false
                ? ''
                : registerStyle('table-caption-dot', {
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '999px',
                    backgroundColor: accentColor,
                    display: 'inline-flex'
                  });

            const scrollClass = registerStyle('table-scroll', {
              width: '100%',
              overflowX: 'auto'
            });

            const tableClass = registerStyle('table', {
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              minWidth: widget.props.minTableWidth || '640px'
            });

            const tableHeadClass = registerStyle('table-head', {
              backgroundColor: widget.props.headerBackground || '#f8fafc'
            });

            const headerRowClass = registerStyle('table-head-row', {
              borderBottom: `1px solid ${widget.props.headerBorderColor || 'rgba(15,23,42,0.12)'}`
            });

            const headerCellClass = registerStyle('table-header-cell', {
              padding: widget.props.headerPadding || '0.75rem 1rem',
              color: widget.props.headerColor || '#0f172a',
              fontWeight: widget.props.headerFontWeight || '600',
              fontSize: widget.props.headerFontSize || '0.75rem',
              letterSpacing: widget.props.headerLetterSpacing || '0.08em',
              textTransform: widget.props.headerTextTransform || 'uppercase',
              textAlign: 'left',
              backgroundColor: widget.props.headerBackground || '#f8fafc'
            });

            const bodyRowClass = registerStyle('table-row', {
              backgroundColor: widget.props.cellBackground || '#ffffff',
              borderBottom:
                widget.props.showRowDividers === false
                  ? 'none'
                  : `${widget.props.rowBorderWidth || '1px'} solid ${widget.props.rowBorderColor || 'rgba(15,23,42,0.08)'}`
            });

            if (widget.props.striped) {
              const stripeCss = buildCssBlock(`${bodyRowClass}:nth-of-type(even)`, {
                backgroundColor: widget.props.stripedColor || 'rgba(15,23,42,0.04)'
              });
              if (stripeCss) widgetStyles.push(stripeCss);
            }

            if (widget.props.hoverable) {
              const hoverCss = buildCssBlock(`${bodyRowClass}:hover`, {
                backgroundColor: widget.props.rowHoverColor || 'rgba(37,99,235,0.08)'
              });
              if (hoverCss) widgetStyles.push(hoverCss);
            }

            const bodyCellClass = registerStyle('table-cell', {
              padding: widget.props.cellPadding || '0.85rem 1rem',
              fontSize: widget.props.cellFontSize || '0.95rem',
              color: widget.props.cellColor || '#1f2937'
            });

            const emptyStateText = widget.props.emptyStateText || 'No data available';

            const handleActionClick = (e: React.MouseEvent) => {
              if (!isPreview) {
                e.preventDefault();
                e.stopPropagation();
              }
            };

            const renderCaption = (position: 'top' | 'bottom') => {
              if (
                widget.props.showCaption === false ||
                !widget.props.caption ||
                widget.props.captionPosition !== position
              ) {
                return null;
              }
              return (
                <div className={captionClass} data-position={position}>
                  <span className={captionDotClass} aria-hidden="true" />
                  <span>{widget.props.caption}</span>
                </div>
              );
            };

            return (
              <div className={tableWrapperClass}>
                {renderCaption('top')}

                {widget.props.showToolbar !== false && (
                  (widget.props.toolbarTitle || widget.props.toolbarDescription || widget.props.toolbarActionText) ? (
                    <div className={toolbarClass}>
                      <div className="space-y-1">
                        {widget.props.toolbarTitle && (
                          <p className={toolbarTitleClass}>{widget.props.toolbarTitle}</p>
                        )}
                        {widget.props.toolbarDescription && (
                          <p className={toolbarSubtitleClass}>{widget.props.toolbarDescription}</p>
                        )}
                      </div>
                      {widget.props.toolbarActionText && toolbarActionClass && (
                        <a
                          href={widget.props.toolbarActionLink || '#'}
                          className={`${toolbarActionClass} focus:outline-none`}
                          onClick={handleActionClick}
                        >
                          {widget.props.toolbarActionText}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ) : null
                )}

                <div className={scrollClass}>
                  <table className={tableClass}>
                    <thead className={tableHeadClass}>
                      <tr className={headerRowClass}>
                        {headers.length > 0 ? (
                          headers.map((header, idx) => (
                            <th
                              key={`header-${idx}`}
                              className={headerCellClass}
                              style={{
                                textAlign: alignments[idx] || 'left',
                                borderRight:
                                  showColumnDividers && idx < headers.length - 1 ? columnDividerStyle : undefined
                              }}
                            >
                              {header || `Column ${idx + 1}`}
                            </th>
                          ))
                        ) : (
                          <th className={headerCellClass}>Add columns to populate the table</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.length > 0 ? (
                        displayRows.map((row, rowIdx) => (
                          <tr key={`row-${rowIdx}`} className={bodyRowClass}>
                            {(headers.length > 0 ? headers : row).map((_, cellIdx) => (
                              <td
                                key={`row-${rowIdx}-cell-${cellIdx}`}
                                className={bodyCellClass}
                                style={{
                                  textAlign: alignments[cellIdx] || 'left',
                                  borderRight:
                                    showColumnDividers && cellIdx < (headers.length || row.length) - 1
                                      ? columnDividerStyle
                                      : undefined
                                }}
                              >
                                {row[cellIdx] ?? ''}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr className={bodyRowClass}>
                          <td className={bodyCellClass} colSpan={Math.max(headers.length, 1)}>
                            {emptyStateText}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {remainingRows > 0 && (
                  <p className="text-xs text-gray-500">
                    Showing {displayRows.length} of {rows.length} rows
                  </p>
                )}

                {renderCaption('bottom')}
              </div>
            );
          })()}
          {widget.type === 'list' && (() => {
            const listClass = registerStyle('list', {
              color: widget.props.color,
              fontSize: widget.props.fontSize,
              lineHeight: widget.props.lineHeight,
              padding: widget.props.padding,
              listStyle: widget.props.listStyle
            });

            return (
              <ul className={listClass}>
                {widget.props.items?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            );
          })()}
          {widget.type === 'progressBar' && (() => {
            const parseNumber = (value: any, fallback: number) => {
              const parsed = Number(value);
              return Number.isFinite(parsed) ? parsed : fallback;
            };

            const minValue = parseNumber(widget.props.min, 0);
            const rawMax = parseNumber(widget.props.max, 100);
            const safeMax = rawMax > minValue ? rawMax : minValue + 1;
            const rawValue = parseNumber(widget.props.value, minValue);
            const clampedValue = Math.min(Math.max(rawValue, minValue), safeMax);
            const range = safeMax - minValue;
            const progressPercent = range === 0 ? 0 : ((clampedValue - minValue) / range) * 100;
            const boundedPercent = Math.max(0, Math.min(progressPercent, 100));
            const goalValue = parseNumber(widget.props.goalValue, safeMax);
            const goalPercentRaw = range === 0 ? 0 : ((goalValue - minValue) / range) * 100;
            const goalPercent = Math.max(0, Math.min(goalPercentRaw, 100));

            const showValue = widget.props.showValue ?? widget.props.showPercentage ?? true;
            const valuePosition = widget.props.valuePosition || 'inline';
            const valueFormat = widget.props.valueFormat || 'percent';
            const decimalsRaw = typeof widget.props.valueDecimalPlaces === 'number'
              ? widget.props.valueDecimalPlaces
              : parseInt(widget.props.valueDecimalPlaces || 0, 10) || 0;
            const decimals = Math.max(0, Math.min(4, decimalsRaw));
            const displayBase = valueFormat === 'value' ? clampedValue : boundedPercent;
            const formattedNumber = Number.isFinite(displayBase)
              ? displayBase.toFixed(decimals)
              : '0';
            const valueSuffix = widget.props.valueSuffix ?? (valueFormat === 'percent' ? '%' : '');
            const valueDisplay = `${widget.props.valuePrefix || ''}${formattedNumber}${valueSuffix}`;

            const labelLayout = widget.props.labelLayout || 'stacked';
            const containerClass = registerStyle('progress-wrapper', {
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            });

            const headerClass = registerStyle('progress-header', {
              display: 'flex',
              flexDirection: labelLayout === 'stacked' ? 'column' : 'row',
              alignItems: labelLayout === 'stacked' ? 'flex-start' : 'center',
              justifyContent: labelLayout === 'between' ? 'space-between' : 'flex-start',
              gap: labelLayout === 'stacked' ? '0.35rem' : '0.75rem'
            });

            const labelClass = registerStyle('progress-label', {
              fontSize: '0.95rem',
              fontWeight: 600,
              color: widget.props.labelColor || '#0f172a'
            });

            const descriptionClass = registerStyle('progress-description', {
              fontSize: '0.85rem',
              color: widget.props.descriptionColor || '#475569'
            });

            const valueInlineClass = registerStyle('progress-value-inline', {
              fontSize: '0.95rem',
              fontWeight: 600,
              color: widget.props.valueColor || '#0f172a'
            });

            const insideValueClass = registerStyle('progress-value-inside', {
              fontSize: '0.8rem',
              fontWeight: 600,
              color: widget.props.valueInsideColor || '#ffffff'
            });

            const belowValueClass = registerStyle('progress-value-below', {
              fontSize: '0.9rem',
              fontWeight: 600,
              color: widget.props.valueColor || '#0f172a'
            });

            const barWrapperClass = registerStyle('progress-bar-wrapper', {
              position: 'relative',
              width: '100%',
              paddingBottom:
                widget.props.showGoal !== false && widget.props.showGoalLabel !== false && widget.props.goalLabel
                  ? '1.5rem'
                  : '0.25rem'
            });

            const trackClass = registerStyle('progress-track', {
              width: '100%',
              backgroundColor: widget.props.trackColor || widget.props.backgroundColor || '#e2e8f0',
              height: widget.props.barHeight || widget.props.height || '1rem',
              borderRadius: widget.props.borderRadius || '999px',
              position: 'relative',
              overflow: 'hidden',
              borderWidth: widget.props.trackBorderWidth || '0px',
              borderStyle: 'solid',
              borderColor: widget.props.trackBorderColor || 'transparent'
            });

            const stripeColor = widget.props.stripeColor || 'rgba(255,255,255,0.35)';
            const stripeSize = widget.props.stripeSize || '1.5rem 1.5rem';
            const useGradient = widget.props.useGradient !== false && Boolean((widget.props.fillGradient || '').trim());
            const fillColor = widget.props.fillColor || '#2563eb';
            const backgroundLayers: string[] = [];
            if (useGradient && widget.props.fillGradient) {
              backgroundLayers.push(widget.props.fillGradient);
            } else {
              backgroundLayers.push(`linear-gradient(90deg, ${fillColor}, ${fillColor})`);
            }
            if (widget.props.striped) {
              backgroundLayers.push(
                `linear-gradient(45deg, ${stripeColor} 25%, transparent 25%, transparent 50%, ${stripeColor} 50%, ${stripeColor} 75%, transparent 75%, transparent)`
              );
            }

            const fillStyles: Record<string, StyleValue> = {
              height: '100%',
              borderRadius: widget.props.borderRadius || '999px',
              backgroundColor: useGradient ? undefined : fillColor,
              backgroundImage: backgroundLayers.join(', '),
              backgroundSize: widget.props.striped ? `100% 100%, ${stripeSize}` : '100% 100%',
              backgroundPosition: widget.props.striped ? '0 0, 0 0' : undefined,
              boxShadow: widget.props.showGlow ? widget.props.fillShadow || '0 12px 30px rgba(37,99,235,0.35)' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: valuePosition === 'inside' ? 'flex-end' : 'flex-start',
              paddingRight: valuePosition === 'inside' ? '0.75rem' : undefined,
              paddingLeft: valuePosition === 'inside' ? '0.75rem' : undefined,
              transition:
                widget.props.animateTransition === false || widget.props.animated === false
                  ? 'none'
                  : 'width 0.4s ease, background-position 1.2s linear'
            };

            if (widget.props.striped && widget.props.animateStripes !== false) {
              const stripeAnimation = `progress-stripes-${widget.id}`;
              widgetStyles.push(
                `@keyframes ${stripeAnimation} { from { background-position: 0 0, 0 0; } to { background-position: 0 0, 60px 0; } }`
              );
              fillStyles.animation = `${stripeAnimation} 1.5s linear infinite`;
            }

            const fillClass = registerStyle('progress-fill', fillStyles);

            const goalMarkerClass = registerStyle('progress-goal-marker', {
              position: 'absolute',
              top: '0',
              bottom: '0',
              width: '2px',
              backgroundColor: widget.props.goalColor || '#0ea5e9',
              borderRadius: '999px',
              pointerEvents: 'none'
            });

            const goalLabelClass = registerStyle('progress-goal-label', {
              position: 'absolute',
              top: 'calc(100% + 0.2rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: '#ffffff',
              color: widget.props.goalLabelColor || widget.props.goalColor || '#0ea5e9',
              boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
              whiteSpace: 'nowrap'
            });

            const minMaxClass = registerStyle('progress-min-max', {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: widget.props.minMaxColor || '#94a3b8',
              fontWeight: 500
            });

            const showInlineValue = showValue && valuePosition === 'inline';
            const showInsideValue = showValue && valuePosition === 'inside';
            const showValueBelowExplicit = showValue && valuePosition === 'below';
            const allowInsideBadge = showInsideValue && boundedPercent > 12;
            const showValueBelow = showValueBelowExplicit || (showInsideValue && !allowInsideBadge);
            const showLabelText = widget.props.showLabel !== false && Boolean(widget.props.label);
            const showDescriptionText = widget.props.showDescription !== false && Boolean(widget.props.description);
            const hasHeaderContent = showLabelText || showDescriptionText || showInlineValue;
            const hasGoalLabel = widget.props.showGoal !== false && widget.props.showGoalLabel !== false && Boolean(widget.props.goalLabel);

            return (
              <div className={containerClass}>
                {hasHeaderContent && (
                  <div className={headerClass}>
                    <div className="space-y-1">
                      {showLabelText && <p className={labelClass}>{widget.props.label}</p>}
                      {showDescriptionText && (
                        <p className={descriptionClass}>{widget.props.description}</p>
                      )}
                    </div>
                    {showInlineValue && <span className={valueInlineClass}>{valueDisplay}</span>}
                  </div>
                )}

                <div className={barWrapperClass}>
                  <div className={trackClass}>
                    <div className={fillClass} style={{ width: `${boundedPercent}%` }}>
                      {allowInsideBadge && <span className={insideValueClass}>{valueDisplay}</span>}
                    </div>
                  </div>
                  {widget.props.showGoal !== false && range > 0 && (
                    <div className={goalMarkerClass} style={{ left: `${goalPercent}%` }}>
                      {hasGoalLabel && <span className={goalLabelClass}>{widget.props.goalLabel}</span>}
                    </div>
                  )}
                </div>

                {showValueBelow && <span className={belowValueClass}>{valueDisplay}</span>}

                {widget.props.showMinMaxLabels !== false && (
                  <div className={minMaxClass}>
                    <span>{widget.props.minLabel || `${minValue}`}</span>
                    <span>{widget.props.maxLabel || `${safeMax}`}</span>
                  </div>
                )}
              </div>
            );
          })()}
          {widget.type === 'stats' && (() => {
            const iconRegistry = LucideIcons as Record<string, LucideIcon>;
            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();
            const layoutVariant = widget.props.layout === 'horizontal' ? 'horizontal' : 'vertical';
            const alignment = widget.props.alignment || 'left';
            const alignItemsMap: Record<string, StyleValue> = {
              left: 'flex-start',
              center: 'center',
              right: 'flex-end'
            };
            const alignItems = alignItemsMap[alignment] || 'flex-start';
            const textAlign = alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';
            const gapValue = widget.props.gap || (layoutVariant === 'horizontal' ? '1.5rem' : '1rem');
            const rawValue = widget.props.value;
            const resolvedValue = rawValue === null || rawValue === undefined
              ? ''
              : typeof rawValue === 'number'
                ? rawValue.toLocaleString()
                : rawValue;
            const valueDisplayString = `${widget.props.valuePrefix || ''}${resolvedValue || ''}${widget.props.valueSuffix || ''}`;
            const valueDisplay = valueDisplayString.length > 0 ? valueDisplayString : '0';

            const changeValueString = `${widget.props.changePrefix || ''}${widget.props.change || ''}${widget.props.changeSuffix || ''}`;
            const hasChangeValue = changeValueString.trim().length > 0;
            const showChange = widget.props.showChange !== false && (hasChangeValue || Boolean(widget.props.changeLabel));
            const showIcon = widget.props.showIcon !== false && Boolean(widget.props.iconUpload || widget.props.uploadedIcon || widget.props.iconName || widget.props.icon);
            const showBadge = widget.props.showBadge ?? Boolean(widget.props.badgeText);
            const showDescription = widget.props.showDescription !== false && Boolean(widget.props.description);
            const showDivider = widget.props.showDivider === true;
            const showAccent = widget.props.showAccent === true;
            const badgeText = widget.props.badgeText || 'Live';
            const badgeStyle = widget.props.badgeStyle || 'pill';
            const changeBadgeStyle = widget.props.changeBadgeStyle || 'pill';
            const changeIconStyle = widget.props.changeIconStyle || 'arrow';
            const changeType = (widget.props.changeType || 'positive') as 'positive' | 'negative' | 'neutral' | 'custom';

            const changeColors = (() => {
              switch (changeType) {
                case 'negative':
                  return {
                    text: widget.props.changeNegativeColor || '#b91c1c',
                    bg: widget.props.changeNegativeBackground || 'rgba(239,68,68,0.15)'
                  };
                case 'neutral':
                  return {
                    text: widget.props.changeNeutralColor || '#475569',
                    bg: widget.props.changeNeutralBackground || 'rgba(71,85,105,0.12)'
                  };
                case 'custom':
                  return {
                    text: widget.props.changeCustomColor || '#0f172a',
                    bg: widget.props.changeCustomBackground || 'rgba(15,23,42,0.08)'
                  };
                case 'positive':
                default:
                  return {
                    text: widget.props.changePositiveColor || '#15803d',
                    bg: widget.props.changePositiveBackground || 'rgba(34,197,94,0.15)'
                  };
              }
            })();

            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if (iconRegistry[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return iconRegistry[formatted] ? formatted : undefined;
            };

            const resolvedIconName = normalizeIconName(widget.props.iconName || widget.props.icon) || 'TrendingUp';
            const IconComponent = iconRegistry[resolvedIconName] || TrendingUp;
            const iconUpload = widget.props.iconUpload || widget.props.uploadedIcon;
            const iconSize = widget.props.iconSize || '2rem';
            const iconPlacement = widget.props.iconPosition === 'top' ? 'top' : 'left';

            const containerClass = registerStyle('stats-card', {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: gapValue,
              padding: widget.props.padding || '1.5rem',
              borderRadius: widget.props.borderRadius || '1rem',
              borderWidth: widget.props.borderWidth || '1px',
              borderStyle: widget.props.borderStyle || 'solid',
              borderColor: widget.props.borderColor || 'rgba(15,23,42,0.08)',
              boxShadow: widget.props.boxShadow || '0 20px 40px rgba(15,23,42,0.08)',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || '#ffffff',
              backgroundImage: backgroundGradient || undefined,
              overflow: 'hidden'
            });

            const headerClass = registerStyle('stats-header', {
              display: 'flex',
              flexDirection: layoutVariant === 'horizontal' ? 'row' : 'column',
              alignItems: layoutVariant === 'horizontal' ? 'center' : alignItems,
              justifyContent: layoutVariant === 'horizontal' ? 'space-between' : 'flex-start',
              width: '100%',
              gap: layoutVariant === 'horizontal' ? gapValue : '0.75rem'
            });

            const metaStackClass = registerStyle('stats-meta', {
              display: 'flex',
              flexDirection: iconPlacement === 'top' ? 'column' : 'row',
              alignItems: iconPlacement === 'top' ? alignItems : 'center',
              gap: showIcon ? (iconPlacement === 'top' ? '0.75rem' : '0.85rem') : '0.35rem',
              width: '100%'
            });

            const textStackClass = registerStyle('stats-text-stack', {
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              width: '100%',
              textAlign,
              alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'
            });

            const badgeClass = showBadge
              ? registerStyle('stats-badge', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: badgeStyle === 'underline' ? 'uppercase' : undefined,
                  letterSpacing: badgeStyle === 'underline' ? '0.08em' : undefined,
                  color: widget.props.badgeColor || '#1d4ed8',
                  backgroundColor: badgeStyle === 'underline' ? 'transparent' : widget.props.badgeBackground || 'rgba(59,130,246,0.12)',
                  padding:
                    badgeStyle === 'pill'
                      ? '0.25rem 0.65rem'
                      : badgeStyle === 'soft'
                        ? '0.2rem 0.4rem'
                        : '0',
                  borderRadius:
                    badgeStyle === 'pill'
                      ? '999px'
                      : badgeStyle === 'soft'
                        ? '0.35rem'
                        : '0',
                  textDecoration: badgeStyle === 'underline' ? 'underline' : undefined,
                  textUnderlineOffset: badgeStyle === 'underline' ? '0.2rem' : undefined
                })
              : '';

            const labelClass = widget.props.label
              ? registerStyle('stats-label', {
                  fontSize: widget.props.labelFontSize || '1rem',
                  fontWeight: widget.props.labelFontWeight || 600,
                  color: widget.props.labelColor || '#475569',
                  margin: 0,
                  textTransform: widget.props.labelUppercase ? 'uppercase' : undefined,
                  letterSpacing: widget.props.labelUppercase ? '0.08em' : undefined
                })
              : '';

            const descriptionClass = showDescription
              ? registerStyle('stats-description', {
                  fontSize: '0.9rem',
                  color: widget.props.descriptionColor || '#94a3b8',
                  margin: 0,
                  lineHeight: 1.5,
                  textAlign,
                  whiteSpace: 'pre-wrap'
                })
              : '';

            const iconWrapperClass = showIcon
              ? registerStyle('stats-icon-wrapper', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: widget.props.iconPadding || '0.65rem',
                  borderRadius: widget.props.iconBorderRadius || '0.85rem',
                  backgroundColor: widget.props.iconBackground || 'rgba(37,99,235,0.12)',
                  color: widget.props.iconColor || '#2563eb',
                  borderWidth: widget.props.iconBorderWidth || '0px',
                  borderStyle: widget.props.iconBorderStyle || 'solid',
                  borderColor: widget.props.iconBorderColor || 'transparent',
                  boxShadow: widget.props.iconShadow || 'none',
                  flexShrink: 0
                })
              : '';

            const valueClass = registerStyle('stats-value', {
              fontSize: widget.props.valueFontSize || '2.5rem',
              fontWeight: widget.props.valueFontWeight || '700',
              color: widget.props.valueColor || '#0f172a',
              letterSpacing: widget.props.valueLetterSpacing || '-0.02em',
              lineHeight: widget.props.valueLineHeight || '1.1',
              margin: 0,
              textAlign,
              whiteSpace: 'nowrap'
            });

            const valueStackClass = registerStyle('stats-value-stack', {
              display: 'flex',
              flexDirection: 'column',
              gap: showChange ? '0.35rem' : '0',
              alignItems: layoutVariant === 'horizontal' ? 'flex-end' : alignItems,
              textAlign
            });

            const changeWrapperClass = showChange
              ? registerStyle('stats-change', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: changeBadgeStyle === 'inline' ? 'flex-start' : 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: changeColors.text,
                  backgroundColor: changeBadgeStyle === 'inline' ? 'transparent' : changeColors.bg,
                  padding:
                    changeBadgeStyle === 'pill'
                      ? '0.25rem 0.7rem'
                      : changeBadgeStyle === 'soft'
                        ? '0.15rem 0.5rem'
                        : '0',
                  borderRadius:
                    changeBadgeStyle === 'pill'
                      ? '999px'
                      : changeBadgeStyle === 'soft'
                        ? '0.5rem'
                        : '0',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap'
                })
              : '';

            const changeStackClass = showChange
              ? registerStyle('stats-change-stack', {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: widget.props.changeLabel ? '0.2rem' : '0',
                  alignItems: layoutVariant === 'horizontal' ? 'flex-end' : alignItems,
                  textAlign
                })
              : '';

            const changeDotClass = showChange && changeIconStyle === 'dot'
              ? registerStyle('stats-change-dot', {
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '999px',
                  backgroundColor: changeColors.text,
                  flexShrink: 0
                })
              : '';

            const changeLabelClass = widget.props.changeLabel
              ? registerStyle('stats-change-label', {
                  fontSize: '0.75rem',
                  color: widget.props.changeLabelColor || '#94a3b8',
                  textAlign,
                  fontWeight: 500
                })
              : '';

            const dividerClass = showDivider
              ? registerStyle('stats-divider', {
                  width: '100%',
                  height: widget.props.dividerThickness || '1px',
                  backgroundColor: widget.props.dividerColor || 'rgba(15,23,42,0.12)',
                  opacity: 0.6
                })
              : '';

            const accentPosition = widget.props.accentPosition || 'top';
            const accentSize = widget.props.accentSize || '48px';
            const accentThickness = widget.props.accentThickness || '4px';
            const accentInset = widget.props.accentInset || '1rem';
            const accentStyles: Record<string, StyleValue> = (() => {
              switch (accentPosition) {
                case 'bottom':
                  return { bottom: accentInset, left: '50%', transform: 'translateX(-50%)', width: accentSize, height: accentThickness };
                case 'left':
                  return { left: accentInset, top: '50%', transform: 'translateY(-50%)', width: accentThickness, height: accentSize };
                case 'right':
                  return { right: accentInset, top: '50%', transform: 'translateY(-50%)', width: accentThickness, height: accentSize };
                case 'top':
                default:
                  return { top: accentInset, left: '50%', transform: 'translateX(-50%)', width: accentSize, height: accentThickness };
              }
            })();

            const accentClass = showAccent
              ? registerStyle('stats-accent', {
                  position: 'absolute',
                  backgroundColor: widget.props.accentColor || '#2563eb',
                  borderRadius: '999px',
                  ...accentStyles
                })
              : '';

            let changeIconElement: React.ReactNode = null;
            if (showChange) {
              if (changeIconStyle === 'dot') {
                changeIconElement = <span className={changeDotClass} />;
              } else if (changeIconStyle === 'arrow') {
                const ArrowIcon = changeType === 'negative' ? ArrowDownRight : changeType === 'neutral' ? Minus : ArrowUpRight;
                changeIconElement = <ArrowIcon className="h-4 w-4" strokeWidth={2.5} />;
              } else if (changeIconStyle === 'trend') {
                const TrendIcon = changeType === 'negative' ? TrendingDown : changeType === 'neutral' ? Minus : TrendingUp;
                changeIconElement = <TrendIcon className="h-4 w-4" strokeWidth={2} />;
              }
            }

            const renderChange = () => {
              if (!showChange) return null;
              return (
                <div className={changeStackClass}>
                  <div className={changeWrapperClass}>
                    {changeIconElement}
                    {hasChangeValue && <span>{changeValueString}</span>}
                  </div>
                  {widget.props.changeLabel && <span className={changeLabelClass}>{widget.props.changeLabel}</span>}
                </div>
              );
            };

            return (
              <div className={containerClass}>
                {showAccent && <span className={accentClass} />}
                <div className={headerClass}>
                  <div className={metaStackClass}>
                    {showIcon && (
                      <div className={iconWrapperClass}>
                        {iconUpload ? (
                          <img
                            src={iconUpload}
                            alt="Statistic icon"
                            className="h-auto w-auto"
                            style={{ width: iconSize, height: iconSize }}
                          />
                        ) : (
                          <IconComponent style={{ width: iconSize, height: iconSize, color: widget.props.iconColor || '#2563eb' }} />
                        )}
                      </div>
                    )}
                    <div className={textStackClass}>
                      {showBadge && <span className={badgeClass}>{badgeText}</span>}
                      {widget.props.label && <p className={labelClass}>{widget.props.label}</p>}
                      {showDescription && <p className={descriptionClass}>{widget.props.description}</p>}
                    </div>
                  </div>
                  {layoutVariant === 'horizontal' && (
                    <div className={valueStackClass}>
                      <p className={valueClass}>{valueDisplay}</p>
                      {renderChange()}
                    </div>
                  )}
                </div>
                {layoutVariant === 'vertical' && showDivider && <div className={dividerClass} />}
                {layoutVariant === 'vertical' && (
                  <div className={valueStackClass}>
                    <p className={valueClass}>{valueDisplay}</p>
                    {renderChange()}
                  </div>
                )}
                {layoutVariant === 'horizontal' && showDivider && <div className={dividerClass} />}
              </div>
            );
          })()}
          
          {/* Forms & Inputs widgets */}
          {widget.type === 'searchBar' && (() => {
            const iconRegistry = LucideIcons as Record<string, LucideIcon>;
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if (iconRegistry[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return iconRegistry[formatted] ? formatted : undefined;
            };

            const layout = widget.props.layout === 'stacked' ? 'stacked' : 'inline';
            const alignment = widget.props.alignment || 'left';
            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();
            const inputGradient = (widget.props.inputBackgroundGradient || '').toString().trim();
            const showLabel = widget.props.showLabel && Boolean(widget.props.label);
            const showHelperText = widget.props.showHelperText && Boolean(widget.props.helperText);
            const showIcon = widget.props.showIcon !== false;
            const showButton = widget.props.showButton !== false;
            const showVoiceButton = widget.props.showVoiceButton === true;
            const showAdvancedButton = widget.props.showAdvancedButton === true;
            const quickFilters: string[] = Array.isArray(widget.props.quickFilters)
              ? widget.props.quickFilters
              : typeof widget.props.quickFilters === 'string'
                ? widget.props.quickFilters.split(',').map((item: string) => item.trim()).filter(Boolean)
                : [];
            const showFilters = widget.props.showFilters && quickFilters.length > 0;
            const textAlign = alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';

            const containerStyles: Record<string, StyleValue> = {
              width: widget.props.fullWidth === false ? 'auto' : '100%',
              maxWidth: widget.props.maxWidth || '640px',
              display: 'flex',
              flexDirection: 'column',
              gap: showFilters ? '1rem' : '0.75rem',
              padding: widget.props.padding || '0',
              borderRadius: widget.props.borderRadius || '999px',
              borderWidth: widget.props.borderWidth || '0px',
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'transparent',
              boxShadow: widget.props.boxShadow || 'none',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || 'transparent',
              backgroundImage: backgroundGradient || undefined
            };
            if (alignment === 'center') {
              containerStyles.marginLeft = 'auto';
              containerStyles.marginRight = 'auto';
            } else if (alignment === 'right') {
              containerStyles.marginLeft = 'auto';
            }

            const containerClass = registerStyle('search-container', containerStyles);
            const headerClass = (showLabel || showHelperText)
              ? registerStyle('search-header', {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  textAlign
                })
              : '';

            const labelClass = showLabel
              ? registerStyle('search-label', {
                  fontSize: widget.props.labelSize || '0.9rem',
                  fontWeight: 600,
                  color: widget.props.labelColor || '#0f172a',
                  textTransform: widget.props.labelUppercase ? 'uppercase' : undefined,
                  letterSpacing: widget.props.labelUppercase ? '0.08em' : undefined
                })
              : '';

            const helperClass = showHelperText
              ? registerStyle('search-helper', {
                  fontSize: '0.85rem',
                  color: widget.props.helperColor || '#94a3b8'
                })
              : '';

            const barClass = registerStyle('search-bar', {
              display: 'flex',
              flexDirection: layout === 'stacked' ? 'column' : 'row',
              gap: widget.props.gap || '0.75rem',
              alignItems: layout === 'stacked' ? 'stretch' : 'center',
              width: '100%'
            });

            const inputWrapperClass = registerStyle('search-input-wrapper', {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: layout === 'inline' && widget.props.fullWidth !== false ? 1 : undefined,
              width: '100%',
              backgroundColor: inputGradient ? undefined : widget.props.inputBackground || '#ffffff',
              backgroundImage: inputGradient || undefined,
              borderRadius: widget.props.inputBorderRadius || '999px',
              borderWidth: widget.props.inputBorderWidth || '1px',
              borderStyle: widget.props.inputBorderStyle || 'solid',
              borderColor: widget.props.inputBorderColor || '#e2e8f0',
              boxShadow: widget.props.inputShadow || 'none',
              paddingLeft: showIcon && widget.props.iconPosition !== 'right' ? '0.75rem' : '1rem',
              paddingRight: showIcon && widget.props.iconPosition === 'right' ? '0.75rem' : '1rem',
              minHeight: widget.props.inputHeight || '52px'
            });

            const inputClass = registerStyle('search-input', {
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: widget.props.inputTextColor || '#0f172a',
              fontSize: widget.props.inputFontSize || '1rem',
              padding: widget.props.inputPadding || '0.75rem 0',
              outline: 'none',
              width: '100%'
            });

            const focusCss = buildCssBlock(`.${inputClass}:focus`, {
              outline: 'none',
              boxShadow: widget.props.focusRingColor ? `0 0 0 2px ${widget.props.focusRingColor}` : 'none'
            });
            const placeholderCss = buildCssBlock(`.${inputClass}::placeholder`, {
              color: widget.props.inputPlaceholderColor || '#94a3b8'
            });
            if (focusCss) widgetStyles.push(focusCss);
            if (placeholderCss) widgetStyles.push(placeholderCss);

            const iconClass = showIcon
              ? registerStyle('search-icon', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: widget.props.iconColor || '#2563eb',
                  backgroundColor: widget.props.iconBackground || 'transparent',
                  borderRadius: '999px'
                })
              : '';

            const actionsClass = (showButton || showAdvancedButton)
              ? registerStyle('search-actions', {
                  display: 'flex',
                  flexDirection: layout === 'stacked' ? 'column' : 'row',
                  gap: '0.5rem',
                  alignItems: layout === 'stacked' ? 'stretch' : 'center',
                  width: layout === 'stacked' ? '100%' : 'auto'
                })
              : '';

            const buttonClass = showButton
              ? registerStyle('search-button', {
                  backgroundColor: widget.props.buttonBackground || '#2563eb',
                  color: widget.props.buttonTextColor || '#ffffff',
                  borderRadius: widget.props.buttonRadius || '999px',
                  borderWidth: widget.props.buttonBorderWidth || '0px',
                  borderStyle: widget.props.buttonBorderStyle || 'solid',
                  borderColor: widget.props.buttonBorderColor || 'transparent',
                  padding: widget.props.buttonPadding || '0.75rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: widget.props.buttonIconName ? '0.5rem' : '0.35rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                })
              : '';
            const buttonHoverCss = showButton
              ? buildCssBlock(`.${buttonClass}:hover`, {
                  backgroundColor: widget.props.buttonHoverBackground || widget.props.buttonBackground || '#2563eb',
                  color: widget.props.buttonHoverTextColor || widget.props.buttonTextColor || '#ffffff'
                })
              : '';
            if (buttonHoverCss) widgetStyles.push(buttonHoverCss);

            const voiceButtonClass = showVoiceButton
              ? registerStyle('search-voice-button', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '999px',
                  color: widget.props.voiceButtonColor || '#475569',
                  backgroundColor: widget.props.voiceButtonBackground || 'rgba(148,163,184,0.15)',
                  border: 'none',
                  flexShrink: 0
                })
              : '';

            const advancedButtonClass = showAdvancedButton
              ? registerStyle('search-advanced-button', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: layout === 'stacked' ? '0.75rem 1rem' : '0.5rem 0.75rem',
                  borderRadius: widget.props.buttonRadius || '999px',
                  borderWidth: widget.props.advancedButtonVariant === 'outline' ? '1px' : '0px',
                  borderStyle: 'solid',
                  borderColor: widget.props.advancedButtonVariant === 'outline'
                    ? widget.props.advancedButtonTextColor || '#2563eb'
                    : 'transparent',
                  color: widget.props.advancedButtonTextColor || '#2563eb',
                  backgroundColor:
                    widget.props.advancedButtonVariant === 'ghost'
                      ? 'rgba(37,99,235,0.08)'
                      : 'transparent',
                  textDecoration: widget.props.advancedButtonVariant === 'link' ? 'underline' : 'none',
                  fontWeight: 600,
                  gap: '0.35rem'
                })
              : '';
            const advancedHoverCss = showAdvancedButton
              ? buildCssBlock(`.${advancedButtonClass}:hover`, {
                  color: widget.props.advancedButtonHoverColor || widget.props.advancedButtonTextColor || '#1d4ed8'
                })
              : '';
            if (advancedHoverCss) widgetStyles.push(advancedHoverCss);

            const filtersWrapperClass = showFilters
              ? registerStyle('search-filters', {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: widget.props.filterGap || '0.5rem'
                })
              : '';
            const filtersLabelClass = showFilters && widget.props.filtersLabel
              ? registerStyle('search-filters-label', {
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: widget.props.helperColor || '#94a3b8'
                })
              : '';
            const filterBadgeClass = showFilters
              ? registerStyle('search-filter', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding:
                    widget.props.filterStyle === 'link'
                      ? '0'
                      : widget.props.filterStyle === 'chip'
                        ? '0.2rem 0.75rem'
                        : '0.25rem 0.9rem',
                  borderRadius:
                    widget.props.filterStyle === 'pill'
                      ? '999px'
                      : widget.props.filterStyle === 'chip'
                        ? '0.75rem'
                        : '0',
                  borderWidth: widget.props.filterStyle === 'link' ? '0px' : '1px',
                  borderStyle: 'solid',
                  borderColor: widget.props.filterBorderColor || 'transparent',
                  backgroundColor: widget.props.filterStyle === 'link'
                    ? 'transparent'
                    : widget.props.filterBackground || 'rgba(37,99,235,0.08)',
                  color: widget.props.filterTextColor || '#2563eb',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: widget.props.filterStyle === 'link' ? 'underline' : 'none'
                })
              : '';
            const filterHoverCss = showFilters
              ? buildCssBlock(`.${filterBadgeClass}:hover`, {
                  backgroundColor: widget.props.filterStyle === 'link' ? 'transparent' : widget.props.filterHoverBackground || 'rgba(37,99,235,0.15)'
                })
              : '';
            if (filterHoverCss) widgetStyles.push(filterHoverCss);

            const iconName = normalizeIconName(widget.props.iconName || widget.props.icon);
            const IconComponent = iconName ? iconRegistry[iconName] : Search;
            const iconUpload = widget.props.iconUpload;
            const buttonIconName = normalizeIconName(widget.props.buttonIconName);
            const ButtonIconComponent = buttonIconName ? iconRegistry[buttonIconName] : undefined;
            const buttonIconUpload = widget.props.buttonIconUpload;

            const renderInputIcon = () => {
              if (!showIcon) return null;
              if (iconUpload) {
                return <img src={iconUpload} alt="Search icon" style={{ width: widget.props.iconSize || '1rem', height: widget.props.iconSize || '1rem' }} className={iconClass} />;
              }
              const Icon = IconComponent || Search;
              return <Icon className={iconClass} style={{ width: widget.props.iconSize || '1rem', height: widget.props.iconSize || '1rem' }} />;
            };

            const renderButtonIcon = () => {
              if (!widget.props.buttonIconName && !buttonIconUpload) return null;
              if (buttonIconUpload) {
                return <img src={buttonIconUpload} alt="Button icon" style={{ width: '1rem', height: '1rem' }} />;
              }
              if (ButtonIconComponent) {
                return <ButtonIconComponent className="h-4 w-4" />;
              }
              return null;
            };

            return (
              <div className={containerClass}>
                {(showLabel || showHelperText) && (
                  <div className={headerClass}>
                    {showLabel && <span className={labelClass}>{widget.props.label}</span>}
                    {showHelperText && <span className={helperClass}>{widget.props.helperText}</span>}
                  </div>
                )}
                <div className={barClass}>
                  <div className={inputWrapperClass}>
                    {showIcon && widget.props.iconPosition !== 'right' && renderInputIcon()}
                    <input
                      className={inputClass}
                      type="text"
                      placeholder={widget.props.placeholder || 'Search...'}
                      readOnly
                    />
                    {showIcon && widget.props.iconPosition === 'right' && renderInputIcon()}
                    {showVoiceButton && (
                      <button type="button" className={voiceButtonClass} title={widget.props.voiceButtonTooltip || 'Voice search'} aria-label="Voice search">
                        <Mic className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {(showButton || showAdvancedButton) && (
                    <div className={actionsClass}>
                      {showButton && (
                        <button type="button" className={buttonClass}>
                          {widget.props.buttonIconPosition === 'left' && renderButtonIcon()}
                          {widget.props.buttonText || 'Search'}
                          {widget.props.buttonIconPosition !== 'left' && renderButtonIcon()}
                        </button>
                      )}
                      {showAdvancedButton && (
                        <button type="button" className={advancedButtonClass}>
                          <Settings className="h-4 w-4" />
                          {widget.props.advancedButtonLabel || 'Advanced'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {showFilters && (
                  <div className="space-y-2">
                    {widget.props.filtersLabel && <span className={filtersLabelClass}>{widget.props.filtersLabel}</span>}
                    <div className={filtersWrapperClass}>
                      {quickFilters.map((filter, idx) => (
                        <span key={`${widget.id}-filter-${idx}`} className={filterBadgeClass}>
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          {widget.type === 'newsletter' && (() => {
            const iconRegistry = LucideIcons as Record<string, LucideIcon>;
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if (iconRegistry[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return iconRegistry[formatted] ? formatted : undefined;
            };

            const layout = widget.props.layout === 'split' ? 'split' : 'centered';
            const alignment = widget.props.alignment === 'left' ? 'left' : 'center';
            const showBadge = widget.props.showBadge !== false && Boolean(widget.props.badgeText);
            const showEyebrow = widget.props.showEyebrow !== false && Boolean(widget.props.eyebrow);
            const showSecondaryButton = widget.props.showSecondaryButton === true && Boolean(widget.props.secondaryButtonText);
            const showStats = widget.props.showStats !== false && Boolean(widget.props.statsValue);
            const showLogos = widget.props.showLogos === true;
            const showImage = widget.props.showImage !== false;
            const showSuccessMessage = Boolean(widget.props.successMessage);
            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();
            const inputGradient = (widget.props.inputBackgroundGradient || '').toString().trim();

            const bulletPoints: string[] = Array.isArray(widget.props.bulletPoints)
              ? widget.props.bulletPoints
              : typeof widget.props.bulletPoints === 'string'
                ? widget.props.bulletPoints.split(/[\r\n]+/).map((item: string) => item.trim()).filter(Boolean)
                : [];
            const logos: string[] = Array.isArray(widget.props.logos)
              ? widget.props.logos
              : typeof widget.props.logos === 'string'
                ? widget.props.logos.split(/[\r\n]+/).map((item: string) => item.trim()).filter(Boolean)
                : [];

            const bulletIconName = normalizeIconName(widget.props.bulletIconName || 'Check');
            const bulletIconUpload = widget.props.bulletIconUpload;
            const BulletIconComponent = bulletIconName && iconRegistry[bulletIconName] ? iconRegistry[bulletIconName] : Check;
            const buttonIconName = normalizeIconName(widget.props.buttonIconName || undefined);
            const buttonIconUpload = widget.props.buttonIconUpload;
            const ButtonIconComponent = buttonIconName ? iconRegistry[buttonIconName] : undefined;

            const textAlign = alignment === 'left' ? 'left' : 'center';
            const alignItems = textAlign === 'left' ? 'flex-start' : 'center';
            const maxWidth = widget.props.maxWidth || '720px';

            const containerClass = registerStyle('newsletter-container', {
              width: '100%',
              maxWidth,
              marginLeft: alignment === 'left' ? 0 : 'auto',
              marginRight: 'auto',
              display: 'flex',
              flexDirection: layout === 'split' ? 'row' : 'column',
              flexWrap: layout === 'split' ? 'wrap' : 'nowrap',
              alignItems: layout === 'split' ? 'center' : alignItems,
              gap: layout === 'split' ? '2.5rem' : widget.props.gap || '1.5rem',
              padding: widget.props.padding || '3rem',
              borderRadius: widget.props.borderRadius || '1.25rem',
              borderWidth: widget.props.borderWidth || '1px',
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'rgba(15,23,42,0.08)',
              boxShadow: widget.props.boxShadow || '0 30px 60px rgba(15,23,42,0.08)',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || '#ffffff',
              backgroundImage: backgroundGradient || undefined,
              overflow: 'hidden',
              boxSizing: 'border-box'
            });

            const contentClass = registerStyle('newsletter-content', {
              flex: layout === 'split' ? '1 1 360px' : '1 1 100%',
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.textGap || widget.props.gap || '1.25rem',
              textAlign,
              alignItems,
              width: '100%',
              minWidth: 0
            });

            const badgeClass = showBadge
              ? registerStyle('newsletter-badge', {
                  alignSelf: textAlign === 'left' ? 'flex-start' : 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  color: widget.props.badgeColor || '#2563eb',
                  backgroundColor: widget.props.badgeBackground || 'rgba(59,130,246,0.12)'
                })
              : '';

            const eyebrowClass = showEyebrow
              ? registerStyle('newsletter-eyebrow', {
                  color: widget.props.eyebrowColor || '#2563eb',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                })
              : '';

            const titleClass = registerStyle('newsletter-title', {
              fontSize: widget.props.titleFontSize || '2.5rem',
              fontWeight: widget.props.titleFontWeight || '700',
              color: widget.props.titleColor || '#0f172a',
              margin: 0,
              lineHeight: 1.1
            });

            const descriptionClass = widget.props.description
              ? registerStyle('newsletter-description', {
                  color: widget.props.descriptionColor || '#475569',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  margin: 0,
                  marginBottom: widget.props.descriptionSpacing || '1.25rem'
                })
              : '';

            const bulletListClass = bulletPoints.length
              ? registerStyle('newsletter-bullets', {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  width: '100%'
                })
              : '';
            const bulletItemClass = registerStyle('newsletter-bullet-item', {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: textAlign === 'center' ? 'center' : 'flex-start'
            });
            const bulletIconClass = registerStyle('newsletter-bullet-icon', {
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '999px',
              backgroundColor: (widget.props.bulletIconColor || '#16a34a') + '1a',
              color: widget.props.bulletIconColor || '#16a34a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            });
            const bulletTextClass = registerStyle('newsletter-bullet-text', {
              color: widget.props.bulletTextColor || '#0f172a',
              fontSize: '0.95rem',
              fontWeight: 500
            });

            const formClass = registerStyle('newsletter-form', {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            });
            const inputLabelClass = widget.props.inputLabel
              ? registerStyle('newsletter-input-label', {
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: widget.props.inputLabelColor || '#0f172a',
                  textAlign
                })
              : '';
            const inputWrapperClass = registerStyle('newsletter-input-wrapper', {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: inputGradient ? undefined : widget.props.inputBackground || '#ffffff',
              backgroundImage: inputGradient || undefined,
              borderRadius: widget.props.inputBorderRadius || '999px',
              borderWidth: widget.props.inputBorderWidth || '1px',
              borderStyle: 'solid',
              borderColor: widget.props.inputBorderColor || 'rgba(148,163,184,0.6)',
              boxShadow: widget.props.inputShadow || '0 10px 30px rgba(15,23,42,0.12)',
              padding: '0.35rem 0.35rem'
            });
            const inputClass = registerStyle('newsletter-input', {
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: widget.props.inputTextColor || '#0f172a',
              fontSize: '1rem',
              padding: '0.75rem 1rem',
              outline: 'none'
            });
            const helperClass = widget.props.inputHelperText
              ? registerStyle('newsletter-input-helper', {
                  fontSize: '0.8rem',
                  color: widget.props.helperColor || '#94a3b8',
                  textAlign
                })
              : '';

            const placeholderCss = buildCssBlock(`.${inputClass}::placeholder`, {
              color: widget.props.inputPlaceholderColor || '#94a3b8'
            });
            if (placeholderCss) widgetStyles.push(placeholderCss);

            const buttonVariant = widget.props.buttonVariant || 'solid';
            const resolvedButtonBackground = buttonVariant === 'solid' ? (widget.props.buttonBackground || '#2563eb') : 'transparent';
            const resolvedButtonColor = widget.props.buttonTextColor || (buttonVariant === 'solid' ? '#ffffff' : widget.props.buttonBackground || '#2563eb');
            const resolvedButtonBorderWidth = widget.props.buttonBorderWidth || (buttonVariant === 'outline' ? '1px' : '0px');
            const resolvedButtonBorderColor = widget.props.buttonBorderColor || (buttonVariant === 'outline' ? widget.props.buttonBackground || '#2563eb' : 'transparent');

            const buttonClass = registerStyle('newsletter-button', {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: widget.props.buttonIconName ? '0.4rem' : '0.25rem',
              padding: widget.props.buttonPadding || '0.85rem 1.75rem',
              borderRadius: widget.props.buttonRadius || '999px',
              backgroundColor: resolvedButtonBackground,
              color: resolvedButtonColor,
              borderWidth: resolvedButtonBorderWidth,
              borderStyle: widget.props.buttonBorderStyle || 'solid',
              borderColor: resolvedButtonBorderColor,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            });
            const buttonHoverCss = buildCssBlock(`.${buttonClass}:hover`, {
              backgroundColor: widget.props.buttonHoverBackground || resolvedButtonBackground,
              color: widget.props.buttonHoverTextColor || resolvedButtonColor
            });
            if (buttonHoverCss) widgetStyles.push(buttonHoverCss);

            const secondaryVariant = widget.props.secondaryButtonVariant || 'link';
            const secondaryButtonClass = showSecondaryButton
              ? registerStyle('newsletter-secondary-button', {
                  alignSelf: textAlign === 'center' ? 'center' : 'flex-start',
                  background: 'transparent',
                  border: secondaryVariant === 'outline' ? '1px solid currentColor' : 'none',
                  color: widget.props.secondaryButtonColor || '#64748b',
                  textDecoration: secondaryVariant === 'link' ? 'underline' : 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                })
              : '';
            const secondaryHoverCss = showSecondaryButton
              ? buildCssBlock(`.${secondaryButtonClass}:hover`, {
                  color: widget.props.secondaryButtonHoverColor || widget.props.secondaryButtonColor || '#0f172a'
                })
              : '';
            if (secondaryHoverCss) widgetStyles.push(secondaryHoverCss);

            const consentClass = widget.props.consentText
              ? registerStyle('newsletter-consent', {
                  fontSize: '0.8rem',
                  color: widget.props.consentTextColor || '#94a3b8',
                  textAlign,
                  lineHeight: 1.6
                })
              : '';

            const successClass = showSuccessMessage
              ? registerStyle('newsletter-success', {
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: widget.props.successMessageColor || '#15803d',
                  textAlign
                })
              : '';

            const statsClass = showStats
              ? registerStyle('newsletter-stats', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  alignSelf: textAlign === 'center' ? 'center' : 'flex-start'
                })
              : '';
            const statsValueClass = registerStyle('newsletter-stats-value', {
              fontSize: '1.5rem',
              fontWeight: 700,
              color: widget.props.statsAccentColor || '#22c55e'
            });
            const statsLabelClass = registerStyle('newsletter-stats-label', {
              fontSize: '0.85rem',
              color: widget.props.descriptionColor || '#475569'
            });

            const logosWrapperClass = showLogos
              ? registerStyle('newsletter-logos', {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  justifyContent: textAlign === 'center' ? 'center' : 'flex-start'
                })
              : '';
            const logoClass = registerStyle('newsletter-logo', {
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: widget.props.logoTextColor || '#64748b',
              padding: '0.3rem 0.6rem',
              border: '1px solid rgba(148,163,184,0.3)',
              borderRadius: '999px'
            });

            const imageWrapperClass = showImage
              ? registerStyle('newsletter-image-wrapper', {
                  flex: layout === 'split' ? '1 1 280px' : '1 1 100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: layout === 'split' ? '0' : '1rem',
                  backgroundColor: widget.props.imageBackground || '#eef2ff',
                  borderRadius: widget.props.imageBorderRadius || '1rem',
                  minHeight: layout === 'split' ? widget.props.imageHeight || '280px' : '220px',
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden'
                })
              : '';
            const imageClass = registerStyle('newsletter-image', {
              width: '100%',
              height: widget.props.imageHeight || '280px',
              objectFit: 'cover',
              borderRadius: widget.props.imageBorderRadius || '1rem'
            });

            const renderBulletIcon = () => {
              if (bulletIconUpload) {
                return <img src={bulletIconUpload} alt="Bullet icon" className={bulletIconClass} />;
              }
              const Icon = BulletIconComponent || Check;
              return (
                <span className={bulletIconClass}>
                  <Icon className="h-3 w-3" />
                </span>
              );
            };

            const renderButtonIcon = () => {
              if (buttonIconUpload) {
                return <img src={buttonIconUpload} alt="Button icon" className="h-4 w-4" />;
              }
              if (ButtonIconComponent) {
                const Icon = ButtonIconComponent;
                return <Icon className="h-4 w-4" />;
              }
              return null;
            };

            const renderIllustration = () => {
              if (!showImage) return null;
              return (
                <div className={imageWrapperClass}>
                  {widget.props.imageUrl ? (
                    <img src={widget.props.imageUrl} alt={widget.props.imageAlt || 'Newsletter illustration'} className={imageClass} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-16 w-16" />
                    </div>
                  )}
                </div>
              );
            };

            const buttonContent = (
              <>
                {widget.props.buttonIconPosition === 'left' && renderButtonIcon()}
                <span>{widget.props.buttonText || 'Subscribe'}</span>
                {widget.props.buttonIconPosition !== 'left' && renderButtonIcon()}
              </>
            );

            return (
              <div className={containerClass}>
                {layout === 'split' && widget.props.imagePosition === 'left' && renderIllustration()}
                <div className={contentClass}>
                  {showBadge && <span className={badgeClass}>{widget.props.badgeText}</span>}
                  {showEyebrow && <span className={eyebrowClass}>{widget.props.eyebrow}</span>}
                  <h3 className={titleClass}>{widget.props.title}</h3>
                  {widget.props.description && <p className={descriptionClass}>{widget.props.description}</p>}
                  {bulletPoints.length > 0 && (
                    <div className={bulletListClass}>
                      {bulletPoints.map((point, idx) => (
                        <div key={`${widget.id}-bullet-${idx}`} className={bulletItemClass}>
                          {renderBulletIcon()}
                          <span className={bulletTextClass}>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={formClass}>
                    {widget.props.inputLabel && <span className={inputLabelClass}>{widget.props.inputLabel}</span>}
                    <div className={inputWrapperClass}>
                      <input
                        type="email"
                        readOnly
                        className={inputClass}
                        placeholder={widget.props.placeholder || 'Enter your email'}
                      />
                      <button type="button" className={buttonClass}>
                        {buttonContent}
                      </button>
                    </div>
                    {widget.props.inputHelperText && <span className={helperClass}>{widget.props.inputHelperText}</span>}
                    {showSecondaryButton && (
                      <button type="button" className={secondaryButtonClass}>
                        {widget.props.secondaryButtonText}
                      </button>
                    )}
                  </div>
                  {widget.props.consentText && <p className={consentClass}>{widget.props.consentText}</p>}
                  {showStats && (
                    <div className={statsClass}>
                      <span className={statsValueClass}>{widget.props.statsValue}</span>
                      <span className={statsLabelClass}>{widget.props.statsLabel}</span>
                    </div>
                  )}
                  {showLogos && logos.length > 0 && (
                    <div className="space-y-2 w-full">
                      {widget.props.logosTitle && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">{widget.props.logosTitle}</p>
                      )}
                      <div className={logosWrapperClass}>
                        {logos.map((logo, idx) => (
                          <span key={`${widget.id}-logo-${idx}`} className={logoClass}>
                            {logo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {showSuccessMessage && <p className={successClass}>{widget.props.successMessage}</p>}
                </div>
                {layout === 'split' && widget.props.imagePosition !== 'left' && renderIllustration()}
                {layout !== 'split' && renderIllustration()}
              </div>
            );
          })()}
          {widget.type === 'contactInfo' && (() => {
            const iconRegistry = LucideIcons as Record<string, LucideIcon>;
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if (iconRegistry[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return iconRegistry[formatted] ? formatted : undefined;
            };

            const layout = widget.props.layout || 'cards';
            const alignment = widget.props.alignment || 'left';
            const textAlign = alignment === 'center' ? 'center' : 'left';
            const columns = Math.max(1, parseInt(widget.props.columns, 10) || (layout === 'list' ? 1 : 2));
            const itemGap = widget.props.itemGap || '1rem';
            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();

            const contactItemsRaw = Array.isArray(widget.props.contactItems) ? widget.props.contactItems : [];
            const fallbackItems: any[] = [];
            if (widget.props.phone) fallbackItems.push({ icon: 'Phone', label: 'Phone', value: widget.props.phone, helper: '', href: widget.props.phoneHref });
            if (widget.props.email) fallbackItems.push({ icon: 'Mail', label: 'Email', value: widget.props.email, helper: '', href: widget.props.emailHref });
            if (widget.props.address) fallbackItems.push({ icon: 'MapPin', label: 'Address', value: widget.props.address, helper: '', href: widget.props.addressHref });
            const contactItems = contactItemsRaw.length ? contactItemsRaw : fallbackItems;

            const showIcons = widget.props.showIcons !== false;
            const showCTA = widget.props.showCTA !== false && Boolean(widget.props.ctaText);
            const showSecondaryCTA = widget.props.showSecondaryCTA && Boolean(widget.props.secondaryCTAText);
            const showSocial = widget.props.showSocial !== false && Array.isArray(widget.props.socialPlatforms) && widget.props.socialPlatforms.length > 0;
            const socialLinks = widget.props.socialLinks && typeof widget.props.socialLinks === 'object' ? widget.props.socialLinks : {};

            const containerClass = registerStyle('contact-container', {
              width: '100%',
              maxWidth: widget.props.maxWidth || '720px',
              marginLeft: alignment === 'left' ? 0 : 'auto',
              marginRight: 'auto',
              padding: widget.props.padding || '2rem',
              borderRadius: widget.props.borderRadius || '1.25rem',
              borderWidth: widget.props.borderWidth || '1px',
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'rgba(15,23,42,0.08)',
              boxShadow: widget.props.boxShadow || '0 20px 45px rgba(15,23,42,0.12)',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || '#ffffff',
              backgroundImage: backgroundGradient || undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.textGap || '1rem',
              overflow: 'hidden',
              boxSizing: 'border-box'
            });

            const headingClass = widget.props.heading
              ? registerStyle('contact-heading', {
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: widget.props.headingColor || '#0f172a',
                  textAlign,
                  margin: 0
                })
              : '';
            const subheadingClass = widget.props.subheading
              ? registerStyle('contact-subheading', {
                  color: widget.props.subheadingColor || '#475569',
                  fontSize: '1rem',
                  textAlign,
                  margin: 0,
                  lineHeight: 1.5
                })
              : '';

            const gridClass = registerStyle('contact-grid',
              layout === 'list'
                ? {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: itemGap
                  }
                : {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gap: itemGap
                  }
            );

            const itemClass = registerStyle('contact-item', {
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: layout === 'cards' ? '1rem' : '0',
              borderRadius: layout === 'cards' ? '0.85rem' : undefined,
              border: layout === 'cards' ? '1px solid rgba(15,23,42,0.08)' : undefined,
              backgroundColor: layout === 'cards' ? 'rgba(15,23,42,0.02)' : 'transparent'
            });

            const iconClass = showIcons
              ? registerStyle('contact-icon', {
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.75rem',
                  backgroundColor: widget.props.iconBackground || 'rgba(37,99,235,0.08)',
                  color: widget.props.iconColor || '#2563eb',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                })
              : '';

            const valueClass = registerStyle('contact-value', {
              color: widget.props.textColor || '#0f172a',
              fontSize: widget.props.fontSize || '1rem',
              fontWeight: widget.props.valueFontWeight || 600,
              textDecoration: 'none'
            });
            const helperClass = registerStyle('contact-helper', {
              color: widget.props.helperColor || '#64748b',
              fontSize: '0.85rem'
            });

            const ctaVariant = widget.props.ctaVariant || 'solid';
            const ctaBackground = ctaVariant === 'solid' ? widget.props.ctaBackground || '#2563eb' : 'transparent';
            const ctaTextColor = widget.props.ctaTextColor || (ctaVariant === 'solid' ? '#ffffff' : widget.props.ctaBackground || '#2563eb');
            const ctaBorderColor = widget.props.ctaBorderColor || (ctaVariant === 'outline' ? widget.props.ctaBackground || '#2563eb' : 'transparent');
            const ctaBorderWidth = widget.props.ctaBorderWidth || (ctaVariant === 'outline' ? '1px' : '0px');

            const ctaButtonClass = showCTA
              ? registerStyle('contact-cta', {
                  alignSelf: textAlign === 'center' ? 'center' : 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: widget.props.ctaIconName ? '0.4rem' : '0.25rem',
                  padding: widget.props.ctaPadding || '0.85rem 1.5rem',
                  borderRadius: '999px',
                  backgroundColor: ctaBackground,
                  color: ctaTextColor,
                  borderWidth: ctaBorderWidth,
                  borderStyle: 'solid',
                  borderColor: ctaBorderColor,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                })
              : '';
            if (showCTA) {
              const hoverCss = buildCssBlock(`.${ctaButtonClass}:hover`, {
                filter: 'brightness(0.95)'
              });
              if (hoverCss) widgetStyles.push(hoverCss);
            }

            const socialIconMap: Record<string, LucideIcon> = {
              facebook: Facebook,
              instagram: Instagram,
              twitter: Twitter,
              linkedin: Linkedin,
              whatsapp: Phone
            };

            const socialWrapperClass = showSocial
              ? registerStyle('contact-socials', {
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                })
              : '';
            const socialButtonClass = registerStyle('contact-social-button', {
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: widget.props.socialIconBackground || 'rgba(37,99,235,0.08)',
              color: widget.props.socialIconColor || '#2563eb'
            });

            const renderIcon = (itemIcon?: string) => {
              if (!showIcons) return null;
              const normalized = normalizeIconName(itemIcon || 'Phone') || 'Phone';
              const IconComponent = iconRegistry[normalized] || Phone;
              return (
                <div className={iconClass}>
                  <IconComponent style={{ width: widget.props.iconSize || '1.1rem', height: widget.props.iconSize || '1.1rem' }} />
                </div>
              );
            };

            const renderCTAIcon = () => {
              if (!showCTA || (!widget.props.ctaIconName && !widget.props.ctaIconUpload)) {
                return null;
              }
              if (widget.props.ctaIconUpload) {
                return <img src={widget.props.ctaIconUpload} alt="CTA icon" className="h-4 w-4" />;
              }
              const normalized = normalizeIconName(widget.props.ctaIconName) || 'ArrowRight';
              const IconComponent = iconRegistry[normalized] || ArrowRight;
              return <IconComponent className="h-4 w-4" />;
            };

            return (
              <div className={containerClass}>
                {widget.props.heading && <h3 className={headingClass}>{widget.props.heading}</h3>}
                {widget.props.subheading && <p className={subheadingClass}>{widget.props.subheading}</p>}
                {contactItems.length > 0 && (
                  <div className={gridClass}>
                    {contactItems.map((item: any, idx: number) => {
                      const valueContent = item?.href ? (
                        <a href={item.href} className={valueClass}>{item.value}</a>
                      ) : (
                        <span className={valueClass}>{item?.value}</span>
                      );
                      return (
                        <div key={`${widget.id}-contact-${idx}`} className={itemClass}>
                          {renderIcon(item?.icon)}
                          <div className="space-y-1" style={{ textAlign }}>
                            {item?.label && <p className="text-sm font-semibold" style={{ color: widget.props.helperColor || '#64748b', margin: 0 }}>{item.label}</p>}
                            {valueContent}
                            {item?.helper && <p className={helperClass}>{item.helper}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(showCTA || showSecondaryCTA) && (
                  <div className="flex flex-col gap-3" style={{ alignItems: textAlign === 'center' ? 'center' : 'flex-start' }}>
                    {showCTA && (
                      <a href={widget.props.ctaHref || '#'} className={ctaButtonClass}>
                        {widget.props.ctaIconPosition === 'left' && renderCTAIcon()}
                        <span>{widget.props.ctaText}</span>
                        {widget.props.ctaIconPosition !== 'left' && renderCTAIcon()}
                      </a>
                    )}
                    {showSecondaryCTA && (
                      <a href={widget.props.secondaryCTAHref || '#'} className="text-sm font-semibold" style={{ color: widget.props.secondaryCTAColor || '#2563eb' }}>
                        {widget.props.secondaryCTAText}
                      </a>
                    )}
                  </div>
                )}
                {showSocial && (
                  <div className="space-y-2" style={{ textAlign }}>
                    {widget.props.socialLabel && (
                      <p className="text-sm font-semibold" style={{ color: widget.props.helperColor || '#64748b' }}>{widget.props.socialLabel}</p>
                    )}
                    <div className={socialWrapperClass}>
                      {(widget.props.socialPlatforms || []).map((platform: string) => {
                        const IconComponent = socialIconMap[platform] || Share2;
                        const href = socialLinks?.[platform];
                        const iconNode = (
                          <div className={socialButtonClass}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                        );
                        if (href) {
                          return (
                            <a
                              key={`${widget.id}-social-${platform}`}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex"
                            >
                              {iconNode}
                            </a>
                          );
                        }
                        return (
                          <div key={`${widget.id}-social-${platform}`} className="inline-flex">
                            {iconNode}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {widget.props.footnote && (
                  <p className="text-sm" style={{ color: widget.props.footnoteColor || '#94a3b8', textAlign }}>
                    {widget.props.footnote}
                  </p>
                )}
              </div>
            );
          })()}
          
          {/* Media widgets */}
          {widget.type === 'gallery' && (() => {
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if ((LucideIcons as any)[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return (LucideIcons as any)[formatted] ? formatted : undefined;
            };

            const galleryItemsRaw = Array.isArray(widget.props.images) ? widget.props.images : [];
            const fallbackItems = [
              { src: '', title: 'Gallery Item 1', description: '', badge: '' },
              { src: '', title: 'Gallery Item 2', description: '', badge: '' },
              { src: '', title: 'Gallery Item 3', description: '', badge: '' }
            ];
            const galleryItems = galleryItemsRaw.length ? galleryItemsRaw : fallbackItems;

            const layout = widget.props.layout || 'grid';
            const columns = Math.max(1, parseInt(widget.props.columns, 10) || 3);
            const mobileColumns = Math.max(1, parseInt(widget.props.mobileColumns, 10) || 1);
            const gap = widget.props.gap || '1rem';
            const rowGap = widget.props.rowGap || gap;
            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();
            const hoverEffect = widget.props.hoverEffect || 'zoom';
            const showOverlay = widget.props.showOverlay !== false;
            const showCaptions = widget.props.showCaptions !== false;
            const showBadges = widget.props.showBadges !== false;
            const showPreviewIcon = widget.props.showPreviewIcon !== false;
            const objectFit = widget.props.objectFit || 'cover';
            const overlayIconName = normalizeIconName(widget.props.overlayIconName || 'Maximize2');
            const OverlayIcon = (overlayIconName && (LucideIcons as any)[overlayIconName]) || Maximize2;
            const overlayIconUpload = widget.props.overlayIconUpload;
            const openLinksInNewTab = widget.props.openLinksInNewTab !== false;

            const containerClass = registerStyle('gallery-container', {
              width: '100%',
              maxWidth: widget.props.maxWidth || '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
              padding: widget.props.padding || '1.5rem',
              borderRadius: widget.props.borderRadius || '1rem',
              borderWidth: widget.props.borderWidth || '0px',
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'transparent',
              boxShadow: widget.props.boxShadow || 'none',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || 'transparent',
              backgroundImage: backgroundGradient || undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.textGap || '1rem'
            });

            const galleryHeadingAlignment = widget.props.headingAlignment || 'left';

            const gridStyles: Record<string, StyleValue> = {
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              columnGap: gap,
              rowGap
            };
            if (layout === 'masonry') {
              gridStyles.gridAutoRows = widget.props.imageHeight || '200px';
            }
            const gridClass = registerStyle('gallery-grid', gridStyles);
            const mobileCss = `@media (max-width: 768px) { .${gridClass} { grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)); } }`;
            widgetStyles.push(mobileCss);

            const cardClass = registerStyle('gallery-card', {
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            });

            const imageWrapperClass = registerStyle('gallery-image-wrapper', {
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              borderRadius: widget.props.imageBorderRadius || '1rem',
              borderWidth: widget.props.imageBorderWidth || '0px',
              borderStyle: 'solid',
              borderColor: widget.props.imageBorderColor || 'transparent',
              boxShadow: widget.props.imageShadow || '0 12px 25px rgba(15,23,42,0.12)',
              aspectRatio: widget.props.imageHeight ? undefined : widget.props.imageAspectRatio || '16/9',
              height: widget.props.imageHeight || undefined
            });

            const imageClass = registerStyle('gallery-image', {
              width: '100%',
              height: widget.props.imageHeight ? '100%' : 'auto',
              objectFit,
              display: 'block',
              transition: 'transform 0.4s ease, filter 0.4s ease'
            });

            if (hoverEffect === 'zoom') {
              widgetStyles.push(buildCssBlock(`.${cardClass}:hover .${imageClass}`, { transform: 'scale(1.08)' }));
            } else if (hoverEffect === 'lift') {
              widgetStyles.push(buildCssBlock(`.${cardClass}:hover .${imageWrapperClass}`, { transform: 'translateY(-6px)' }));
            } else if (hoverEffect === 'fade') {
              widgetStyles.push(buildCssBlock(`.${cardClass}:hover .${imageClass}`, { opacity: 0.85 }));
            } else if (hoverEffect === 'grayscale') {
              widgetStyles.push(buildCssBlock(`.${cardClass}:hover .${imageClass}`, { filter: 'grayscale(100%)' }));
            }

            const overlayClass = showOverlay
              ? registerStyle('gallery-overlay', {
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: widget.props.overlayColor || 'rgba(15,23,42,0.45)',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s ease',
                  color: '#ffffff'
                })
              : '';
            if (showOverlay) {
              widgetStyles.push(buildCssBlock(`.${cardClass}:hover .${overlayClass}`, { opacity: 1 }));
            }

            const captionWrapperClass = showCaptions
              ? registerStyle('gallery-caption', {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  textAlign: widget.props.captionAlignment || 'left'
                })
              : '';
            const badgeClass = showBadges
              ? registerStyle('gallery-badge', {
                  alignSelf: widget.props.captionAlignment === 'center' ? 'center' : 'flex-start',
                  backgroundColor: widget.props.badgeBackground || 'rgba(37,99,235,0.12)',
                  color: widget.props.badgeColor || '#2563eb',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                })
              : '';
            const captionTitleClass = registerStyle('gallery-caption-title', {
              color: widget.props.captionColor || '#0f172a',
              fontWeight: 600,
              fontSize: '1rem',
              margin: 0
            });
            const captionDescriptionClass = registerStyle('gallery-caption-description', {
              color: widget.props.captionDescriptionColor || '#475569',
              fontSize: '0.9rem',
              margin: 0
            });

            const ctaVariant = widget.props.ctaVariant || 'outline';
            const showCTA = Boolean(widget.props.ctaText);
            const ctaBackground = ctaVariant === 'solid' ? widget.props.ctaBackground || '#2563eb' : 'transparent';
            const ctaTextColor = widget.props.ctaTextColor || (ctaVariant === 'solid' ? '#ffffff' : widget.props.ctaBackground || '#2563eb');
            const ctaBorderColor = widget.props.ctaBorderColor || (ctaVariant === 'outline' ? widget.props.ctaBackground || '#2563eb' : 'transparent');
            const ctaBorderWidth = widget.props.ctaBorderWidth || (ctaVariant === 'outline' ? '1px' : '0px');
            const ctaButtonClass = showCTA
              ? registerStyle('gallery-cta', {
                  alignSelf: widget.props.captionAlignment === 'center' ? 'center' : 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: widget.props.ctaIconName ? '0.35rem' : '0.2rem',
                  padding: widget.props.ctaPadding || '0.7rem 1.25rem',
                  borderRadius: '999px',
                  backgroundColor: ctaBackground,
                  color: ctaTextColor,
                  borderWidth: ctaBorderWidth,
                  borderStyle: 'solid',
                  borderColor: ctaBorderColor,
                  fontWeight: 600,
                  textDecoration: 'none'
                })
              : '';
            if (showCTA) {
              widgetStyles.push(buildCssBlock(`.${ctaButtonClass}:hover`, { filter: 'brightness(0.92)' }));
            }

            const overlayIconNode = overlayIconUpload
              ? <img src={overlayIconUpload} alt="Preview" className="h-6 w-6" />
              : <OverlayIcon className="h-6 w-6" />;

            const ctaIconNameNormalized = normalizeIconName(widget.props.ctaIconName);
            const CTAIcon = ctaIconNameNormalized ? (LucideIcons as any)[ctaIconNameNormalized] : null;
            const ctaIconUpload = widget.props.ctaIconUpload;
            const ctaIconNode = ctaIconUpload ? (
              <img src={ctaIconUpload} alt="CTA icon" className="h-4 w-4" />
            ) : CTAIcon ? (
              <CTAIcon className="h-4 w-4" />
            ) : null;
            const ctaIconPosition = widget.props.ctaIconPosition || 'right';

            return (
              <div className={containerClass}>
                {widget.props.heading && <h3 className="text-lg font-bold" style={{ color: widget.props.headingColor || '#0f172a', textAlign: galleryHeadingAlignment }}>{widget.props.heading}</h3>}
                {widget.props.subheading && <p className="text-sm text-muted-foreground" style={{ color: widget.props.subheadingColor || '#475569', textAlign: galleryHeadingAlignment }}>{widget.props.subheading}</p>}
                <div className={gridClass}>
                  {galleryItems.map((item: any, idx: number) => {
                    const src = typeof item === 'string' ? item : item?.src;
                    const title = typeof item === 'string' ? '' : item?.title;
                    const description = typeof item === 'string' ? '' : item?.description;
                    const badge = typeof item === 'string' ? '' : item?.badge;
                    const href = typeof item === 'object' && item?.href ? item.href : undefined;
                    const alt = typeof item === 'object' && item?.alt ? item.alt : 'Gallery image';

                    const imageElement = src ? (
                      <img src={src} alt={alt} className={imageClass} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400" style={{ height: widget.props.imageHeight || '100%' }}>
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    );

                    const mediaContent = (
                      <div className={imageWrapperClass}>
                        {imageElement}
                        {showOverlay && (
                          <div className={overlayClass}>
                            {showPreviewIcon && overlayIconNode}
                          </div>
                        )}
                      </div>
                    );

                    const clickableMedia = href ? (
                      <a
                        href={href}
                        target={openLinksInNewTab ? '_blank' : undefined}
                        rel={openLinksInNewTab ? 'noreferrer' : undefined}
                        className="block"
                      >
                        {mediaContent}
                      </a>
                    ) : mediaContent;

                    return (
                      <div key={`${widget.id}-gallery-${idx}`} className={cardClass}>
                        {clickableMedia}
                        {showCaptions && (
                          <div className={captionWrapperClass}>
                            {showBadges && badge && <span className={badgeClass}>{badge}</span>}
                            {title && <p className={captionTitleClass}>{title}</p>}
                            {description && <p className={captionDescriptionClass}>{description}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {showCTA && (
                  <a href={widget.props.ctaHref || '#'} className={ctaButtonClass} target={openLinksInNewTab ? '_blank' : undefined} rel={openLinksInNewTab ? 'noreferrer' : undefined}>
                    {ctaIconNode && ctaIconPosition === 'left' && ctaIconNode}
                    <span>{widget.props.ctaText}</span>
                    {ctaIconNode && ctaIconPosition !== 'left' && ctaIconNode}
                  </a>
                )}
              </div>
            );
          })()}
          {widget.type === 'carousel' && (() => {
            const slidesRaw = Array.isArray(widget.props.slides) ? widget.props.slides : [];
            const fallbackSlides = [
              { image: '', headline: 'Carousel headline', subheadline: 'Subheadline', description: '', badge: '' },
              { image: '', headline: 'Second slide', subheadline: '', description: '', badge: '' },
              { image: '', headline: 'Third slide', subheadline: '', description: '', badge: '' }
            ];
            const slides = slidesRaw.length ? slidesRaw : fallbackSlides;
            const previewSlides = slides.slice(0, 3);

            const height = widget.props.height || '420px';
            const slideWidth = widget.props.slideWidth || '80%';
            const slideGap = widget.props.slideGap || '1.5rem';
            const borderRadius = widget.props.borderRadius || '1.25rem';
            const showOverlay = widget.props.showOverlay !== false;
            const showContent = widget.props.showContent !== false;
            const showArrows = widget.props.showArrows !== false;
            const showIndicators = widget.props.showIndicators !== false;
            const contentAlignment = widget.props.contentAlignment || 'left';
            const headingColor = widget.props.headlineColor || '#ffffff';
            const bodyColor = widget.props.bodyColor || 'rgba(255,255,255,0.85)';
            const badgeBackground = widget.props.badgeBackground || 'rgba(255,255,255,0.15)';
            const badgeColor = widget.props.badgeColor || '#ffffff';
            const buttonBg = widget.props.buttonBackground || '#ffffff';
            const buttonColor = widget.props.buttonTextColor || '#0f172a';
            const showIndicatorsThumbnails = widget.props.showThumbnails === true;

            const containerClass = registerStyle('carousel-container', {
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              borderRadius,
              height,
              padding: widget.props.padding || '0',
              backgroundColor: widget.props.backgroundGradient ? undefined : widget.props.backgroundColor || 'transparent',
              backgroundImage: widget.props.backgroundGradient || undefined
            });

            const trackClass = registerStyle('carousel-track', {
              display: 'flex',
              height: '100%',
              alignItems: 'stretch',
              gap: slideGap,
              transition: `transform ${(widget.props.transitionDuration || 600)}ms ease`
            });

            const slideClass = registerStyle('carousel-slide', {
              position: 'relative',
              flex: '0 0 100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center'
            });

            const slideInnerClass = registerStyle('carousel-slide-inner', {
              position: 'relative',
              width: slideWidth,
              height: '100%',
              borderRadius,
              overflow: 'hidden',
              boxShadow: '0 25px 45px rgba(15,23,42,0.25)',
              backgroundColor: '#0f172a'
            });

            const mediaClass = registerStyle('carousel-media', {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: widget.props.mediaFilter || 'none'
            });

            const overlayClass = showOverlay
              ? registerStyle('carousel-overlay', {
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: widget.props.overlayColor || 'rgba(0,0,0,0.35)',
                  backdropFilter: widget.props.overlayBlur && widget.props.overlayBlur !== '0px' ? `blur(${widget.props.overlayBlur})` : undefined
                })
              : '';

            const contentClass = showContent
              ? registerStyle('carousel-content', {
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  height: '100%',
                  justifyContent: 'center',
                  padding: '0 3rem',
                  textAlign: contentAlignment,
                  color: headingColor
                })
              : '';

            const badgeClass = registerStyle('carousel-badge', {
              display: 'inline-flex',
              alignSelf: contentAlignment === 'center' ? 'center' : 'flex-start',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: badgeBackground,
              color: badgeColor,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              fontWeight: 600,
              textTransform: 'uppercase'
            });

            const headlineClass = registerStyle('carousel-headline', {
              fontSize: '2.25rem',
              lineHeight: 1.15,
              margin: 0,
              color: headingColor
            });

            const subheadlineClass = registerStyle('carousel-subheadline', {
              fontSize: '1.25rem',
              fontWeight: 500,
              margin: 0,
              color: headingColor
            });

            const bodyClass = registerStyle('carousel-body', {
              fontSize: '1rem',
              color: bodyColor,
              margin: 0
            });

            const buttonClass = registerStyle('carousel-button', {
              alignSelf: contentAlignment === 'center' ? 'center' : 'flex-start',
              backgroundColor: buttonBg,
              color: buttonColor,
              padding: widget.props.buttonPadding || '0.65rem 1.5rem',
              borderRadius: '999px',
              fontWeight: 600,
              border: 'none',
              textDecoration: 'none',
              boxShadow: '0 10px 20px rgba(0,0,0,0.25)'
            });

            const arrowBaseClass = showArrows
              ? registerStyle('carousel-arrow', {
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '999px',
                  backgroundColor: widget.props.arrowBackground || 'rgba(15,23,42,0.6)',
                  color: widget.props.arrowColor || '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                })
              : '';

            const indicatorsClass = showIndicators
              ? registerStyle('carousel-indicators', {
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.5rem'
                })
              : '';

            const indicatorDotClass = registerStyle('carousel-indicator', {
              width: widget.props.indicatorStyle === 'line' ? '1.5rem' : '0.6rem',
              height: '0.6rem',
              borderRadius: widget.props.indicatorStyle === 'line' ? '999px' : '50%',
              backgroundColor: widget.props.indicatorColor || 'rgba(255,255,255,0.4)'
            });
            const indicatorActiveClass = registerStyle('carousel-indicator-active', {
              backgroundColor: widget.props.indicatorActiveColor || '#ffffff'
            });

            const thumbnailsWrapperClass = showIndicatorsThumbnails
              ? registerStyle('carousel-thumbnails', {
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  justifyContent: 'center'
                })
              : '';
            const thumbnailClass = registerStyle('carousel-thumbnail', {
              width: '70px',
              height: '50px',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '2px solid transparent'
            });

            return (
              <div className={containerClass}>
                <div className={trackClass}>
                  {previewSlides.map((slide, idx) => {
                    const image = slide?.image || (typeof slide === 'string' ? slide : '');
                    const headline = slide?.headline || (typeof slide === 'string' ? slide : '');
                    const subheadline = slide?.subheadline;
                    const description = slide?.description;
                    const badge = slide?.badge;
                    const buttonText = slide?.buttonText;
                    const buttonHref = slide?.buttonHref;

                    const slideMedia = image ? (
                      <img src={image} alt={slide?.alt || 'Carousel slide'} className={mediaClass} />
                    ) : (
                      <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    );

                    const slideContent = showContent ? (
                      <div className={contentClass}>
                        {badge && <span className={badgeClass}>{badge}</span>}
                        {headline && <h3 className={headlineClass}>{headline}</h3>}
                        {subheadline && <p className={subheadlineClass}>{subheadline}</p>}
                        {description && <p className={bodyClass}>{description}</p>}
                        {buttonText && (
                          <a href={buttonHref || '#'} className={buttonClass}>
                            {buttonText}
                          </a>
                        )}
                      </div>
                    ) : null;

                    return (
                      <div key={`${widget.id}-slide-${idx}`} className={slideClass}>
                        <div className={slideInnerClass}>
                          {slideMedia}
                          {showOverlay && <div className={overlayClass} />}
                          {slideContent}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {showArrows && (
                  <>
                    <div
                      className={arrowBaseClass}
                      style={{ left: widget.props.arrowPosition === 'inside' ? '1rem' : '-1.5rem' }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </div>
                    <div
                      className={arrowBaseClass}
                      style={{ right: widget.props.arrowPosition === 'inside' ? '1rem' : '-1.5rem' }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </>
                )}
                {showIndicators && (
                  <div className={indicatorsClass}>
                    {previewSlides.map((_, idx) => (
                      <span
                        key={`${widget.id}-indicator-${idx}`}
                        className={`${indicatorDotClass} ${idx === 0 ? indicatorActiveClass : ''}`}
                      />
                    ))}
                  </div>
                )}
                {showIndicatorsThumbnails && (
                  <div className={thumbnailsWrapperClass}>
                    {previewSlides.map((slide, idx) => (
                      <div
                        key={`${widget.id}-thumb-${idx}`}
                        className={thumbnailClass}
                        style={{
                          borderColor: idx === 0 ? widget.props.indicatorActiveColor || '#ffffff' : 'transparent'
                        }}
                      >
                        {slide?.image ? (
                          <img src={slide.image} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          {widget.type === 'audioPlayer' && (
            <div 
              className="p-4 rounded"
              style={{ backgroundColor: widget.props.backgroundColor }}
            >
              <div className="flex items-center gap-3">
                <Volume2 className="h-8 w-8 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium">{widget.props.title}</div>
                  <div className="text-sm text-gray-500">{widget.props.artist}</div>
                </div>
              </div>
              {widget.props.showControls && (
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-blue-500" />
                </div>
              )}
            </div>
          )}
          
          {/* Commerce widgets */}
          {widget.type === 'productCard' && (() => {
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if ((LucideIcons as any)[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return (LucideIcons as any)[formatted] ? formatted : undefined;
            };

            const layoutVariant = widget.props.layoutVariant || 'vertical';
            const alignment = widget.props.alignment || 'left';
            const textAlign = alignment;
            const alignItems = alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
            const showImage = widget.props.showImage !== false && (widget.props.image || widget.props.imageBackground);
            const showBadge = widget.props.showBadge !== false && Boolean(widget.props.badge);
            const showFavoriteIcon = widget.props.showFavoriteIcon !== false;
            const showDiscount = widget.props.showDiscount !== false && Boolean(widget.props.discountText);
            const showRating = widget.props.showRating !== false && typeof widget.props.rating === 'number';
            const showSecondaryButton = widget.props.showSecondaryButton !== false && widget.props.secondaryButtonText;
            const showCurrency = widget.props.showCurrency !== false;
            const cardBackgroundGradient = (widget.props.cardBackgroundGradient || '').toString().trim();
            const features = Array.isArray(widget.props.features) ? widget.props.features.filter((item: string) => item?.trim()) : [];
            const showFeatures = widget.props.showFeatures !== false && features.length > 0;

            const currencySymbol = widget.props.currency || '';
            const priceValue = widget.props.price || '';
            const originalPriceValue = widget.props.originalPrice || '';
            const prependCurrency = (value: string) => {
              if (!showCurrency || !currencySymbol) return value;
              return value.trim().startsWith(currencySymbol) ? value : `${currencySymbol}${value}`;
            };
            const displayPrice = priceValue ? prependCurrency(priceValue) : (showCurrency ? currencySymbol : '');
            const displayOriginalPrice = originalPriceValue ? prependCurrency(originalPriceValue) : '';

            const ratingValue = typeof widget.props.rating === 'number'
              ? Math.min(5, Math.max(0, widget.props.rating))
              : 0;

            const CTAIconName = normalizeIconName(widget.props.ctaIconName || 'ShoppingCart');
            const CTAIcon = (CTAIconName && (LucideIcons as any)[CTAIconName]) || ShoppingCart;
            const hasCtaIcon = Boolean(widget.props.ctaIconUpload || widget.props.ctaIconName);
            const ctaIconNode = widget.props.ctaIconUpload ? (
              <img src={widget.props.ctaIconUpload} alt="cta icon" className="h-4 w-4" />
            ) : hasCtaIcon ? (
              <CTAIcon className="h-4 w-4" />
            ) : null;

            const featureIconName = normalizeIconName(widget.props.featureIconName || 'Check');
            const FeatureIcon = (featureIconName && (LucideIcons as any)[featureIconName]) || Check;
            const favoriteIconName = normalizeIconName(widget.props.favoriteIconName || 'Heart');
            const FavoriteIcon = (favoriteIconName && (LucideIcons as any)[favoriteIconName]) || Heart;

            const cardClass = registerStyle('product-card', {
              width: '100%',
              display: layoutVariant === 'horizontal' ? 'grid' : 'flex',
              flexDirection: layoutVariant === 'horizontal' ? undefined : 'column',
              gridTemplateColumns: layoutVariant === 'horizontal' && showImage ? `${widget.props.mediaWidth || '320px'} 1fr` : undefined,
              gap: widget.props.contentGap || (layoutVariant === 'horizontal' ? '1.75rem' : '1.25rem'),
              padding: widget.props.cardPadding || '1.5rem',
              borderRadius: widget.props.borderRadius || '1.25rem',
              borderWidth: widget.props.borderWidth || '1px',
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'rgba(15,23,42,0.08)',
              boxShadow: widget.props.boxShadow || '0 25px 45px rgba(15,23,42,0.12)',
              backgroundColor: cardBackgroundGradient ? undefined : widget.props.cardBackground || '#ffffff',
              backgroundImage: cardBackgroundGradient || undefined,
              alignItems: layoutVariant === 'horizontal' ? 'stretch' : undefined
            });

            const mediaWrapperClass = registerStyle('product-card-media', {
              position: 'relative',
              width: '100%',
              height: layoutVariant === 'horizontal' ? '100%' : widget.props.imageHeight || '260px',
              borderRadius: widget.props.imageBorderRadius || '1.25rem',
              overflow: 'hidden',
              backgroundColor: widget.props.imageBackground || '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            });

            const imageClass = registerStyle('product-card-image', {
              width: '100%',
              height: '100%',
              objectFit: widget.props.objectFit || 'cover',
              display: 'block'
            });

            const badgeClass = showBadge
              ? registerStyle('product-card-badge', {
                  position: 'absolute',
                  top: '1rem',
                  left: widget.props.badgePosition === 'top-right' ? undefined : '1rem',
                  right: widget.props.badgePosition === 'top-right' ? '1rem' : undefined,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  backgroundColor: widget.props.badgeBackground || 'rgba(59,130,246,0.2)',
                  color: widget.props.badgeTextColor || '#1d4ed8'
                })
              : '';

            const favoriteButtonClass = showFavoriteIcon
              ? registerStyle('product-card-favorite', {
                  position: 'absolute',
                  top: '1rem',
                  right: widget.props.badgePosition === 'top-right' && showBadge ? '4rem' : '1rem',
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '999px',
                  backgroundColor: widget.props.favoriteIconBackground || '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(15,23,42,0.15)'
                })
              : '';

            const contentClass = registerStyle('product-card-content', {
              display: 'flex',
              flexDirection: 'column',
              gap: widget.props.contentGap || '1rem',
              textAlign,
              alignItems: layoutVariant === 'horizontal' ? 'flex-start' : alignItems,
              justifyContent: 'center'
            });

            const titleClass = registerStyle('product-card-title', {
              fontSize: '1.4rem',
              lineHeight: 1.2,
              margin: 0,
              color: widget.props.titleColor || '#0f172a'
            });

            const subtitleClass = registerStyle('product-card-subtitle', {
              fontSize: '0.95rem',
              margin: 0,
              color: widget.props.subtitleColor || '#2563eb',
              fontWeight: 600
            });

            const descriptionClass = registerStyle('product-card-description', {
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: widget.props.descriptionColor || '#475569',
              margin: 0
            });

            const priceRowClass = registerStyle('product-card-price-row', {
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: '0.75rem'
            });

            const priceClass = registerStyle('product-card-price', {
              fontSize: '2rem',
              fontWeight: 700,
              color: widget.props.priceColor || '#0f172a',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0.35rem'
            });

            const priceSuffixClass = registerStyle('product-card-price-suffix', {
              fontSize: '1rem',
              color: widget.props.priceColor || '#0f172a',
              opacity: 0.8
            });

            const originalPriceClass = registerStyle('product-card-original', {
              fontSize: '1rem',
              color: widget.props.originalPriceColor || '#94a3b8',
              textDecoration: 'line-through'
            });

            const discountClass = showDiscount
              ? registerStyle('product-card-discount', {
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: widget.props.discountBackground || 'rgba(34,197,94,0.15)',
                  color: widget.props.discountColor || '#15803d'
                })
              : '';

            const priceLabelClass = registerStyle('product-card-price-label', {
              fontSize: '0.85rem',
              color: '#94a3b8',
              margin: 0
            });

            const metaRowClass = registerStyle('product-card-meta', {
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            });

            const ratingRowClass = showRating
              ? registerStyle('product-card-rating', {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  alignItems: 'center'
                })
              : '';

            const starClass = registerStyle('product-card-star', {
              width: '1rem',
              height: '1rem',
              color: widget.props.starColor || '#facc15'
            });

            const ratingTextClass = registerStyle('product-card-rating-text', {
              fontSize: '0.9rem',
              color: widget.props.ratingColor || '#475569'
            });

            const featureListClass = showFeatures
              ? registerStyle('product-card-features', {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                })
              : '';

            const featureItemClass = registerStyle('product-card-feature', {
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              fontSize: '0.95rem',
              color: widget.props.descriptionColor || '#475569'
            });

            const featureIconClass = registerStyle('product-card-feature-icon', {
              width: '1.1rem',
              height: '1.1rem',
              color: widget.props.featureIconColor || '#2563eb'
            });

            const buttonVariant = widget.props.buttonVariant || 'solid';
            const buttonBackground = buttonVariant === 'solid'
              ? widget.props.buttonBackground || '#2563eb'
              : buttonVariant === 'outline'
                ? 'transparent'
                : 'transparent';
            const buttonColor = widget.props.buttonTextColor || (buttonVariant === 'solid'
              ? '#ffffff'
              : widget.props.buttonBackground || '#2563eb');
            const buttonBorderColor = buttonVariant === 'outline'
              ? widget.props.buttonBorderColor || widget.props.buttonBackground || '#2563eb'
              : widget.props.buttonBorderColor || 'transparent';
            const buttonBorderWidth = widget.props.buttonBorderWidth || (buttonVariant === 'outline' ? '1px' : '0px');

            const buttonAlignSelf = widget.props.buttonFullWidth === false
              ? (alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start')
              : 'stretch';

            const buttonClass = registerStyle('product-card-button', {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: widget.props.buttonFullWidth === false ? 'auto' : '100%',
              gap: hasCtaIcon ? '0.4rem' : '0.2rem',
              padding: widget.props.buttonPadding || '0.85rem 1.4rem',
              borderRadius: widget.props.buttonBorderRadius || '999px',
              backgroundColor: buttonBackground,
              color: buttonColor,
              borderWidth: buttonBorderWidth,
              borderStyle: 'solid',
              borderColor: buttonBorderColor,
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: buttonVariant === 'solid' ? '0 15px 30px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.2s ease',
              alignSelf: buttonAlignSelf
            });
            widgetStyles.push(buildCssBlock(`.${buttonClass}:hover`, {
              backgroundColor: widget.props.buttonHoverBackground || buttonBackground,
              color: widget.props.buttonHoverTextColor || buttonColor
            }));

            const secondaryButtonClass = showSecondaryButton
              ? registerStyle('product-card-secondary', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
                  color: widget.props.secondaryButtonColor || '#2563eb',
                  textDecoration: widget.props.secondaryButtonVariant === 'link' ? 'underline' : 'none',
                  fontWeight: 600,
                  padding: widget.props.secondaryButtonVariant === 'ghost'
                    ? widget.props.secondaryButtonPadding || '0.75rem 1rem'
                    : '0.25rem 0',
                  backgroundColor: widget.props.secondaryButtonVariant === 'ghost'
                    ? widget.props.secondaryButtonBackground || 'rgba(37,99,235,0.08)'
                    : 'transparent',
                  borderRadius: widget.props.secondaryButtonVariant === 'ghost' ? '999px' : '0',
                  width: widget.props.buttonFullWidth === false ? 'auto' : '100%'
                })
              : '';
            if (showSecondaryButton) {
              widgetStyles.push(buildCssBlock(`.${secondaryButtonClass}:hover`, {
                color: widget.props.secondaryButtonHoverColor || widget.props.secondaryButtonColor || '#1d4ed8',
                backgroundColor: widget.props.secondaryButtonVariant === 'ghost'
                  ? widget.props.secondaryButtonHoverBackground || 'rgba(37,99,235,0.16)'
                  : 'transparent'
              }));
            }

            const favoriteIconNode = widget.props.favoriteIconUpload ? (
              <img src={widget.props.favoriteIconUpload} alt="favorite" className="h-4 w-4" />
            ) : (
              <FavoriteIcon className="h-4 w-4" style={{ color: widget.props.favoriteIconColor || '#ef4444' }} />
            );

            return (
              <div className={cardClass}>
                {showImage && (
                  <div className={mediaWrapperClass}>
                    {widget.props.image ? (
                      <img src={widget.props.image} alt={widget.props.imageAlt || widget.props.title || 'Product image'} className={imageClass} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    {showBadge && <span className={badgeClass}>{widget.props.badge}</span>}
                    {showFavoriteIcon && <div className={favoriteButtonClass}>{favoriteIconNode}</div>}
                  </div>
                )}
                <div className={contentClass}>
                  {widget.props.subtitle && <p className={subtitleClass}>{widget.props.subtitle}</p>}
                  {widget.props.title && <h3 className={titleClass}>{widget.props.title}</h3>}
                  {widget.props.description && <p className={descriptionClass}>{widget.props.description}</p>}
                  <div className={priceRowClass}>
                    <div className={priceClass}>
                      <span>{displayPrice}</span>
                      {widget.props.priceSuffix && <span className={priceSuffixClass}>{widget.props.priceSuffix}</span>}
                    </div>
                    {displayOriginalPrice && <span className={originalPriceClass}>{displayOriginalPrice}</span>}
                    {showDiscount && <span className={discountClass}>{widget.props.discountText}</span>}
                  </div>
                  {widget.props.priceLabel && <p className={priceLabelClass}>{widget.props.priceLabel}</p>}
                  <div className={metaRowClass}>
                    {widget.props.stockStatus && (
                      <span style={{ color: widget.props.stockColor || '#16a34a', fontWeight: 600 }}>{widget.props.stockStatus}</span>
                    )}
                    {widget.props.shippingText && (
                      <span style={{ color: widget.props.shippingColor || '#2563eb', fontWeight: 600 }}>{widget.props.shippingText}</span>
                    )}
                  </div>
                  {showRating && (
                    <div className={ratingRowClass}>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={`${widget.id}-rating-${idx}`}
                            className={starClass}
                            style={{ opacity: ratingValue >= idx + 0.25 ? 1 : 0.2, fill: ratingValue >= idx + 0.25 ? (widget.props.starColor || '#facc15') : 'transparent' }}
                          />
                        ))}
                      </div>
                      {(widget.props.ratingCountLabel || widget.props.ratingLabel) && (
                        <span className={ratingTextClass}>
                          {[widget.props.ratingCountLabel, widget.props.ratingLabel].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  )}
                  {showFeatures && (
                    <div className={featureListClass}>
                      {features.map((feature, idx) => (
                        <div key={`${widget.id}-feature-${idx}`} className={featureItemClass}>
                          {widget.props.featureIconUpload ? (
                            <img src={widget.props.featureIconUpload} alt="feature icon" className={featureIconClass} />
                          ) : (
                            <FeatureIcon className={featureIconClass} />
                          )}
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-3 w-full">
                    {widget.props.buttonText && (
                      <a href={widget.props.buttonHref || '#'} className={buttonClass}>
                        {ctaIconNode && widget.props.ctaIconPosition === 'left' && ctaIconNode}
                        <span>{widget.props.buttonText}</span>
                        {ctaIconNode && widget.props.ctaIconPosition !== 'left' && ctaIconNode}
                      </a>
                    )}
                    {showSecondaryButton && widget.props.secondaryButtonText && (
                      <a href={widget.props.secondaryButtonHref || '#'} className={secondaryButtonClass}>
                        {widget.props.secondaryButtonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          {widget.type === 'pricing' && (() => {
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if ((LucideIcons as any)[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return (LucideIcons as any)[formatted] ? formatted : undefined;
            };

            const includedFeatures = Array.isArray(widget.props.features)
              ? widget.props.features.filter((feature: string) => feature && feature.trim())
              : [];
            const limitedFeatures = Array.isArray(widget.props.limitedFeatures)
              ? widget.props.limitedFeatures.filter((feature: string) => feature && feature.trim())
              : [];

            const layoutVariant = widget.props.layoutVariant || 'card';
            const alignment = widget.props.alignment === 'center' ? 'center' : 'left';
            const textAlign = alignment;
            const showAccentBar = widget.props.showAccentBar !== false;
            const accentPosition = widget.props.accentPosition || 'top';
            const showCurrency = widget.props.showCurrency !== false;
            const showOriginalPrice = widget.props.showOriginalPrice !== false && widget.props.originalPrice;
            const showFeatures = widget.props.showFeatures !== false && includedFeatures.length > 0;
            const showLimited = widget.props.showFeatures !== false && limitedFeatures.length > 0;
            const showSecondaryButton = widget.props.showSecondaryButton !== false && widget.props.secondaryButtonText;
            const showGuarantee = widget.props.showGuarantee !== false && widget.props.guaranteeText;
            const showFooterNote = widget.props.showFooterNote !== false && widget.props.footerNote;

            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();
            const currencySymbol = widget.props.currency || '';
            const formatPrice = (value?: string) => {
              if (!value) return '';
              if (!showCurrency || !currencySymbol) return value;
              return value.trim().startsWith(currencySymbol) ? value : `${currencySymbol}${value}`;
            };
            const displayPrice = formatPrice(widget.props.price);
            const displayOriginalPrice = showOriginalPrice ? formatPrice(widget.props.originalPrice) : '';

            const featureIconName = normalizeIconName(widget.props.featureIconName || 'Check');
            const FeatureIcon = (featureIconName && (LucideIcons as any)[featureIconName]) || Check;
            const limitedIconName = normalizeIconName(widget.props.limitedFeatureIconName || 'X');
            const LimitedIcon = (limitedIconName && (LucideIcons as any)[limitedIconName]) || X;

            const buttonVariant = widget.props.buttonVariant || 'solid';
            const buttonBackground = buttonVariant === 'solid'
              ? widget.props.buttonBackground || '#2563eb'
              : 'transparent';
            const buttonBorderColor = buttonVariant === 'outline'
              ? widget.props.buttonBorderColor || widget.props.buttonBackground || '#2563eb'
              : widget.props.buttonBorderColor || 'transparent';
            const buttonBorderWidth = widget.props.buttonBorderWidth || (buttonVariant === 'outline' ? '1px' : '0px');
            const buttonTextColor = widget.props.buttonTextColor || (buttonVariant === 'solid' ? '#ffffff' : widget.props.buttonBackground || '#2563eb');

            const buttonClass = registerStyle('pricing-button', {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: widget.props.buttonFullWidth === false ? 'auto' : '100%',
              gap: widget.props.ctaIconName || widget.props.ctaIconUpload ? '0.5rem' : '0.25rem',
              padding: widget.props.buttonPadding || '0.85rem 1.5rem',
              borderRadius: widget.props.buttonBorderRadius || '999px',
              fontWeight: 600,
              borderWidth: buttonBorderWidth,
              borderStyle: 'solid',
              borderColor: buttonBorderColor,
              backgroundColor: buttonBackground,
              color: buttonTextColor,
              textDecoration: 'none',
              boxShadow: buttonVariant === 'solid' ? '0 15px 30px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.2s ease'
            });
            widgetStyles.push(buildCssBlock(`.${buttonClass}:hover`, {
              backgroundColor: widget.props.buttonHoverBackground || buttonBackground,
              color: widget.props.buttonHoverTextColor || buttonTextColor
            }));

            const secondaryButtonClass = showSecondaryButton
              ? registerStyle('pricing-secondary-button', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: alignment === 'center' ? 'center' : 'flex-start',
                  color: widget.props.secondaryButtonColor || '#2563eb',
                  padding: widget.props.secondaryButtonVariant === 'ghost'
                    ? widget.props.secondaryButtonPadding || '0.75rem 1rem'
                    : '0.25rem 0',
                  borderRadius: widget.props.secondaryButtonVariant === 'ghost' ? '999px' : '0',
                  backgroundColor: widget.props.secondaryButtonVariant === 'ghost'
                    ? widget.props.secondaryButtonBackground || 'rgba(37,99,235,0.08)'
                    : 'transparent',
                  fontWeight: 600,
                  textDecoration: widget.props.secondaryButtonVariant === 'link' ? 'underline' : 'none',
                  width: widget.props.buttonFullWidth === false ? 'auto' : '100%'
                })
              : '';
            if (showSecondaryButton) {
              widgetStyles.push(buildCssBlock(`.${secondaryButtonClass}:hover`, {
                color: widget.props.secondaryButtonHoverColor || widget.props.secondaryButtonColor || '#1d4ed8',
                backgroundColor: widget.props.secondaryButtonVariant === 'ghost'
                  ? widget.props.secondaryButtonHoverBackground || 'rgba(37,99,235,0.16)'
                  : 'transparent'
              }));
            }

            const cardClass = registerStyle('pricing-card', {
              position: 'relative',
              width: '100%',
              maxWidth: widget.props.maxWidth || '420px',
              padding: widget.props.cardPadding || '2rem',
              borderRadius: widget.props.borderRadius || '1.5rem',
              borderWidth: widget.props.borderWidth || (layoutVariant === 'minimal' ? '0px' : '1px'),
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'rgba(15,23,42,0.08)',
              boxShadow: layoutVariant === 'minimal' ? 'none' : widget.props.boxShadow || '0 25px 45px rgba(15,23,42,0.12)',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || '#ffffff',
              backgroundImage: backgroundGradient || undefined,
              textAlign,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            });

            const accentBase: Record<string, StyleValue> = {
              position: 'absolute',
              backgroundColor: widget.props.accentColor || '#2563eb'
            };
            if (accentPosition === 'top') {
              accentBase.top = '0';
              accentBase.left = '0';
              accentBase.right = '0';
              accentBase.height = widget.props.accentThickness || '4px';
              accentBase.borderTopLeftRadius = widget.props.borderRadius || '1.5rem';
              accentBase.borderTopRightRadius = widget.props.borderRadius || '1.5rem';
            } else {
              accentBase.top = '0';
              accentBase.bottom = '0';
              accentBase.left = '0';
              accentBase.width = widget.props.accentThickness || '4px';
              accentBase.borderTopLeftRadius = widget.props.borderRadius || '1.5rem';
              accentBase.borderBottomLeftRadius = widget.props.borderRadius || '1.5rem';
            }
            const accentClass = showAccentBar ? registerStyle('pricing-accent', accentBase) : '';

            const badgeClass = widget.props.badgeText
              ? registerStyle('pricing-badge', {
                  alignSelf: alignment === 'center' ? 'center' : 'flex-start',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  backgroundColor: widget.props.badgeBackground || 'rgba(59,130,246,0.12)',
                  color: widget.props.badgeColor || '#1d4ed8'
                })
              : '';

            const titleClass = registerStyle('pricing-title', {
              fontSize: '2rem',
              margin: 0,
              color: widget.props.titleColor || '#0f172a'
            });

            const subtitleClass = widget.props.subtitle
              ? registerStyle('pricing-subtitle', {
                  fontSize: '1rem',
                  color: widget.props.subtitleColor || '#2563eb',
                  margin: 0,
                  fontWeight: 600
                })
              : '';

            const descriptionClass = widget.props.description
              ? registerStyle('pricing-description', {
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: widget.props.descriptionColor || '#475569',
                  margin: 0
                })
              : '';

            const priceRowClass = registerStyle('pricing-price-row', {
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: '0.75rem',
              justifyContent: alignment === 'center' ? 'center' : 'flex-start'
            });

            const priceClass = registerStyle('pricing-price', {
              fontSize: '3rem',
              fontWeight: 700,
              color: widget.props.priceColor || '#0f172a',
              lineHeight: 1
            });

            const suffixClass = registerStyle('pricing-suffix', {
              fontSize: '1rem',
              color: widget.props.priceSuffixColor || '#475569'
            });

            const originalClass = showOriginalPrice
              ? registerStyle('pricing-original', {
                  fontSize: '1rem',
                  color: widget.props.originalPriceColor || '#94a3b8',
                  textDecoration: 'line-through'
                })
              : '';

            const featureListClass = showFeatures
              ? registerStyle('pricing-features', {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                })
              : '';

            const featureItemClass = registerStyle('pricing-feature-item', {
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.95rem',
              color: '#1f2937'
            });

            const limitedFeatureClass = showLimited
              ? registerStyle('pricing-limited-feature', {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.95rem',
                  color: '#94a3b8'
                })
              : '';

            const guaranteeClass = showGuarantee
              ? registerStyle('pricing-guarantee', {
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: widget.props.guaranteeColor || '#16a34a',
                  textAlign
                })
              : '';

            const footnoteClass = showFooterNote
              ? registerStyle('pricing-footnote', {
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  textAlign
                })
              : '';

            const CTAIconNode = widget.props.ctaIconUpload ? (
              <img src={widget.props.ctaIconUpload} alt="cta icon" className="h-4 w-4" />
            ) : (() => {
              const iconName = normalizeIconName(widget.props.ctaIconName || 'ArrowRight');
              const IconComponent = iconName && (LucideIcons as any)[iconName] ? (LucideIcons as any)[iconName] : ArrowRight;
              return widget.props.ctaIconName || widget.props.ctaIconUpload ? <IconComponent className="h-4 w-4" /> : null;
            })();

            const renderIncludedIcon = () => {
              if (widget.props.featureIconUpload) {
                return <img src={widget.props.featureIconUpload} alt="feature" className="h-4 w-4" />;
              }
              return <FeatureIcon className="h-4 w-4" style={{ color: widget.props.featureIconColor || '#16a34a' }} />;
            };

            const renderLimitedIcon = () => {
              if (widget.props.limitedFeatureIconUpload) {
                return <img src={widget.props.limitedFeatureIconUpload} alt="limited" className="h-4 w-4" />;
              }
              return <LimitedIcon className="h-4 w-4" style={{ color: widget.props.limitedFeatureIconColor || '#ef4444' }} />;
            };

            return (
              <div className={cardClass}>
                {showAccentBar && <span className={accentClass} />}
                {widget.props.badgeText && <span className={badgeClass}>{widget.props.badgeText}</span>}
                {widget.props.subtitle && <p className={subtitleClass}>{widget.props.subtitle}</p>}
                {widget.props.title && <h3 className={titleClass}>{widget.props.title}</h3>}
                {widget.props.description && <p className={descriptionClass}>{widget.props.description}</p>}
                <div className={priceRowClass}>
                  <div className="flex items-baseline gap-2">
                    <span className={priceClass}>{displayPrice || currencySymbol}</span>
                    {widget.props.priceSuffix && <span className={suffixClass}>{widget.props.priceSuffix}</span>}
                  </div>
                  {displayOriginalPrice && <span className={originalClass}>{displayOriginalPrice}</span>}
                </div>
                {widget.props.priceLabel && (
                  <p className="text-sm font-medium" style={{ color: '#1e293b', textAlign }}>{widget.props.priceLabel}</p>
                )}
                {widget.props.priceSubtext && (
                  <p className="text-sm" style={{ color: '#94a3b8', textAlign }}>{widget.props.priceSubtext}</p>
                )}
                {showFeatures && (
                  <div className={featureListClass}>
                    {includedFeatures.map((feature, idx) => (
                      <div key={`${widget.id}-feature-${idx}`} className={featureItemClass}>
                        {renderIncludedIcon()}
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showLimited && (
                  <div className="flex flex-col gap-2">
                    {limitedFeatures.map((feature, idx) => (
                      <div key={`${widget.id}-limited-${idx}`} className={limitedFeatureClass}>
                        {renderLimitedIcon()}
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {widget.props.buttonText && (
                    <a href={widget.props.buttonHref || '#'} className={buttonClass}>
                      {CTAIconNode && widget.props.ctaIconPosition === 'left' && CTAIconNode}
                      <span>{widget.props.buttonText}</span>
                      {CTAIconNode && widget.props.ctaIconPosition !== 'left' && CTAIconNode}
                    </a>
                  )}
                  {showSecondaryButton && (
                    <a href={widget.props.secondaryButtonHref || '#'} className={secondaryButtonClass}>
                      {widget.props.secondaryButtonText}
                    </a>
                  )}
                </div>
                {showGuarantee && <p className={guaranteeClass}>{widget.props.guaranteeText}</p>}
                {showFooterNote && <p className={footnoteClass}>{widget.props.footerNote}</p>}
              </div>
            );
          })()}
          {widget.type === 'testimonial' && (() => {
            const normalizeIconName = (name?: string) => {
              if (!name) return undefined;
              if ((LucideIcons as any)[name]) return name;
              const formatted = name
                .split(/[\s_-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              return (LucideIcons as any)[formatted] ? formatted : undefined;
            };

            const layoutVariant = widget.props.layoutVariant || 'card';
            const alignment = widget.props.alignment === 'center' ? 'center' : 'left';
            const textAlign = alignment;
            const showQuoteIcon = widget.props.showQuoteIcon !== false;
            const showAvatar = widget.props.showAvatar !== false;
            const showRating = widget.props.showRating !== false && typeof widget.props.rating === 'number';
            const showCTA = widget.props.showCTA !== false && widget.props.ctaText;
            const showLogos = widget.props.showLogos !== false && Array.isArray(widget.props.logos) && widget.props.logos.length > 0;

            const quoteText = widget.props.quote || '';
            const highlightText = (widget.props.highlightText || '').trim();
            const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightParts = highlightText
              ? quoteText.split(new RegExp(`(${escapeRegExp(highlightText)})`, 'gi')).filter(Boolean)
              : [quoteText];

            const backgroundGradient = (widget.props.backgroundGradient || '').toString().trim();
            const logos = Array.isArray(widget.props.logos) ? widget.props.logos : [];

            const cardClass = registerStyle('testimonial-card', {
              position: 'relative',
              width: '100%',
              maxWidth: widget.props.maxWidth || '640px',
              padding: widget.props.cardPadding || '2.5rem',
              borderRadius: widget.props.borderRadius || '1.75rem',
              borderWidth: widget.props.borderWidth || (layoutVariant === 'minimal' ? '0px' : '1px'),
              borderStyle: 'solid',
              borderColor: widget.props.borderColor || 'rgba(255,255,255,0.15)',
              boxShadow: layoutVariant === 'minimal' ? 'none' : widget.props.boxShadow || '0 35px 65px rgba(15,23,42,0.35)',
              backgroundColor: backgroundGradient ? undefined : widget.props.backgroundColor || '#0f172a',
              backgroundImage: backgroundGradient || undefined,
              textAlign,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              color: widget.props.quoteColor || '#ffffff'
            });

            const quoteLineHeight = typeof widget.props.quoteLineHeight === 'number'
              ? widget.props.quoteLineHeight
              : parseFloat(widget.props.quoteLineHeight) || 1.5;

            const quoteClass = registerStyle('testimonial-quote', {
              fontSize: `${widget.props.quoteSize || 1.4}rem`,
              lineHeight: quoteLineHeight,
              fontStyle: widget.props.quoteItalic === false ? 'normal' : 'italic',
              margin: 0,
              color: widget.props.quoteColor || '#ffffff'
            });

            const highlightClass = registerStyle('testimonial-highlight', {
              color: widget.props.highlightColor || '#fde047',
              fontWeight: 600
            });

            const quoteIconClass = showQuoteIcon
              ? registerStyle('testimonial-quote-icon', {
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '1rem',
                  backgroundColor: widget.props.quoteIconBackground || '#fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: widget.props.quoteIconColor || '#0f172a'
                })
              : '';

            const authorRowClass = registerStyle('testimonial-author-row', {
              display: 'flex',
              alignItems: 'center',
              justifyContent: alignment === 'center' ? 'center' : 'flex-start',
              gap: '1rem',
              textAlign
            });

            const authorNameClass = registerStyle('testimonial-author-name', {
              fontSize: '1.1rem',
              fontWeight: 600,
              color: widget.props.authorColor || '#ffffff',
              margin: 0
            });

            const authorRoleClass = registerStyle('testimonial-author-role', {
              fontSize: '0.95rem',
              color: widget.props.roleColor || 'rgba(255,255,255,0.75)',
              margin: 0
            });

            const ratingRowClass = showRating
              ? registerStyle('testimonial-rating', {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                  alignItems: 'center',
                  justifyContent: alignment === 'center' ? 'center' : 'flex-start'
                })
              : '';

            const starClass = registerStyle('testimonial-star', {
              width: '1.1rem',
              height: '1.1rem',
              color: widget.props.starColor || '#facc15'
            });

            const ratingLabelClass = registerStyle('testimonial-rating-label', {
              fontSize: '0.9rem',
              color: widget.props.ratingColor || 'rgba(255,255,255,0.85)'
            });

            const ctaButtonClass = showCTA
              ? registerStyle('testimonial-cta', {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: widget.props.ctaPadding || '0.85rem 1.6rem',
                  borderRadius: widget.props.ctaBorderRadius || '999px',
                  backgroundColor: widget.props.ctaBackground || '#fde047',
                  color: widget.props.ctaTextColor || '#0f172a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  alignSelf: alignment === 'center' ? 'center' : 'flex-start'
                })
              : '';
            if (showCTA) {
              widgetStyles.push(buildCssBlock(`.${ctaButtonClass}:hover`, {
                backgroundColor: widget.props.ctaHoverBackground || widget.props.ctaBackground || '#facc15',
                color: widget.props.ctaHoverTextColor || widget.props.ctaTextColor || '#0f172a'
              }));
            }

            const logosRowClass = showLogos
              ? registerStyle('testimonial-logos', {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  justifyContent: alignment === 'center' ? 'center' : 'flex-start',
                  color: widget.props.logoTextColor || 'rgba(255,255,255,0.6)',
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                })
              : '';

            const QuoteIconName = normalizeIconName(widget.props.quoteIconName || 'MessageSquare');
            const QuoteIcon = (QuoteIconName && (LucideIcons as any)[QuoteIconName]) || MessageSquare;
            const quoteIconNode = widget.props.quoteIconUpload ? (
              <img src={widget.props.quoteIconUpload} alt="quote" className="h-5 w-5" />
            ) : (
              <QuoteIcon className="h-5 w-5" />
            );

            const ratingValue = typeof widget.props.rating === 'number'
              ? Math.max(0, Math.min(5, widget.props.rating))
              : 0;

            const renderQuote = () => (
              <p className={quoteClass}>
                {highlightParts.map((part, idx) => (
                  highlightText && part.toLowerCase() === highlightText.toLowerCase() ? (
                    <span key={`${widget.id}-highlight-${idx}`} className={highlightClass}>{part}</span>
                  ) : (
                    <React.Fragment key={`${widget.id}-quote-${idx}`}>{part}</React.Fragment>
                  )
                ))}
              </p>
            );

            const avatarSize = widget.props.avatarSize || '64px';
            const avatarBorderRadius = widget.props.avatarShape === 'rounded' ? '1rem' : '999px';
            const avatarNode = widget.props.avatar ? (
              <img
                src={widget.props.avatar}
                alt={widget.props.author || 'Author avatar'}
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarBorderRadius,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: widget.props.authorColor || '#ffffff'
                }}
              >
                {widget.props.author?.[0] || 'A'}
              </div>
            );

            return (
              <div className={cardClass}>
                {showQuoteIcon && <div className={quoteIconClass}>{quoteIconNode}</div>}
                {renderQuote()}
                {showRating && (
                  <div className={ratingRowClass}>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={`${widget.id}-testimonial-star-${idx}`}
                          className={starClass}
                          style={{ opacity: ratingValue >= idx + 0.25 ? 1 : 0.2, fill: ratingValue >= idx + 0.25 ? (widget.props.starColor || '#facc15') : 'transparent' }}
                        />
                      ))}
                    </div>
                    {widget.props.ratingLabel && <span className={ratingLabelClass}>{widget.props.ratingLabel}</span>}
                  </div>
                )}
                <div className={authorRowClass}>
                  {showAvatar && avatarNode}
                  <div className="space-y-1" style={{ textAlign }}>
                    {widget.props.author && <p className={authorNameClass}>{widget.props.author}</p>}
                    {(widget.props.role || widget.props.company) && (
                      <p className={authorRoleClass}>
                        {[widget.props.role, widget.props.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                {showCTA && (
                  <a href={widget.props.ctaHref || '#'} className={ctaButtonClass}>
                    <span>{widget.props.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                {showLogos && (
                  <div className={logosRowClass}>
                    {logos.map((logo: string, idx: number) => (
                      <span key={`${widget.id}-logo-${idx}`}>{logo}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Special widgets */}
          {widget.type === 'countdown' && (
            <div 
              className="p-4 text-center rounded"
              style={{ 
                backgroundColor: widget.props.backgroundColor,
                color: widget.props.textColor
              }}
            >
              <div className="mb-3">{widget.props.title}</div>
              <div className="flex justify-center gap-3">
                {widget.props.showDays && (
                  <div>
                    <div className="text-2xl font-bold">00</div>
                    <div className="text-xs">Days</div>
                  </div>
                )}
                {widget.props.showHours && (
                  <div>
                    <div className="text-2xl font-bold">00</div>
                    <div className="text-xs">Hours</div>
                  </div>
                )}
                {widget.props.showMinutes && (
                  <div>
                    <div className="text-2xl font-bold">00</div>
                    <div className="text-xs">Minutes</div>
                  </div>
                )}
                {widget.props.showSeconds && (
                  <div>
                    <div className="text-2xl font-bold">00</div>
                    <div className="text-xs">Seconds</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {widget.type === 'map' && (
            <div 
              className="bg-gray-200 flex items-center justify-center"
              style={{ height: widget.props.height }}
            >
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600">{widget.props.markerTitle}</div>
              </div>
            </div>
          )}
          {widget.type === 'weather' && (
            <div 
              className="p-4 rounded"
              style={{ 
                backgroundColor: widget.props.backgroundColor,
                color: widget.props.textColor
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">22°C</div>
                  <div className="text-sm">{widget.props.location}</div>
                </div>
                <Cloud className="h-12 w-12" />
              </div>
              {widget.props.showForecast && (
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3].map((_, idx) => (
                    <div key={idx} className="flex-1 text-center text-xs">
                      <Cloud className="h-6 w-6 mx-auto mb-1" />
                      <div>20°</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {widget.type === 'socialShare' && (
            <div className="flex items-center" style={{ gap: widget.props.gap }}>
              {widget.props.platforms?.map((platform: string, idx: number) => {
                const icons: Record<string, any> = {
                  facebook: Facebook,
                  twitter: Twitter,
                  linkedin: Linkedin,
                  instagram: Instagram,
                  whatsapp: MessageSquare
                };
                const Icon = icons[platform] || Share2;
                return (
                  <button
                    key={idx}
                    className="flex items-center justify-center"
                    style={{
                      width: widget.props.size === 'small' ? '32px' : widget.props.size === 'large' ? '48px' : '40px',
                      height: widget.props.size === 'small' ? '32px' : widget.props.size === 'large' ? '48px' : '40px',
                      borderRadius: widget.props.borderRadius,
                      backgroundColor: '#e0e0e0'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {widget.props.showLabels && <span className="ml-2 text-sm">{platform}</span>}
                  </button>
                );
              })}
            </div>
          )}
          {widget.type === 'rating' && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(widget.props.max)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="transition-colors"
                    style={{
                      width: widget.props.size,
                      height: widget.props.size,
                      color: i < widget.props.value ? widget.props.color : widget.props.emptyColor,
                      fill: i < widget.props.value ? widget.props.color : 'none'
                    }}
                  />
                ))}
              </div>
              {widget.props.showValue && (
                <span className="text-sm text-gray-600">
                  {widget.props.value}/{widget.props.max}
                </span>
              )}
            </div>
          )}
          {widget.type === 'timeline' && (
            <div className="space-y-4">
              {widget.props.items?.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <div className="relative">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: widget.props.dotColor }}
                    />
                    {idx < 2 && (
                      <div 
                        className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-8"
                        style={{ backgroundColor: widget.props.lineColor }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {widgetStyles.length > 0 && <style>{widgetStyles.join('\n')}</style>}
      </div>
    );
  };

  const CanvasPropertiesPanel = () => {
    const renderColorField = (label: string, key: 'backgroundColor' | 'borderColor' | 'gridColor') => {
      const value = (canvasSettings[key] as string) || '#ffffff';
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={value}
              onChange={(e) => handleCanvasSettingChange(key, e.target.value)}
              className="h-10 w-14 p-1"
            />
            <Input
              value={value}
              onChange={(e) => handleCanvasSettingChange(key, e.target.value)}
            />
          </div>
        </div>
      );
    };

    const renderSliderControl = (
      label: string,
      key: 'extraWidthPadding' | 'extraHeightPadding' | 'gridSize',
      min: number,
      max: number,
      step: number,
      unit: string = 'px'
    ) => {
      const rawValue = Number(canvasSettings[key]);
      const value = Number.isFinite(rawValue) ? rawValue : min;
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{label}</Label>
            <span className="text-xs text-muted-foreground">{Math.round(value)}{unit}</span>
          </div>
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={([val]) => handleCanvasSettingChange(key, val)}
          />
        </div>
      );
    };

    return (
      <div className="space-y-6 p-4">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <h3 className="font-semibold text-sm text-blue-900">Canvas Controls</h3>
          <p className="text-xs text-blue-700 mt-1">
            Configure the overall layout, spacing, and helper grid that wrap all widgets on the canvas.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Layout</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select
                value={canvasSettings.align}
                onValueChange={(val) => handleCanvasSettingChange('align', val as CanvasSettings['align'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Padding</Label>
              <Input
                value={canvasSettings.padding}
                onChange={(e) => handleCanvasSettingChange('padding', e.target.value)}
                placeholder="e.g., 2rem"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Min Width</Label>
              <Input
                value={canvasSettings.minWidth}
                onChange={(e) => handleCanvasSettingChange('minWidth', e.target.value)}
                placeholder="1200px"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Width</Label>
              <Input
                value={canvasSettings.maxWidth}
                onChange={(e) => handleCanvasSettingChange('maxWidth', e.target.value)}
                placeholder="1600px"
              />
            </div>
            <div className="space-y-2">
              <Label>Min Height</Label>
              <Input
                value={canvasSettings.minHeight}
                onChange={(e) => handleCanvasSettingChange('minHeight', e.target.value)}
                placeholder="1000px"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Height</Label>
              <Input
                value={canvasSettings.maxHeight}
                onChange={(e) => handleCanvasSettingChange('maxHeight', e.target.value)}
                placeholder="2000px"
              />
            </div>
          </div>
          {renderSliderControl('Horizontal Padding Buffer', 'extraWidthPadding', 0, 600, 10)}
          {renderSliderControl('Vertical Padding Buffer', 'extraHeightPadding', 0, 600, 10)}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Visual Style</h4>
          {renderColorField('Background Color', 'backgroundColor')}
          <div className="space-y-2">
            <Label>Background Gradient</Label>
            <Input
              value={canvasSettings.backgroundGradient}
              onChange={(e) => handleCanvasSettingChange('backgroundGradient', e.target.value)}
              placeholder="linear-gradient(...)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Input
                value={canvasSettings.borderRadius}
                onChange={(e) => handleCanvasSettingChange('borderRadius', e.target.value)}
                placeholder="24px"
              />
            </div>
            <div className="space-y-2">
              <Label>Border Width</Label>
              <Input
                value={canvasSettings.borderWidth}
                onChange={(e) => handleCanvasSettingChange('borderWidth', e.target.value)}
                placeholder="1px"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Border Style</Label>
            <Select
              value={canvasSettings.borderStyle}
              onValueChange={(val) => handleCanvasSettingChange('borderStyle', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="solid" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderColorField('Border Color', 'borderColor')}
          <div className="space-y-2">
            <Label>Shadow</Label>
            <Input
              value={canvasSettings.shadow}
              onChange={(e) => handleCanvasSettingChange('shadow', e.target.value)}
              placeholder="CSS box-shadow value"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Grid Overlay</h4>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <Label>Show Grid</Label>
              <p className="text-xs text-muted-foreground">Helpful for spacing while editing</p>
            </div>
            <Switch
              checked={canvasSettings.showGrid}
              onCheckedChange={(checked) => handleCanvasSettingChange('showGrid', checked)}
            />
          </div>
          {canvasSettings.showGrid && (
            <div className="space-y-4">
              {renderSliderControl('Grid Size', 'gridSize', 10, 160, 5)}
              {renderColorField('Grid Color', 'gridColor')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
    <DashboardLayout>
      <div className="flex flex-col h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Top toolbar */}
        <div className="border-b bg-white px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold">{t('nav.website_edit')}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex === 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} size="sm" disabled={isPersistingState}>
              <Save className="h-4 w-4 mr-2" />
              {isPersistingState ? 'Saving...' : 'Save Page'}
            </Button>
          </div>
        </div>

        {/* Main content area with three panels */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANEL - Widgets Library */}
          <div 
            className={`border-r bg-gray-50 overflow-hidden flex flex-col transition-all duration-300 ${
              isWidgetPanelCollapsed ? 'w-14' : 'w-80'
            }`}
          >
            {!isWidgetPanelCollapsed ? (
              <>
                <div className="p-4 border-b bg-white flex items-center justify-between">
                  <div className="flex-1">
                    {/* Main section tabs */}
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant={activeMainTab === 'widgets' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveMainTab('widgets')}
                        className="flex-1"
                      >
                        Widgets
                      </Button>
                      <Button
                        variant={activeMainTab === 'templates' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveMainTab('templates')}
                        className="flex-1"
                      >
                        Templates
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      {activeMainTab === 'widgets' ? 'Drag widgets onto canvas' : 'Choose a template to start'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWidgetPanelCollapsed(true)}
                    className="h-8 w-8 p-0 ml-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  {activeMainTab === 'widgets' ? (
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full justify-start px-4 pt-4 flex-wrap h-auto gap-1">
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                      <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
                      <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
                      <TabsTrigger value="interactive" className="text-xs">Interactive</TabsTrigger>
                      <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                      <TabsTrigger value="navigation" className="text-xs">Navigation</TabsTrigger>
                      <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
                      <TabsTrigger value="forms" className="text-xs">Forms</TabsTrigger>
                      <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
                      <TabsTrigger value="commerce" className="text-xs">Commerce</TabsTrigger>
                      <TabsTrigger value="special" className="text-xs">Special</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {widgetLibrary.map((widget) => (
                          <div
                            key={widget.type}
                            draggable
                            onDragStart={() => handleDragStart(widget)}
                            className="flex flex-col items-center justify-center gap-2 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all aspect-square"
                          >
                            <widget.icon className="h-6 w-6 text-gray-600" />
                            <span className="text-xs font-medium text-center">{widget.label}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {['basic', 'layout', 'interactive', 'content', 'navigation', 'data', 'forms', 'media', 'commerce', 'special'].map((category) => (
                      <TabsContent key={category} value={category} className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {widgetLibrary
                            .filter((w) => w.category === category)
                            .map((widget) => (
                              <div
                                key={widget.type}
                                draggable
                                onDragStart={() => handleDragStart(widget)}
                                className="flex flex-col items-center justify-center gap-2 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all aspect-square"
                              >
                                <widget.icon className="h-6 w-6 text-gray-600" />
                                <span className="text-xs font-medium text-center">{widget.label}</span>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  ) : (
                    // Templates Section
                    <div className="p-4">
                      <div className="space-y-4">
                        {templates.map((template) => (
                          <Card
                            key={template.id}
                            className="p-4 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-start gap-4">
                              <div className="text-4xl">{template.thumbnail}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                                <p className="text-sm text-gray-600">{template.description}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                  <Layout className="h-3 w-3" />
                                  <span>{template.widgets.length} sections</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditTemplate(template.id)}
                              >
                                {editingTemplateId === template.id ? 'Continue Editing' : 'Edit Template'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveTemplate(template.id)}
                                disabled={editingTemplateId !== template.id}
                              >
                                Save Template
                              </Button>
                            </div>
                            {editingTemplateId === template.id && (
                              <p className="mt-2 text-xs text-blue-600 font-medium">
                                Editing in progress — make changes on the canvas and save when ready.
                              </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWidgetPanelCollapsed(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-3">
                  {widgetLibrary.slice(0, 5).map((widget) => (
                    <div
                      key={widget.type}
                      draggable
                      onDragStart={() => handleDragStart(widget)}
                      title={widget.label}
                      className="flex items-center justify-center p-2 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <widget.icon className="h-5 w-5 text-gray-600" />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 transform -rotate-90 whitespace-nowrap mt-8">
                  Widgets
                </div>
              </div>
            )}
          </div>

          {/* CENTER PANEL - Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100">
            <ScrollArea className="h-full">
              <div
                className="min-h-full p-8 overflow-auto"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => setSelectedWidget(null)}
              >
                {canvasWidgets.length === 0 ? (
                  <div className="flex items-center justify-center h-96 border-4 border-dashed border-gray-300 rounded-lg bg-white">
                    <div className="text-center">
                      <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2">
                        Start Building Your Page
                      </h3>
                      <p className="text-gray-500">
                        Drag widgets from the left panel and drop them here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="canvas-container relative"
                    style={editCanvasStyle}
                    onMouseMove={handleRepositionMove}
                    onMouseUp={handleRepositionEnd}
                    onMouseLeave={handleRepositionEnd}
                  >
                    {canvasSettings.showGrid && (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[inherit]"
                        style={{
                          backgroundImage: `linear-gradient(90deg, ${canvasGridColor} 1px, transparent 1px), linear-gradient(0deg, ${canvasGridColor} 1px, transparent 1px)`,
                          backgroundSize: `${canvasGridSize}px ${canvasGridSize}px`,
                          opacity: 0.25,
                          zIndex: 0
                        }}
                      />
                    )}
                    {canvasWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        className={`canvas-widget-wrapper absolute group transition-shadow ${
                          selectedWidget?.id === widget.id ? 'ring-2 ring-blue-500' : ''
                        } ${
                          repositioningWidget?.id === widget.id ? 'shadow-2xl z-50 widget-dragging' : 'hover:shadow-lg'
                        }`}
                        style={{
                          left: `${widget.props.x || 0}px`,
                          top: `${widget.props.y || 0}px`,
                          width: widget.props.width || 'auto',
                          height: widget.props.height || 'auto',
                          userSelect: 'none',
                          cursor: isDraggingPosition && repositioningWidget?.id === widget.id ? 'grabbing' : 'grab',
                          transition: isDraggingPosition && repositioningWidget?.id === widget.id ? 'none' : 'box-shadow 0.2s',
                          zIndex: 1
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleRepositionStart(widget, e);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDraggingPosition) {
                            setSelectedWidget(widget);
                          }
                        }}
                      >
                        {/* Widget controls */}
                        <div className="absolute -top-8 left-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded-t text-xs z-10">
                          <GripVertical className="h-3 w-3" />
                          <span className="flex-1 font-medium">{widget.type}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateWidget(widget);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-red-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWidget(widget.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {renderWidget(widget, false, false)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT PANEL - Properties */}
          <div
            className={`border-l bg-white overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${
              isPropertiesPanelCollapsed ? 'w-14' : 'w-80'
            }`}
          >
            {!isPropertiesPanelCollapsed ? (
              <Tabs
                value={activePropertiesPanel}
                onValueChange={(val) => setActivePropertiesPanel(val as 'canvas' | 'widget')}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg mb-1 text-gray-900">Properties</h2>
                      <p className="text-sm text-gray-600">
                        {propertyPanelDescription}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPropertiesPanelCollapsed(true)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <TabsList className="mt-4 grid grid-cols-2">
                    <TabsTrigger value="canvas">Canvas</TabsTrigger>
                    <TabsTrigger value="widget">Widget</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="canvas" className="flex-1 min-h-0 focus-visible:outline-none">
                  <ScrollArea className="h-full">
                    <CanvasPropertiesPanel />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="widget" className="flex-1 min-h-0 focus-visible:outline-none">
                  <ScrollArea className="h-full">
                    {selectedWidget ? (
                      <div className="p-4">
                        <PropertyEditor
                          widget={selectedWidget}
                          onUpdate={handleUpdateProperty}
                          onUpdateMultiple={handleUpdateProperties}
                          onDelete={handleDeleteWidget}
                          onDuplicate={handleDuplicateWidget}
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                          <Settings className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-700 mb-2">No Widget Selected</h3>
                        <p className="text-sm">Click on a widget in the canvas to edit its properties</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center py-4 gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPropertiesPanelCollapsed(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="text-xs text-gray-400 transform -rotate-90 whitespace-nowrap mt-8">
                  Properties
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>

    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="max-w-[95vw] w-[1300px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Page Preview</DialogTitle>
          <DialogDescription>
            Preview shows a read-only snapshot of your current layout.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] rounded-lg border bg-gray-100">
          {canvasWidgets.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              Add widgets to see a preview.
            </div>
          ) : (
            <div 
              className="relative mx-auto my-6"
              style={previewCanvasStyle}
            >
              {canvasSettings.showGrid && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${canvasGridColor} 1px, transparent 1px), linear-gradient(0deg, ${canvasGridColor} 1px, transparent 1px)`,
                    backgroundSize: `${canvasGridSize}px ${canvasGridSize}px`,
                    opacity: 0.25,
                    zIndex: 0
                  }}
                />
              )}
              {canvasWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="absolute"
                  style={{
                    left: `${widget.props.x || 0}px`,
                    top: `${widget.props.y || 0}px`,
                    width: widget.props.width || 'auto',
                    height: widget.props.height || 'auto',
                    zIndex: 1
                  }}
                >
                  {renderWidget(widget, false, false, 'preview')}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
}
