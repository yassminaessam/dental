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
  Code,
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
  AtSign
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PropertyEditor } from "@/components/website-builder/PropertyEditor";
import type { Widget, WidgetDefinition, NavLink } from "@/types/website-builder";
import { normalizeNavLinks } from "@/lib/website-builder";

type StyleValue = string | number | null | undefined;

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
      label: 'Total Sales',
      icon: 'trending-up',
      change: '+12%',
      changeType: 'positive',
      backgroundColor: '#f8f9fa',
      iconColor: '#0066cc'
    }
  },
  // Forms & Inputs
  {
    type: 'searchBar',
    label: 'Search Bar',
    icon: Search,
    category: 'forms',
    defaultProps: {
      placeholder: 'Search...',
      buttonText: 'Search',
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      borderWidth: '1px',
      borderColor: '#e0e0e0',
      showButton: true,
      showIcon: true
    }
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    category: 'forms',
    defaultProps: {
      title: 'Subscribe to our Newsletter',
      description: 'Get the latest updates delivered to your inbox',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      backgroundColor: '#f8f9fa',
      buttonColor: '#0066cc',
      padding: '2rem'
    }
  },
  {
    type: 'contactInfo',
    label: 'Contact Info',
    icon: Phone,
    category: 'forms',
    defaultProps: {
      phone: '+1 234 567 8900',
      email: 'info@example.com',
      address: '123 Main St, City, Country',
      showIcons: true,
      iconColor: '#0066cc',
      textColor: '#333333',
      fontSize: '1rem'
    }
  },
  // Media
  {
    type: 'gallery',
    label: 'Image Gallery',
    icon: Grid,
    category: 'media',
    defaultProps: {
      images: [],
      columns: 3,
      gap: '1rem',
      borderRadius: '0.5rem',
      aspectRatio: '16/9',
      lightbox: true,
      captions: false
    }
  },
  {
    type: 'carousel',
    label: 'Carousel',
    icon: Layers,
    category: 'media',
    defaultProps: {
      slides: [],
      autoplay: true,
      interval: 5000,
      showIndicators: true,
      showArrows: true,
      height: '400px',
      borderRadius: '0'
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
      title: 'Product Name',
      price: '$99.99',
      originalPrice: '$129.99',
      image: '',
      rating: 4.5,
      badge: 'Sale',
      badgeColor: '#ff4444',
      buttonText: 'Add to Cart',
      currency: '$'
    }
  },
  {
    type: 'pricing',
    label: 'Pricing Table',
    icon: CreditCard,
    category: 'commerce',
    defaultProps: {
      title: 'Basic Plan',
      price: '$29',
      period: '/month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      buttonText: 'Choose Plan',
      featured: false,
      backgroundColor: '#ffffff',
      accentColor: '#0066cc'
    }
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    icon: MessageSquare,
    category: 'commerce',
    defaultProps: {
      quote: 'This is an amazing product that has helped our business grow significantly.',
      author: 'John Doe',
      role: 'CEO, Company',
      avatar: '',
      rating: 5,
      backgroundColor: '#f8f9fa',
      quoteIcon: true
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
  const [draggedWidget, setDraggedWidget] = React.useState<WidgetDefinition | null>(null);
  const [draggedExistingWidget, setDraggedExistingWidget] = React.useState<Widget | null>(null);
  const [dropTargetSection, setDropTargetSection] = React.useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = React.useState<number | null>(null);
  const [isWidgetPanelCollapsed, setIsWidgetPanelCollapsed] = React.useState(false);
  const [isDraggingPosition, setIsDraggingPosition] = React.useState(false);
  const [repositioningWidget, setRepositioningWidget] = React.useState<Widget | null>(null);
  const [dragStartPos, setDragStartPos] = React.useState({ x: 0, y: 0 });
  const [widgetStartPos, setWidgetStartPos] = React.useState({ x: 0, y: 0 });
  const [activeMainTab, setActiveMainTab] = React.useState<'widgets' | 'templates'>('widgets');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [accordionState, setAccordionState] = React.useState<Record<string, boolean>>({});

  type TemplateDefinition = {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    widgets: Widget[];
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
      ]
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
      ]
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
      ]
    }
  ];

  const TEMPLATE_STORAGE_KEY = 'websiteBuilderTemplates';
  const [templates, setTemplates] = React.useState<TemplateDefinition[]>(initialTemplates);
  const [editingTemplateId, setEditingTemplateId] = React.useState<string | null>(null);
  const [templatesHydrated, setTemplatesHydrated] = React.useState(false);

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
      case 'navbar':
        return 80;
      case 'footer':
        return 150;
      case 'section':
        return 400;
      default:
        return 200;
    }
  };

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

  // Apply template to canvas
  const applyTemplate = (template: TemplateDefinition) => {
    const clonedWidgets = template.widgets.map((widget) => cloneWidgetWithNewIds(widget));
    const arrangedWidgets = template.id === 'template1'
      ? normalizeTemplateSections(clonedWidgets)
      : clonedWidgets;

    setCanvasWidgets(arrangedWidgets);
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

  const handleSaveTemplate = (templateId: string) => {
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

    const updatedTemplate = {
      ...template,
      widgets: cloneWidgetsForStorage(canvasWidgets),
    };

    setTemplates((prev) => prev.map((t) => (t.id === templateId ? updatedTemplate : t)));
    setEditingTemplateId(null);

    toast({
      title: "Template Saved",
      description: `${template.name} has been updated`,
    });
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTemplates(parsed as TemplateDefinition[]);
        }
      }
    } catch (error) {
      console.error('Failed to load saved templates', error);
    } finally {
      setTemplatesHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!templatesHydrated || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to persist templates', error);
    }
  }, [templates, templatesHydrated]);

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

  // Calculate next widget position (staggered to avoid overlap)
  const getNextPosition = () => {
    const count = canvasWidgets.length;
    const offsetX = (count * 20) % 400; // Stagger horizontally
    const offsetY = Math.floor(count / 20) * 150; // Stack after 20 widgets
    return { x: 50 + offsetX, y: 50 + offsetY };
  };

  // Create columns for a section
  const createColumns = (count: number): Widget[] => {
    return Array.from({ length: count }, (_, i) => ({
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
    const widgetX = widget.props.x || 0;
    const widgetY = widget.props.y || 0;
    
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
        width: draggedWidget.type === 'section' ? '800px' :
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
        height: draggedWidget.type === 'section' ? '400px' :
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
      let widgetsWithoutDragged = removeWidgetById(canvasWidgets, draggedExistingWidget.id);
      
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
          // Special handling for section column count change
          if (w.type === 'section' && property === 'columns') {
            const newColumnCount = parseInt(value);
            const currentColumnCount = w.children?.length || 0;
            let newChildren = w.children || [];
            
            if (newColumnCount > currentColumnCount) {
              // Add columns
              const columnsToAdd = newColumnCount - currentColumnCount;
              const newColumns = createColumns(columnsToAdd);
              newChildren = [...newChildren, ...newColumns];
            } else if (newColumnCount < currentColumnCount) {
              // Remove columns (only if they're empty)
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
      let widgetsWithoutDragged = removeWidgetById(canvasWidgets, draggedExistingWidget.id);
      
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
    try {
      // TODO: Implement API call to save the page
      toast({
        title: "Page Saved",
        description: "Your website has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the page. Please try again.",
        variant: "destructive"
      });
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
                      {/* Drop zone before child */}
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
                      
                      {/* Drop zone after last child */}
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
            const statsClass = registerStyle('stats', {
              backgroundColor: widget.props.backgroundColor
            });

            return (
              <div className={`p-4 rounded ${statsClass}`}>
                <div className="text-2xl font-bold">{widget.props.value}</div>
                <div className="text-sm text-gray-600">{widget.props.label}</div>
                {widget.props.change && (
                  <div className={`text-sm ${widget.props.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {widget.props.change}
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Forms & Inputs widgets */}
          {widget.type === 'searchBar' && (() => {
            const searchClass = registerStyle('search-bar', {
              backgroundColor: widget.props.backgroundColor,
              borderRadius: widget.props.borderRadius
            });

            return (
              <div className={`flex items-center gap-2 p-2 border rounded ${searchClass}`}>
                {widget.props.showIcon && <Search className="h-4 w-4 text-gray-400" />}
                <input 
                  type="text" 
                  placeholder={widget.props.placeholder}
                  className="flex-1 outline-none bg-transparent text-sm"
                />
                {widget.props.showButton && (
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                    {widget.props.buttonText}
                  </button>
                )}
              </div>
            );
          })()}
          {widget.type === 'newsletter' && (() => {
            const newsletterClass = registerStyle('newsletter', {
              backgroundColor: widget.props.backgroundColor,
              padding: widget.props.padding
            });

            const newsletterButtonClass = registerStyle('newsletter-button', {
              backgroundColor: widget.props.buttonColor
            });

            return (
              <div className={`text-center ${newsletterClass}`}>
                <h3 className="font-bold mb-2">{widget.props.title}</h3>
                <p className="text-sm mb-4">{widget.props.description}</p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder={widget.props.placeholder}
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <button 
                    className={`px-4 py-2 text-white rounded text-sm ${newsletterButtonClass}`}
                  >
                    {widget.props.buttonText}
                  </button>
                </div>
              </div>
            );
          })()}
          {widget.type === 'contactInfo' && (() => {
            const contactTextClass = registerStyle('contact-text', {
              color: widget.props.textColor,
              fontSize: widget.props.fontSize
            });

            const contactIconClass = widget.props.showIcons
              ? registerStyle('contact-icon', {
                  color: widget.props.iconColor
                })
              : '';

            return (
              <div className="space-y-2">
                {widget.props.phone && (
                  <div className="flex items-center gap-2">
                    {widget.props.showIcons && <Phone className={`h-4 w-4 ${contactIconClass}`} />}
                    <span className={contactTextClass}>
                      {widget.props.phone}
                    </span>
                  </div>
                )}
                {widget.props.email && (
                  <div className="flex items-center gap-2">
                    {widget.props.showIcons && <Mail className={`h-4 w-4 ${contactIconClass}`} />}
                    <span className={contactTextClass}>
                      {widget.props.email}
                    </span>
                  </div>
                )}
                {widget.props.address && (
                  <div className="flex items-center gap-2">
                    {widget.props.showIcons && <MapPin className={`h-4 w-4 ${contactIconClass}`} />}
                    <span className={contactTextClass}>
                      {widget.props.address}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Media widgets */}
          {widget.type === 'gallery' && (() => {
            const galleryGridClass = registerStyle('gallery-grid', {
              display: 'grid',
              gridTemplateColumns: `repeat(${widget.props.columns}, 1fr)`,
              gap: widget.props.gap
            });

            const galleryItemClass = registerStyle('gallery-item', {
              aspectRatio: widget.props.aspectRatio,
              borderRadius: widget.props.borderRadius
            });

            return (
              <div className={galleryGridClass}>
                {[1, 2, 3, 4].slice(0, widget.props.columns * 2).map((_, idx) => (
                  <div 
                    key={idx}
                    className={`bg-gray-200 ${galleryItemClass}`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          {widget.type === 'carousel' && (
            <div 
              className="relative bg-gray-200 flex items-center justify-center"
              style={{ 
                height: widget.props.height,
                borderRadius: widget.props.borderRadius
              }}
            >
              <ImageIcon className="h-12 w-12 text-gray-400" />
              {widget.props.showArrows && (
                <>
                  <ChevronLeft className="absolute left-2 h-6 w-6 text-white bg-black/50 rounded" />
                  <ChevronRight className="absolute right-2 h-6 w-6 text-white bg-black/50 rounded" />
                </>
              )}
              {widget.props.showIndicators && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {[1, 2, 3].map((_, idx) => (
                    <div key={idx} className="w-2 h-2 bg-white/50 rounded-full" />
                  ))}
                </div>
              )}
            </div>
          )}
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
          {widget.type === 'productCard' && (
            <div className="border rounded overflow-hidden">
              <div className="bg-gray-200 h-40 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-3">
                {widget.props.badge && (
                  <span 
                    className="text-xs px-2 py-1 rounded text-white"
                    style={{ backgroundColor: widget.props.badgeColor }}
                  >
                    {widget.props.badge}
                  </span>
                )}
                <h3 className="font-bold mt-2">{widget.props.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold">{widget.props.price}</span>
                  {widget.props.originalPrice && (
                    <span className="text-sm line-through text-gray-500">{widget.props.originalPrice}</span>
                  )}
                </div>
                {widget.props.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(widget.props.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                )}
                <button className="w-full mt-3 py-2 bg-blue-500 text-white rounded text-sm">
                  {widget.props.buttonText}
                </button>
              </div>
            </div>
          )}
          {widget.type === 'pricing' && (
            <div 
              className="border rounded p-4 text-center"
              style={{ 
                backgroundColor: widget.props.backgroundColor,
                borderColor: widget.props.featured ? widget.props.accentColor : undefined
              }}
            >
              <h3 className="font-bold text-lg">{widget.props.title}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{widget.props.price}</span>
                <span className="text-gray-600">{widget.props.period}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {widget.props.features?.map((feature: string, idx: number) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
              <button 
                className="w-full mt-4 py-2 rounded text-white"
                style={{ backgroundColor: widget.props.accentColor }}
              >
                {widget.props.buttonText}
              </button>
            </div>
          )}
          {widget.type === 'testimonial' && (
            <div 
              className="p-4 rounded"
              style={{ backgroundColor: widget.props.backgroundColor }}
            >
              {widget.props.quoteIcon && (
                <MessageSquare className="h-8 w-8 text-gray-300 mb-3" />
              )}
              <p className="italic mb-3">"{widget.props.quote}"</p>
              <div className="flex items-center gap-3">
                {widget.props.avatar ? (
                  <img src={widget.props.avatar} className="w-10 h-10 rounded-full" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300" />
                )}
                <div>
                  <div className="font-medium">{widget.props.author}</div>
                  <div className="text-sm text-gray-600">{widget.props.role}</div>
                </div>
              </div>
              {widget.props.rating && (
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < widget.props.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
          
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
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              View Code
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Page
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
                className="min-h-full p-8"
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
                    className="canvas-container bg-white shadow-lg rounded-lg relative" 
                    style={{ 
                      minHeight: '1000px', 
                      width: '1200px',
                      userSelect: isDraggingPosition ? 'none' : 'auto'
                    }}
                    onMouseMove={handleRepositionMove}
                    onMouseUp={handleRepositionEnd}
                    onMouseLeave={handleRepositionEnd}
                  >
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
                          transition: isDraggingPosition && repositioningWidget?.id === widget.id ? 'none' : 'box-shadow 0.2s'
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
          <div className="w-80 border-l bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="font-bold text-lg mb-1 text-gray-900">Properties</h2>
              <p className="text-sm text-gray-600">
                {selectedWidget ? 'Customize the selected widget' : 'Select a widget to edit'}
              </p>
            </div>
            
            <ScrollArea className="flex-1">
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
            <div className="relative mx-auto my-6 w-[1200px] min-h-[900px] rounded-2xl bg-white shadow-2xl">
              {canvasWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="absolute"
                  style={{
                    left: `${widget.props.x || 0}px`,
                    top: `${widget.props.y || 0}px`,
                    width: widget.props.width || 'auto',
                    height: widget.props.height || 'auto'
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
