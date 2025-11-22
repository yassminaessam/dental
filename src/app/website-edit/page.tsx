/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      borderRadius: '0',
      borderWidth: '0',
      borderColor: '#e0e0e0',
      borderStyle: 'solid',
      boxShadow: 'none',
      opacity: '1',
      filter: 'none',
      loading: 'lazy',
      aspectRatio: 'auto'
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
      align: 'center'
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
      size: '2rem', 
      color: '#0066cc',
      backgroundColor: 'transparent',
      borderRadius: '0',
      padding: '0',
      rotation: '0',
      flip: 'none'
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
      defaultOpen: false
    }
  },
  {
    type: 'form',
    label: 'Form',
    icon: MessageSquare,
    category: 'interactive',
    defaultProps: { 
      title: 'Contact Form',
      fields: ['name', 'email', 'message'], 
      submitText: 'Submit',
      action: ''
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
      buttonText: 'Get Started', 
      link: '#',
      backgroundColor: '#0066cc',
      color: '#ffffff'
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
      message: 'This is an alert message. It can be used to display important information to your users.',
      dismissible: false,
      icon: true,
      borderWidth: '1px',
      borderStyle: 'solid'
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
      links: [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' }
      ],
      backgroundColor: '#ffffff',
      color: '#333333',
      position: 'fixed',
      shadow: true,
      height: '60px'
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
      bordered: true,
      hoverable: true,
      headerBackground: '#f5f5f5',
      headerColor: '#333333'
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
      value: 60,
      max: 100,
      label: 'Progress',
      showPercentage: true,
      backgroundColor: '#e0e0e0',
      fillColor: '#0066cc',
      height: '20px',
      borderRadius: '10px',
      animated: true
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
        {widgetStyles.length > 0 && <style>{widgetStyles.join('\n')}</style>}
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
              <div className={headingClass}>
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
              <div className={textClass}>
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

            const containerClass = registerStyle('image-container', {
              width: widget.props.width || '100%',
              height: resolvedHeight || 'auto',
              minHeight: resolvedHeight || hasImage ? undefined : '200px',
              borderRadius: widget.props.borderRadius || '0',
              borderWidth: widget.props.borderWidth || '0',
              borderColor: widget.props.borderColor || 'transparent',
              borderStyle: widget.props.borderStyle || 'solid',
              overflow: 'hidden',
              boxShadow: widget.props.boxShadow || 'none',
              backgroundColor: hasImage ? 'transparent' : '#f3f4f6'
            });

            const imageClass = registerStyle('image-element', {
              width: '100%',
              height: resolvedHeight ? '100%' : 'auto',
              objectFit: widget.props.objectFit || 'cover',
              opacity: widget.props.opacity || 1,
              filter: widget.props.filter || 'none',
              display: 'block'
            });

            return (
              <div className={`relative ${containerClass}`}>
                {hasImage && (
                  <img
                    src={imageSrc}
                    alt={widget.props.alt || 'Image'}
                    className={imageClass}
                    loading={widget.props.loading || 'lazy'}
                    style={{ aspectRatio: widget.props.aspectRatio || undefined }}
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
                  className={`absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50 ${hasImage ? 'hidden' : ''}`}
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span>No image selected</span>
                </div>
              </div>
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
              cursor: 'pointer',
              transition: widget.props.transition || 'all 0.2s ease'
            });

            const hoverCss = buildCssBlock(`${buttonClass}:hover`, {
              backgroundColor: widget.props.hoverBackgroundColor || undefined,
              color: widget.props.hoverColor || undefined,
              boxShadow: widget.props.hoverBoxShadow || undefined
            });
            if (hoverCss) {
              widgetStyles.push(hoverCss);
            }

            return (
              <button
                type="button"
                className={`${buttonClass} focus:outline-none`}
              >
                {widget.props.text}
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
            // Function to render the icon
            const renderIcon = () => {
              // If it's an uploaded image
              if (widget.props.useImage && widget.props.imageSrc) {
                const iconImageClass = registerStyle('icon-image', {
                  width: widget.props.size,
                  height: widget.props.size
                });
                
                return (
                  <img
                    src={widget.props.imageSrc}
                    alt={widget.props.name || 'Icon'}
                    className={iconImageClass}
                  />
                );
              }
              
              // Create a case-insensitive icon mapping
              const iconName = widget.props.name || 'Globe';
              
              // Map of icon names to components - matching exactly what IconPicker sends
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
              
              // Get the icon component (case-sensitive match)
              const IconComponent = iconMap[iconName] || iconMap['Globe'] || Globe;
              return (
                <IconComponent
                  size={widget.props.size}
                  color={widget.props.color}
                  strokeWidth={1.5}
                />
              );
            };
            
            const rotationValue = widget.props.rotation || 0;
            const iconContainerClass = registerStyle('icon-container', {
              color: widget.props.color,
              fontSize: widget.props.size,
              backgroundColor: widget.props.backgroundColor || 'transparent',
              borderRadius: widget.props.borderRadius || '0',
              padding: widget.props.padding || '0',
              transform: `rotate(${rotationValue}deg) ${
                widget.props.flip === 'horizontal' ? 'scaleX(-1)' : 
                widget.props.flip === 'vertical' ? 'scaleY(-1)' : 
                widget.props.flip === 'both' ? 'scale(-1)' : 'scale(1)'
              }`,
              width: 'fit-content',
              height: 'fit-content'
            });

            return (
              <div className={`flex items-center justify-center ${iconContainerClass}`}>
                {renderIcon()}
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
            const cardClass = registerStyle('card', {
              backgroundColor: widget.props.backgroundColor,
              borderRadius: widget.props.borderRadius
            });

            return (
              <Card className={`p-4 ${cardClass}`}>
              {widget.props.image && (
                <div className="mb-3 bg-gray-100 h-32 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <h3 className="font-bold mb-2">{widget.props.title}</h3>
              <p className="text-sm text-gray-600">{widget.props.content}</p>
              </Card>
            );
          })()}
          {widget.type === 'alert' && (
            <div className={`p-4 rounded-lg flex items-start gap-2 ${
              widget.props.type === 'info' ? 'bg-blue-50 text-blue-900 border-blue-200' :
              widget.props.type === 'warning' ? 'bg-yellow-50 text-yellow-900 border-yellow-200' :
              widget.props.type === 'error' ? 'bg-red-50 text-red-900 border-red-200' :
              'bg-green-50 text-green-900 border-green-200'
            } border-2`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {widget.props.message}
              </div>
              {widget.props.dismissible && (
                <button className="text-current opacity-50 hover:opacity-100">×</button>
              )}
            </div>
          )}
          {widget.type === 'cta' && (() => {
            const ctaClass = registerStyle('cta', {
              backgroundColor: widget.props.backgroundColor,
              color: widget.props.color
            });

            const ctaButtonClass = registerStyle('cta-button', {
              color: widget.props.backgroundColor
            });

            return (
              <div className={`p-8 rounded-lg text-center ${ctaClass}`}>
                <h2 className="text-2xl font-bold mb-2">{widget.props.heading}</h2>
                {widget.props.description && (
                  <p className="mb-4 opacity-90">{widget.props.description}</p>
                )}
                <button className={`bg-white px-6 py-3 rounded-lg font-bold ${ctaButtonClass}`}>
                  {widget.props.buttonText}
                </button>
              </div>
            );
          })()}
          {widget.type === 'form' && (
            <div className="space-y-4 p-4 border rounded-lg">
              {widget.props.title && (
                <h3 className="font-bold text-lg mb-4">{widget.props.title}</h3>
              )}
              {widget.props.fields.map((field: string, idx: number) => (
                <div key={idx}>
                  <Label className="capitalize">{field}</Label>
                  <Input placeholder={`Enter ${field}...`} />
                </div>
              ))}
              <Button className="w-full">{widget.props.submitText}</Button>
            </div>
          )}
          {widget.type === 'accordion' && (
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 font-medium flex items-center justify-between cursor-pointer hover:bg-gray-100">
                {widget.props.title}
                <ChevronDown className="h-4 w-4" />
              </div>
              {widget.props.defaultOpen && (
                <div className="p-4 border-t bg-white">
                  {widget.props.content}
                </div>
              )}
            </div>
          )}
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

            const navbarClass = registerStyle('navbar', {
              backgroundColor: widget.props.backgroundColor,
              color: widget.props.color,
              minHeight: widget.props.height || '60px',
              boxShadow: widget.props.shadow ? '0 10px 30px rgba(15,23,42,0.12)' : 'none'
            });

            return (
              <div
                className={`flex w-full flex-wrap items-center gap-4 rounded-xl px-4 py-3 transition-all ${navbarClass}`}
              >
                <div className="flex items-center gap-3 font-semibold text-base">
                  {hasLogoImage ? (
                    <img
                      src={widget.props.logo}
                      alt={widget.props.logoText || 'Logo'}
                      className="h-10 w-10 rounded-md border border-white/40 bg-white/20 object-contain"
                    />
                  ) : (
                    <span>{widget.props.logoText || 'Brand'}</span>
                  )}
                  {hasLogoImage && widget.props.logoText && (
                    <span className="text-sm font-medium opacity-80">{widget.props.logoText}</span>
                  )}
                </div>

                <div className="flex flex-1 flex-wrap items-center justify-end gap-4 text-sm font-medium">
                  {navLinks.length > 0 ? (
                    navLinks.map((link, idx) => (
                      <a
                        key={`${link.label}-${idx}`}
                        href={link.href || '#'}
                        onClick={(e) => e.preventDefault()}
                        className="hover:text-blue-600 transition-colors"
                        title={link.href}
                      >
                        {link.label || `Link ${idx + 1}`}
                      </a>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No links configured</span>
                  )}
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
            const tableHeadClass = registerStyle('table-head', {
              backgroundColor: widget.props.headerBackground
            });

            const tableHeaderCellClass = registerStyle('table-header-cell', {
              color: widget.props.headerColor
            });

            return (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className={tableHeadClass}>
                    <tr>
                      {widget.props.headers?.map((header: string, idx: number) => (
                        <th key={idx} className={`p-2 text-left ${tableHeaderCellClass}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                <tbody>
                  {widget.props.rows?.slice(0, 2).map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className={widget.props.striped && rowIdx % 2 ? 'bg-gray-50' : ''}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td key={cellIdx} className="p-2 border-t">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                </table>
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
            const progressContainerClass = registerStyle('progress-container', {
              backgroundColor: widget.props.backgroundColor,
              height: widget.props.height,
              borderRadius: widget.props.borderRadius
            });

            const progressFillClass = registerStyle('progress-fill', {
              backgroundColor: widget.props.fillColor,
              width: `${widget.props.value}%`
            });

            return (
              <div>
                {widget.props.label && <div className="text-sm mb-1">{widget.props.label}</div>}
                <div className={`relative overflow-hidden ${progressContainerClass}`}>
                  <div className={`h-full transition-all ${progressFillClass}`} />
                  {widget.props.showPercentage && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {widget.props.value}%
                    </div>
                  )}
                </div>
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
